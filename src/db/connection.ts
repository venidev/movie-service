import Database from 'better-sqlite3';

export type Db = Database.Database;

/**
 * Opens a SQLite database. Source data is read-only by default so the API
 * can never mutate the provided datasets.
 */
export function openDatabase(filePath: string, { readonly = true } = {}): Db {
  return new Database(filePath, { readonly, fileMustExist: readonly });
}
