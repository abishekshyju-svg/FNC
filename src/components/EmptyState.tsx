import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  query: string;
}

export function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__icon">
        <SearchX size={40} aria-hidden="true" />
      </div>
      <h3 className="empty-state__title">No matching primary key found</h3>
      <p className="empty-state__subtitle">
        No key ending with{' '}
        <span className="empty-state__query">&ldquo;{query}&rdquo;</span>
        {' '}was found in the <code>primarykey</code> column. Check the value and try again.
      </p>
    </div>
  );
}
