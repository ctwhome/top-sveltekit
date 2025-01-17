import {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL,
  MAX_CLIENTS,
  IDLE_TIMEOUT_MILLIS,
  CONNECTION_TIMEOUT_MILLIS
} from "$env/static/private"
import {
  PUBLIC_DB_HOST,
  PUBLIC_DB_PORT,
  PUBLIC_DB_USER,
  PUBLIC_DB_PASSWORD,
  PUBLIC_DB_NAME
} from "$env/static/public"
import postgres from 'postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { dev } from '$app/environment';

// Configure postgres.js connection for application queries
export const sql = postgres({
  host: dev ? PUBLIC_DB_HOST : DB_HOST,
  port: dev ? Number(PUBLIC_DB_PORT) : Number(DB_PORT) || 5432,
  user: dev ? PUBLIC_DB_USER : DB_USER,
  password: dev ? PUBLIC_DB_PASSWORD : DB_PASSWORD,
  database: dev ? PUBLIC_DB_NAME : DB_NAME,
  ssl: dev ? false : DB_SSL === 'true',
  max: Number(MAX_CLIENTS) || 20,
  idle_timeout: Number(IDLE_TIMEOUT_MILLIS) / 1000 || 30, // Convert to seconds
  connect_timeout: Number(CONNECTION_TIMEOUT_MILLIS) / 1000 || 2, // Convert to seconds
  transform: {
    undefined: null, // Transform undefined values to null
  }
});

// Configure pg Pool for auth adapter
export const pool = new Pool({
  host: dev ? PUBLIC_DB_HOST : DB_HOST,
  port: dev ? Number(PUBLIC_DB_PORT) : Number(DB_PORT) || 5432,
  user: dev ? PUBLIC_DB_USER : DB_USER,
  password: dev ? PUBLIC_DB_PASSWORD : DB_PASSWORD,
  database: dev ? PUBLIC_DB_NAME : DB_NAME,
  ssl: dev ? false : DB_SSL === 'true',
  max: 5, // Lower max connections since this is only for auth
  idleTimeoutMillis: Number(IDLE_TIMEOUT_MILLIS) || 30000,
  connectionTimeoutMillis: Number(CONNECTION_TIMEOUT_MILLIS) || 2000
});

// Log which environment we're using
console.log(`Database connected in ${dev ? 'development' : 'production'} mode`);

// Close connections gracefully when the application is shutting down
process.on('SIGINT', async () => {
  await Promise.all([
    sql.end(),
    pool.end()
  ]);
  console.log('Database connections closed');
  process.exit(0);
});
