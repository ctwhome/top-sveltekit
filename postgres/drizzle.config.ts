import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL } = process.env;

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: DB_HOST || 'localhost',
    port: Number(DB_PORT) || 5432,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME || 'postgres',
    ssl: DB_SSL === 'true'
  }
} satisfies Config;
