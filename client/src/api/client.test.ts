import { describe, expect, test } from 'vitest';
import { api, ApiError } from './client';
import { mockApi, requestedUrls } from '../test/fakeApi';

describe('api client', () => {
  test('builds endpoint URLs with query params', async () => {
    const fetchMock = mockApi();
    await api.listMovies({ page: 2 });
    await api.listMovies({ page: 1, q: 'star wars' });
    await api.listMoviesByYear('1995', { page: 1, order: 'desc' });
    await api.listMoviesByGenre('Science Fiction', { page: 3 });
    expect(requestedUrls(fetchMock)).toEqual([
      '/api/v1/movies?page=2',
      '/api/v1/movies?q=star+wars&page=1',
      '/api/v1/years/1995/movies?page=1&order=desc',
      '/api/v1/genres/Science%20Fiction/movies?page=3',
    ]);
  });

  test('unwraps single resources', async () => {
    mockApi();
    expect(await api.listGenres()).toEqual(['Action', 'Drama']);
    expect((await api.getMovie('tt0000001')).title).toBe('Movie 1');
  });

  test('throws ApiError with the server message', async () => {
    mockApi();
    const error = await api.getMovie('tt404').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, message: 'Movie not found' });
  });
});
