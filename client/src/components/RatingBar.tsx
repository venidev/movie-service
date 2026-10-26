const SEGMENTS = 5;

interface Props {
  average: number | null;
  count: number;
}

/** Average rating (0–5) shown as five partially filled segments. */
export default function RatingBar({ average, count }: Props) {
  if (average == null) return <p className="rating rating-empty">No ratings yet</p>;

  const noun = count === 1 ? 'rating' : 'ratings';
  const label = `Rated ${average.toFixed(2)} out of 5 from ${count.toLocaleString('en-US')} ${noun}`;

  return (
    <div className="rating">
      <span className="rating-value" aria-hidden="true">{average.toFixed(1)}</span>
      <div className="rating-body">
        <div className="rating-bar" role="img" aria-label={label}>
          {Array.from({ length: SEGMENTS }, (_, i) => {
            const fill = Math.min(1, Math.max(0, average - i));
            return (
              <span key={i} className="rating-segment">
                <span style={{ width: `${fill * 100}%` }} />
              </span>
            );
          })}
        </div>
        <span className="rating-count" aria-hidden="true">
          out of 5, from {count.toLocaleString('en-US')} {noun}
        </span>
      </div>
    </div>
  );
}
