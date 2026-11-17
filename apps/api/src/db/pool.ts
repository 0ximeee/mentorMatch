// Pool mantiene varias conexiones abiertas y las reutiliza
import { Pool } from 'pg';

const useSsl = process.env.DB_SSL === 'true';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});