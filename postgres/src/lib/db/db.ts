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
} from "$env/static/private";
import {
  PUBLIC_DB_HOST,
  PUBLIC_DB_PORT,
  PUBLIC_DB_USER,
  PUBLIC_DB_PASSWORD,
  PUBLIC_DB_NAME
} from "$env/static/public";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { dev } from '$app/environment';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

// Configuration for the postgres client
const connectionString = dev
  ? `postgres://${PUBLIC_DB_USER}:${PUBLIC_DB_PASSWORD}@${PUBLIC_DB_HOST}:${PUBLIC_DB_PORT}/${PUBLIC_DB_NAME}`
  : `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Create the postgres connection
const client = postgres(connectionString, {
  max: Number(MAX_CLIENTS) || 20,
  idle_timeout: Number(IDLE_TIMEOUT_MILLIS) || 30000,
  connect_timeout: Number(CONNECTION_TIMEOUT_MILLIS) || 2000,
  ssl: dev ? false : DB_SSL === 'true',
});

// Create the drizzle db instance
export const db = drizzle(client, { schema });

// Log which environment we're using
console.log(`Database connected in ${dev ? 'development' : 'production'} mode`);

// Run migrations during app startup in development
if (dev) {
  console.log('Running migrations in development mode...');
  migrate(db, { migrationsFolder: 'drizzle' })
    .then(() => console.log('Migrations completed'))
    .catch((err) => console.error('Error running migrations:', err));
}

// Close the pool gracefully when the application is shutting down
process.on('SIGINT', () => {
  client.end().then(() => {
    console.log('postgres connection has ended');
    process.exit(0);
  });
});
