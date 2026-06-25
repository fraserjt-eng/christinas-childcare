"use client";

// Shared demo store for the /preview layer. Every preview screen reads and
// writes this one store, so the surfaces visibly talk to each other during
// review: a kiosk check-in moves the office ratio tiles, a room log lands in
// the family feed, food counts roll into the room's day.
//
// THIS STORE'S SHAPE IS THE DRAFT CONTRACT for the real tables at merge time.
// Mapping to production tables is documented in docs/preview/PLAN.md.
//
// Persistence: localStorage only (zustand persist, skipHydration so the
// server render always matches the first client render). Reset Demo restores
// the seed. Nothing here touches Supabase.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  CHECKED_IN_SEED,
  CLOCKED_IN_SEED,
  DEFAULT_OFFICE_TILES,
  FAMILIES,
  FAMILY_MESSAGES,
  FEED_SEED,
  KIDS,
  MEALS_SEED,
  NEWSLETTER_SEED,
  ROOMS,
  SHIFTS_SEED,
  STAFF,
  type FeedEvent,
  type FeedKind,
  type MealMark,
  type NewsletterBlock,
  type OfficeTileId,
  type PreviewFamily,
  type PreviewKid,
  type PreviewRoom,
  type PreviewShift,
  type PreviewStaff,
} from "./fixtures";
import { setSoundEnabled } from "./sound";

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Display time like "9:15 AM". The demo speaks human time, never ISO. */
export function nowTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export interface LogEventInput {
  kind: FeedKind;
  roomId: string;
  kidIds: string[];
  title: string;
  detail: string;
  photoId?: string | null;
  photoUrl?: string | null;
}

/** One message in a family thread. `mine: true` means the office/center sent
 *  it; `mine: false` means the parent wrote back. Same shape both ways so the
 *  office and the parent phone read the same thread. */
export interface PreviewMessage {
  id: string;
  from: string;
  body: string;
  time: string;
  fromOffice: boolean;
  unread: boolean;
}

/** The live, real-data payload the front-facing portal hydrates from
 *  (/api/portal/center-data). Same shape the fixtures define, but real rows
 *  with real UUIDs and the center's actual classrooms as rooms. */
export interface LivePayload {
  centerId: string;
  centerName: string | null;
  centers: { id: string; name: string }[];
  rooms: PreviewRoom[];
  kids: PreviewKid[];
  staff: PreviewStaff[];
  families: PreviewFamily[];
  checkedIn: Record<string, string | null>;
  clockedIn: Record<string, string | null>;
  feed: FeedEvent[];
  shifts: PreviewShift[];
  /** kidId -> signed avatar URL, from family_children.photo_url (cloud). */
  kidPhotos?: Record<string, string>;
}

export interface PreviewState {
  /** The live center this portal is showing (null in the fixtures demo). */
  centerId: string | null;
  centerName: string | null;
  rooms: PreviewRoom[];
  kids: PreviewKid[];
  staff: PreviewStaff[];
  families: PreviewFamily[];
  feed: FeedEvent[];
  shifts: PreviewShift[];
  newsletter: NewsletterBlock[];
  /** kidId to display check-in time, or null when checked out. */
  checkedIn: Record<string, string | null>;
  /** staffId to display clock-in time, or null when clocked out. */
  clockedIn: Record<string, string | null>;
  /** "roomId|Meal name" to per-kid marks. */
  meals: Record<string, Record<string, MealMark>>;
  officeTiles: OfficeTileId[];
  soundOn: boolean;
  /** kidId to an uploaded photo data URL, used as the child's box avatar. */
  kidPhotos: Record<string, string>;
  /** staffId to an uploaded photo data URL, used as the staff member's avatar. */
  staffPhotos: Record<string, string>;
  /** familyId to current balance owed. The office can change it; the parent
   *  phone reads it. Maps to family_statements in the real app. */
  balances: Record<string, number>;
  /** familyId to its message thread, newest first. Shared by the office
   *  messages screen and the parent phone, so a send shows up on both. */
  threads: Record<string, PreviewMessage[]>;

  checkInKid: (kidId: string, by: string, photoUrl?: string | null) => void;
  checkOutKid: (kidId: string, by: string) => void;
  clockInStaff: (staffId: string) => void;
  clockOutStaff: (staffId: string) => void;
  logEvent: (input: LogEventInput) => void;
  editEvent: (eventId: string, detail: string) => void;
  removeEvent: (eventId: string) => void;
  setKidPhoto: (kidId: string, dataUrl: string) => void;
  setStaffPhoto: (staffId: string, dataUrl: string) => void;
  markFamilyPaid: (familyId: string) => void;
  sendToFamily: (familyId: string, from: string, body: string, fromOffice: boolean) => void;
  markThreadRead: (familyId: string) => void;
  setMealMark: (roomId: string, meal: string, kidId: string, mark: MealMark) => void;
  addShift: (shift: Omit<PreviewShift, "id">) => void;
  removeShift: (shiftId: string) => void;
  updateShift: (shiftId: string, patch: Partial<Omit<PreviewShift, "id">>) => void;
  addNewsletterBlock: (kind: NewsletterBlock["kind"]) => void;
  updateNewsletterBlock: (blockId: string, patch: Partial<Omit<NewsletterBlock, "id" | "kind">>) => void;
  addPerson: (input: { kind: "staff" | "family"; name: string }) => void;
  setStaffRoom: (staffId: string, roomId: string | null) => void;
  addOfficeTile: (tile: OfficeTileId) => void;
  removeOfficeTile: (tile: OfficeTileId) => void;
  toggleSound: () => void;
  hydrateFromLive: (payload: LivePayload) => void;
  resetDemo: () => void;
}

function buildSeed() {
  return {
    centerId: null as string | null,
    centerName: null as string | null,
    rooms: ROOMS.map((r) => ({ ...r })),
    kids: KIDS.map((k) => ({ ...k })),
    staff: STAFF.map((s) => ({ ...s })),
    families: FAMILIES.map((f) => ({ ...f, kidIds: [...f.kidIds] })),
    feed: FEED_SEED.map((e) => ({ ...e, kidIds: [...e.kidIds] })),
    shifts: SHIFTS_SEED.map((s) => ({ ...s })),
    newsletter: NEWSLETTER_SEED.map((b) => ({ ...b, photoIds: [...b.photoIds] })),
    checkedIn: { ...CHECKED_IN_SEED },
    clockedIn: { ...CLOCKED_IN_SEED },
    meals: Object.fromEntries(
      Object.entries(MEALS_SEED).map(([key, marks]) => [key, { ...marks }]),
    ),
    officeTiles: [...DEFAULT_OFFICE_TILES],
    soundOn: true,
    kidPhotos: {} as Record<string, string>,
    staffPhotos: {} as Record<string, string>,
    balances: Object.fromEntries(FAMILIES.map((f) => [f.id, f.balanceOwed])) as Record<string, number>,
    threads: Object.fromEntries(
      FAMILIES.map((f) => {
        const seed = FAMILY_MESSAGES[f.id];
        return [
          f.id,
          seed
            ? [
                {
                  id: newId("msg"),
                  from: seed.from,
                  body: seed.body,
                  time: seed.time,
                  fromOffice: true,
                  unread: seed.unread,
                },
              ]
            : [],
        ];
      }),
    ) as Record<string, PreviewMessage[]>,
  };
}

export const usePreviewStore = create<PreviewState>()(
  persist(
    (set, get) => ({
      ...buildSeed(),

      checkInKid: (kidId, by, photoUrl) => {
        const kid = get().kids.find((k) => k.id === kidId);
        if (!kid) return;
        const time = nowTime();
        set((state) => ({
          checkedIn: { ...state.checkedIn, [kidId]: time },
          feed: [
            {
              id: newId("fe"),
              kind: "checkin" as const,
              roomId: kid.roomId,
              kidIds: [kidId],
              title: "Check in",
              detail: `Dropped off by ${by}`,
              time,
              dayLabel: "Today",
              photoId: null,
              photoUrl: photoUrl ?? null,
            },
            ...state.feed,
          ],
        }));
      },

      checkOutKid: (kidId, by) => {
        const kid = get().kids.find((k) => k.id === kidId);
        if (!kid) return;
        const time = nowTime();
        set((state) => ({
          checkedIn: { ...state.checkedIn, [kidId]: null },
          feed: [
            {
              id: newId("fe"),
              kind: "checkout" as const,
              roomId: kid.roomId,
              kidIds: [kidId],
              title: "Check out",
              detail: `Picked up by ${by}`,
              time,
              dayLabel: "Today",
              photoId: null,
            },
            ...state.feed,
          ],
        }));
      },

      clockInStaff: (staffId) => {
        set((state) => ({
          clockedIn: { ...state.clockedIn, [staffId]: nowTime() },
        }));
      },

      clockOutStaff: (staffId) => {
        set((state) => ({
          clockedIn: { ...state.clockedIn, [staffId]: null },
        }));
      },

      logEvent: (input) => {
        set((state) => ({
          feed: [
            {
              id: newId("fe"),
              kind: input.kind,
              roomId: input.roomId,
              kidIds: [...input.kidIds],
              title: input.title,
              detail: input.detail,
              time: nowTime(),
              dayLabel: "Today",
              photoId: input.photoId ?? null,
              photoUrl: input.photoUrl ?? null,
            },
            ...state.feed,
          ],
        }));
      },

      editEvent: (eventId, detail) => {
        set((state) => ({
          feed: state.feed.map((e) => (e.id === eventId ? { ...e, detail } : e)),
        }));
      },

      removeEvent: (eventId) => {
        set((state) => ({
          feed: state.feed.filter((e) => e.id !== eventId),
        }));
      },

      setKidPhoto: (kidId, dataUrl) => {
        // Optimistic: show it immediately on this device.
        set((state) => ({
          kidPhotos: { ...state.kidPhotos, [kidId]: dataUrl },
        }));
        // Persist to the cloud so it syncs to every device (best-effort; in the
        // sealed fixtures demo there is no session and this 401s harmlessly).
        if (typeof fetch !== 'undefined') {
          fetch('/api/child-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ child_id: kidId, image_data: dataUrl }),
          }).catch(() => {});
        }
      },

      setStaffPhoto: (staffId, dataUrl) => {
        set((state) => ({
          staffPhotos: { ...state.staffPhotos, [staffId]: dataUrl },
        }));
      },

      markFamilyPaid: (familyId) => {
        set((state) => ({
          balances: { ...state.balances, [familyId]: 0 },
        }));
      },

      sendToFamily: (familyId, from, body, fromOffice) => {
        set((state) => ({
          threads: {
            ...state.threads,
            [familyId]: [
              {
                id: newId("msg"),
                from,
                body,
                time: nowTime(),
                fromOffice,
                unread: true,
              },
              ...(state.threads[familyId] ?? []),
            ],
          },
        }));
      },

      markThreadRead: (familyId) => {
        set((state) => ({
          threads: {
            ...state.threads,
            [familyId]: (state.threads[familyId] ?? []).map((m) => ({ ...m, unread: false })),
          },
        }));
      },

      setMealMark: (roomId, meal, kidId, mark) => {
        const key = `${roomId}|${meal}`;
        set((state) => ({
          meals: {
            ...state.meals,
            [key]: { ...(state.meals[key] ?? {}), [kidId]: mark },
          },
        }));
      },

      addShift: (shift) => {
        set((state) => ({
          shifts: [...state.shifts, { ...shift, id: newId("sh") }],
        }));
      },

      removeShift: (shiftId) => {
        set((state) => ({
          shifts: state.shifts.filter((s) => s.id !== shiftId),
        }));
      },

      updateShift: (shiftId, patch) => {
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === shiftId ? { ...s, ...patch } : s)),
        }));
      },

      addNewsletterBlock: (kind) => {
        const labels: Record<NewsletterBlock["kind"], string> = {
          header: "Header",
          photos: "Photos from the week",
          reminders: "Reminders",
        };
        set((state) => ({
          newsletter: [
            ...state.newsletter,
            {
              id: newId("nb"),
              kind,
              label: labels[kind],
              title: "",
              body: "",
              photoIds: [],
            },
          ],
        }));
      },

      updateNewsletterBlock: (blockId, patch) => {
        set((state) => ({
          newsletter: state.newsletter.map((b) =>
            b.id === blockId ? { ...b, ...patch } : b,
          ),
        }));
      },

      addPerson: ({ kind, name }) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        if (kind === "staff") {
          const first = trimmed.split(" ")[0] ?? trimmed;
          const last = trimmed.split(" ").slice(1).join(" ");
          set((state) => ({
            staff: [
              ...state.staff,
              {
                id: newId("st"),
                firstName: first,
                lastName: last,
                role: "teacher" as const,
                roomId: null,
                pin: String(1000 + Math.floor(Math.random() * 9000)),
                avatar: "🧑🏾‍🏫",
                color: "#4a90d9",
              },
            ],
          }));
        } else {
          const name = trimmed.endsWith("family") ? trimmed : `${trimmed} family`;
          const parentFirst = trimmed.replace(/family$/i, "").trim().split(" ")[0] || trimmed;
          set((state) => ({
            families: [
              ...state.families,
              {
                id: newId("fam"),
                name,
                pin: String(1000 + Math.floor(Math.random() * 9000)),
                avatar: "👨🏾‍👩🏾‍👧🏾",
                kidIds: [],
                parentName: parentFirst,
                email: `${parentFirst.toLowerCase()}@example.com`,
                emergencyContact: { name: "", relationship: "", phone: "" },
                approvedPickups: [{ name: parentFirst, relationship: "Parent" }],
                balanceOwed: 0,
                balanceDueLabel: "no balance yet",
                formsToSign: [],
              },
            ],
          }));
        }
      },

      setStaffRoom: (staffId, roomId) => {
        set((state) => ({
          staff: state.staff.map((s) => (s.id === staffId ? { ...s, roomId } : s)),
        }));
      },

      addOfficeTile: (tile) => {
        set((state) => ({
          officeTiles: state.officeTiles.includes(tile)
            ? state.officeTiles
            : [...state.officeTiles, tile],
        }));
      },

      removeOfficeTile: (tile) => {
        set((state) => ({
          officeTiles: state.officeTiles.filter((t) => t !== tile),
        }));
      },

      toggleSound: () => {
        const next = !get().soundOn;
        setSoundEnabled(next);
        set({ soundOn: next });
      },

      hydrateFromLive: (payload) => {
        set((state) => ({
          centerId: payload.centerId,
          centerName: payload.centerName,
          rooms: payload.rooms,
          kids: payload.kids,
          staff: payload.staff,
          families: payload.families,
          checkedIn: payload.checkedIn,
          clockedIn: payload.clockedIn,
          feed: payload.feed,
          balances: Object.fromEntries(payload.families.map((f) => [f.id, f.balanceOwed])),
          threads: Object.fromEntries(payload.families.map((f) => [f.id, state.threads[f.id] ?? []])),
          meals: {},
          shifts: payload.shifts,
          // Cloud avatars win where present; a just-uploaded local photo not yet
          // reflected in the cloud is preserved so it never flickers to the
          // placeholder between upload and the next hydrate.
          kidPhotos: { ...state.kidPhotos, ...(payload.kidPhotos ?? {}) },
        }));
      },

      resetDemo: () => {
        set(buildSeed());
        setSoundEnabled(true);
      },
    }),
    {
      name: "cc-preview-demo-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // Never persist kidPhotos. They hold short-lived SIGNED photo URLs; a
      // persisted link expires within hours and then shows a broken image until
      // a hard refresh. Always rehydrate them fresh from the server via
      // hydrateFromLive, so a photo saved on one device shows on every device.
      partialize: (state) => {
        const persisted = { ...state } as Record<string, unknown>;
        delete persisted.kidPhotos;
        return persisted as Partial<PreviewState>;
      },
      // Bump when the fixture world changes shape so devices that walked an
      // older demo reseed instead of carrying a stale world (v2: four rooms,
      // bottles and diapers, infant and school-age kids. v3: uploaded photos.
      // v4: office-driven balances and message threads. v5: staff photos).
      version: 5,
      migrate: () => buildSeed(),
    },
  ),
);

export interface RoomStatus {
  roomId: string;
  present: number;
  staffIn: number;
  ratioText: string;
  limitText: string;
  level: "good" | "near" | "over";
  message: string;
}

/** Live ratio per room, computed from check-ins and clock-ins.
 *  This is the math behind the office traffic-light tiles.
 *  Call it OUTSIDE a zustand selector (it returns a fresh object every
 *  call, which zustand v5 reads as an endless snapshot change). */
export function getRoomStatus(
  state: Pick<PreviewState, "kids" | "staff" | "checkedIn" | "clockedIn"> & { rooms?: PreviewRoom[] },
  roomId: string,
): RoomStatus {
  const room = (state.rooms ?? ROOMS).find((r) => r.id === roomId);
  const limit = room?.ratioLimit ?? 10;
  const present = state.kids.filter(
    (k) => k.roomId === roomId && state.checkedIn[k.id],
  ).length;
  const staffIn = state.staff.filter(
    (s) => s.roomId === roomId && state.clockedIn[s.id],
  ).length;

  let level: RoomStatus["level"] = "good";
  let message = "All good";
  if (present === 0) {
    level = "good";
    message = "Quiet room";
  } else if (staffIn === 0) {
    level = "over";
    message = "Needs a teacher";
  } else {
    const ratio = Math.ceil(present / staffIn);
    if (ratio > limit) {
      level = "over";
      message = "Needs staff";
    } else if (ratio === limit) {
      level = "near";
      message = "Near the limit";
    }
  }

  return {
    roomId,
    present,
    staffIn,
    ratioText: staffIn > 0 ? `${present} : ${staffIn}` : `${present} : 0`,
    limitText: `Limit ${limit} per teacher`,
    level,
    message,
  };
}
