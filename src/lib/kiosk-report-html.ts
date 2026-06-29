// Renders a KioskReport into a branded HTML email (inline styles, table-based for
// email clients). Used by the every-2-hours cron. No PII beyond room-level counts.

import type { KioskReport, RoomStat, CenterStat } from './kiosk-report';

const RED = '#C62828', BLUE = '#2196F3', GREEN = '#4CAF50', INK = '#2b2b2b', MUTE = '#6b7280';
const esc = (s: string) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));

function pctColor(p: number): string {
  if (p >= 80) return GREEN;
  if (p >= 50) return '#B7791F';
  return MUTE;
}

function row(r: RoomStat, bold = false): string {
  const w = bold ? 'font-weight:700;' : '';
  const bg = bold ? 'background:#faf6f0;' : '';
  return `<tr style="${bg}">
    <td style="padding:7px 10px;border-bottom:1px solid #eee;${w}">${esc(r.room)}</td>
    <td style="padding:7px 10px;border-bottom:1px solid #eee;text-align:right;${w}">${r.enrolled}</td>
    <td style="padding:7px 10px;border-bottom:1px solid #eee;text-align:right;color:${BLUE};font-weight:700;">${r.inNow}</td>
    <td style="padding:7px 10px;border-bottom:1px solid #eee;text-align:right;color:${MUTE};">${r.out}</td>
    <td style="padding:7px 10px;border-bottom:1px solid #eee;text-align:right;color:${MUTE};">${r.notArrived}</td>
    <td style="padding:7px 10px;border-bottom:1px solid #eee;text-align:right;color:${pctColor(r.attendancePct)};font-weight:700;">${r.attendancePct}%</td>
  </tr>`;
}

function table(rows: RoomStat[], total: RoomStat, totalLabel: string): string {
  const head = ['Room', 'Enrolled', 'In now', 'Out', 'Not arrived', 'Attendance']
    .map((h, i) => `<th style="padding:7px 10px;text-align:${i === 0 ? 'left' : 'right'};font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:${MUTE};border-bottom:2px solid #ddd;">${h}</th>`)
    .join('');
  const body = rows.length ? rows.map((r) => row(r)).join('') : `<tr><td colspan="6" style="padding:10px;text-align:center;color:${MUTE};">No enrolled children.</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;color:${INK};margin-top:6px;">
    <thead><tr>${head}</tr></thead><tbody>${body}${row({ ...total, room: totalLabel }, true)}</tbody></table>`;
}

export function kioskReportEmailHtml(report: KioskReport): string {
  const g = report.grandTotal;
  const centerBlocks = report.centers.map((c: CenterStat) =>
    `<div style="margin-top:22px;"><div style="font-size:16px;font-weight:800;color:${INK};">${esc(c.centerName)}</div>${table(c.rooms, c.total, 'All rooms')}</div>`
  ).join('');
  const combined = report.centers.length > 1
    ? `<div style="margin-top:26px;"><div style="font-size:16px;font-weight:800;color:${BLUE};">Combined rooms (all centers)</div>${table(report.combinedRooms, report.grandTotal, 'Everything')}</div>`
    : '';

  return `<!doctype html><html><body style="margin:0;background:#f4f1ec;font-family:'Helvetica Neue',Arial,sans-serif;color:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:22px 12px;"><tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border-radius:14px;overflow:hidden;">
  <tr><td style="background:${RED};padding:20px 26px;color:#fff;">
    <div style="font-size:19px;font-weight:800;">Kiosk Attendance Report</div>
    <div style="font-size:12.5px;opacity:.9;margin-top:3px;">As of ${esc(report.asOfCentral)} Central &middot; ${esc(report.date)}</div>
  </td></tr>
  <tr><td style="height:6px;background:#FFD54F;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td style="padding:22px 26px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="text-align:center;"><tr>
      <td><div style="font-size:26px;font-weight:800;">${g.enrolled}</div><div style="font-size:11px;color:${MUTE};text-transform:uppercase;">Enrolled</div></td>
      <td><div style="font-size:26px;font-weight:800;color:${BLUE};">${g.inNow}</div><div style="font-size:11px;color:${MUTE};text-transform:uppercase;">In now</div></td>
      <td><div style="font-size:26px;font-weight:800;color:${MUTE};">${g.out}</div><div style="font-size:11px;color:${MUTE};text-transform:uppercase;">Out</div></td>
      <td><div style="font-size:26px;font-weight:800;color:${MUTE};">${g.notArrived}</div><div style="font-size:11px;color:${MUTE};text-transform:uppercase;">Not arrived</div></td>
      <td><div style="font-size:26px;font-weight:800;color:${pctColor(g.attendancePct)};">${g.attendancePct}%</div><div style="font-size:11px;color:${MUTE};text-transform:uppercase;">Attendance</div></td>
    </tr></table>
    ${centerBlocks}
    ${combined}
    <div style="margin-top:22px;font-size:11.5px;color:${MUTE};border-top:1px solid #eee;padding-top:12px;">
      Enrolled counts active families only. Automated update; sent every two hours, 6am to 9pm Central, this week.
    </div>
  </td></tr>
</table></td></tr></table></body></html>`;
}

export function kioskReportSubject(report: KioskReport): string {
  const g = report.grandTotal;
  return `Kiosk: ${g.inNow} in, ${g.notArrived} not arrived of ${g.enrolled} (${report.asOfCentral})`;
}
