import type { RequestHandler } from 'express';
import { HttpError } from '../utils/httpError';
import { verifyToken, type AuthUser, type Role } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Token requerido');
  }

  try {
    req.user = verifyToken(token);
  } catch {
    throw new HttpError(401, 'Token inválido o expirado');
  }
  next();
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) throw new HttpError(401, 'Token requerido');
    if (!roles.includes(req.user.role)) {
      throw new HttpError(403, 'No tienes permiso para esta acción');
    }
    next();
  };
}
