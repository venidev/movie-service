import fs from 'node:fs';
import path from 'node:path';
import { Router, type Request } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { rootDir } from '../config';

export const spec = YAML.parse(fs.readFileSync(path.join(rootDir, 'openapi.yaml'), 'utf8'));

/**
 * The spec with `servers` pointing at the host that requested it, so
 * importers (Postman, Insomnia) and Swagger UI get a working base URL on
 * any host or port.
 */
function specFor(req: Request) {
  return { ...spec, servers: [{ url: `${req.protocol}://${req.get('host')}` }] };
}

/** Serves the OpenAPI spec and an interactive Swagger UI. */
export function createDocsRouter(): Router {
  const router = Router();
  router.get('/openapi.json', (req, res) => res.json(specFor(req)));
  router.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, { swaggerOptions: { url: '/openapi.json' } }),
  );
  return router;
}
