import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import Notice from './Notice';

interface Props {
  genre: string;
  onChange: (genre: string) => void;
}

export default function GenrePicker({ genre, onChange }: Props) {
  const genres = useApi((signal) => api.listGenres({ signal }), 'genres');

  if (genres.error) return <Notice error>Genres didn’t load: {genres.error.message}</Notice>;
  if (!genres.data) return <Notice>Loading genres…</Notice>;

  return (
    <div className="genres" role="group" aria-label="Genre">
      {genres.data.map((name) => (
        <button
          key={name}
          type="button"
          className="chip"
          aria-pressed={name === genre}
          onClick={() => onChange(name)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
