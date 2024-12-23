import { writable, get } from 'svelte/store';
import { db, remove, select, update, create } from './db';

// Define the SurrealDB Record ID type
interface RecordId {
  tb: string;
  id: string;
}

// Define the Item interface
export interface Item extends Record<string, unknown> {
  id: string | RecordId;
  text: string;
  created_at: string;
  position: number;
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
      const [action, id] = args;
      console.log('Live query update:', { action, id });
      // Only reload on specific actions to avoid unnecessary updates
      if (action === "CREATE" || action === "UPDATE" || action === "DELETE") {
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

// Helper to get clean ID with or without table prefix
function getCleanId(id: unknown, preservePrefix: boolean = false): string {
  if (typeof id === 'object' && id !== null && 'tb' in id && 'id' in id) {
    // Handle SurrealDB Record ID object
    return (id as { id: string }).id;
  } else if (typeof id === 'string') {
    if (preservePrefix) {
      return id;
    }
    return id.startsWith('items:') ? id.replace('items:', '') : id;
  } else {
    console.error('Invalid ID type:', { id, type: typeof id });
    return String(id);
  }
}

// Delete an item
export async function deleteItem(id: string | RecordId) {
  // Always get clean ID without prefix since remove() adds the prefix internally
  // const cleanId = getCleanId(id);
  // console.log('Deleting item with ID:', { original: id, clean: cleanId });
  try {
    // Delete a specific item by its RecordId
    const deletedItem = await db.delete(`${id.tb}:${id.id}`);
    console.log("Deleted item:", deletedItem);
    return deletedItem;
  } catch (err) {
    console.error("Failed to delete item:", err);
  } finally {
    console.log('🎹 sss');

  }
  // const result = await db.delete(`${table}:${id}`)
}

// Load all items and update store
export async function loadAllItems() {
  try {
    console.log('Loading all items');
    const results = await select<Item>('items');
    // console.log('Raw results from DB:', JSON.stringify(results, null, 2));
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
      const cleanId = getCleanId(item.id);
      console.log('Updating position:', { original: item.id, clean: cleanId, newPosition: index });
      return update('items', cleanId, { position: index });
    });
    await Promise.all(updates);
  } catch (error) {
    console.error('Failed to update positions:', error);
    throw error;
  }
}
