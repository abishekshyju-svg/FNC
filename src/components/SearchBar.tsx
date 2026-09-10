import { useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  resultCount: number | null;
  fileName: string;
}

export function SearchBar({ value, onChange, resultCount, fileName }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="search-section">
      <div className="search-meta">
        <span className="search-meta__file">
          <span className="search-meta__dot" aria-hidden="true" />
          {fileName}
        </span>
        {resultCount !== null && value.trim() && (
          <span className="search-meta__count">
            {resultCount === 0
              ? 'No match found'
              : `${resultCount} equipment${resultCount !== 1 ? 's' : ''} found`}
          </span>
        )}
      </div>

      <div className="search-bar">
        <span className="search-bar__icon" aria-hidden="true">
          <Search size={20} />
        </span>
        <input
          ref={inputRef}
          className="search-bar__input"
          type="text"
          placeholder="Paste or type a primarykey value…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
          aria-label="Search by primary key"
          spellCheck={false}
        />
        {value && (
          <button
            className="search-bar__clear"
            onClick={handleClear}
            aria-label="Clear search"
            type="button"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
