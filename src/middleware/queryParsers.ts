import HttpError from '../errors/HttpError';
import type { SortOrder } from '../types';

// Query values are untyped user input (string, array or nested object).
export function parsePage(value: unknown): number {
  if (value === undefined) return 1;
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    throw HttpError.badRequest('`page` must be a positive integer');
  }
  return page;
}

export function parseOrder(value: unknown): SortOrder {
  if (value === undefined) return 'asc';
  const order = String(value).toLowerCase();
  if (order !== 'asc' && order !== 'desc') {
    throw HttpError.badRequest('`order` must be "asc" or "desc"');
  }
  return order;
}

export function parseYear(value: unknown): number {
  if (typeof value !== 'string' || !/^\d{4}$/.test(value)) {
    throw HttpError.badRequest('`year` must be a four-digit year');
  }
  return Number(value);
}

export const MAX_QUERY_LENGTH = 100;

/** Returns the trimmed search text, or undefined when absent or blank. */
export function parseSearchQuery(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw HttpError.badRequest('`q` must be a single string');
  const query = value.trim();
  if (query.length > MAX_QUERY_LENGTH) {
    throw HttpError.badRequest(`\`q\` must be at most ${MAX_QUERY_LENGTH} characters`);
  }
  return query || undefined;
}
