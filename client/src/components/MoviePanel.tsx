import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import MovieDetails from './MovieDetails';
import Notice from './Notice';

interface Props {
  imdbId: string;
  onClose: () => void;
}

/** Side panel showing the movie selected in the results list. */
export default function MoviePanel({ imdbId, onClose }: Props) {
  const movie = useApi((signal) => api.getMovie(imdbId, { signal }), imdbId || null);
  const ref = useRef<HTMLElement>(null);

  // On narrow screens the panel sits below the list; bring it into view.
  useEffect(() => {
    if (imdbId && window.matchMedia?.('(max-width: 959px)').matches) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [imdbId]);

  return (
    <aside
      ref={ref}
      className="panel"
      aria-label="Film details"
      aria-busy={movie.loading}
      data-loading={movie.loading || undefined}
    >
      {!imdbId && (
        <div className="panel-empty">
          <p>Pick a film from the list to see its rating, budget and production details.</p>
        </div>
      )}
      {imdbId && movie.error && <Notice error>{movie.error.message}</Notice>}
      {imdbId && movie.data && (
        <div className="panel-content" key={movie.data.imdbId}>
          <div className="panel-actions">
            <Link to={`/movies/${movie.data.imdbId}`}>Open full page</Link>
            <button type="button" className="text-button" onClick={onClose}>
              Close{' '}<span className="visually-hidden">film details</span>
            </button>
          </div>
          <MovieDetails movie={movie.data} />
        </div>
      )}
    </aside>
  );
}
