import express from 'express';
import cors from 'cors';
import { pool } from './db/pool';

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() });
});

app.get('/api/health/db', async (_req, res) => {
  const result = await pool.query('SELECT now() AS now');
  res.json({ 
    status: 'ok',
    dbTime: result.rows[0].now });
});