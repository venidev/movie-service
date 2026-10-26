import { Link } from 'react-router-dom';
import type { MovieSummary } from '../api/types';
import Notice from './Notice';

interface Props {
  movies: MovieSummary[];
  selected: string;
  emptyMessage: string;
  linkToMovie: (imdbId: string) => string;
}

export default function ResultList({ movies, selected, emptyMessage, linkToMovie }: Props) {
  if (movies.length === 0) return <Notice>{emptyMessage}</Notice>;

  return (
    <ol className="result-list">
      {movies.map((movie) => (
        <li
          key={movie.imdbId}
          className="result"
          aria-current={movie.imdbId === selected ? 'true' : undefined}
        >
          <span className="result-year" aria-hidden="true">
            {movie.releaseDate?.slice(0, 4) ?? '—'}
          </span>
          <div className="result-main">
            <Link className="result-title" to={linkToMovie(movie.imdbId)}>
              {movie.title}
            </Link>
            <span className="result-meta">
              {movie.releaseDate ? (
                <time dateTime={movie.releaseDate}>{movie.releaseDate}</time>
              ) : (
                <span>Release date unknown</span>
              )}
              {movie.genres.length > 0 && <span>{movie.genres.join(', ')}</span>}
            </span>
          </div>
          <span className="result-budget">
            {movie.budget && (
              <>
                <span className="visually-hidden">Budget</span>{' '}
                {movie.budget}
              </>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
