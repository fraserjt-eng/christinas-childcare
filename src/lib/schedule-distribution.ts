// Schedule Distribution / Publishing Logic — Christina's Child Care Center
// localStorage persistence, designed for Supabase migration.

import { createCommunication } from '@/lib/comms-storage';

export interface ScheduleDistribution {
  id: string;
  week_start: string;
  distributed_at: string;
  channels: Array<'in_app' | 'email' | 'sms' | 'print'>;
  distributed_by: string;
  pdf_generated: boolean;
}

const DISTRIBUTIONS_KEY = 'christinas_schedule_distributions';

// ─── Storage Helpers ──────────────────────────────────────────────────────────

function getFromStorage(): ScheduleDistribution[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(DISTRIBUTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(data: ScheduleDistribution[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DISTRIBUTIONS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving distributions:', error);
  }
}

function generateId(): string {
  return `dist_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatWeekLabel(weekStart: string): string {
  const monday = new Date(weekStart + 'T12:00:00');
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  const start = monday.toLocaleDateString('en-US', opts);
  const end = friday.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${start} – ${end}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function distributeSchedule(
  weekStart: string,
  channels: Array<'in_app' | 'email' | 'sms' | 'print'>,
  distributedBy: string
): Promise<ScheduleDistribution> {
  const record: ScheduleDistribution = {
    id: generateId(),
    week_start: weekStart,
    distributed_at: new Date().toISOString(),
    channels,
    distributed_by: distributedBy,
    pdf_generated: channels.includes('print'),
  };

  // Persist distribution record
  const existing = getFromStorage();
  saveToStorage([...existing, record]);

  // Create an in-app communication record so staff see the published schedule
  const weekLabel = formatWeekLabel(weekStart);
  const channelList = channels
    .map(c => ({ in_app: 'In-App', email: 'Email', sms: 'SMS', print: 'Print/PDF' }[c]))
    .join(', ');

  try {
    await createCommunication({
      type: 'announcement',
      subject: `Schedule Published: ${weekLabel}`,
      body_html: `<p>The staff schedule for the week of <strong>${weekLabel}</strong> has been published.</p><p>Distribution channels: ${channelList}.</p><p>Published by: ${distributedBy}</p>`,
      audience_type: 'all',
      created_by: distributedBy,
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    // Non-fatal: distribution record was already saved
    console.error('Failed to create schedule communication:', err);
  }

  return record;
}

export function getDistributionHistory(): ScheduleDistribution[] {
  return getFromStorage().sort((a, b) => b.distributed_at.localeCompare(a.distributed_at));
}

export function getLatestDistribution(weekStart: string): ScheduleDistribution | null {
  const all = getFromStorage().filter(d => d.week_start === weekStart);
  if (all.length === 0) return null;
  return all.sort((a, b) => b.distributed_at.localeCompare(a.distributed_at))[0];
}
