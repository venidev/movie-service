

## Pre-requisites

* An IDE or text editor of your choice
* [Sqlite3](http://www.sqlitetutorial.net/)


 
**The Databases**
The databases are provided as a SQLite3 database in `db/`.  It does not require any credentials to login.  You can run SQL queries directly against the database using:

```
sqlite <path to db file>
```

`.tables` will return a list of available tables and `.schema <table>` will provide the schema.

## Considerations
When developing your solution, please consider the following:

* Structure of your endpoints - Can you easily extend the API to support new endpoints as feature requests come in?
* Quality of your code - Does your code demonstrate the use of design patterns?
* Testability - Is your code testable?
* Can your solution be easily configured and deployed?  Consider guidelines from [12 Factor App](http://12factor.net/)


## User Stories

#### List All Movies
AC:

* An endpoint exists that lists all movies
* List is paginated: 50 movies per page, the page can be altered with the `page` query params
* Columns should include: imdb id, title, genres, release date, budget
* Budget is displayed in dollars

#### Movie Details
AC:

* An endpoint exists that lists the movie details for a particular movie
* Details should include: imdb id, title, description, release date, budget, runtime, average rating, genres, original language, production companies
* Budget should be displayed in dollars
* Ratings are pulled from the rating database

#### Movies By Year
AC:

* An endpoint exists that will list all movies from a particular year 
* List is paginated: 50 movies per page, the page can be altered with the `page` query params
* List is sorted by date in chronological order
* Sort order can be descending
* Columns include: imdb id, title, genres, release date, budget

#### Movies By Genre
AC:

* An endpoint exists that will list all movies by a genre
* List is paginated: 50 movies per page, the page can be altered with the `page` query params
* Columns include: imdb id, title, genres, release date, budget

## Tips

* This is a test of your abilities and not how fast you can crank through random stories.  As such, it is more important to produce well structured code that meets the criteria in the user stories rather than getting all stories done.
* If you get stuck, please ask someone.  We want to know how you work both as an individual and as part of a team.  You will not lose points for asking for help on something that is unclear or where you are stuck.

---

## Running the API

Requires Node.js 20+. The API is written in TypeScript and compiled to `dist/`.

```
npm install
npm --prefix client install
cp .env.example .env   # optional; defaults work out of the box

npm run build          # compile the API to dist/ and build the UI into client/dist
npm start              # API + UI on http://localhost:3000
npm run test:all       # type-check, then API (Jest) and client (Vitest) tests
```

For UI development, run the API and the Vite dev server side by side
(Vite proxies `/api` to port 3000 and hot-reloads the UI):

```
npm run dev            # API on :3000 via tsx, restarts on change
npm run dev:client     # UI on http://localhost:5173
```

With Docker:

```
docker build -t movie-services .
docker run -p 3000:3000 movie-services
```

### Endpoints

| Method | Path | Query params |
|--------|------|--------------|
| GET | `/api/v1/movies` | `page`, `q` (title search; exact, then prefix, then substring matches) |
| GET | `/api/v1/movies/:imdbId` | |
| GET | `/api/v1/years/:year/movies` | `page`, `order` (`asc` \| `desc`, default `asc`) |
| GET | `/api/v1/genres` | |
| GET | `/api/v1/genres/:genre/movies` | `page` (genre match is case-insensitive) |
| GET | `/health` | |
| GET | `/` | React UI (when `client/dist` is built) |
| GET | `/docs` | Swagger UI for trying the API in a browser |
| GET | `/openapi.json` | OpenAPI 3 spec; import this URL into Postman/Insomnia (its server URL matches the host you fetch it from) |

Paginated responses look like `{ data: [...], pagination: { page, pageSize, totalItems, totalPages } }`.
Budgets are formatted in dollars (e.g. `"$4,000,000"`); a budget of `0` in the source data is returned as `null`,
as is an empty release date. Errors look like `{ error: { status, message } }`.

### Configuration

All settings come from environment variables (see `.env.example`):
`PORT`, `PAGE_SIZE`, `MOVIES_DB_PATH`, `RATINGS_DB_PATH`, `CLIENT_DIR`, `NODE_ENV`.
If `CLIENT_DIR` has no built UI, the server runs API-only.

### Structure

```
openapi.yaml     API contract, served at /openapi.json and /docs
src/             TypeScript API (strict mode)
  types.ts       row and response types shared across layers
  config/        environment-driven configuration
  db/            SQLite connection factory (read-only)
  repositories/  data access, one per database (interface + SQLite implementation)
  mappers/       row -> API shape (budget formatting, JSON column parsing)
  services/      business logic; combines movies + ratings
  controllers/   HTTP <-> service translation, input validation
  routes/        versioned router; new resources mount here
  middleware/    query parsing, error handling
  docs/          Swagger UI and spec routes
  client.ts      serves the built React app with SPA fallback
  container.ts   composition root (dependency injection)
  app.ts         Express app factory (no I/O, used by tests)
  server.ts      process entry point
tests/           TypeScript, run with Jest via ts-jest
  helpers/       in-memory SQLite fixtures
  unit/          service and mapper tests with typed fakes
  integration/   HTTP tests (Supertest) against the fixtures
dist/            compiled API output (generated by `npm run build`)
client/          React + TypeScript UI (Vite), talks only to the API
  src/api/       one function per API endpoint; response types shared with src/types.ts
  src/hooks/     useApi: fetch with abort + loading/error state
  src/pages/     Browse (URL search params hold all state) and Movie pages
  src/components/ search, year/genre pickers, result list, detail panel
  src/test/      Vitest setup and a stubbed API
```
