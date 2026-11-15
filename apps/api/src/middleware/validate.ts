import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

export function validate(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: {
          message: 'Datos inválidos',
          details: parsed.error.issues.map((issue) => ({
            path: issue.path.map(String).join('.'),
            message: issue.message,
          })),
        },
      });
      return;
    }
    req.body = parsed.data;
    next();
  };
}
