import type { MovieDetails as Movie } from '../api/types';
import RatingBar from './RatingBar';

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

function languageName(code: string | null): string | null {
  if (!code) return null;
  try {
    return languageNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return hours ? `${hours} h ${rest} min` : `${rest} min`;
}

function formatDate(date: string | null): string | null {
  if (!date) return null;
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface Props {
  movie: Movie;
  headingLevel?: 1 | 2;
}

export default function MovieDetails({ movie, headingLevel = 2 }: Props) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const facts: [string, string | null][] = [
    ['Released', formatDate(movie.releaseDate)],
    ['Runtime', formatRuntime(movie.runtime)],
    ['Budget', movie.budget ?? 'Not reported'],
    ['Language', languageName(movie.originalLanguage)],
    ['Genres', movie.genres.join(', ') || null],
    ['Production', movie.productionCompanies.join(', ') || null],
  ];

  return (
    <article className="movie">
      <Heading className="movie-title">{movie.title}</Heading>
      <RatingBar average={movie.averageRating} count={movie.ratingCount} />
      {movie.description && <p className="movie-overview">{movie.description}</p>}
      <dl className="facts">
        {facts.map(
          ([label, value]) =>
            value && (
              <div key={label} className="fact">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ),
        )}
        <div className="fact">
          <dt>IMDb</dt>
          <dd>
            <a href={`https://www.imdb.com/title/${movie.imdbId}/`} target="_blank" rel="noopener noreferrer">
              {movie.imdbId}{' '}
              <span className="visually-hidden">(opens IMDb in a new tab)</span>
            </a>
          </dd>
        </div>
      </dl>
    </article>
  );
}
