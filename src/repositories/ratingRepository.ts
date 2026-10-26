import type { Db } from '../db/connection';
import type { RatingSummary } from '../types';

export interface RatingRepository {
  getAverageForMovie(movieId: number): RatingSummary;
}

/**
 * Data access for the ratings database, which lives in a separate file
 * from movies and is joined in the service layer by movieId.
 */
export class SqliteRatingRepository implements RatingRepository {
  private readonly averageStmt;

  constructor(db: Db) {
    this.averageStmt = db.prepare<[number], RatingSummary>(
      'SELECT AVG(rating) AS average, COUNT(*) AS count FROM ratings WHERE movieId = ?',
    );
  }

  getAverageForMovie(movieId: number): RatingSummary {
    // Aggregates always return exactly one row.
    const { average, count } = this.averageStmt.get(movieId)!;
    return { average, count };
  }
}
