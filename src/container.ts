import type { Config } from './config';
import { openDatabase, type Db } from './db/connection';
import { SqliteMovieRepository } from './repositories/movieRepository';
import { SqliteRatingRepository } from './repositories/ratingRepository';
import { MovieService } from './services/movieService';

export interface Services {
  movieService: MovieService;
}

export interface Container {
  services: Services;
  close(): void;
}

/**
 * Composition root: wires databases -> repositories -> services.
 * Databases can be injected (e.g. in-memory fixtures in tests).
 */
export function createContainer(
  config: Pick<Config, 'pageSize'> & Partial<Pick<Config, 'db'>>,
  { moviesDb, ratingsDb }: { moviesDb?: Db; ratingsDb?: Db } = {},
): Container {
  const movies = moviesDb ?? openDatabase(config.db!.moviesPath);
  const ratings = ratingsDb ?? openDatabase(config.db!.ratingsPath);

  const movieService = new MovieService({
    movieRepository: new SqliteMovieRepository(movies),
    ratingRepository: new SqliteRatingRepository(ratings),
    pageSize: config.pageSize,
  });

  return {
    services: { movieService },
    close() {
      movies.close();
      ratings.close();
    },
  };
}
