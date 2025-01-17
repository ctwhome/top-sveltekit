import {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL,
  IDLE_TIMEOUT_MILLIS,
  CONNECTION_TIMEOUT_MILLIS
} from "$env/static/private"

import { dev } from '$app/environment';

import postgres from 'postgres';
import pkg from 'pg';
const { Pool } = pkg;

const dbaccess = {
  host: DB_HOST,
  port: Number(DB_PORT) || 5432,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME || 'your_db_name',
  ssl: dev ? false : DB_SSL === 'true',
  max: 5, // Lower max connections since this is only for auth
  idleTimeoutMillis: Number(IDLE_TIMEOUT_MILLIS) || 30000,
  connectionTimeoutMillis: Number(CONNECTION_TIMEOUT_MILLIS) || 2000
};
// Configure postgres.js connection for application queries
export const sql = postgres(dbaccess);

// Configure pg Pool for auth adapter
export const pool = new Pool(dbaccess);

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
