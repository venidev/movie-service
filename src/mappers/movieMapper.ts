import type {
  MovieDetailRow,
  MovieDetails,
  MovieSummary,
  MovieSummaryRow,
  RatingSummary,
} from '../types';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** Budget is stored as an integer; 0 means unknown in the source data. */
export function formatBudget(budget: number | null): string | null {
  return budget ? currency.format(budget) : null;
}

/**
 * Extracts `name` values from a JSON array column like
 * `[{"id": 18, "name": "Drama"}]`. Some rows contain unescaped quotes and are
 * not valid JSON, so fall back to a pattern match in that case.
 */
export function parseNames(raw: string | null): string[] {
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as { name: string }[]).map((item) => item.name);
  } catch {
    return [...raw.matchAll(/"name":\s*"(.*?)",\s*"id"/g)].map((m) => m[1] ?? '');
  }
}

function roundRating(average: number | null | undefined): number | null {
  return average == null ? null : Math.round(average * 100) / 100;
}

export function toMovieSummary(row: MovieSummaryRow): MovieSummary {
  return {
    imdbId: row.imdbId,
    title: row.title,
    genres: parseNames(row.genres),
    // Some rows store an empty string instead of NULL.
    releaseDate: row.releaseDate || null,
    budget: formatBudget(row.budget),
  };
}

export function toMovieDetails(row: MovieDetailRow, rating?: RatingSummary): MovieDetails {
  return {
    imdbId: row.imdbId,
    title: row.title,
    description: row.overview,
    // Some rows store an empty string instead of NULL.
    releaseDate: row.releaseDate || null,
    budget: formatBudget(row.budget),
    runtime: row.runtime,
    averageRating: roundRating(rating?.average),
    ratingCount: rating?.count ?? 0,
    genres: parseNames(row.genres),
    originalLanguage: row.language || null,
    productionCompanies: parseNames(row.productionCompanies),
  };
}
