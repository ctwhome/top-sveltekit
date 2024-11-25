import { Surreal, type Uuid } from 'surrealdb';

type DbConfig = {
  url: string;
  namespace: string;
  database: string;
};

const DEFAULT_CONFIG: DbConfig = {
  url: 'wss://surreal.ctwhome.com/rpc',
  namespace: 'test',
  database: 'testdb'
};

let connectionPromise: Promise<Surreal> | null = null;
let db: Surreal | null = null;

const connectToDatabase = async (config: DbConfig): Promise<Surreal> => {
  if (db) return db;

  const newDb = new Surreal();

  try {
    await newDb.connect(config.url);

    await newDb.signin({
      username: 'root',
      password: 'root',
      NS: config.namespace,
      DB: config.database
    });

    await newDb.use({ namespace: config.namespace, database: config.database });

    console.log('Successfully connected to SurrealDB');
    db = newDb;
    return db;
  } catch (err) {
    console.error(
      'Failed to connect to SurrealDB:',
      err instanceof Error ? err.message : String(err)
    );
    await newDb.close();
    throw err;
  }
};

export const getDb = async (
  config: DbConfig = DEFAULT_CONFIG
): Promise<Surreal> => {
  if (!connectionPromise) {
    connectionPromise = connectToDatabase(config);
  }
  return connectionPromise;
};


// Generate a unique ID for this browser tab/instance
const instanceId = Math.random().toString(36).substring(2, 15);

// Helper function to setup live queries
export async function setupLiveQuery(
  table: string,
  callback: (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CLOSE', result: any) => void
): Promise<Uuid> {
  try {
    const dbInstance = await getDb();
    // Simplified live query to ensure it captures all changes including deletions
    const query = `LIVE SELECT * FROM ${table}`;
    return await dbInstance.live(query, (action, result) => {
      if (action === 'CLOSE') {
        console.log('Live query closed:', result);
        return;
      }
      console.log('Live query event:', action, result);
      callback(action, result);
    });
  } catch (error) {
    console.error('Error setting up live query:', error);
    throw error;
  }
}

// Helper function to kill a live query
export async function killLiveQuery(queryUuid: Uuid): Promise<void> {
  try {
    const dbInstance = await getDb();
    await dbInstance.kill(queryUuid);
  } catch (error) {
    console.error('Error killing live query:', error);
    throw error;
  }
}

// Initialize the database connection
getDb().catch(console.error);

export { db, type DbConfig };
