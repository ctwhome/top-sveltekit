import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USER,
  DB_PASSWORD,
  DB_NAME = 'postgres',
  DB_SSL = 'false',
} = process.env;

// Configuration for migrations - uses a separate connection
const client = postgres({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  ssl: DB_SSL === 'true',
  max: 1,
});

async function main() {
  console.log('Dropping all tables...');

  try {
    // Drop all tables in the correct order
    await client.unsafe(`
      DROP TABLE IF EXISTS todos CASCADE;
      DROP TABLE IF EXISTS accounts CASCADE;
      DROP TABLE IF EXISTS verification_token CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;
      DROP SCHEMA IF EXISTS drizzle CASCADE;
    `);

    console.log('All tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  }

  await client.end();
  process.exit(0);
}

main();
