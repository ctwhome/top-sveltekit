import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
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
const migrationClient = postgres({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  ssl: DB_SSL === 'true',
  max: 1,
});

// Create a new instance of drizzle for migrations
const db = drizzle(migrationClient);

// Run migrations
async function main() {
  console.log('Running migrations...');

  try {
    await migrate(db, {
      migrationsFolder: 'drizzle'
    });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }

  await migrationClient.end();
  process.exit(0);
}

main();
