import type { Db } from '../db/connection';
import type {
  MovieDetailRow,
  MovieSummaryRow,
  PageRequest,
  RowPage,
  SortOrder,
} from '../types';

export interface MovieRepository {
  findAll(page: PageRequest): RowPage<MovieSummaryRow>;
  searchByTitle(query: string, page: PageRequest): RowPage<MovieSummaryRow>;
  findByImdbId(imdbId: string): MovieDetailRow | undefined;
  findByYear(year: number, query: PageRequest & { order?: SortOrder }): RowPage<MovieSummaryRow>;
  findByGenre(genre: string, page: PageRequest): RowPage<MovieSummaryRow>;
  listGenres(): string[];
}

const SUMMARY_COLUMNS = 'movieId, imdbId, title, genres, releaseDate, budget';

const DETAIL_COLUMNS = `
  movieId, imdbId, title, overview, releaseDate, budget, runtime,
  genres, language, productionCompanies
`;

const HAS_GENRE = `
  EXISTS (
    SELECT 1 FROM json_each(movies.genres) AS g
    WHERE lower(json_extract(g.value, '$.name')) = lower(@genre)
  )
`;

interface TitleSearch {
  query: string;
  contains: string;
  prefix: string;
}

/** Escapes LIKE wildcards so user input matches literally. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

interface YearRange {
  from: string;
  to: string;
}

type Count = { total: number };

/**
 * Data access for the movies database. Returns raw rows; shaping for the API
 * happens in the mapper layer. Statements are prepared once and reused.
 */
export class SqliteMovieRepository implements MovieRepository {
  private readonly statements;

  constructor(db: Db) {
    this.statements = {
      findAll: db.prepare<PageRequest, MovieSummaryRow>(
        `SELECT ${SUMMARY_COLUMNS} FROM movies ORDER BY movieId LIMIT @limit OFFSET @offset`,
      ),
      countAll: db.prepare<[], Count>('SELECT COUNT(*) AS total FROM movies'),

      // Exact title first, then titles starting with the query, then the rest.
      searchByTitle: db.prepare<TitleSearch & PageRequest, MovieSummaryRow>(
        `SELECT ${SUMMARY_COLUMNS} FROM movies
         WHERE title LIKE @contains ESCAPE '\\'
         ORDER BY
           CASE
             WHEN lower(title) = lower(@query) THEN 0
             WHEN title LIKE @prefix ESCAPE '\\' THEN 1
             ELSE 2
           END,
           releaseDate DESC, movieId
         LIMIT @limit OFFSET @offset`,
      ),
      countByTitle: db.prepare<Pick<TitleSearch, 'contains'>, Count>(
        `SELECT COUNT(*) AS total FROM movies WHERE title LIKE @contains ESCAPE '\\'`,
      ),

      findByImdbId: db.prepare<[string], MovieDetailRow>(
        `SELECT ${DETAIL_COLUMNS} FROM movies WHERE imdbId = ?`,
      ),

      findByYearAsc: db.prepare<YearRange & PageRequest, MovieSummaryRow>(
        `SELECT ${SUMMARY_COLUMNS} FROM movies
         WHERE releaseDate >= @from AND releaseDate < @to
         ORDER BY releaseDate ASC, movieId ASC LIMIT @limit OFFSET @offset`,
      ),
      findByYearDesc: db.prepare<YearRange & PageRequest, MovieSummaryRow>(
        `SELECT ${SUMMARY_COLUMNS} FROM movies
         WHERE releaseDate >= @from AND releaseDate < @to
         ORDER BY releaseDate DESC, movieId DESC LIMIT @limit OFFSET @offset`,
      ),
      countByYear: db.prepare<YearRange, Count>(
        'SELECT COUNT(*) AS total FROM movies WHERE releaseDate >= @from AND releaseDate < @to',
      ),

      findByGenre: db.prepare<{ genre: string } & PageRequest, MovieSummaryRow>(
        `SELECT ${SUMMARY_COLUMNS} FROM movies WHERE ${HAS_GENRE}
         ORDER BY movieId LIMIT @limit OFFSET @offset`,
      ),
      countByGenre: db.prepare<{ genre: string }, Count>(
        `SELECT COUNT(*) AS total FROM movies WHERE ${HAS_GENRE}`,
      ),

      listGenres: db.prepare<[], { name: string }>(
        `SELECT DISTINCT json_extract(g.value, '$.name') AS name
         FROM movies, json_each(movies.genres) AS g ORDER BY name`,
      ),
    };
  }

  findAll({ limit, offset }: PageRequest): RowPage<MovieSummaryRow> {
    return {
      rows: this.statements.findAll.all({ limit, offset }),
      total: this.statements.countAll.get()!.total,
    };
  }

  searchByTitle(query: string, { limit, offset }: PageRequest): RowPage<MovieSummaryRow> {
    // LIKE is case-insensitive for ASCII in SQLite.
    const escaped = escapeLike(query);
    const contains = `%${escaped}%`;
    return {
      rows: this.statements.searchByTitle.all({
        query,
        contains,
        prefix: `${escaped}%`,
        limit,
        offset,
      }),
      total: this.statements.countByTitle.get({ contains })!.total,
    };
  }

  findByImdbId(imdbId: string): MovieDetailRow | undefined {
    return this.statements.findByImdbId.get(imdbId);
  }

  findByYear(
    year: number,
    { limit, offset, order = 'asc' }: PageRequest & { order?: SortOrder },
  ): RowPage<MovieSummaryRow> {
    // A date range (instead of strftime) keeps the predicate index-friendly.
    const range = { from: `${year}-01-01`, to: `${year + 1}-01-01` };
    const stmt = order === 'desc' ? this.statements.findByYearDesc : this.statements.findByYearAsc;
    return {
      rows: stmt.all({ ...range, limit, offset }),
      total: this.statements.countByYear.get(range)!.total,
    };
  }

  findByGenre(genre: string, { limit, offset }: PageRequest): RowPage<MovieSummaryRow> {
    return {
      rows: this.statements.findByGenre.all({ genre, limit, offset }),
      total: this.statements.countByGenre.get({ genre })!.total,
    };
  }

  listGenres(): string[] {
    return this.statements.listGenres.all().map((row) => row.name);
  }
}
