// Pool mantiene varias conexiones abiertas y las reutiliza
import { Pool } from 'pg';

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

