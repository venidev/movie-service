import type { MovieDetails, MovieSummary, Paged, SortOrder } from './types';

const BASE = '/api/v1';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  signal?: AbortSignal;
}

type QueryValue = string | number | undefined;

function query(params: Record<string, QueryValue>): string {
  const entries = Object.entries(params).flatMap(([key, value]) =>
    value === undefined || value === '' ? [] : [[key, String(value)]],
  );
  const search = new URLSearchParams(entries).toString();
  return search ? `?${search}` : '';
}

async function getJson<T>(path: string, { signal }: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { signal, headers: { Accept: 'application/json' } });
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (body as { error?: { message?: string } } | null)?.error?.message;
    throw new ApiError(res.status, message ?? `Request failed (${res.status})`);
  }
  return body as T;
}

/** One function per API endpoint; components never build URLs themselves. */
export const api = {
  listMovies: ({ page, q }: { page: number; q?: string }, opts?: RequestOptions) =>
    getJson<Paged<MovieSummary>>(`/movies${query({ q, page })}`, opts),

  getMovie: (imdbId: string, opts?: RequestOptions) =>
    getJson<{ data: MovieDetails }>(`/movies/${encodeURIComponent(imdbId)}`, opts).then(
      (body) => body.data,
    ),

  listMoviesByYear: (
    year: string,
    { page, order }: { page: number; order: SortOrder },
    opts?: RequestOptions,
  ) =>
    getJson<Paged<MovieSummary>>(
      `/years/${encodeURIComponent(year)}/movies${query({ page, order })}`,
      opts,
    ),

  listMoviesByGenre: (genre: string, { page }: { page: number }, opts?: RequestOptions) =>
    getJson<Paged<MovieSummary>>(`/genres/${encodeURIComponent(genre)}/movies${query({ page })}`, opts),

  listGenres: (opts?: RequestOptions) =>
    getJson<{ data: string[] }>('/genres', opts).then((body) => body.data),
};
