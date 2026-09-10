import { useState, useCallback, useDeferredValue } from 'react';
import { AppLayout } from './components/AppLayout';
import { UploadCard } from './components/UploadCard';
import { SearchBar } from './components/SearchBar';
import { ResultsTable } from './components/ResultsTable';
import { ErrorBanner } from './components/ErrorBanner';
import { EnumConversionPanel } from './components/EnumConversionPanel';
import { parseExcelFile, searchByPrimaryKey, buildPointsData } from './utils/excelParser';
import { MOCK_ROWS } from './utils/mockData';
import type { FlatNameRow, SearchResult } from './types';
import './App.css';

export default function App() {
  const [rows, setRows]         = useState<FlatNameRow[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [query, setQuery]       = useState('');
  const [error, setError]       = useState<string | null>(null);

  // Enum conversion state
  const [enumEnabled, setEnumEnabled]           = useState(false);
  const [selectedEnum, setSelectedEnum]         = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleFile = useCallback((buffer: ArrayBuffer, name: string) => {
    setError(null);
    try {
      const parsed = parseExcelFile(buffer);
      setRows(parsed);
      setFileName(name);
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setRows(null);
    }
  }, []);

  const handleMockLoad = useCallback(() => {
    setError(null);
    setRows(MOCK_ROWS);
    setFileName('sample-data (mock)');
    setQuery('');
  }, []);

  const handleReset = useCallback(() => {
    setRows(null);
    setFileName('');
    setQuery('');
    setError(null);
  }, []);

  const handleEnumToggle = useCallback(() => {
    setEnumEnabled((prev) => {
      // When disabling, also clear the selection
      if (prev) setSelectedEnum(null);
      return !prev;
    });
  }, []);

  // ─── Derived: search results ────────────────────────────────────────────────
  // Each element = one equipment row that ends-with matches the query.
  // suffixTag is detected when the input has _READ / _FDBACK_READ / _FDBACK_CTRL
  // and the exact key is not found — the base key is matched instead.
  const activeEnum = enumEnabled ? selectedEnum : null;

  const searchResults: SearchResult[] = (() => {
    if (!rows || !deferredQuery.trim()) return [];
    const { results, suffixTag } = searchByPrimaryKey(rows, deferredQuery);
    return results.map((row) => ({
      row,
      selectedAssetType: row.assetType?.split(',')[0]?.trim() ?? '',
      pointsData: buildPointsData(row, activeEnum ?? undefined, suffixTag ?? undefined, deferredQuery),
      suffixTag,
    }));
  })();

  const hasSearched = deferredQuery.trim().length > 0;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {!rows && (
        <UploadCard
          onFile={handleFile}
          onError={setError}
          onMockLoad={handleMockLoad}
        />
      )}

      {rows && (
        <>
          {/* Toolbar: search left, enum panel right */}
          <div className="toolbar">
            {/* Left: search + new-file button */}
            <div className="toolbar__search-group">
              <SearchBar
                value={query}
                onChange={setQuery}
                resultCount={hasSearched ? searchResults.length : null}
                fileName={fileName}
              />
              <button
                className="reset-btn"
                onClick={handleReset}
                type="button"
                aria-label="Upload a different file"
              >
                ↑ New file
              </button>
            </div>

            {/* Right: enum conversion panel */}
            <EnumConversionPanel
              enabled={enumEnabled}
              onToggle={handleEnumToggle}
              selectedValue={selectedEnum}
              onSelect={setSelectedEnum}
            />
          </div>

          {hasSearched && (
            <ResultsTable
              results={searchResults}
              query={deferredQuery.trim()}
              enumValue={activeEnum}
            />
          )}

          {!hasSearched && (
            <div className="search-prompt" role="status" aria-live="polite">
              <p>
                Enter a <strong>primarykey</strong> value above to search across{' '}
                {rows.length} rows.
              </p>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
