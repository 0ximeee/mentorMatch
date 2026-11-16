import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from '../utils/httpError';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { message: 'Ruta no encontrada' } });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { message: error.message } });
    return;
  }

  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { message: 'JSON inválido' } });
    return;
  }
  if (error?.type === 'entity.too.large') {
    res.status(413).json({ error: { message: 'Cuerpo demasiado grande' } });
    return;
  }

  console.error('Error interno en API:', error);
  res.status(500).json({ error: { message: 'Error interno del servidor' } });
};
