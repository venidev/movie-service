import { useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import {
  readBrowseState,
  resultsRequest,
  resultsTitle,
  toSearch,
  viewOf,
  type BrowseState,
} from './browseState';
import SearchHero from '../components/SearchHero';
import ModeTabs from '../components/ModeTabs';
import YearPicker from '../components/YearPicker';
import GenrePicker from '../components/GenrePicker';
import ResultList from '../components/ResultList';
import Pager from '../components/Pager';
import MoviePanel from '../components/MoviePanel';
import Notice from '../components/Notice';

const HINTS = {
  year: 'Pick a decade, then a year.',
  genre: 'Pick a genre to see its films.',
} as const;

const FILTER_FIELDS: (keyof BrowseState)[] = ['q', 'year', 'genre', 'order'];

export default function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const state = readBrowseState(params);
  const view = viewOf(state);

  // The selected movie isn't part of the results query.
  const request = resultsRequest(state);
  const resultsKey = request ? toSearch({ ...state, movie: '' }) || '?' : null;
  const results = useApi(request, resultsKey);

  /** Applies changes to the URL; changing a filter returns to page 1. */
  const update = (changes: Partial<BrowseState>, { replace = false } = {}) => {
    const resetsPage = FILTER_FIELDS.some((field) => field in changes);
    const next = { ...state, ...(resetsPage && { page: 1 }), ...changes };
    setParams(toSearch(next), { replace });
  };

  const linkTo = (changes: Partial<BrowseState>) => toSearch({ ...state, ...changes });

  return (
    <>
      <SearchHero
        value={state.q}
        onSearch={(q) => update({ q, movie: '' }, { replace: view === 'search' && q !== '' })}
      />

      <main id="content" className="page">
        <div className="controls">
          <ModeTabs active={view} linkTo={(by) => toSearch({ ...state, by, q: '', page: 1, movie: '' })} />
          {view === 'year' && (
            <YearPicker year={state.year} order={state.order} onChange={(changes) => update(changes)} />
          )}
          {view === 'genre' && (
            <GenrePicker genre={state.genre} onChange={(genre) => update({ genre })} />
          )}
        </div>

        <div className="browse">
          <section
            className="results"
            aria-labelledby="results-title"
            aria-busy={results.loading}
            data-loading={results.loading || undefined}
          >
            <header className="results-header">
              <h1 id="results-title">{resultsTitle(state)}</h1>
              {results.data && results.data.pagination.totalItems > 0 && (
                <p className="results-count">
                  {results.data.pagination.totalItems.toLocaleString('en-US')}{' '}
                  {results.data.pagination.totalItems === 1 ? 'film' : 'films'}, page{' '}
                  {results.data.pagination.page} of {results.data.pagination.totalPages}
                </p>
              )}
            </header>

            {!request && (view === 'year' || view === 'genre') && <Notice>{HINTS[view]}</Notice>}
            {results.error && <Notice error>{results.error.message}</Notice>}
            {results.data && (
              <>
                <ResultList
                  movies={results.data.data}
                  selected={state.movie}
                  emptyMessage={
                    view === 'search'
                      ? 'No titles match. Try a shorter or different word.'
                      : 'No films here. Try another page or filter.'
                  }
                  linkToMovie={(imdbId) => linkTo({ movie: imdbId })}
                />
                <Pager
                  pagination={results.data.pagination}
                  linkToPage={(page) => linkTo({ page, movie: '' })}
                />
              </>
            )}
          </section>

          <MoviePanel imdbId={state.movie} onClose={() => update({ movie: '' })} />
        </div>
      </main>
    </>
  );
}
