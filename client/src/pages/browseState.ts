import { api } from '../api/client';
import type { MovieSummary, Paged, SortOrder } from '../api/types';

export type BrowseBy = 'all' | 'year' | 'genre';
export type View = BrowseBy | 'search';

export interface BrowseState {
  by: BrowseBy;
  q: string;
  year: string;
  genre: string;
  order: SortOrder;
  page: number;
  movie: string;
}

const BROWSE_BY: readonly BrowseBy[] = ['all', 'year', 'genre'];

const isBrowseBy = (value: string | null): value is BrowseBy =>
  BROWSE_BY.includes(value as BrowseBy);

/** URL search params are the single source of truth for browse state. */
export function readBrowseState(params: URLSearchParams): BrowseState {
  const by = params.get('by');
  return {
    by: isBrowseBy(by) ? by : 'all',
    q: params.get('q') ?? '',
    year: params.get('year') ?? '',
    genre: params.get('genre') ?? '',
    order: params.get('order') === 'desc' ? 'desc' : 'asc',
    page: Math.max(1, Number(params.get('page')) || 1),
    movie: params.get('movie') ?? '',
  };
}

/** An active search takes precedence over the browse filters. */
export const viewOf = (state: BrowseState): View => (state.q.trim() ? 'search' : state.by);

/** Builds a search string from state, omitting defaults and irrelevant fields. */
export function toSearch(state: BrowseState): string {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.by !== 'all') params.set('by', state.by);
  if (state.by === 'year' && state.year) params.set('year', state.year);
  if (state.by === 'year' && state.order === 'desc') params.set('order', 'desc');
  if (state.by === 'genre' && state.genre) params.set('genre', state.genre);
  if (state.page > 1) params.set('page', String(state.page));
  if (state.movie) params.set('movie', state.movie);
  const search = params.toString();
  return search ? `?${search}` : '';
}

type ResultsRequest = (signal: AbortSignal) => Promise<Paged<MovieSummary>>;

/** Returns the request for the current view, or null if a filter is still missing. */
export function resultsRequest(state: BrowseState): ResultsRequest | null {
  const { year, genre, order, page } = state;
  switch (viewOf(state)) {
    case 'search':
      return (signal) => api.listMovies({ page, q: state.q.trim() }, { signal });
    case 'year':
      return year ? (signal) => api.listMoviesByYear(year, { page, order }, { signal }) : null;
    case 'genre':
      return genre ? (signal) => api.listMoviesByGenre(genre, { page }, { signal }) : null;
    case 'all':
      return (signal) => api.listMovies({ page }, { signal });
  }
}

/** Heading for the results list in plain words. */
export function resultsTitle(state: BrowseState): string {
  switch (viewOf(state)) {
    case 'search':
      return `Titles matching “${state.q.trim()}”`;
    case 'year':
      return state.year ? `Films from ${state.year}` : 'Films by year';
    case 'genre':
      return state.genre || 'Films by genre';
    case 'all':
      return 'All films';
  }
}
