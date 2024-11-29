import { Surreal } from 'surrealdb';
import { env } from '$env/dynamic/private';

type DbConfig = {
  url: string;
  namespace: string;
  database: string;
  username?: string;
  password?: string;
  token?: string;
};

interface SignInResponse {
  code: number;
  details: string;
  token: string;
  status: string;
}

const DEFAULT_CONFIG: DbConfig = {
  url: env.SURREAL_URL,
  namespace: env.SURREAL_NS,
  database: env.SURREAL_DB,
  username: env.SURREAL_USER,
  password: env.SURREAL_PASS,
};

let connectionPromise: Promise<Surreal> | null = null;
let db: Surreal | null = null;

const connectToDatabase = async (config: DbConfig): Promise<Surreal> => {
  if (db) return db;

  const newDb = new Surreal();

  try {
    console.log('Connecting to SurrealDB with config:', {
      url: config.url,
      namespace: config.namespace,
      database: config.database,
      username: config.username
    });

    await newDb.connect(config.url);
    console.log('Connected to SurrealDB');

    if (config.token) {
      await newDb.authenticate(config.token);
      console.log('Authenticated with token');
    } else {
      // Use root credentials to sign in
      await newDb.signin({
        username: config.username,
        password: config.password,
        scope: 'root',
        NS: config.namespace,
        DB: config.database
      });
      console.log('Signed in with root credentials');
    }

    await newDb.use({ namespace: config.namespace, database: config.database });
    console.log('Using namespace and database');

    console.log('Successfully connected to SurrealDB');
    db = newDb;
    return db;
  } catch (err) {
    console.error('Failed to connect to SurrealDB:', err instanceof Error ? err.message : String(err));
    if (err instanceof Error && err.stack) {
      console.error('Stack trace:', err.stack);
    }
    await newDb.close();
    throw new Error('Failed to connect to SurrealDB');
  }
};

export const getDb = async (config: DbConfig = DEFAULT_CONFIG): Promise<Surreal> => {
  try {
    if (!connectionPromise) {
      connectionPromise = connectToDatabase(config);
    }
    const dbInstance = await connectionPromise;
    if (!dbInstance) {
      throw new Error('Database connection failed');
    }
    return dbInstance;
  } catch (error) {
    connectionPromise = null;
    db = null;
    throw error;
  }
};

// User authentication function
export const authenticateUser = async (email: string, password: string): Promise<{ token: string; user: any }> => {
  const response = await fetch(`${DEFAULT_CONFIG.url.replace('/rpc', '')}/signin`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      namespace: DEFAULT_CONFIG.namespace,
      database: DEFAULT_CONFIG.database,
      scope: 'user',
      email,
      password
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to sign in: ${response.statusText}. ${errorText}`);
  }

  const result = await response.json() as SignInResponse;

  // Get user details using the token
  const userDb = await connectWithToken(result.token);
  const userResult = await userDb.query<[any]>('SELECT * FROM users WHERE email = $email LIMIT 1', { email });
  const user = userResult[0]?.[0];

  if (!user) {
    throw new Error('User not found after authentication');
  }

  return { token: result.token, user };
};

// Create a frontend-specific connection function
export const connectWithToken = async (token: string): Promise<Surreal> => {
  // Reset any existing connection
  if (db) {
    await db.close();
    db = null;
    connectionPromise = null;
  }

  return getDb({
    url: typeof window !== 'undefined' ? window.location.origin.replace('http', 'ws') : DEFAULT_CONFIG.url,
    namespace: DEFAULT_CONFIG.namespace,
    database: DEFAULT_CONFIG.database,
    token
  });
};

// Initialize the database connection for backend
if (typeof window === 'undefined') {
  getDb().catch(console.error);
}

export { db, type DbConfig };
