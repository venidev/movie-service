import type { MovieRepository } from '../../src/repositories/movieRepository';
import type { RatingRepository } from '../../src/repositories/ratingRepository';
import { MovieService } from '../../src/services/movieService';
import type { MovieDetailRow } from '../../src/types';

const row: MovieDetailRow = {
  movieId: 7,
  imdbId: 'tt7',
  title: 'Seven',
  overview: null,
  genres: null,
  releaseDate: '2000-01-01',
  budget: 10,
  runtime: null,
  language: null,
  productionCompanies: null,
};

type Mocked<T> = { [K in keyof T]: jest.Mock };

function makeService(overrides: Partial<Mocked<MovieRepository>> = {}) {
  const movieRepository: Mocked<MovieRepository> = {
    findAll: jest.fn(() => ({ rows: [row], total: 120 })),
    searchByTitle: jest.fn(() => ({ rows: [], total: 0 })),
    findByImdbId: jest.fn(() => row),
    findByYear: jest.fn(() => ({ rows: [], total: 0 })),
    findByGenre: jest.fn(() => ({ rows: [], total: 0 })),
    listGenres: jest.fn(() => ['Drama']),
    ...overrides,
  };
  const ratingRepository: Mocked<RatingRepository> = { getAverageForMovie: jest.fn(() => ({ average: 4, count: 2 })) };
  const service = new MovieService({ movieRepository, ratingRepository, pageSize: 50 });
  return { service, movieRepository, ratingRepository };
}

describe('MovieService', () => {
  test('translates page number into limit/offset', () => {
    const { service, movieRepository } = makeService();
    const result = service.listMovies({ page: 3 });
    expect(movieRepository.findAll).toHaveBeenCalledWith({ limit: 50, offset: 100 });
    expect(result.pagination).toEqual({ page: 3, pageSize: 50, totalItems: 120, totalPages: 3 });
  });

  test('searches by title when a query is given', () => {
    const { service, movieRepository } = makeService();
    service.listMovies({ page: 2, query: 'star' });
    expect(movieRepository.searchByTitle).toHaveBeenCalledWith('star', { limit: 50, offset: 50 });
    expect(movieRepository.findAll).not.toHaveBeenCalled();
  });

  test('joins ratings by movieId for details', () => {
    const { service, ratingRepository } = makeService();
    const movie = service.getMovieDetails('tt7');
    expect(ratingRepository.getAverageForMovie).toHaveBeenCalledWith(7);
    expect(movie?.averageRating).toBe(4);
  });

  test('returns null when the movie does not exist', () => {
    const { service, ratingRepository } = makeService({ findByImdbId: jest.fn(() => undefined) });
    expect(service.getMovieDetails('nope')).toBeNull();
    expect(ratingRepository.getAverageForMovie).not.toHaveBeenCalled();
  });

  test('passes sort order through for year queries', () => {
    const { service, movieRepository } = makeService();
    service.listMoviesByYear(1995, { page: 1, order: 'desc' });
    expect(movieRepository.findByYear).toHaveBeenCalledWith(1995, { limit: 50, offset: 0, order: 'desc' });
  });

  test('caches the genre list', () => {
    const { service, movieRepository } = makeService();
    expect(service.listGenres()).toEqual(['Drama']);
    service.listGenres();
    expect(movieRepository.listGenres).toHaveBeenCalledTimes(1);
  });
});
