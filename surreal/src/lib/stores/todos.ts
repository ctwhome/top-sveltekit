import { writable } from 'svelte/store';
import { db } from './db';

// Define the Item interface
export interface Item extends Record<string, unknown> {
  id: string;
  text: string;
  created_at: string;
}

// Create a writable store for todos
export const todos = writable<Item[]>([]);

// Initialize live query subscription
export async function initTodosLiveQuery() {
  try {
    // Wait for ready state
    await db.ready;

    // Initial load
    await loadAllItems();


    // Set up new live query
    const liveQueryId = await db.live('items', (async (...args: any) => {
      const [action] = args;
      // Reload data when we receive any change notification
      if (action !== "CLOSE") {
        await loadAllItems();
      }
    }) as any);

    // Return cleanup function
    return () => {
      if (liveQueryId) {
        db.kill(liveQueryId).catch(err => {
          console.error('Failed to kill live query:', err);
        });
      }
    };
  } catch (error) {
    console.error('Failed to initialize live query:', error);
    throw error;
  }
}

// Delete an item
export async function deleteItem(id: string) {
  try {
    await db.delete(id);
  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
}

// Load all items and update store
async function loadAllItems() {
  try {
    const results = await db.select<Item>('items');
    todos.set(results);
  } catch (error) {
    console.error('Failed to load items:', error);
    todos.set([]);
  }
}
