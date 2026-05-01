// Snapshot envelope schema. v2 wraps both browser localStorage AND Supabase
// table dumps inside one JSON file so a snapshot is a complete restorable
// picture of center operations. v1 envelopes (localStorage only) remain
// readable; the restore path detects the version and degrades gracefully.

export interface SnapshotEnvelopeV1 {
  meta: {
    created_at: string;
    key_count: number;
    byte_size: number;
  };
  data: Record<string, string>; // localStorage key/value pairs
}

export interface SnapshotEnvelopeV2 {
  envelope_version: 2;
  meta: {
    created_at: string;
    byte_size: number;
    local_key_count: number;
    table_count: number;
    table_row_count: number;
    tables_included: string[];
    created_by: string | null;
    source: 'admin_button' | 'scheduled' | 'api';
  };
  localStorage: Record<string, string>;
  supabase: {
    [tableName: string]: Record<string, unknown>[];
  };
}

export type SnapshotEnvelope = SnapshotEnvelopeV1 | SnapshotEnvelopeV2;

export function isV2(env: SnapshotEnvelope): env is SnapshotEnvelopeV2 {
  return (
    'envelope_version' in env && (env as SnapshotEnvelopeV2).envelope_version === 2
  );
}

export function buildTimestampFilename(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `v2/${yyyy}-${mm}-${dd}-${hh}${min}${ss}.json`;
}
