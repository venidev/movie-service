import { Link, Route, Routes } from 'react-router-dom';
import BrowsePage from './pages/BrowsePage';
import MoviePage from './pages/MoviePage';
import Notice from './components/Notice';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#content">Skip to content</a>
      <header className="site-header">
        <Link className="brand" to="/">Movies</Link>
        <nav aria-label="Site">
          {/* Served by the API, not the React router. */}
          <a href="/docs">API docs</a>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<BrowsePage />} />
        <Route path="/movies/:imdbId" element={<MoviePage />} />
        <Route
          path="*"
          element={
            <main id="content" className="page">
              <Notice error>This page doesn’t exist. <Link to="/">Browse all films</Link>.</Notice>
            </main>
          }
        />
      </Routes>
    </>
  );
}
