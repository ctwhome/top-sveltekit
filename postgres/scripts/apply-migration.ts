import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL
} = process.env;

const sql = postgres({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  ssl: DB_SSL === 'true',
});

async function main() {
  try {
    const migrationPath = join(__dirname, '..', 'drizzle', '0002_triggers_and_indexes.sql');
    const migration = readFileSync(migrationPath, 'utf-8');

    await sql.unsafe(migration);
    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await sql.end();
  }
}

main();
