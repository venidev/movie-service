import type { ErrorRequestHandler, RequestHandler } from 'express';
import HttpError from '../errors/HttpError';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(HttpError.notFound(`Route ${req.method} ${req.path} not found`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof HttpError ? err.status : 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: { status, message: status >= 500 ? 'Internal Server Error' : (err as Error).message },
  });
};
