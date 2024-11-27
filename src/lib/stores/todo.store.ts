import { writable, derived } from 'svelte/store';
import type { Todo } from '$lib/models/todo';
import { Surreal } from 'surrealdb';

type TodoResponse = { id: string } & Todo;

type LiveQueryAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'CLOSE';
type LiveQueryResult<T> = T | 'killed' | 'disconnected';

function createTodoStore() {
  const { subscribe, set, update } = writable<Todo[]>([]);
  let db: Surreal | null = null;
  let liveQuery: any = null;

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

    async init() {
      try {
        // Connect to SurrealDB
        db = new Surreal();
        await db.connect('wss://surreal.ctwhome.com/rpc');

        // Initial fetch
        const result = await db.query<[{ result: TodoResponse[] }]>('SELECT * FROM todo ORDER BY created_at DESC');
        if (result?.[0]?.result) {
          set(result[0].result);
        }

        // Setup live query
        liveQuery = await db.live<TodoResponse>('todo', (action: LiveQueryAction, result: LiveQueryResult<TodoResponse>) => {
          if (action === 'CREATE' && typeof result !== 'string') {
            update(todos => [...todos, result]);
          } else if (action === 'UPDATE' && typeof result !== 'string') {
            update(todos => todos.map(t => t.id === result.id ? result : t));
          } else if (action === 'DELETE' && typeof result !== 'string') {
            update(todos => todos.filter(t => t.id !== result.id));
          }
        });
      } catch (error) {
        console.error('Error initializing todo store:', error);
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
    },

    async addTodo(title: string) {
      try {
        if (!db) throw new Error('Database not initialized');
        if (!title.trim()) throw new Error('Title cannot be empty');

        const result = await db.query<[{ result: TodoResponse[] }]>(
          'CREATE todo CONTENT { title: $title, completed: false, created_at: time::now() }',
          { title: title.trim() }
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
        if (!id) throw new Error('Todo ID is required');

        const result = await db.query<[{ result: TodoResponse[] }]>(
          'UPDATE $id SET completed = function() { return !this.completed }',
          { id }
        );

        if (!result?.[0]?.result?.[0]) {
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
        if (!id) throw new Error('Todo ID is required');

        await db.query('DELETE $id', { id });
      } catch (error) {
        console.error('Error deleting todo:', error);
        throw error;
      }
    }
  };

  return actions;
}

export const todos = createTodoStore();
