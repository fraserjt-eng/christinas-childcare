// MN DCYF attestation versioning. Bumping PRIVACY_NOTICE_VERSION re-prompts
// every family at their next kiosk use (the notice must be re-agreed "when any
// changes are made"). Agreements also expire after a year (re-agreed annually).
// Shared by the kiosk route (currency check), the kiosk clients, and the notice
// component, so the version is defined once.

export const PRIVACY_NOTICE_VERSION = '2026-06-22';
export const ATTESTATION_VALID_DAYS = 365;

// The provider CCAP import-attendance attestation (admin export).
export const IMPORT_ATTENDANCE_VERSION = '2026-06-22';
