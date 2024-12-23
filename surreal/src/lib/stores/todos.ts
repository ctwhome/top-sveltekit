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
            // console.log('Live query update:', { action, id });
            // Always reload items to get the latest state
            await loadAllItems();
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
    // console.log('Loading all items');
    const results = await select<Item>('items');
    // Sort by position
    const sortedResults = results.sort((a, b) =>
      (a.position ?? Infinity) - (b.position ?? Infinity)
    );
    todos.set(sortedResults);
  } catch (error) {
    console.error('Failed to load items:', error);
    todos.set([]);
  }
}

// Create a new item
export async function addItem(text: string) {
  try {
    // Get the highest position number
    const currentItems = get(todos);
    const maxPosition = currentItems.reduce((max, item) =>
      Math.max(max, item.position ?? -1), -1
    );

    console.log('Creating new item:', { text, position: maxPosition + 1 });
    const result = await create<Item>('items', {
      text,
      created_at: new Date().toISOString(),
      position: maxPosition + 1
    });
    console.log('Created item:', result);
    await loadAllItems();
  } catch (error) {
    console.error('Failed to add item:', error);
    throw error;
  }
}

// Update item positions
export async function updatePositions(items: Item[]) {
  try {
    // Find the range of items that need updating
    const oldIndex = items.findIndex(item => item.position !== items.indexOf(item));
    if (oldIndex === -1) {
      console.log('No position changes needed');
      return;
    }

    // Only update items that have moved
    const updates = items
      .map((item, index) => ({
        id: item.id,
        oldPosition: item.position,
        newPosition: index
      }))
      .filter(update => update.oldPosition !== update.newPosition);

    // console.log('Updating positions for items:', updates);

    // Get current items to preserve their data
    const currentItems = await select<Item>('items');
    const itemsMap = new Map(currentItems.map(item => [item.id.id, item]));

    // Update positions concurrently while preserving all item data
    await Promise.all(
      updates.map(update => {
        const currentItem = itemsMap.get(update.id.id);
        if (!currentItem) {
          console.error('Item not found in database:', update);
          return Promise.resolve();
        }
        return db.update(update.id, {
          ...currentItem,
          position: update.newPosition
        });
      })
    );

    // Reload items to get the new order
    await loadAllItems();
  } catch (error) {
    console.error('Failed to update positions:', error);
    await loadAllItems(); // Reload on error
    throw error;
  }
}
