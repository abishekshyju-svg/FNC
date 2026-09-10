import * as XLSX from 'xlsx';
import type { FlatNameRow } from '../types';

export const TARGET_SHEET = 'flat_Name_Convention';

// ── Suffix rules ──────────────────────────────────────────────────────────────
// Order matters: longer/more-specific suffixes must come first so that
// _FDBACK_READ is matched before the plain _READ rule.
const SUFFIX_RULES: { suffix: string; tag: string }[] = [
  { suffix: '_FDBACK_READ', tag: 'feedbackRead'    },
  { suffix: '_FDBACK_CTRL', tag: 'feedbackControl' },
  { suffix: '_READ',        tag: 'readOnly'         },
];

/**
 * Strip a recognised trailing suffix from `query` (case-insensitive).
 * Returns the stripped base and the tag to inject, or the original query
 * and null if no suffix matched.
 */
export function stripSuffix(query: string): { base: string; tag: string | null } {
  const q = query.trim();
  for (const { suffix, tag } of SUFFIX_RULES) {
    if (q.toLowerCase().endsWith(suffix.toLowerCase())) {
      return { base: q.slice(0, q.length - suffix.length), tag };
    }
  }
  return { base: q, tag: null };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalise(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (['null', 'undefined', 'n/a', 'na', '-'].includes(str.toLowerCase())) return '';
  return str;
}

/**
 * Tokenise one cell value into individual tokens.
 * - Splits on commas and/or whitespace
 * - Strips spaces within tokens (e.g. "duct mod" → "ductmod")
 * - Collapses spaces around colons (e.g. "minVal : x" → "minVal:x")
 * - Drops empty results
 */
function tokenise(value: string): string[] {
  const normalised = value.replace(/\s*:\s*/g, ':');
  return normalised
    .split(/[\s,]+/)
    .map((t) => t.replace(/\s+/g, ''))
    .filter(Boolean);
}

// ── pointTypeOptions pipe-selector ───────────────────────────────────────────

/**
 * Some pointTypeOptions cells carry pipe-separated alternatives, e.g. "sensor|sp".
 * The correct alternative is chosen based on the original search query:
 *
 *   sensor|sp  →  "sp"     when the query contains *SP* or has _SP as a segment
 *                 "sensor" for all other inputs
 *
 * Any token that does NOT contain a pipe is passed through unchanged.
 * The query comparison is case-insensitive.
 */
function resolvePipeTokens(tokens: string[], query: string): string[] {
  const q = query.toUpperCase();

  // Matches:  _SP_  (segment in middle)  OR  ends with _SP  (segment at end)
  const isSpQuery = /_SP[_\-]/.test(q) || q.endsWith('_SP');

  return tokens.flatMap((token) => {
    if (!token.includes('|')) return [token];

    // Split the alternatives and pick the right one
    const alternatives = token.split('|').map((t) => t.trim()).filter(Boolean);

    // Specific sensor|sp rule
    const hasSensor = alternatives.some((a) => a.toLowerCase() === 'sensor');
    const hasSp     = alternatives.some((a) => a.toLowerCase() === 'sp');

    if (hasSensor && hasSp) {
      return isSpQuery ? ['sp'] : ['sensor'];
    }

    // Fallback for other pipe patterns: return the first alternative
    return [alternatives[0]];
  });
}

// ── Core builder ──────────────────────────────────────────────────────────────

/**
 * Build the Points Data string.
 *
 * Final token order:
 *   haystacktags
 *   [enumValue]          ← after haystacktags, when enum is active
 *   customHaystackTags
 *   pointParameters (with suffixTag injected BEFORE the first minVal:… token)
 *   pointTypeOptions     (pipe alternatives resolved from the query)
 *
 * All fields comma-separated, no spaces anywhere.
 */
export function buildPointsData(
  row: FlatNameRow,
  enumValue?: string,
  suffixTag?: string,
  query?: string,           // original search query — used for pipe resolution
): string {
  const q = query ?? '';

  const haystackTokens = normalise(row.haystacktags)
    ? tokenise(normalise(row.haystacktags)) : [];

  const customTokens = normalise(row.customHaystackTags)
    ? tokenise(normalise(row.customHaystackTags)) : [];

  // pointParameters: inject suffixTag before the first minVal:… token
  let paramTokens = normalise(row.pointParameters)
    ? tokenise(normalise(row.pointParameters)) : [];

  if (suffixTag) {
    const minValIdx = paramTokens.findIndex((t) =>
      t.toLowerCase().startsWith('minval:')
    );
    if (minValIdx === -1) {
      paramTokens = [...paramTokens, suffixTag];
    } else {
      paramTokens = [
        ...paramTokens.slice(0, minValIdx),
        suffixTag,
        ...paramTokens.slice(minValIdx),
      ];
    }
  }

  // pointTypeOptions: tokenise then resolve any pipe-separated alternatives
  const rawOptionTokens = normalise(row.pointTypeOptions)
    ? tokenise(normalise(row.pointTypeOptions)) : [];
  const optionTokens = resolvePipeTokens(rawOptionTokens, q);

  return [
    ...haystackTokens,
    ...(enumValue ? [enumValue] : []),
    ...customTokens,
    ...paramTokens,
    ...optionTokens,
  ].join(',');
}

// ── Excel parsing ─────────────────────────────────────────────────────────────

export function parseExcelFile(buffer: ArrayBuffer): FlatNameRow[] {
  let workbook: XLSX.WorkBook;

  try {
    workbook = XLSX.read(buffer, { type: 'array' });
  } catch {
    throw new Error(
      'Failed to read the Excel file. Please ensure it is a valid .xlsx workbook.'
    );
  }

  if (!workbook.SheetNames.includes(TARGET_SHEET)) {
    throw new Error(
      `Required sheet "${TARGET_SHEET}" not found in uploaded Excel file. ` +
        `Available sheets: ${workbook.SheetNames.join(', ')}`
    );
  }

  const sheet = workbook.Sheets[TARGET_SHEET];

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
  });

  if (rawRows.length === 0) {
    throw new Error(`The sheet "${TARGET_SHEET}" appears to be empty.`);
  }

  return rawRows.map((raw) => {
    const get = (key: string): string => {
      if (key in raw) return normalise(raw[key]);
      const found = Object.keys(raw).find(
        (k) => k.trim().toLowerCase() === key.toLowerCase()
      );
      return found ? normalise(raw[found]) : '';
    };

    return {
      primarykey:        get('primarykey'),
      assetType:         get('assetType'),
      haystacktags:      get('haystacktags'),
      customHaystackTags:get('customHaystackTags'),
      pointParameters:   get('pointParameters'),
      pointTypeOptions:  get('pointTypeOptions'),
    } as FlatNameRow;
  });
}

// ── Search ────────────────────────────────────────────────────────────────────

/**
 * Search rows whose primarykey ENDS WITH the query (case-insensitive, trimmed).
 *
 * Suffix stripping:  if the query ends with _READ, _FDBACK_READ, or _FDBACK_CTRL
 * and NO direct ends-with match is found, the suffix is stripped and the search
 * is retried on the base key.  The detected tag is returned alongside the rows
 * so callers can inject it into Points Data.
 */
export function searchByPrimaryKey(
  rows: FlatNameRow[],
  query: string,
): { results: FlatNameRow[]; suffixTag: string | null } {
  const q = query.trim().toLowerCase();
  if (!q) return { results: [], suffixTag: null };

  // First: direct ends-with match (no suffix stripping)
  const direct = rows.filter((row) =>
    row.primarykey.trim().toLowerCase().endsWith(q)
  );
  if (direct.length > 0) return { results: direct, suffixTag: null };

  // Second: strip a recognised suffix and retry
  const { base, tag } = stripSuffix(query);
  if (tag === null) return { results: [], suffixTag: null }; // no suffix to strip

  const stripped = base.toLowerCase();
  const fallback = rows.filter((row) =>
    row.primarykey.trim().toLowerCase().endsWith(stripped)
  );
  return { results: fallback, suffixTag: tag };
}
