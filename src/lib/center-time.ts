// The center's business day, not UTC. Christina's is in Crystal, MN
// (America/Chicago). "Today" must mean today in Crystal, or an evening
// entry rolls into tomorrow's report and parents never see it. Works on
// the server (Node ICU) and the client (browser Intl).

export const CENTER_TZ = 'America/Chicago';

const fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: CENTER_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// YYYY-MM-DD in the center's timezone.
export function centerDate(d: Date = new Date()): string {
  return fmt.format(d); // en-CA => 2026-05-18
}

export function centerDateOf(iso: string | number | Date): string {
  return centerDate(new Date(iso));
}

// Shift a YYYY-MM-DD business date by whole days, staying in center time.
// Noon anchor avoids any DST/offset edge flipping the day.
export function shiftCenterDate(dateStr: string, deltaDays: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return centerDate(d);
}
