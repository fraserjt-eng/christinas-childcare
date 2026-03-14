// Newsletter Analytics Storage for Christina's Child Care Center
// localStorage for demo mode, designed for Supabase migration
//
// Supabase migration path:
//   Tables:
//     newsletter_opens (id UUID PK, newsletter_id TEXT, family_id TEXT,
//                       opened_at TIMESTAMPTZ, device_type TEXT)
//     newsletter_clicks (id UUID PK, newsletter_id TEXT, family_id TEXT,
//                        section_id TEXT, section_title TEXT,
//                        clicked_at TIMESTAMPTZ, link_url TEXT)
//   Replace getFromStorage/saveToStorage with Supabase insert/select calls.

export interface NewsletterOpenEvent {
  id: string;
  newsletter_id: string;
  family_id: string;
  opened_at: string;
  device_type: 'mobile' | 'desktop'; // inferred from window.innerWidth
}

export interface NewsletterClickEvent {
  id: string;
  newsletter_id: string;
  family_id: string;
  section_id: string;
  section_title: string;
  clicked_at: string;
  link_url?: string;
}

export interface NewsletterAnalytics {
  newsletter_id: string;
  total_recipients: number;
  unique_opens: number;
  open_rate: number; // 0-100
  total_clicks: number;
  unique_clickers: number;
  click_rate: number; // 0-100
  clicks_by_section: Record<string, number>;
  top_sections: { section_id: string; section_title: string; clicks: number }[];
  device_breakdown: { mobile: number; desktop: number };
  opens_over_time: { date: string; count: number }[];
}

export interface AllNewslettersAnalytics {
  total_newsletters: number;
  total_opens: number;
  total_clicks: number;
  avg_open_rate: number;
  avg_click_rate: number;
  most_engaged_newsletter_id: string | null;
}

const OPENS_KEY = 'christinas_newsletter_opens';
const CLICKS_KEY = 'christinas_newsletter_clicks';

// Assumed recipient count for open/click rate calculations in demo mode.
// In production this would come from the newsletters table.
const DEMO_RECIPIENT_COUNT = 24;

// ============================================================================
// Internal helpers
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

function inferDeviceType(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

function formatDateKey(isoString: string): string {
  return isoString.slice(0, 10); // YYYY-MM-DD
}

// ============================================================================
// Public API — tracking
// ============================================================================

/**
 * Record that a family opened a newsletter.
 * Deduplicates: only one open event is stored per family per newsletter.
 */
export function trackOpen(newsletterId: string, familyId: string): void {
  const opens = getFromStorage<NewsletterOpenEvent>(OPENS_KEY);

  const alreadyOpened = opens.some(
    (o) => o.newsletter_id === newsletterId && o.family_id === familyId
  );

  if (alreadyOpened) return;

  const event: NewsletterOpenEvent = {
    id: generateId(),
    newsletter_id: newsletterId,
    family_id: familyId,
    opened_at: new Date().toISOString(),
    device_type: inferDeviceType(),
  };

  opens.push(event);
  saveToStorage(OPENS_KEY, opens);
}

/**
 * Record that a family clicked a section link in a newsletter.
 * Multiple clicks from the same family are each recorded for total_clicks.
 */
export function trackClick(
  newsletterId: string,
  familyId: string,
  sectionId: string,
  sectionTitle: string,
  linkUrl?: string
): void {
  const clicks = getFromStorage<NewsletterClickEvent>(CLICKS_KEY);

  const event: NewsletterClickEvent = {
    id: generateId(),
    newsletter_id: newsletterId,
    family_id: familyId,
    section_id: sectionId,
    section_title: sectionTitle,
    clicked_at: new Date().toISOString(),
    link_url: linkUrl,
  };

  clicks.push(event);
  saveToStorage(CLICKS_KEY, clicks);
}

// ============================================================================
// Public API — analytics
// ============================================================================

/**
 * Compute the full analytics summary for a single newsletter.
 */
export function getAnalytics(newsletterId: string): NewsletterAnalytics {
  const allOpens = getFromStorage<NewsletterOpenEvent>(OPENS_KEY);
  const allClicks = getFromStorage<NewsletterClickEvent>(CLICKS_KEY);

  const opens = allOpens.filter((o) => o.newsletter_id === newsletterId);
  const clicks = allClicks.filter((c) => c.newsletter_id === newsletterId);

  const uniqueOpenFamilies = new Set(opens.map((o) => o.family_id));
  const uniqueClickFamilies = new Set(clicks.map((c) => c.family_id));

  const totalRecipients = DEMO_RECIPIENT_COUNT;
  const uniqueOpens = uniqueOpenFamilies.size;
  const uniqueClickers = uniqueClickFamilies.size;

  // Clicks by section
  const clicksBySectionMap: Record<string, { title: string; count: number }> = {};
  for (const click of clicks) {
    if (!clicksBySectionMap[click.section_id]) {
      clicksBySectionMap[click.section_id] = { title: click.section_title, count: 0 };
    }
    clicksBySectionMap[click.section_id].count += 1;
  }

  const clicksBySection: Record<string, number> = {};
  for (const [sectionId, { count }] of Object.entries(clicksBySectionMap)) {
    clicksBySection[sectionId] = count;
  }

  const topSections = Object.entries(clicksBySectionMap)
    .map(([sectionId, { title, count }]) => ({
      section_id: sectionId,
      section_title: title,
      clicks: count,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  // Device breakdown
  const deviceBreakdown = { mobile: 0, desktop: 0 };
  for (const open of opens) {
    deviceBreakdown[open.device_type] += 1;
  }

  // Opens over time (grouped by date)
  const opensByDate: Record<string, number> = {};
  for (const open of opens) {
    const dateKey = formatDateKey(open.opened_at);
    opensByDate[dateKey] = (opensByDate[dateKey] ?? 0) + 1;
  }
  const opensOverTime = Object.entries(opensByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    newsletter_id: newsletterId,
    total_recipients: totalRecipients,
    unique_opens: uniqueOpens,
    open_rate: totalRecipients > 0 ? Math.round((uniqueOpens / totalRecipients) * 100) : 0,
    total_clicks: clicks.length,
    unique_clickers: uniqueClickers,
    click_rate: totalRecipients > 0 ? Math.round((uniqueClickers / totalRecipients) * 100) : 0,
    clicks_by_section: clicksBySection,
    top_sections: topSections,
    device_breakdown: deviceBreakdown,
    opens_over_time: opensOverTime,
  };
}

/**
 * Aggregate summary stats across all newsletters.
 */
export function getAnalyticsForAll(): AllNewslettersAnalytics {
  const allOpens = getFromStorage<NewsletterOpenEvent>(OPENS_KEY);
  const allClicks = getFromStorage<NewsletterClickEvent>(CLICKS_KEY);

  const newsletterIds = Array.from(new Set([
    ...allOpens.map((o) => o.newsletter_id),
    ...allClicks.map((c) => c.newsletter_id),
  ]));

  if (newsletterIds.length === 0) {
    return {
      total_newsletters: 0,
      total_opens: 0,
      total_clicks: 0,
      avg_open_rate: 0,
      avg_click_rate: 0,
      most_engaged_newsletter_id: null,
    };
  }

  const analyticsPerNewsletter = newsletterIds.map((id) => getAnalytics(id));

  const totalOpens = analyticsPerNewsletter.reduce((sum, a) => sum + a.unique_opens, 0);
  const totalClicks = analyticsPerNewsletter.reduce((sum, a) => sum + a.total_clicks, 0);
  const avgOpenRate = Math.round(
    analyticsPerNewsletter.reduce((sum, a) => sum + a.open_rate, 0) / analyticsPerNewsletter.length
  );
  const avgClickRate = Math.round(
    analyticsPerNewsletter.reduce((sum, a) => sum + a.click_rate, 0) / analyticsPerNewsletter.length
  );

  const mostEngaged = analyticsPerNewsletter.reduce((best, current) =>
    current.unique_opens > best.unique_opens ? current : best
  );

  return {
    total_newsletters: newsletterIds.length,
    total_opens: totalOpens,
    total_clicks: totalClicks,
    avg_open_rate: avgOpenRate,
    avg_click_rate: avgClickRate,
    most_engaged_newsletter_id: mostEngaged.unique_opens > 0 ? mostEngaged.newsletter_id : null,
  };
}

/**
 * Returns a list of all open events for a newsletter, enriched for the UI.
 * Used by the family engagement list in the analytics dashboard.
 */
export function getOpenEvents(newsletterId: string): NewsletterOpenEvent[] {
  const opens = getFromStorage<NewsletterOpenEvent>(OPENS_KEY);
  return opens
    .filter((o) => o.newsletter_id === newsletterId)
    .sort((a, b) => b.opened_at.localeCompare(a.opened_at));
}

/**
 * Returns all click events for a newsletter.
 * Used by the family engagement list in the analytics dashboard.
 */
export function getClickEvents(newsletterId: string): NewsletterClickEvent[] {
  const clicks = getFromStorage<NewsletterClickEvent>(CLICKS_KEY);
  return clicks
    .filter((c) => c.newsletter_id === newsletterId)
    .sort((a, b) => b.clicked_at.localeCompare(a.clicked_at));
}

// ============================================================================
// Demo seed data (development only)
// ============================================================================

export function seedDemoAnalytics(newsletterId: string): void {
  const existingOpens = getFromStorage<NewsletterOpenEvent>(OPENS_KEY);
  const alreadySeeded = existingOpens.some((o) => o.newsletter_id === newsletterId);
  if (alreadySeeded) return;

  const demofamilies = [
    'family-001', 'family-002', 'family-003', 'family-004', 'family-005',
    'family-006', 'family-007', 'family-008', 'family-009', 'family-010',
    'family-011', 'family-012', 'family-013', 'family-014', 'family-015',
  ];

  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  // Seed opens for 15 families across 3 days
  const opensToSeed: NewsletterOpenEvent[] = [
    ...demofamilies.slice(0, 6).map((fid, i) => ({
      id: generateId(),
      newsletter_id: newsletterId,
      family_id: fid,
      opened_at: daysAgo(2),
      device_type: (i % 2 === 0 ? 'desktop' : 'mobile') as 'desktop' | 'mobile',
    })),
    ...demofamilies.slice(6, 11).map((fid, i) => ({
      id: generateId(),
      newsletter_id: newsletterId,
      family_id: fid,
      opened_at: daysAgo(1),
      device_type: (i % 2 === 0 ? 'mobile' : 'desktop') as 'desktop' | 'mobile',
    })),
    ...demofamilies.slice(11, 15).map((fid) => ({
      id: generateId(),
      newsletter_id: newsletterId,
      family_id: fid,
      opened_at: daysAgo(0),
      device_type: 'mobile' as const,
    })),
  ];

  const allOpens = getFromStorage<NewsletterOpenEvent>(OPENS_KEY);
  saveToStorage(OPENS_KEY, [...allOpens, ...opensToSeed]);

  // Seed clicks for 10 of those families across 4 sections
  const sections = [
    { id: 'photos', title: 'Photo Highlights' },
    { id: 'events', title: 'Upcoming Events' },
    { id: 'menu', title: 'Menu Highlights' },
    { id: 'milestones', title: 'Milestones' },
  ];

  const clicksToSeed: NewsletterClickEvent[] = [];
  demofamilies.slice(0, 10).forEach((fid, fi) => {
    const numClicks = (fi % 3) + 1;
    for (let i = 0; i < numClicks; i++) {
      const section = sections[(fi + i) % sections.length];
      clicksToSeed.push({
        id: generateId(),
        newsletter_id: newsletterId,
        family_id: fid,
        section_id: section.id,
        section_title: section.title,
        clicked_at: daysAgo(fi % 3),
      });
    }
  });

  const allClicks = getFromStorage<NewsletterClickEvent>(CLICKS_KEY);
  saveToStorage(CLICKS_KEY, [...allClicks, ...clicksToSeed]);
}
