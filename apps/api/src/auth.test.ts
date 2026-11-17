import { describe, expect, it } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from './app';
import { authenticate, requireRole } from './middleware/auth';
import { errorHandler } from './middleware/errors';
import { registerSchema } from './schemas/auth.schemas';
import { signToken, verifyToken } from './utils/jwt';

const secret = process.env.JWT_SECRET!;

describe('Validación con Zod', () => {
  const valido = { full_name: 'Karla López', email: 'karlita@correo.com ', password: 'contrasenia1234' };

  it('limpia el correo y asigna STUDENT por defecto', () => {
    const r = registerSchema.parse(valido);
    expect(r.email).toBe('karlita@correo.com');
    expect(r.role).toBe('STUDENT');
  });

  it('no permite registrarse como ADMIN', () => {
    expect(registerSchema.safeParse({ ...valido, role: 'ADMIN' }).success).toBe(false);
  });

  it('rechaza contraseñas débiles o demasiado largas', () => {
    expect(registerSchema.safeParse({ ...valido, password: 'corta1' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valido, password: 'sinnumeros' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valido, password: '12345678' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valido, password: 'a1'.repeat(40) }).success).toBe(false);
  });
});

describe('JWT', () => {
  it('firma y verifica un token', () => {
    const token = signToken({ id: 7, role: 'ADVISOR' });
    expect(verifyToken(token)).toEqual({ id: 7, role: 'ADVISOR' });
  });

  it('rechaza un token firmado con otro secreto', () => {
    const falso = jwt.sign({ role: 'ADMIN' }, 'otro-secreto-distinto-de-32-caracteres!!', { subject: '1' });
    expect(() => verifyToken(falso)).toThrow();
  });

  it('rechaza un token expirado', () => {
    const viejo = jwt.sign({ role: 'STUDENT' }, secret, { subject: '1', expiresIn: -10 });
    expect(() => verifyToken(viejo)).toThrow();
  });
});

describe('API /api/auth (sin base de datos)', () => {
  it('POST /register rechaza datos inválidos con 400 y detalles', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ full_name: 'A', email: 'no-es-correo', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Datos inválidos');
    const campos = res.body.error.details.map((d: { path: string }) => d.path);
    expect(campos).toEqual(expect.arrayContaining(['full_name', 'email', 'password']));
  });

  it('POST /login exige correo y contraseña', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('POST con JSON mal formado responde 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('JSON inválido');
  });

  it('GET /me sin token responde 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /me con token inválido responde 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer basura');
    expect(res.status).toBe(401);
  });

  it('ruta inexistente responde 404 en formato JSON', async () => {
    const res = await request(app).get('/api/nada');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Ruta no encontrada');
  });
});

describe('requireRole', () => {
  const mini = express();
  mini.get('/solo-asesores', authenticate, requireRole('ADVISOR'), (_req, res) => {
    res.json({ ok: true });
  });
  mini.use(errorHandler);

  it('responde 403 si el rol no coincide', async () => {
    const token = signToken({ id: 1, role: 'STUDENT' });
    const res = await request(mini).get('/solo-asesores').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('deja pasar al rol correcto', async () => {
    const token = signToken({ id: 2, role: 'ADVISOR' });
    const res = await request(mini).get('/solo-asesores').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
