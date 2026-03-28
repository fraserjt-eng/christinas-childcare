// CSV export utilities for Christina's Child Care Center
// Handles single-dataset exports and full localStorage backup exports.

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Escapes a single cell value for CSV output.
 * Wraps in quotes if the value contains a comma, quote, or newline.
 */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Wrap in double quotes if the value needs escaping
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts an array of objects to a CSV string.
 * Uses the keys of the first object as column headers.
 */
function objectsToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const headerRow = headers.map(escapeCell).join(',');

  const rows = data.map((row) =>
    headers.map((h) => escapeCell(row[h])).join(',')
  );

  return [headerRow, ...rows].join('\n');
}

/**
 * Triggers a browser download for the given CSV content.
 */
function triggerDownload(content: string, filename: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Converts an array of objects to CSV and triggers a browser download.
 *
 * @param data - Array of flat objects (arrays of arrays are not supported)
 * @param filename - The download filename, e.g. "attendance-2026-03-28.csv"
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) {
    console.warn('exportToCSV: no data to export');
    return;
  }
  const csv = objectsToCSV(data);
  triggerDownload(csv, filename);
}

/**
 * Reads all localStorage keys that start with "christinas_" and exports
 * them as a single CSV file with section headers separating each dataset.
 * The file is named christinas-backup-YYYY-MM-DD.csv.
 */
export function exportAllData(): void {
  if (typeof window === 'undefined') return;

  const today = new Date().toISOString().split('T')[0];
  const filename = `christinas-backup-${today}.csv`;

  const sections: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('christinas_')) continue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed: unknown = JSON.parse(raw);

      // Handle arrays of objects
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        const rows = parsed as Record<string, unknown>[];
        sections.push(`### ${key} ###`);
        sections.push(objectsToCSV(rows));
        sections.push('');
        continue;
      }

      // Handle plain objects (single-record config, etc.)
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        sections.push(`### ${key} ###`);
        sections.push(objectsToCSV([parsed as Record<string, unknown>]));
        sections.push('');
        continue;
      }

      // Scalar or unexpected shape: store as a single key/value row
      sections.push(`### ${key} ###`);
      sections.push('key,value');
      sections.push(`${escapeCell(key)},${escapeCell(String(parsed))}`);
      sections.push('');
    } catch {
      // Skip keys with non-JSON values (auth tokens stored as plain strings, etc.)
      sections.push(`### ${key} (unparseable) ###`);
      sections.push('');
    }
  }

  if (sections.length === 0) {
    console.warn('exportAllData: no christinas_ keys found in localStorage');
    return;
  }

  const content = sections.join('\n');
  triggerDownload(content, filename);
}
