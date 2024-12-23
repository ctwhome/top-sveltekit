import { Surreal } from 'surrealdb';
import { writable } from 'svelte/store';

// Create a singleton instance of SurrealDB
const db = new Surreal();

// Create a store to manage connection state
export const dbStatus = writable<'disconnected' | 'connected' | 'error'>('disconnected');

// Initialize database connection with retry logic
export async function initDB(retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Connection attempt ${attempt}/${retries}...`);

      // Close any existing connection first
      try {
        await db.close();
      } catch (e) {
        // Ignore close errors
      }

      // Connect to the database with auth and namespace/database
      await db.connect('ws://127.0.0.1:8000/rpc', {
        auth: {
          username: 'root',
          password: 'root'
        },
        namespace: 'test',
        database: 'test'
      });
      console.log('Connected to SurrealDB');

      // Wait for connection to be ready
      await db.ready;
      console.log('Namespace and database set');

      // Set status and return success
      dbStatus.set('connected');
      return true;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      if (attempt === retries) {
        console.error('All connection attempts failed');
        dbStatus.set('error');
        return false;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

// Helper function to ensure connection is ready
async function ensureConnection() {
  if (db.ready) {
    await db.ready;
  }
}

// Helper function to create records
export async function create<T>(table: string, data: Partial<T>, retries = 3) {
  await ensureConnection();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await db.create(table, data);
      return result;
    } catch (error) {
      if (attempt === retries) {
        console.error(`Failed to create record in ${table}:`, error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Helper function to query records
export async function query<T>(sql: string, retries = 3): Promise<T[]> {
  await ensureConnection();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await db.query<[{ result: T[] }]>(sql);
      return result[0]?.result ?? [];
    } catch (error) {
      if (attempt === retries) {
        console.error('Query failed:', error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return [];
}

// Helper function to select all records from a table
export async function select<T>(table: string, retries = 3): Promise<T[]> {
  await ensureConnection();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await db.select(table);
      return result as T[];
    } catch (error) {
      if (attempt === retries) {
        console.error(`Failed to select from ${table}:`, error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return [];
}

// Helper function to update a record
export async function update<T>(table: string, id: string, data: Partial<T>, retries = 3) {
  await ensureConnection();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await db.update(`${table}:${id}`, data);
      return result;
    } catch (error) {
      if (attempt === retries) {
        console.error(`Failed to update record in ${table}:`, error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Helper function to delete a record
export async function remove(table: string, id: string, retries = 3) {
  await ensureConnection();
  for (let attempt = 1; attempt <= retries; attempt++) {

    try {
      // Delete a specific item by its RecordId
      const deletedItem = await db.delete(`items:${id.id}`);
      console.log("Deleted item:", deletedItem);
      return deletedItem;
    } catch (err) {
      console.error("Failed to delete item:", err);
    } finally {
      console.log('🎹 Closing connection');

      // await db.close();
    }

    try {
      const result = await db.delete(`${table}:${id}`);
      return result;
    } catch (error) {
      if (attempt === retries) {
        console.error(`Failed to delete record from ${table}:`, error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Export the db instance for advanced usage if needed
export { db };
