// Demo fixtures for the sealed /preview layer (Christina's Simplified Summer).
// Every person here is fictional. Nothing reads or writes Supabase.
// Shapes intentionally mirror production tables so this module doubles as the
// draft schema contract at merge time. Mapping notes: docs/preview/PLAN.md.

export interface PreviewRoom {
  id: string;
  name: string;
  emoji: string;
  color: string;
  capacity: number;
  /** Kids allowed per staff member (MN licensing style limit, demo values). */
  ratioLimit: number;
}

export interface PreviewKid {
  id: string;
  firstName: string;
  lastName: string;
  roomId: string;
  familyId: string;
  avatar: string;
  allergy: string | null;
}

export interface PreviewStaff {
  id: string;
  firstName: string;
  lastName: string;
  role: "teacher" | "owner";
  roomId: string | null;
  pin: string;
  avatar: string;
  color: string;
}

export interface PreviewFamily {
  id: string;
  name: string;
  pin: string;
  avatar: string;
  kidIds: string[];
}

export type FeedKind =
  | "meal"
  | "bottle"
  | "diaper"
  | "nap"
  | "activity"
  | "photo"
  | "note"
  | "checkin"
  | "checkout";

export interface FeedEvent {
  id: string;
  kind: FeedKind;
  roomId: string;
  kidIds: string[];
  title: string;
  detail: string;
  /** Display time, e.g. "9:15 AM". The demo runs on display strings, not clocks. */
  time: string;
  /** "Mon" through "Fri" for the past week, "Today" for the live demo day. */
  dayLabel: string;
  /** Photo id from DEMO_PHOTOS, or null. */
  photoId: string | null;
}

export interface PreviewShift {
  id: string;
  staffId: string;
  /** 0 = Monday through 4 = Friday. */
  day: number;
  start: string;
  end: string;
  roomId: string | null;
}

export interface NewsletterBlock {
  id: string;
  kind: "header" | "photos" | "reminders";
  label: string;
  title: string;
  body: string;
  photoIds: string[];
}

export type MealMark = "ate" | "some" | "none";

export type OfficeTileId =
  | "rooms"
  | "people"
  | "newsletter"
  | "schedule"
  | "reports"
  | "training"
  | "food"
  | "feed"
  | "messages"
  | "billing";

export interface DemoPhoto {
  id: string;
  src: string;
  caption: string;
}

/** Committed SVG scene cards. No faces by construction; real faceless photos
 *  can replace these files at the same paths without a code change. */
export const DEMO_PHOTOS: DemoPhoto[] = [
  { id: "p1", src: "/preview/photos/blocks.svg", caption: "Block tower, 14 blocks tall" },
  { id: "p2", src: "/preview/photos/painting.svg", caption: "Finger painting, summer flowers" },
  { id: "p3", src: "/preview/photos/playground.svg", caption: "Morning playground time" },
  { id: "p4", src: "/preview/photos/snack.svg", caption: "Snack table, apple slices day" },
  { id: "p5", src: "/preview/photos/books.svg", caption: "Story circle favorites" },
  { id: "p6", src: "/preview/photos/water.svg", caption: "Water table science" },
];

export function photoById(id: string | null): DemoPhoto | null {
  if (!id) return null;
  return DEMO_PHOTOS.find((p) => p.id === id) ?? null;
}

export const ROOMS: PreviewRoom[] = [
  { id: "infants", name: "Infants", emoji: "🍼", color: "#4a90d9", capacity: 8, ratioLimit: 4 },
  { id: "toddlers", name: "Toddlers", emoji: "🧸", color: "#2a9d8f", capacity: 14, ratioLimit: 7 },
  { id: "preschool", name: "Preschool", emoji: "🎨", color: "#6d597a", capacity: 20, ratioLimit: 10 },
  { id: "schoolage", name: "School Age", emoji: "🎒", color: "#e9b44c", capacity: 20, ratioLimit: 10 },
];

export const STAFF: PreviewStaff[] = [
  { id: "st-dana", firstName: "Dana", lastName: "Whitfield", role: "teacher", roomId: "toddlers", pin: "7321", avatar: "👩🏾‍🏫", color: "#2a9d8f" },
  { id: "st-maria", firstName: "Maria", lastName: "Lewis", role: "teacher", roomId: "preschool", pin: "7322", avatar: "👩🏿‍🏫", color: "#6d597a" },
  { id: "st-tasha", firstName: "Tasha", lastName: "Reed", role: "teacher", roomId: null, pin: "7323", avatar: "👩🏾‍🦱", color: "#c98d4b" },
  { id: "st-keisha", firstName: "Keisha", lastName: "Daniels", role: "teacher", roomId: "infants", pin: "7324", avatar: "👩🏿", color: "#4a90d9" },
  { id: "st-marcus", firstName: "Marcus", lastName: "Boyd", role: "teacher", roomId: "schoolage", pin: "7325", avatar: "👨🏾", color: "#e9b44c" },
  { id: "st-christina", firstName: "Christina", lastName: "B.", role: "owner", roomId: null, pin: "9999", avatar: "👩🏾‍💼", color: "#e8604c" },
];

export const FAMILIES: PreviewFamily[] = [
  { id: "fam-brown", name: "Brown family", pin: "1234", avatar: "👨🏾‍👩🏾‍👧🏾", kidIds: ["kid-noah", "kid-ava", "kid-imani"] },
  { id: "fam-garcia", name: "Garcia family", pin: "2345", avatar: "👨🏽‍👩🏽‍👧🏽", kidIds: ["kid-sofia", "kid-mateo", "kid-luca"] },
  { id: "fam-johnson", name: "Johnson family", pin: "3456", avatar: "👨🏿‍👩🏿‍👦🏿", kidIds: ["kid-zoe", "kid-jordan", "kid-nia"] },
  { id: "fam-okafor", name: "Okafor family", pin: "4567", avatar: "👨🏿‍👩🏾‍👧🏾", kidIds: ["kid-amara", "kid-kofi", "kid-ade"] },
  { id: "fam-williams", name: "Williams family", pin: "5678", avatar: "👩🏾‍👧🏾‍👦🏾", kidIds: ["kid-maya", "kid-eli"] },
];

export const KIDS: PreviewKid[] = [
  { id: "kid-noah", firstName: "Noah", lastName: "Brown", roomId: "toddlers", familyId: "fam-brown", avatar: "👦🏾", allergy: null },
  { id: "kid-ava", firstName: "Ava", lastName: "Brown", roomId: "preschool", familyId: "fam-brown", avatar: "👧🏾", allergy: null },
  { id: "kid-sofia", firstName: "Sofia", lastName: "Garcia", roomId: "preschool", familyId: "fam-garcia", avatar: "👧🏽", allergy: null },
  { id: "kid-mateo", firstName: "Mateo", lastName: "Garcia", roomId: "toddlers", familyId: "fam-garcia", avatar: "👦🏽", allergy: "Peanuts" },
  { id: "kid-zoe", firstName: "Zoe", lastName: "Johnson", roomId: "toddlers", familyId: "fam-johnson", avatar: "👧🏿", allergy: null },
  { id: "kid-jordan", firstName: "Jordan", lastName: "Johnson", roomId: "preschool", familyId: "fam-johnson", avatar: "👦🏿", allergy: null },
  { id: "kid-amara", firstName: "Amara", lastName: "Okafor", roomId: "preschool", familyId: "fam-okafor", avatar: "👧🏾", allergy: null },
  { id: "kid-kofi", firstName: "Kofi", lastName: "Okafor", roomId: "toddlers", familyId: "fam-okafor", avatar: "👦🏿", allergy: null },
  { id: "kid-maya", firstName: "Maya", lastName: "Williams", roomId: "preschool", familyId: "fam-williams", avatar: "👧🏾", allergy: null },
  { id: "kid-eli", firstName: "Eli", lastName: "Williams", roomId: "toddlers", familyId: "fam-williams", avatar: "👦🏾", allergy: null },
  { id: "kid-imani", firstName: "Imani", lastName: "Brown", roomId: "infants", familyId: "fam-brown", avatar: "👶🏾", allergy: null },
  { id: "kid-luca", firstName: "Luca", lastName: "Garcia", roomId: "infants", familyId: "fam-garcia", avatar: "👶🏽", allergy: "Dairy" },
  { id: "kid-nia", firstName: "Nia", lastName: "Johnson", roomId: "schoolage", familyId: "fam-johnson", avatar: "👧🏿", allergy: null },
  { id: "kid-ade", firstName: "Ade", lastName: "Okafor", roomId: "schoolage", familyId: "fam-okafor", avatar: "👦🏾", allergy: null },
];

/** A believable past week plus a live "Today" the walkthrough adds to. */
export const FEED_SEED: FeedEvent[] = [
  { id: "fe-1", kind: "activity", roomId: "preschool", kidIds: ["kid-ava", "kid-sofia", "kid-jordan", "kid-amara", "kid-maya"], title: "Activity", detail: "Finger painting, summer flowers", time: "10:05 AM", dayLabel: "Mon", photoId: "p2" },
  { id: "fe-2", kind: "meal", roomId: "toddlers", kidIds: ["kid-noah", "kid-mateo", "kid-zoe", "kid-kofi", "kid-eli"], title: "Morning snack", detail: "Apple slices and crackers, ate most", time: "9:15 AM", dayLabel: "Mon", photoId: null },
  { id: "fe-3", kind: "photo", roomId: "toddlers", kidIds: ["kid-noah"], title: "Photo", detail: "Block tower, 14 blocks tall", time: "3:40 PM", dayLabel: "Tue", photoId: "p1" },
  { id: "fe-4", kind: "nap", roomId: "toddlers", kidIds: ["kid-noah", "kid-mateo", "kid-zoe", "kid-kofi", "kid-eli"], title: "Nap", detail: "Slept 12:30 to 2:05", time: "2:05 PM", dayLabel: "Tue", photoId: null },
  { id: "fe-5", kind: "activity", roomId: "preschool", kidIds: ["kid-sofia", "kid-amara"], title: "Activity", detail: "Water table science, sink or float", time: "11:00 AM", dayLabel: "Wed", photoId: "p6" },
  { id: "fe-6", kind: "note", roomId: "preschool", kidIds: ["kid-jordan"], title: "Note", detail: "Jordan led story circle today and picked the book", time: "1:20 PM", dayLabel: "Wed", photoId: "p5" },
  { id: "fe-7", kind: "photo", roomId: "preschool", kidIds: ["kid-maya", "kid-ava"], title: "Photo", detail: "Morning playground time", time: "9:50 AM", dayLabel: "Thu", photoId: "p3" },
  { id: "fe-8", kind: "meal", roomId: "preschool", kidIds: ["kid-ava", "kid-sofia", "kid-jordan", "kid-amara", "kid-maya"], title: "Lunch", detail: "Chicken, rice, and green beans", time: "12:10 PM", dayLabel: "Thu", photoId: "p4" },
  { id: "fe-9", kind: "activity", roomId: "toddlers", kidIds: ["kid-zoe", "kid-eli"], title: "Activity", detail: "Big blocks and ramps in the gross motor room", time: "10:30 AM", dayLabel: "Fri", photoId: null },
  { id: "fe-10", kind: "checkin", roomId: "toddlers", kidIds: ["kid-noah"], title: "Check in", detail: "Dropped off by Dad", time: "7:42 AM", dayLabel: "Today", photoId: null },
  { id: "fe-11", kind: "checkin", roomId: "toddlers", kidIds: ["kid-zoe"], title: "Check in", detail: "Dropped off by Mom", time: "7:55 AM", dayLabel: "Today", photoId: null },
  { id: "fe-12", kind: "checkin", roomId: "preschool", kidIds: ["kid-sofia"], title: "Check in", detail: "Dropped off by Mom", time: "8:02 AM", dayLabel: "Today", photoId: null },
  { id: "fe-13", kind: "checkin", roomId: "preschool", kidIds: ["kid-amara"], title: "Check in", detail: "Dropped off by Auntie", time: "8:10 AM", dayLabel: "Today", photoId: null },
  { id: "fe-14", kind: "meal", roomId: "toddlers", kidIds: ["kid-noah", "kid-zoe"], title: "Morning snack", detail: "Banana and graham crackers", time: "9:20 AM", dayLabel: "Today", photoId: null },
  { id: "fe-15", kind: "checkin", roomId: "infants", kidIds: ["kid-imani"], title: "Check in", detail: "Dropped off by Mom", time: "8:05 AM", dayLabel: "Today", photoId: null },
  { id: "fe-16", kind: "bottle", roomId: "infants", kidIds: ["kid-imani"], title: "Bottle", detail: "4 oz, finished it all", time: "9:40 AM", dayLabel: "Today", photoId: null },
  { id: "fe-17", kind: "diaper", roomId: "infants", kidIds: ["kid-imani"], title: "Diaper", detail: "Wet, changed and happy", time: "10:15 AM", dayLabel: "Today", photoId: null },
  { id: "fe-18", kind: "activity", roomId: "schoolage", kidIds: ["kid-nia", "kid-ade"], title: "Activity", detail: "Homework table, then gym games", time: "4:10 PM", dayLabel: "Thu", photoId: null },
];

/** Mon to Fri shifts. Color comes from the room. Christina holds office days. */
export const SHIFTS_SEED: PreviewShift[] = [
  { id: "sh-1", staffId: "st-dana", day: 0, start: "7:00", end: "3:00", roomId: "toddlers" },
  { id: "sh-2", staffId: "st-dana", day: 1, start: "7:00", end: "3:00", roomId: "toddlers" },
  { id: "sh-3", staffId: "st-dana", day: 3, start: "7:00", end: "3:00", roomId: "toddlers" },
  { id: "sh-4", staffId: "st-dana", day: 4, start: "7:00", end: "3:00", roomId: "toddlers" },
  { id: "sh-5", staffId: "st-maria", day: 0, start: "9:00", end: "5:00", roomId: "preschool" },
  { id: "sh-6", staffId: "st-maria", day: 2, start: "9:00", end: "5:00", roomId: "preschool" },
  { id: "sh-7", staffId: "st-maria", day: 3, start: "9:00", end: "5:00", roomId: "preschool" },
  { id: "sh-8", staffId: "st-tasha", day: 1, start: "10:00", end: "6:00", roomId: "toddlers" },
  { id: "sh-9", staffId: "st-tasha", day: 2, start: "10:00", end: "6:00", roomId: "preschool" },
  { id: "sh-10", staffId: "st-tasha", day: 4, start: "10:00", end: "6:00", roomId: "preschool" },
  { id: "sh-11", staffId: "st-christina", day: 0, start: "8:00", end: "4:00", roomId: null },
  { id: "sh-12", staffId: "st-christina", day: 2, start: "8:00", end: "4:00", roomId: null },
  { id: "sh-13", staffId: "st-keisha", day: 0, start: "7:00", end: "3:00", roomId: "infants" },
  { id: "sh-14", staffId: "st-keisha", day: 1, start: "7:00", end: "3:00", roomId: "infants" },
  { id: "sh-15", staffId: "st-keisha", day: 3, start: "7:00", end: "3:00", roomId: "infants" },
  { id: "sh-16", staffId: "st-marcus", day: 0, start: "2:00", end: "6:00", roomId: "schoolage" },
  { id: "sh-17", staffId: "st-marcus", day: 2, start: "2:00", end: "6:00", roomId: "schoolage" },
  { id: "sh-18", staffId: "st-marcus", day: 4, start: "2:00", end: "6:00", roomId: "schoolage" },
];

export const NEWSLETTER_SEED: NewsletterBlock[] = [
  {
    id: "nb-header",
    kind: "header",
    label: "Header",
    title: "🌞 Week of June 8 at Christina's",
    body: "What a week of sunshine and big steps. Here is what your kids were up to.",
    photoIds: [],
  },
  {
    id: "nb-photos",
    kind: "photos",
    label: "Photos from the week",
    title: "Moments we loved",
    body: "",
    photoIds: ["p1", "p2", "p3"],
  },
  {
    id: "nb-reminders",
    kind: "reminders",
    label: "Reminders",
    title: "For next week",
    body: "Water day is Friday. Bring towels and a change of clothes.",
    photoIds: [],
  },
];

/** Kids already in the building when the demo starts, with display times.
 *  School Age stays empty until after school: a true quiet room. */
export const CHECKED_IN_SEED: Record<string, string | null> = {
  "kid-noah": "7:42 AM",
  "kid-zoe": "7:55 AM",
  "kid-sofia": "8:02 AM",
  "kid-amara": "8:10 AM",
  "kid-imani": "8:05 AM",
};

/** Staff already clocked in when the demo starts. */
export const CLOCKED_IN_SEED: Record<string, string | null> = {
  "st-dana": "6:58 AM",
  "st-maria": "8:00 AM",
  "st-keisha": "7:30 AM",
};

/** Meal marks already taken today: key is roomId|mealName, value maps kid to mark. */
export const MEALS_SEED: Record<string, Record<string, MealMark>> = {
  "toddlers|Morning snack": {
    "kid-noah": "ate",
    "kid-zoe": "some",
  },
};

export const DEFAULT_OFFICE_TILES: OfficeTileId[] = [
  "rooms",
  "people",
  "newsletter",
  "schedule",
  "reports",
];

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function kidById(kids: PreviewKid[], id: string): PreviewKid | null {
  return kids.find((k) => k.id === id) ?? null;
}

export function roomById(id: string): PreviewRoom | null {
  return ROOMS.find((r) => r.id === id) ?? null;
}
