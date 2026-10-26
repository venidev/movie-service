import { Router } from 'express';
import { createMovieController } from '../controllers/movieController';
import type { Services } from '../container';

/**
 * Versioned API router. New resources get their own controller and are
 * mounted here without touching existing routes.
 */
export function createApiRouter({ movieService }: Services): Router {
  const router = Router();
  const movies = createMovieController(movieService);

  router.get('/movies', movies.list);
  router.get('/movies/:imdbId', movies.details);
  router.get('/years/:year/movies', movies.byYear);
  router.get('/genres', movies.genres);
  router.get('/genres/:genre/movies', movies.byGenre);

  return router;
}
