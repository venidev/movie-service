import { useEffect, useState } from 'react';
import type { SortOrder } from '../api/types';

// The catalogue runs from the 1870s to the 2010s (plus a stray 2020 entry).
const FIRST_DECADE = 1870;
const LAST_YEAR = 2020;
const DECADES = Array.from(
  { length: (LAST_YEAR - FIRST_DECADE) / 10 + 1 },
  (_, i) => FIRST_DECADE + i * 10,
);
const DEFAULT_DECADE = 1990;

const decadeOf = (year: string) => Math.floor(Number(year) / 10) * 10;

interface Props {
  year: string;
  order: SortOrder;
  onChange: (changes: { year?: string; order?: SortOrder }) => void;
}

export default function YearPicker({ year, order, onChange }: Props) {
  const [decade, setDecade] = useState(year ? decadeOf(year) : DEFAULT_DECADE);
  useEffect(() => {
    if (year) setDecade(decadeOf(year));
  }, [year]);

  const years = Array.from({ length: 10 }, (_, i) => decade + i).filter((y) => y <= LAST_YEAR);

  return (
    <div className="picker">
      <div className="decades" role="group" aria-label="Decade">
        {DECADES.map((d) => (
          <button
            key={d}
            type="button"
            className="decade"
            aria-pressed={d === decade}
            onClick={() => setDecade(d)}
          >
            {d}s
          </button>
        ))}
      </div>

      <div className="picker-row">
        <div className="years" role="group" aria-label={`Years in the ${decade}s`}>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              className="year"
              aria-pressed={String(y) === year}
              onClick={() => onChange({ year: String(y) })}
            >
              {y}
            </button>
          ))}
        </div>

        <div className="segmented" role="group" aria-label="Sort by release date">
          {(['asc', 'desc'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={order === value}
              onClick={() => onChange({ order: value })}
            >
              {value === 'asc' ? 'Oldest first' : 'Newest first'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
