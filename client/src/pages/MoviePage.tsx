import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import MovieDetails from '../components/MovieDetails';
import Notice from '../components/Notice';

export default function MoviePage() {
  const { imdbId = '' } = useParams();
  const { data, error, loading } = useApi((signal) => api.getMovie(imdbId, { signal }), imdbId);

  return (
    <main id="content" className="page page-narrow">
      <p className="back-link"><Link to="/">Back to all films</Link></p>
      {loading && !data && <Notice>Loading film…</Notice>}
      {error && <Notice error>{error.message}</Notice>}
      {data && <MovieDetails movie={data} headingLevel={1} />}
    </main>
  );
}
