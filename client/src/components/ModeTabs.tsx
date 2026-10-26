import { Link } from 'react-router-dom';
import type { BrowseBy, View } from '../pages/browseState';

const TABS: { by: BrowseBy; label: string }[] = [
  { by: 'all', label: 'All films' },
  { by: 'year', label: 'By year' },
  { by: 'genre', label: 'By genre' },
];

interface Props {
  active: View;
  linkTo: (by: BrowseBy) => string;
}

export default function ModeTabs({ active, linkTo }: Props) {
  return (
    <nav className="tabs" aria-label="Browse films">
      {TABS.map((tab) => (
        <Link
          key={tab.by}
          to={linkTo(tab.by) || '/'}
          aria-current={tab.by === active ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
