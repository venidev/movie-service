import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createContainer, type Container } from '../../src/container';
import type { MovieSummary } from '../../src/types';
import { createMoviesDb, createRatingsDb } from '../helpers/fixtures';

let container: Container;
let app: Express;

beforeAll(() => {
  container = createContainer(
    { pageSize: 2 },
    { moviesDb: createMoviesDb(), ratingsDb: createRatingsDb() },
  );
  app = createApp(container.services);
});

afterAll(() => container.close());

describe('GET /api/v1/movies', () => {
  test('lists movies with the summary columns, paginated', async () => {
    const res = await request(app).get('/api/v1/movies').expect(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toEqual({
      imdbId: 'tt0000001',
      title: 'Alpha',
      genres: ['Drama', 'Comedy'],
      releaseDate: '1995-12-09',
      budget: '$4,000,000',
    });
    expect(res.body.pagination).toEqual({ page: 1, pageSize: 2, totalItems: 6, totalPages: 3 });
  });

  test('honours the page query param', async () => {
    const res = await request(app).get('/api/v1/movies?page=2').expect(200);
    expect(res.body.data.map((m: MovieSummary) => m.title)).toEqual(['Gamma', 'Alpha Returns']);
  });

  test.each(['0', '-1', 'abc', '1.5'])('rejects invalid page %s', async (page) => {
    await request(app).get(`/api/v1/movies?page=${page}`).expect(400);
  });
});

describe('GET /api/v1/movies?q=', () => {
  const titles = async (q: string) => {
    const res = await request(app).get('/api/v1/movies').query({ q }).expect(200);
    return res.body.data.map((m: MovieSummary) => m.title);
  };

  test('ranks exact, then prefix, then substring matches', async () => {
    const res = await request(app).get('/api/v1/movies?q=alpha').expect(200);
    expect(res.body.data.map((m: MovieSummary) => m.title)).toEqual(['Alpha', 'Alpha Returns']);
    expect(res.body.pagination).toMatchObject({ totalItems: 3, totalPages: 2 });
    const page2 = await request(app).get('/api/v1/movies?q=alpha&page=2').expect(200);
    expect(page2.body.data.map((m: MovieSummary) => m.title)).toEqual(['Return of Alpha']);
  });

  test('treats LIKE wildcards literally', async () => {
    expect(await titles('%')).toEqual(['100% Pure']);
    expect(await titles('_')).toEqual([]);
  });

  test('ignores blank queries', async () => {
    const res = await request(app).get('/api/v1/movies?q=%20%20').expect(200);
    expect(res.body.pagination.totalItems).toBe(6);
  });

  test('rejects overly long or repeated queries', async () => {
    await request(app).get(`/api/v1/movies?q=${'a'.repeat(101)}`).expect(400);
    await request(app).get('/api/v1/movies?q=a&q=b').expect(400);
  });
});

test('empty release dates are returned as null', async () => {
  const res = await request(app).get('/api/v1/movies/tt0000004').expect(200);
  expect(res.body.data.releaseDate).toBeNull();
});

describe('GET /api/v1/movies/:imdbId', () => {
  test('returns details with average rating from the ratings database', async () => {
    const res = await request(app).get('/api/v1/movies/tt0000001').expect(200);
    expect(res.body.data).toEqual({
      imdbId: 'tt0000001',
      title: 'Alpha',
      description: 'First film',
      releaseDate: '1995-12-09',
      budget: '$4,000,000',
      runtime: 98,
      averageRating: 4,
      ratingCount: 3,
      genres: ['Drama', 'Comedy'],
      originalLanguage: 'en',
      productionCompanies: ['Acme'],
    });
  });

  test('404s for an unknown movie', async () => {
    await request(app).get('/api/v1/movies/tt9999999').expect(404);
  });
});

describe('GET /api/v1/years/:year/movies', () => {
  test('sorts chronologically by default', async () => {
    const res = await request(app).get('/api/v1/years/1995/movies').expect(200);
    expect(res.body.data.map((m: MovieSummary) => m.releaseDate)).toEqual(['1995-01-15', '1995-12-09']);
  });

  test('supports descending order', async () => {
    const res = await request(app).get('/api/v1/years/1995/movies?order=desc').expect(200);
    expect(res.body.data.map((m: MovieSummary) => m.releaseDate)).toEqual(['1995-12-09', '1995-01-15']);
  });

  test('rejects invalid year and order', async () => {
    await request(app).get('/api/v1/years/95/movies').expect(400);
    await request(app).get('/api/v1/years/1995/movies?order=up').expect(400);
  });
});

describe('GET /api/v1/genres/:genre/movies', () => {
  test('lists movies in a genre, case-insensitively', async () => {
    const res = await request(app).get('/api/v1/genres/drama/movies').expect(200);
    expect(res.body.data.map((m: MovieSummary) => m.title)).toEqual(['Alpha', 'Beta']);
    expect(res.body.pagination.totalItems).toBe(3);
  });

  test('returns an empty page for unknown genres', async () => {
    const res = await request(app).get('/api/v1/genres/Western/movies').expect(200);
    expect(res.body.data).toEqual([]);
  });
});

test('unknown routes return a JSON 404', async () => {
  const res = await request(app).get('/nope').expect(404);
  expect(res.body.error.status).toBe(404);
});

describe('API docs', () => {
  test('serves the OpenAPI spec covering every API route', async () => {
    const res = await request(app).get('/openapi.json').expect(200);
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining([
        '/api/v1/movies',
        '/api/v1/movies/{imdbId}',
        '/api/v1/years/{year}/movies',
        '/api/v1/genres',
        '/api/v1/genres/{genre}/movies',
      ]),
    );
  });

  test('points servers at the requesting host', async () => {
    const res = await request(app).get('/openapi.json').set('Host', 'api.example.test:8080');
    expect(res.body.servers).toEqual([{ url: 'http://api.example.test:8080' }]);
  });

  test('documents every path parameter', async () => {
    const res = await request(app).get('/openapi.json');
    const params = Object.values(res.body.paths as Record<string, { get: { parameters?: { in: string; description?: string }[] } }>)
      .flatMap((path) => path.get.parameters ?? [])
      .filter((param) => param.in === 'path');
    expect(params.length).toBeGreaterThan(0);
    params.forEach((param) => expect(param.description).toBeTruthy());
  });

  test('serves Swagger UI', async () => {
    const res = await request(app).get('/docs/').expect(200);
    expect(res.text).toContain('swagger-ui');
  });
});

test('GET /api/v1/genres lists distinct genres alphabetically', async () => {
  const res = await request(app).get('/api/v1/genres').expect(200);
  expect(res.body.data).toEqual(['Action', 'Comedy', 'Drama']);
});
