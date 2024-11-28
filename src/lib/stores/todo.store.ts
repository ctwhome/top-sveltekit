import { writable, derived } from 'svelte/store';
import type { Todo } from '$lib/models/todo';
import { Surreal } from 'surrealdb';
import type { LiveHandler, Patch } from 'surrealdb';

type TodoResponse = { id: string } & Todo;

interface QueryResult {
  status: string;
  time: string;
  result: TodoResponse[];
}

type LiveQueryData = {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CLOSE';
  result: TodoResponse | 'killed' | 'disconnected';
};

function createTodoStore() {
  const { subscribe, set, update } = writable<Todo[]>([]);
  let db: Surreal | null = null;
  let liveQuery: any = null;
  let currentUserId: string | null = null;

  // Derived store for sorted todos
  const sortedTodos = derived({ subscribe }, ($todos) => {
    return [...$todos].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  });

  // Store actions
  const actions = {
    subscribe: sortedTodos.subscribe,

    async init(userId: string) {
      try {
        currentUserId = userId;

        // Connect to SurrealDB
        db = new Surreal();
        await db.connect('wss://surreal.ctwhome.com/rpc');

        // Use the namespace and database
        await db.use({ namespace: 'ctw', database: 'topsveltekit' });

        // Initial fetch - only get todos for the current user
        const result = await db.query<[QueryResult]>(
          'SELECT * FROM todos WHERE user = $userId ORDER BY created_at DESC',
          { userId }
        );

        if (result?.[0]?.result) {
          set(result[0].result);
        }

        // Setup live query for user's todos
        const query = `SELECT * FROM todos WHERE user = "${userId}"`;
        liveQuery = await db.live(query, (action, result) => {
          if (action === 'CREATE' && typeof result !== 'string') {
            update(todos => [...todos, result as TodoResponse]);
          } else if (action === 'UPDATE' && typeof result !== 'string') {
            update(todos => todos.map(t => t.id === (result as TodoResponse).id ? (result as TodoResponse) : t));
          } else if (action === 'DELETE' && typeof result !== 'string') {
            update(todos => todos.filter(t => t.id !== (result as TodoResponse).id));
          }
        });
      } catch (error) {
        console.error('Error initializing todo store:', error);
        throw error;
      }
    },

    destroy() {
      if (liveQuery && db) {
        db.kill(liveQuery).catch(console.error);
        liveQuery = null;
      }
      if (db) {
        db.close().catch(console.error);
        db = null;
      }
      currentUserId = null;
    },

    async addTodo(title: string) {
      try {
        if (!db) throw new Error('Database not initialized');
        if (!currentUserId) throw new Error('User not authenticated');
        if (!title.trim()) throw new Error('Title cannot be empty');

        const result = await db.query<[QueryResult]>(
          'CREATE todos CONTENT { title: $title, completed: false, created_at: time::now(), user: $userId }',
          { title: title.trim(), userId: currentUserId }
        );

        if (!result?.[0]?.result?.[0]) {
          throw new Error('Failed to create todo');
        }
      } catch (error) {
        console.error('Error creating todo:', error);
        throw error;
      }
    },

    async toggleTodo(id: string) {
      try {
        if (!db) throw new Error('Database not initialized');
        if (!currentUserId) throw new Error('User not authenticated');
        if (!id) throw new Error('Todo ID is required');

        // First get the current todo
        const result = await db.query<[QueryResult]>(
          'SELECT * FROM $id WHERE user = $userId',
          { id, userId: currentUserId }
        );

        if (!result?.[0]?.result?.[0]) {
          throw new Error('Todo not found or unauthorized');
        }

        // Update the todo
        const updateResult = await db.query<[QueryResult]>(
          'UPDATE $id SET completed = function() { return !this.completed } WHERE user = $userId',
          { id, userId: currentUserId }
        );

        if (!updateResult?.[0]?.result?.[0]) {
          throw new Error('Failed to toggle todo');
        }
      } catch (error) {
        console.error('Error toggling todo:', error);
        throw error;
      }
    },

    async deleteTodo(id: string) {
      try {
        if (!db) throw new Error('Database not initialized');
        if (!currentUserId) throw new Error('User not authenticated');
        if (!id) throw new Error('Todo ID is required');

        // First verify the todo belongs to the user
        const result = await db.query<[QueryResult]>(
          'SELECT * FROM $id WHERE user = $userId',
          { id, userId: currentUserId }
        );

        if (!result?.[0]?.result?.[0]) {
          throw new Error('Todo not found or unauthorized');
        }

        // Delete the todo
        const deleteResult = await db.query<[QueryResult]>(
          'DELETE $id WHERE user = $userId',
          { id, userId: currentUserId }
        );

        if (!deleteResult?.[0]?.result?.[0]) {
          throw new Error('Failed to delete todo');
        }
      } catch (error) {
        console.error('Error deleting todo:', error);
        throw error;
      }
    }
  };

  return actions;
}

export const todos = createTodoStore();
