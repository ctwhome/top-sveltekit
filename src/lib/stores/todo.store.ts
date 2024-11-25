import { writable } from 'svelte/store';
import type { Todo } from '$lib/models/todo';
import { getDb, setupLiveQuery, killLiveQuery } from '$lib/db/surreal';
import type { Uuid } from 'surrealdb';

// Helper function to safely convert SurrealDB response to Todo type
function toTodo(data: any): Todo | null {
  if (!data || typeof data !== 'object') return null;

  return {
    id: data.id,
    title: data.title || '',
    completed: Boolean(data.completed),
    created_at: data.created_at || new Date().toISOString()
  };
}

function createTodoStore() {
  const { subscribe, set, update } = writable<Todo[]>([]);
  let isInitialized = false;
  let currentLiveQuery: Uuid | null = null;
  console.log('🎹 hol');


  async function ensureConnection() {
    if (!isInitialized) {
      try {
        await getDb();
        isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize database connection:', error);
        throw error;
      }
    }
  }

  async function setupRealtimeUpdates() {
    // Only set up live query if it doesn't exist
    if (currentLiveQuery) {
      console.log('Live query already exists, skipping setup');
      return;
    }

    try {
      // Set up new live query
      currentLiveQuery = await setupLiveQuery('todos', async (action, result) => {
        console.log('Live query update:', action, result);

        switch (action) {
          case 'CREATE': {
            const newTodo = toTodo(result);
            if (newTodo) {
              update(todos => {
                const newTodos = [...todos, newTodo];
                return newTodos.sort((a, b) => {
                  const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                  const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                  return dateB - dateA;
                });
              });
            }
            break;
          }
          case 'UPDATE': {
            const updatedTodo = toTodo(result);
            if (updatedTodo) {
              update(todos => todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
            }
            break;
          }
          case 'DELETE': {
            // Handle both possible delete result formats
            const deletedId = typeof result === 'string' ? result : result?.id;
            if (deletedId) {
              update(todos => {
                console.log('Removing todo with id:', deletedId);
                return todos.filter(t => t.id !== deletedId);
              });
            }
            break;
          }
          case 'CLOSE': {
            currentLiveQuery = null;
            break;
          }
        }
      });
    } catch (error) {
      console.error('Error setting up realtime updates:', error);
    }
  }

  async function fetchAllTodos() {
    try {
      const dbInstance = await getDb();
      const result = await dbInstance.query('SELECT * FROM todos ORDER BY created_at DESC');
      if (!Array.isArray(result) || result.length === 0) {
        set([]);
        return [];
      }

      const todos = Array.isArray(result[0])
        ? result[0].map((t: any) => toTodo(t)).filter((t): t is Todo => t !== null)
        : [];
      set(todos);
      return todos;
    } catch (error) {
      console.error('Error fetching todos:', error);
      return [];
    }
  }

  return {
    subscribe,

    // Initialize store with realtime updates
    async init() {
      await ensureConnection();
      await fetchAllTodos();
      // await setupRealtimeUpdates();
    },

    // Cleanup function
    async destroy() {
      if (currentLiveQuery) {
        await killLiveQuery(currentLiveQuery);
        currentLiveQuery = null;
      }
    },

    // Create a new todo
    async create(title: string) {
      try {
        await ensureConnection();
        const dbInstance = await getDb();

        const result = await dbInstance.query('CREATE todos SET title = $title, completed = false, created_at = $created_at', {
          title,
          created_at: new Date().toISOString()
        });

        if (!Array.isArray(result) || result.length === 0 || !Array.isArray(result[0])) return null;

        const created = toTodo(result[0][0]);
        return created || null;
      } catch (error) {
        console.error('Error creating todo:', error);
        return null;
      }
    },

    // Toggle todo completion
    async toggle(id: string) {
      try {
        await ensureConnection();
        const dbInstance = await getDb();

        // First get the current todo to check its completed status
        const currentResult = await dbInstance.query('SELECT * FROM todos WHERE id = $id', { id });
        if (!Array.isArray(currentResult) || currentResult.length === 0 || !Array.isArray(currentResult[0])) return null;

        const currentTodo = toTodo(currentResult[0][0]);
        if (!currentTodo) return null;

        // Then update with the opposite completed status
        const result = await dbInstance.query('UPDATE todos SET completed = $completed WHERE id = $id', {
          id,
          completed: !currentTodo.completed
        });

        if (!Array.isArray(result) || result.length === 0 || !Array.isArray(result[0])) return null;

        const updated = toTodo(result[0][0]);
        return updated || null;
      } catch (error) {
        console.error('Error toggling todo:', error);
        return null;
      }
    },

    // Delete a todo
    async delete(id: string) {
      try {
        await ensureConnection();
        const dbInstance = await getDb();

        const result = await dbInstance.query('DELETE todos WHERE id = $id RETURN id', { id });
        return Array.isArray(result) && result.length > 0;
      } catch (error) {
        console.error('Error deleting todo:', error);
        return false;
      }
    }
  };
}

export const todoStore = createTodoStore();
