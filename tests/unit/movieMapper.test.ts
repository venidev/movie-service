import type { MovieDetailRow } from '../../src/types';
import { formatBudget, parseNames, toMovieDetails } from '../../src/mappers/movieMapper';

describe('movieMapper', () => {
  test('formats budget in dollars', () => {
    expect(formatBudget(4000000)).toBe('$4,000,000');
  });

  test('treats a zero budget as unknown', () => {
    expect(formatBudget(0)).toBeNull();
  });

  test('parses names from JSON arrays', () => {
    expect(parseNames('[{"id": 18, "name": "Drama"}, {"id": 35, "name": "Comedy"}]')).toEqual([
      'Drama',
      'Comedy',
    ]);
  });

  test('recovers names from malformed JSON with unescaped quotes', () => {
    const raw = '[{"name": "Cooper"s Town Productions", "id": 213}, {"name": "Eagle Vision", "id": 214}]';
    expect(parseNames(raw)).toEqual(['Cooper"s Town Productions', 'Eagle Vision']);
  });

  test('returns empty list for missing values', () => {
    expect(parseNames(null)).toEqual([]);
  });

  test('rounds average rating and handles missing ratings', () => {
    const row: MovieDetailRow = {
      movieId: 1,
      imdbId: 'tt1',
      title: 'T',
      overview: null,
      releaseDate: null,
      budget: 0,
      runtime: null,
      genres: null,
      language: '',
      productionCompanies: null,
    };
    expect(toMovieDetails(row, { average: 3.33333, count: 3 }).averageRating).toBe(3.33);
    expect(toMovieDetails(row, { average: null, count: 0 })).toMatchObject({
      averageRating: null,
      ratingCount: 0,
      originalLanguage: null,
    });
  });
});
