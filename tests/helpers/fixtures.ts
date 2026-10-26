import Database from 'better-sqlite3';

const genres = (...names: string[]) => JSON.stringify(names.map((name, id) => ({ id, name })));

const MOVIES = [
  [1, 'tt0000001', 'Alpha', 'First film', '[{"name": "Acme", "id": 1}]', '1995-12-09', 4000000, 98, 'en', genres('Drama', 'Comedy')],
  [2, 'tt0000002', 'Beta', 'Second film', null, '1995-01-15', 0, 120, 'fr', genres('Drama')],
  [3, 'tt0000003', 'Gamma', 'Third film', '[{"name": "Cooper"s Town", "id": 2}]', '2001-06-01', 150, 90, '', genres('Action')],
  [4, 'tt0000004', 'Alpha Returns', null, null, '', 0, null, null, genres('Drama')],
  [5, 'tt0000005', 'Return of Alpha', null, null, '2003-01-01', 0, null, null, null],
  [6, 'tt0000006', '100% Pure', null, null, '2004-01-01', 0, null, null, null],
];

const RATINGS = [
  [1, 10, 1, 4.0, 0],
  [2, 11, 1, 3.0, 0],
  [3, 12, 1, 5.0, 0],
];

function createMoviesDb() {
  const db = new Database(':memory:');
  db.exec(`CREATE TABLE movies (movieId INTEGER PRIMARY KEY, imdbId TEXT NOT NULL, title TEXT NOT NULL,
    overview TEXT, productionCompanies TEXT, releaseDate TEXT, budget INTEGER, revenue INTEGER,
    runtime REAL, language TEXT, genres TEXT, status TEXT)`);
  const insert = db.prepare(`INSERT INTO movies (movieId, imdbId, title, overview, productionCompanies,
    releaseDate, budget, runtime, language, genres) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  MOVIES.forEach((row) => insert.run(...row));
  return db;
}

function createRatingsDb() {
  const db = new Database(':memory:');
  db.exec(`CREATE TABLE ratings (ratingId INTEGER PRIMARY KEY, userId INTEGER NOT NULL,
    movieId INTEGER NOT NULL, rating REAL NOT NULL, timestamp INTEGER NOT NULL)`);
  const insert = db.prepare('INSERT INTO ratings VALUES (?, ?, ?, ?, ?)');
  RATINGS.forEach((row) => insert.run(...row));
  return db;
}

export { createMoviesDb, createRatingsDb };
