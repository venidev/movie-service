export type SortOrder = 'asc' | 'desc';

export interface PageRequest {
  limit: number;
  offset: number;
}

/** A page of raw rows plus the total count across all pages. */
export interface RowPage<T> {
  rows: T[];
  total: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface Paged<T> {
  data: T[];
  pagination: Pagination;
}

/** Columns selected for list views. */
export interface MovieSummaryRow {
  movieId: number;
  imdbId: string;
  title: string;
  genres: string | null;
  releaseDate: string | null;
  budget: number | null;
}

export interface MovieDetailRow extends MovieSummaryRow {
  overview: string | null;
  runtime: number | null;
  language: string | null;
  productionCompanies: string | null;
}

export interface RatingSummary {
  average: number | null;
  count: number;
}

export interface MovieSummary {
  imdbId: string;
  title: string;
  genres: string[];
  releaseDate: string | null;
  budget: string | null;
}

export interface MovieDetails extends MovieSummary {
  description: string | null;
  runtime: number | null;
  averageRating: number | null;
  ratingCount: number;
  originalLanguage: string | null;
  productionCompanies: string[];
}
