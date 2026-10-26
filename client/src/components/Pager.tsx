import { Link } from 'react-router-dom';
import type { Pagination } from '../api/types';

interface Props {
  pagination: Pagination;
  linkToPage: (page: number) => string;
}

export default function Pager({ pagination, linkToPage }: Props) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  return (
    <nav className="pager" aria-label="Pages">
      {page > 1 ? (
        <Link className="pager-link" to={linkToPage(page - 1) || '/'} rel="prev">Previous page</Link>
      ) : (
        <span />
      )}
      <span className="pager-status">Page {page} of {totalPages}</span>
      {page < totalPages ? (
        <Link className="pager-link" to={linkToPage(page + 1)} rel="next">Next page</Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
