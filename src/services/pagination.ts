import type { PageRequest, Paged, RowPage } from '../types';

export function toPage(page: number, pageSize: number): PageRequest {
  return { limit: pageSize, offset: (page - 1) * pageSize };
}

export function toPagedResponse<Row, Item>(
  { rows, total }: RowPage<Row>,
  { page, pageSize }: { page: number; pageSize: number },
  mapRow: (row: Row) => Item,
): Paged<Item> {
  return {
    data: rows.map(mapRow),
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
