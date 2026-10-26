import fs from 'node:fs';
import path from 'node:path';
import express, { Router } from 'express';

/**
 * Serves the built React app. Any GET that accepts HTML and isn't handled by
 * the API falls back to index.html so client-side routes work on reload.
 * Does nothing if the client hasn't been built (e.g. API-only deploys).
 */
export function createClientRouter(clientDir: string): Router {
  const router = Router();
  const indexHtml = path.join(clientDir, 'index.html');
  if (!fs.existsSync(indexHtml)) return router;

  router.use(express.static(clientDir, { index: false }));
  router.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/') || !req.accepts('html')) return next();
    res.sendFile(indexHtml);
  });
  return router;
}
