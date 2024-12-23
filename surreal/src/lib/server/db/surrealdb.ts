import { Surreal } from 'surrealdb';

const connectionString = process.env.AUTH_SURREALDB_CONNECTION;
const username = process.env.AUTH_SURREALDB_USERNAME;
const password = process.env.AUTH_SURREALDB_PASSWORD;
const namespace = process.env.AUTH_SURREALDB_NAMESPACE;
const database = process.env.AUTH_SURREALDB_DATABASE;

if (!connectionString || !username || !password || !namespace || !database) {
  throw new Error(
    'SurrealDB connection string, username, password, namespace, and database are required'
  );
}

const db = new Surreal();

const clientPromise = (async () => {
  try {
    await db.connect(connectionString);
    await db.signin({
      username,
      password,
    });
    await db.use({
      namespace,
      database,
    });
    return db;
  } catch (e) {
    console.error('SurrealDB connection error:', e);
    throw e;
  }
})();

export default clientPromise;
