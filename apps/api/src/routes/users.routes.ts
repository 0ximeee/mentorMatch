import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authenticate, requireRole } from '../middleware/auth';
import { HttpError } from '../utils/httpError';

export const usersRouter = Router();

const roleSchema = z.enum(['STUDENT', 'ADVISOR', 'ADMIN']);

// GET /api/users?role=STUDENT  (solo ADMIN)
usersRouter.get('/', authenticate, requireRole('ADMIN'), async (req, res) => {
  const role = req.query.role;
  let rows;

  if (role === undefined) {
    ({ rows } = await pool.query(
      'SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC',
    ));
  } else {
    const parsed = roleSchema.safeParse(role);
    if (!parsed.success) throw new HttpError(400, 'Rol inválido');
    ({ rows } = await pool.query(
      'SELECT id, full_name, email, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
      [parsed.data],
    ));
  }

  res.json({ data: rows });
});