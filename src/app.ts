import express, { type Express } from 'express';
import { createClientRouter } from './client';
import type { Services } from './container';
import { createDocsRouter } from './docs';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { createApiRouter } from './routes';

/**
 * Builds the Express app from injected services. Kept free of I/O so tests
 * can construct it with fakes or in-memory databases.
 */
export function createApp(services: Services, { clientDir }: { clientDir?: string } = {}): Express {
  const app = express();
  app.disable('x-powered-by');

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/v1', createApiRouter(services));
  app.use(createDocsRouter());
  if (clientDir) app.use(createClientRouter(clientDir));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
