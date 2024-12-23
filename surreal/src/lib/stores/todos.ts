import { writable, get } from 'svelte/store';
import { db, remove, select, update, create } from './db';
import { RecordId } from 'surrealdb';

// Define the Item interface
export interface Item extends Record<string, unknown> {
  id: RecordId;
  text: string;
  created_at: string;
  position: number;
}

// Create a writable store for todos
export const todos = writable<Item[]>([]);

// Initialize live query subscription
export async function initTodosLiveQuery() {
  try {
    // Initial load
    await loadAllItems();

    // Set up live query with retries
    let liveQueryId: any;
    const setupLiveQuery = async (retries = 3) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          // Ensure we're connected
          await db.ready;

          // Kill any existing live query
          if (liveQueryId) {
            try {
              await db.kill(liveQueryId);
            } catch (e) {
              console.warn('Failed to kill previous live query:', e);
            }
          }

          // Set up new live query
          liveQueryId = await db.live('items', (async (action: string, id: RecordId) => {
            console.log('Live query update:', { action, id });

            try {
              if (action === "DELETE") {
                // For deletes, update the store directly
                todos.update(items => {
                  const filtered = items.filter(item => item.id.id !== id.id);
                  console.log('Store updated after delete:', filtered.length);
                  return filtered;
                });
              } else {
                // For other actions, reload all items
                await loadAllItems();
              }
            } catch (error) {
              console.error('Error in live query callback:', error);
              // Try to reload items on error
              await loadAllItems();
            }
          }) as any);

          console.log('Live query set up successfully with ID:', liveQueryId);
          return;
        } catch (error) {
          console.error(`Live query setup attempt ${attempt} failed:`, error);
          if (attempt === retries) throw error;
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    };

    await setupLiveQuery();

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
export async function deleteItem(id: RecordId) {
  try {
    console.log('Deleting item with ID:', id);

    // Update the store optimistically
    todos.update(items => items.filter(item => item.id.id !== id.id));

    // Then perform the deletion
    const result = await db.delete(id);
    console.log('Delete result:', result);

    return result;
  } catch (err) {
    console.error('Failed to delete item:', err);
    // If deletion fails, reload items to restore the correct state
    await loadAllItems();
    throw err;
  }
}

// Load all items and update store
export async function loadAllItems() {
  try {
    console.log('Loading all items');
    const results = await select<Item>('items');
    // Sort by position if available, otherwise by created_at
    const sortedResults = results.sort((a, b) => {
      // console.log('Comparing items:', { a, b });
      if (a.position != null && b.position != null) {
        return a.position - b.position;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    todos.set(sortedResults);
  } catch (error) {
    console.error('Failed to load items:', error);
    todos.set([]);
  }
}

// Create a new item
export async function addItem(text: string) {
  try {
    const currentItems = get(todos);
    const nextPosition = currentItems.length;
    console.log('Creating new item:', { text, position: nextPosition });
    const result = await create<Item>('items', {
      text,
      created_at: new Date().toISOString(),
      position: nextPosition
    });
    console.log('Created item:', result);
  } catch (error) {
    console.error('Failed to add item:', error);
    throw error;
  }
}

// Update item positions
export async function updatePositions(items: Item[]) {
  try {
    console.log('Updating positions for items:', JSON.stringify(items, null, 2));
    // Ensure all items have valid IDs before proceeding
    if (items.some(item => !item.id)) {
      console.error('Invalid items array - some items missing IDs:', items);
      return;
    }

    const updates = items.map((item, index) => {
      console.log('Updating position:', { id: item.id, newPosition: index });
      return db.update(item.id, { position: index });
    });
    await Promise.all(updates);
  } catch (error) {
    console.error('Failed to update positions:', error);
    throw error;
  }
}
