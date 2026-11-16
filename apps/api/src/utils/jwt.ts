import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export const ROLES = ['STUDENT', 'ADVISOR', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export interface AuthUser {
  id: number;
  role: Role;
}

const ALGORITHM = 'HS256';

export function signToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    algorithm: ALGORITHM,
  });
}

export function verifyToken(token: string): AuthUser {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });

  if (typeof decoded === 'string') throw new Error('Payload inválido');

  const id = Number(decoded.sub);
  const role = decoded.role as Role;
  if (!Number.isSafeInteger(id) || id <= 0 || !ROLES.includes(role)) {
    throw new Error('Payload inválido');
  }
  return { id, role };
}
