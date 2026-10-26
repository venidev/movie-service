import { vi, type MockInstance } from 'vitest';
import type { MovieDetails, MovieSummary, Paged } from '../api/types';

const movie = (n: number, extra: Partial<MovieSummary> = {}): MovieSummary => ({
  imdbId: `tt000000${n}`,
  title: `Movie ${n}`,
  genres: ['Drama'],
  releaseDate: `1995-0${n}-01`,
  budget: n === 1 ? '$4,000,000' : null,
  ...extra,
});

export const MOVIE_DETAILS: MovieDetails = {
  imdbId: 'tt0000001',
  title: 'Movie 1',
  description: 'A film.',
  releaseDate: '1995-01-01',
  budget: '$4,000,000',
  runtime: 98,
  averageRating: 3.27,
  ratingCount: 56,
  genres: ['Drama', 'Comedy'],
  originalLanguage: 'fr',
  productionCompanies: ['Miramax Films'],
};

const page = (data: MovieSummary[], pageNo = 1, totalPages = 2): Paged<MovieSummary> => ({
  data,
  pagination: { page: pageNo, pageSize: 50, totalItems: totalPages * 50, totalPages },
});

const json = (status: number, body: unknown) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) } as Response);

/** Stubs global fetch with canned API responses; returns the mock. */
export function mockApi(): MockInstance<typeof fetch> {
  return vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const { pathname, searchParams } = new URL(String(input), 'http://test');
    const pageNo = Number(searchParams.get('page')) || 1;
    const q = searchParams.get('q');

    if (pathname === '/api/v1/genres') return json(200, { data: ['Action', 'Drama'] });
    if (pathname === '/api/v1/movies/tt0000001') return json(200, { data: MOVIE_DETAILS });
    if (pathname.startsWith('/api/v1/movies/')) {
      return json(404, { error: { status: 404, message: 'Movie not found' } });
    }
    if (pathname === '/api/v1/years/95/movies') {
      return json(400, { error: { status: 400, message: '`year` must be a four-digit year' } });
    }
    if (q === 'zzz') return json(200, { data: [], pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0 } });
    if (q) return json(200, page([movie(3, { title: `Star ${q}` })], 1, 1));
    return json(200, page([movie(1), movie(2)], pageNo));
  });
}

export const requestedUrls = (fetchMock: MockInstance<typeof fetch>) =>
  fetchMock.mock.calls.map(([url]) => String(url));
