import { useState } from 'react';
import type { SearchResult } from '../types';
import { buildPointsData } from '../utils/excelParser';
import { CopyButton } from './CopyButton';
import { EmptyState } from './EmptyState';

interface ResultsTableProps {
  results: SearchResult[];
  query: string;
  enumValue: string | null;
}

export function ResultsTable({ results, query, enumValue }: ResultsTableProps) {
  // suffixTag is the same across all results for this query (derived from the query itself)
  const suffixTag = results[0]?.suffixTag ?? null;

  // 1. Sort A→Z by assetType
  const sorted = [...results].sort((a, b) =>
    (a.row.assetType || '').localeCompare(b.row.assetType || '', undefined, { sensitivity: 'base' })
  );

  // 2. Deduplicate: stable key uses base pointsData (no enum/suffix/query)
  const seen = new Set<string>();
  const deduped = sorted.filter((r) => {
    const key = `${r.row.assetType}||${buildPointsData(r.row, undefined, undefined, query)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (results.length === 0) {
    return <EmptyState query={query} />;
  }

  // Active row from the deduped+sorted array (clamp in case dedup shrinks list)
  const safeIndex  = Math.min(selectedIndex, deduped.length - 1);
  const activeRow  = deduped[safeIndex];
  // Re-compute live with enum + suffixTag + query applied
  const pointsData = buildPointsData(
    activeRow.row,
    enumValue ?? undefined,
    suffixTag ?? undefined,
    query,
  );
  const primaryKey = activeRow.row.primarykey;

  // Human-readable suffix label for the indicator badge
  const suffixLabel: Record<string, string> = {
    readOnly:        '_READ → readOnly injected',
    feedbackRead:    '_FDBACK_READ → feedbackRead injected',
    feedbackControl: '_FDBACK_CTRL → feedbackControl injected',
  };

  return (
    <div className="results-wrapper" role="region" aria-label="Search results">

      {/* ── Result header ─────────────────────────────────── */}
      <div className="results-header">
        <div className="results-header__left">
          <h2 className="results-header__title">Result</h2>
          <span className="results-header__badge">
            {deduped.length} equipment{deduped.length !== 1 ? 's' : ''}
          </span>
          {/* Suffix-match indicator */}
          {suffixTag && (
            <span className="suffix-badge" title={`Input had a recognised suffix. Base key matched; "${suffixTag}" was inserted before minVal.`}>
              {suffixLabel[suffixTag] ?? suffixTag}
            </span>
          )}
        </div>
        <p className="results-header__query">
          Keys ending with <code>{query}</code>
        </p>
      </div>

      {/* ── Main result card ──────────────────────────────── */}
      <div className="result-card">

        {/* Primary key banner */}
        <div className="result-card__key-row">
          <span className="result-card__key-label">Primary Key</span>
          <span className="result-card__key-value">{primaryKey}</span>
          {suffixTag && (
            <span className="result-card__suffix-pill">
              +{suffixTag}
            </span>
          )}
        </div>

        <div className="result-card__divider" />

        {/* Table: Asset Type | Points Data | Copy */}
        <div className="table-container">
          <table className="results-table" aria-label={`Point data for ${primaryKey}`}>
            <thead>
              <tr>
                <th scope="col" className="col-asset">Asset Type</th>
                <th scope="col" className="col-points">Points Data</th>
                <th scope="col" className="col-copy">Copy</th>
              </tr>
            </thead>
            <tbody>
              <tr className="results-table__row results-table__row--active">

                {/* Asset Type dropdown */}
                <td className="col-asset">
                  <div className="asset-select-wrap">
                    <select
                      className="asset-select"
                      value={safeIndex}
                      onChange={(e) => setSelectedIndex(Number(e.target.value))}
                      aria-label="Select equipment type"
                    >
                      {deduped.map((r, i) => (
                        <option key={i} value={i}>
                          {r.row.assetType || `Equipment ${i + 1}`}
                        </option>
                      ))}
                    </select>
                    {deduped.length > 1 && (
                      <span className="asset-select__hint">
                        {deduped.length} equipment types available
                      </span>
                    )}
                  </div>
                </td>

                {/* Points Data */}
                <td className="col-points">
                  {pointsData
                    ? <p className="points-data">{pointsData}</p>
                    : <em className="muted">No data available for this equipment</em>
                  }
                </td>

                {/* Copy */}
                <td className="col-copy">
                  <CopyButton text={pointsData} />
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
