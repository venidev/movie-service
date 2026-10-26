import { toMovieDetails, toMovieSummary } from '../mappers/movieMapper';
import type { MovieRepository } from '../repositories/movieRepository';
import type { RatingRepository } from '../repositories/ratingRepository';
import type { MovieDetails, MovieSummary, Paged, SortOrder } from '../types';
import { toPage, toPagedResponse } from './pagination';

export interface MovieServiceDeps {
  movieRepository: MovieRepository;
  ratingRepository: RatingRepository;
  pageSize: number;
}

/**
 * Business logic for movies. Depends only on repository interfaces, which
 * are injected, so it can be unit tested with simple fakes.
 */
export class MovieService {
  private readonly movies: MovieRepository;
  private readonly ratings: RatingRepository;
  private readonly pageSize: number;
  private genres?: string[];

  constructor({ movieRepository, ratingRepository, pageSize }: MovieServiceDeps) {
    this.movies = movieRepository;
    this.ratings = ratingRepository;
    this.pageSize = pageSize;
  }

  /** Lists all movies, or those whose title contains `query` when given. */
  listMovies({ page, query }: { page: number; query?: string }): Paged<MovieSummary> {
    const pageRequest = toPage(page, this.pageSize);
    const result = query
      ? this.movies.searchByTitle(query, pageRequest)
      : this.movies.findAll(pageRequest);
    return toPagedResponse(result, { page, pageSize: this.pageSize }, toMovieSummary);
  }

  getMovieDetails(imdbId: string): MovieDetails | null {
    const row = this.movies.findByImdbId(imdbId);
    if (!row) return null;
    const rating = this.ratings.getAverageForMovie(row.movieId);
    return toMovieDetails(row, rating);
  }

  listMoviesByYear(
    year: number,
    { page, order }: { page: number; order: SortOrder },
  ): Paged<MovieSummary> {
    const result = this.movies.findByYear(year, { ...toPage(page, this.pageSize), order });
    return toPagedResponse(result, { page, pageSize: this.pageSize }, toMovieSummary);
  }

  listMoviesByGenre(genre: string, { page }: { page: number }): Paged<MovieSummary> {
    const result = this.movies.findByGenre(genre, toPage(page, this.pageSize));
    return toPagedResponse(result, { page, pageSize: this.pageSize }, toMovieSummary);
  }

  /** The genre set is static for a read-only dataset, so compute it once. */
  listGenres(): string[] {
    this.genres ??= this.movies.listGenres();
    return this.genres;
  }
}
