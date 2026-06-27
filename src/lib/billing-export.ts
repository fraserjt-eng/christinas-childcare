// Billing exports, defined in ONE place. Two shapes:
//   - CCAP/DHS billing (Phase 3): the per-assistance-family fields the owner
//     currently keys into the state hub by hand. This header is a DRAFT, our
//     best guess pending the owner walkthrough screenshots; confirm + correct
//     it against the real Provider Hub billing screen before relying on it.
//   - Billing summary (Phase 5 / QuickBooks): per-family period totals the owner
//     enters into QuickBooks or imports into Brightwheel.
// Client builds the file from a safe server-provided rows payload (no PII via the
// anon client), same pattern as the DCYF attendance export.

export interface BillingExportRow {
  familyName: string;
  email: string;
  childNames: string;
  ccapStatus: string;
  ccapCaseNumber: string;
  ccapSubsidyAmount: number | null;
  copayAmount: number | null;
  periodCharges: number;
  periodPayments: number;
  balance: number;
}

function csvCell(value: string | number | null | undefined): string {
  let s = (value ?? '').toString();
  // Block spreadsheet formula injection (CWE-1236): a cell starting with
  // = + - @ (or a tab/CR) executes as a formula in Excel/Sheets. Family and
  // child names are user-entered, so prefix a tab to force text.
  if (/^[=+\-@\t\r]/.test(s)) s = '\t' + s;
  return /[",\n\r\t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function dollars(n: number | null | undefined): string {
  return n == null ? '' : Number(n).toFixed(2);
}

// DRAFT CCAP/DHS billing header — confirm against the state hub after the
// owner walkthrough. Kept obvious so nobody mistakes it for the final format.
export const CCAP_BILLING_HEADER_DRAFT =
  'Family,Children,CCAP Case Number,CCAP Status,State Subsidy Amount,Family Co-pay,Period Charges,Period Payments,Balance Due';

export const BILLING_SUMMARY_HEADER =
  'Family,Email,Children,Period Charges,Period Payments,Balance Due';

export function buildCcapBillingCsv(rows: BillingExportRow[]): string {
  const body = rows
    .filter((r) => r.ccapStatus && r.ccapStatus !== 'none')
    .map((r) =>
      [
        csvCell(r.familyName),
        csvCell(r.childNames),
        csvCell(r.ccapCaseNumber),
        csvCell(r.ccapStatus),
        csvCell(dollars(r.ccapSubsidyAmount)),
        csvCell(dollars(r.copayAmount)),
        csvCell(dollars(r.periodCharges)),
        csvCell(dollars(r.periodPayments)),
        csvCell(dollars(r.balance)),
      ].join(',')
    );
  return '﻿' + [CCAP_BILLING_HEADER_DRAFT, ...body].join('\r\n');
}

export function buildBillingSummaryCsv(rows: BillingExportRow[]): string {
  const body = rows.map((r) =>
    [
      csvCell(r.familyName),
      csvCell(r.email),
      csvCell(r.childNames),
      csvCell(dollars(r.periodCharges)),
      csvCell(dollars(r.periodPayments)),
      csvCell(dollars(r.balance)),
    ].join(',')
  );
  return '﻿' + [BILLING_SUMMARY_HEADER, ...body].join('\r\n');
}
