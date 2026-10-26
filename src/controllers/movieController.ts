import type { Request, Response } from 'express';
import HttpError from '../errors/HttpError';
import { parseOrder, parsePage, parseSearchQuery, parseYear } from '../middleware/queryParsers';
import type { MovieService } from '../services/movieService';

type Handler = (req: Request, res: Response) => void;

export interface MovieController {
  list: Handler;
  details: Handler;
  byYear: Handler;
  genres: Handler;
  byGenre: Handler;
}

/**
 * Translates HTTP requests into service calls. Express 5 forwards thrown
 * errors to the error handler, so handlers can throw HttpError directly.
 */
export function createMovieController(movieService: MovieService): MovieController {
  return {
    list(req, res) {
      res.json(
        movieService.listMovies({
          page: parsePage(req.query.page),
          query: parseSearchQuery(req.query.q),
        }),
      );
    },

    details(req, res) {
      const imdbId = String(req.params.imdbId);
      const movie = movieService.getMovieDetails(imdbId);
      if (!movie) throw HttpError.notFound(`Movie ${imdbId} not found`);
      res.json({ data: movie });
    },

    byYear(req, res) {
      res.json(
        movieService.listMoviesByYear(parseYear(req.params.year), {
          page: parsePage(req.query.page),
          order: parseOrder(req.query.order),
        }),
      );
    },

    genres(_req, res) {
      res.json({ data: movieService.listGenres() });
    },

    byGenre(req, res) {
      res.json(
        movieService.listMoviesByGenre(String(req.params.genre), {
          page: parsePage(req.query.page),
        }),
      );
    },
  };
}
