import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// Same depth from src/config and dist/config, so this works compiled or not.
export const rootDir = path.resolve(__dirname, '..', '..');

export interface Config {
  env: string;
  port: number;
  pageSize: number;
  clientDir: string;
  db: {
    moviesPath: string;
    ratingsPath: string;
  };
}

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * All runtime configuration comes from the environment (12-factor III).
 * Defaults are suitable for local development.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Readonly<Config> {
  return Object.freeze({
    env: env.NODE_ENV || 'development',
    port: toInt(env.PORT, 3000),
    pageSize: toInt(env.PAGE_SIZE, 50),
    clientDir: path.resolve(rootDir, env.CLIENT_DIR || 'client/dist'),
    db: Object.freeze({
      moviesPath: path.resolve(rootDir, env.MOVIES_DB_PATH || 'db/movies.db'),
      ratingsPath: path.resolve(rootDir, env.RATINGS_DB_PATH || 'db/ratings.db'),
    }),
  });
}
