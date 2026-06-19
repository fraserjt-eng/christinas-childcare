// Tile catalog for the office home (src/app/preview/office).
//
// One static, stable list of every button the owner can put on her screen.
// The office page renders whatever ordered id list getLayout() returns, looked
// up here. New buttons get added to this catalog; the saved layout only stores
// ids, so a renamed label or moved page never strands a saved screen.
//
// Two kinds of destination:
//  - Portal screens live inside this front-facing portal (/preview/*). They
//    open in-app with next/link.
//  - Admin tools are the real back-office pages (/admin/*). Same card look; a
//    small "opens admin" hint marks that they cross into the full admin app.
//
// `icon` is a lucide-react icon NAME (resolved in the page). `group` buckets
// the "Add a button" picker. `kind: "rooms"` is the one special tile: the
// double-height live traffic-light card, not a plain link.

export type TileKind = "rooms" | "portal" | "admin";

export interface TileCatalogEntry {
  /** Stable kebab id. Saved layouts store only these. Never reuse or rename. */
  id: string;
  /** Plain button label, e.g. "Statements". */
  label: string;
  /** One short line under the label, e.g. "Send and track family bills". */
  description: string;
  /** Where the button goes. */
  href: string;
  /** Picker bucket, e.g. "Daily", "Family", "Money". */
  group: string;
  /** A lucide-react icon name that exists, e.g. "FileText". */
  icon: string;
  /** Portal (in-app) vs admin (opens the back office) vs the live rooms card. */
  kind: TileKind;
}

// Order here is the order the "Add a button" picker shows within each group.
export const TILE_CATALOG: TileCatalogEntry[] = [
  // ---------------------------------------------------------------- Daily
  {
    id: "rooms",
    label: "Today's rooms",
    description: "Who is in each room right now",
    href: "/preview/dashboard",
    group: "Daily",
    icon: "TrafficCone",
    kind: "rooms",
  },
  {
    id: "schedule",
    label: "Schedule",
    description: "The whole week on one screen",
    href: "/preview/schedule",
    group: "Daily",
    icon: "Calendar",
    kind: "portal",
  },
  {
    id: "meals",
    label: "Food counts",
    description: "Tap who ate what",
    href: "/preview/meals",
    group: "Daily",
    icon: "Utensils",
    kind: "portal",
  },
  {
    id: "attendance",
    label: "Attendance",
    description: "Who is checked in today",
    href: "/admin/attendance",
    group: "Daily",
    icon: "ClipboardCheck",
    kind: "admin",
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Your to-do list for the center",
    href: "/admin/tasks",
    group: "Daily",
    icon: "ListChecks",
    kind: "admin",
  },

  // ---------------------------------------------------------------- Family
  {
    id: "newsletter",
    label: "Newsletter",
    description: "Three blocks, then send",
    href: "/preview/newsletter",
    group: "Family",
    icon: "Newspaper",
    kind: "portal",
  },
  {
    id: "messages",
    label: "Messages",
    description: "Read and write families",
    href: "/preview/office/messages",
    group: "Family",
    icon: "MessageSquare",
    kind: "portal",
  },
  {
    id: "communications",
    label: "Communications",
    description: "Send a note to every family",
    href: "/admin/communications",
    group: "Family",
    icon: "Megaphone",
    kind: "admin",
  },
  {
    id: "enrollment",
    label: "Enrollment pipeline",
    description: "Tours, leads, and new families",
    href: "/admin/pipeline",
    group: "Family",
    icon: "GitBranch",
    kind: "admin",
  },

  // ---------------------------------------------------------------- People
  {
    id: "people",
    label: "People",
    description: "Add someone or reset a code",
    href: "/preview/office/people",
    group: "People",
    icon: "Users",
    kind: "portal",
  },
  {
    id: "training",
    label: "Training",
    description: "Who is current",
    href: "/preview/office/training",
    group: "People",
    icon: "GraduationCap",
    kind: "portal",
  },
  {
    id: "hr",
    label: "HR",
    description: "Staff records and documents",
    href: "/admin/hr",
    group: "People",
    icon: "Briefcase",
    kind: "admin",
  },
  {
    id: "team",
    label: "Team and admins",
    description: "Who can sign in and what they can do",
    href: "/admin/team",
    group: "People",
    icon: "Users",
    kind: "admin",
  },

  // ---------------------------------------------------------------- Money
  {
    id: "billing",
    label: "Billing",
    description: "Who owes what",
    href: "/preview/office/billing",
    group: "Money",
    icon: "DollarSign",
    kind: "portal",
  },
  {
    id: "statements",
    label: "Statements",
    description: "Send and track family bills",
    href: "/admin/statements",
    group: "Money",
    icon: "FileText",
    kind: "admin",
  },
  {
    id: "payroll",
    label: "Payroll",
    description: "Hours and pay for your staff",
    href: "/admin/payroll",
    group: "Money",
    icon: "Wallet",
    kind: "admin",
  },
  {
    id: "budget",
    label: "Budget",
    description: "Money in and money out",
    href: "/admin/budget",
    group: "Money",
    icon: "PieChart",
    kind: "admin",
  },
  {
    id: "food-counts",
    label: "Food counts and CACFP",
    description: "Meal claims and reimbursement",
    href: "/admin/food-counts",
    group: "Money",
    icon: "UtensilsCrossed",
    kind: "admin",
  },

  // ---------------------------------------------------------------- Compliance
  {
    id: "ratios",
    label: "Ratios",
    description: "Staff-to-child counts by room",
    href: "/admin/ratios",
    group: "Compliance",
    icon: "Users",
    kind: "admin",
  },
  {
    id: "compliance",
    label: "Compliance",
    description: "Licensing and what is due",
    href: "/admin/compliance",
    group: "Compliance",
    icon: "ShieldCheck",
    kind: "admin",
  },
  {
    id: "incidents",
    label: "Incidents",
    description: "Log and review safety reports",
    href: "/admin/incidents",
    group: "Compliance",
    icon: "AlertTriangle",
    kind: "admin",
  },

  // ---------------------------------------------------------------- Admin
  {
    id: "reports",
    label: "Reports",
    description: "Sent to you weekly",
    href: "/admin/reports",
    group: "Admin",
    icon: "ClipboardList",
    kind: "admin",
  },
  {
    id: "inventory",
    label: "Supplies",
    description: "Track stock and reorder",
    href: "/admin/inventory",
    group: "Admin",
    icon: "Package",
    kind: "admin",
  },
  {
    id: "curriculum",
    label: "Curriculum",
    description: "Lesson plans and themes",
    href: "/admin/curriculum",
    group: "Admin",
    icon: "BookOpen",
    kind: "admin",
  },
];

/** Quick id -> entry lookup. */
const BY_ID: Record<string, TileCatalogEntry> = Object.fromEntries(
  TILE_CATALOG.map((t) => [t.id, t]),
);

/** The catalog entry for an id, or null when the id is unknown. */
export function tileById(id: string): TileCatalogEntry | null {
  return BY_ID[id] ?? null;
}

/** True when the id is a real catalog tile. */
export function isKnownTile(id: string): boolean {
  return id in BY_ID;
}

/** Distinct group names, in catalog order, for the picker. */
export const TILE_GROUPS: string[] = TILE_CATALOG.reduce<string[]>((groups, t) => {
  if (!groups.includes(t.group)) groups.push(t.group);
  return groups;
}, []);

/**
 * The office page's default tiles. Matches what the screen shows today, so a
 * center that never edits sees exactly the current layout: the live rooms card,
 * People, Newsletter, Schedule, Reports.
 */
export const DEFAULT_TILE_IDS: string[] = [
  "rooms",
  "people",
  "newsletter",
  "schedule",
  "reports",
];
