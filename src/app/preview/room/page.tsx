"use client";

// Teacher quick-tap logging (design study 03, Brightwheel pattern).
// One tap logs for the whole room. Every present kid starts selected,
// the teacher drops the one or two it does not apply to, then saves.
// The Infants room gets two extra actions, Bottle and Diaper, and most
// actions carry quick-detail chips that fill the detail box in one tap.

import { useState } from "react";
import { BackHome } from "@/components/preview/BackHome";
import {
  Apple,
  Baby,
  Backpack,
  Blocks,
  Camera,
  Check,
  ClipboardList,
  type LucideIcon,
  Milk,
  Moon,
  Palette,
  StickyNote,
  Sun,
  Undo2,
} from "lucide-react";
import {
  BigButton,
  Chip,
  EmptyState,
  SuccessBanner,
  useMounted,
} from "@/components/preview/ui";
import { PhotoUpload } from "@/components/preview/PhotoUpload";
import { PhotoAvatar } from "@/components/preview/PhotoAvatar";
import { AvatarUpload } from "@/components/preview/AvatarUpload";
import { DEMO_PHOTOS } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

/** Small lucide line icon per room, tinted with the room color. */
const ROOM_ICON: Record<string, LucideIcon> = {
  infants: Baby,
  toddlers: Blocks,
  preschool: Palette,
  schoolage: Backpack,
};

/** Small lucide line icon per log kind (replaces the kind emoji glyphs). */
const KIND_ICON: Record<string, LucideIcon> = {
  meal: Apple,
  bottle: Milk,
  diaper: StickyNote,
  nap: Moon,
  activity: Palette,
  photo: Camera,
  note: StickyNote,
};

type ActionKind = "meal" | "bottle" | "diaper" | "nap" | "activity" | "photo" | "note";

interface RoomAction {
  kind: ActionKind;
  label: string;
  icon: LucideIcon;
  color: string;
  panelTitle: string;
  defaultDetail: string;
  /** One-tap fills for the detail box. Empty means free text only. */
  quickChips: string[];
}

const MEAL_CHIPS = ["Ate all", "Ate some", "Just a little"];
const BOTTLE_CHIPS = ["2 oz", "4 oz", "6 oz", "8 oz, finished it"];
const DIAPER_CHIPS = ["Wet", "BM", "Dry, checked"];
const NAP_CHIPS = ["Just fell asleep", "Woke up happy", "Short rest"];
const ACTIVITY_CHIPS = [
  "Circle time",
  "Outdoor play",
  "Art & craft",
  "Music & movement",
  "Story time",
  "Sensory play",
  "Free play",
  "Blocks",
];
const BOTTLE_TYPES = ["Breast milk", "Formula", "Water"];

// Format a 24h time value ("13:05") as a friendly clock time ("1:05 PM").
function fmtTime(t: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return t;
  const h = Number(m[1]);
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m[2]} ${ap}`;
}
// The structured nap / bottle controls just build the human-readable note
// string; storage stays {note: string} so the family feed renders it unchanged.
function buildNap(start: string, end: string): string {
  if (start && end) return `Slept ${fmtTime(start)} to ${fmtTime(end)}`;
  if (start) return `Fell asleep ${fmtTime(start)}`;
  if (end) return `Woke up ${fmtTime(end)}`;
  return "";
}
function buildBottle(oz: string, type: string): string {
  const parts: string[] = [];
  if (oz) parts.push(`${oz} oz`);
  if (type) parts.push(type.toLowerCase());
  return parts.join(" ");
}

const STANDARD_ACTIONS: RoomAction[] = [
  {
    kind: "meal",
    label: "Meal",
    icon: Apple,
    color: "var(--pv-teal)",
    panelTitle: "Log a meal",
    defaultDetail: "Morning snack, ate most",
    quickChips: MEAL_CHIPS,
  },
  {
    kind: "nap",
    label: "Nap",
    icon: Moon,
    color: "var(--pv-plum)",
    panelTitle: "Log a nap",
    defaultDetail: "Slept 12:30 to 2:05",
    quickChips: NAP_CHIPS,
  },
  {
    kind: "activity",
    label: "Activity",
    icon: Palette,
    color: "var(--pv-gold)",
    panelTitle: "Log an activity",
    defaultDetail: "Outdoor play and big blocks",
    quickChips: ACTIVITY_CHIPS,
  },
  {
    kind: "photo",
    label: "Photo",
    icon: Camera,
    color: "var(--pv-sky)",
    panelTitle: "Log a photo",
    defaultDetail: "A moment from today",
    quickChips: [],
  },
  {
    kind: "note",
    label: "Note",
    icon: StickyNote,
    color: "var(--pv-coral)",
    panelTitle: "Log a note",
    defaultDetail: "A quick note from the room",
    quickChips: [],
  },
];

/** The Infants room logs bottles and diapers all day, so those lead.
 *  Seven actions share five readable colors, repeats spaced apart. */
const INFANT_ACTIONS: RoomAction[] = [
  {
    kind: "bottle",
    label: "Bottle",
    icon: Milk,
    color: "var(--pv-sky)",
    panelTitle: "Log a bottle",
    defaultDetail: "4 oz",
    quickChips: BOTTLE_CHIPS,
  },
  {
    kind: "diaper",
    label: "Diaper",
    icon: StickyNote,
    color: "var(--pv-plum)",
    panelTitle: "Log a diaper change",
    defaultDetail: "Wet, changed",
    quickChips: DIAPER_CHIPS,
  },
  {
    kind: "meal",
    label: "Meal",
    icon: Apple,
    color: "var(--pv-teal)",
    panelTitle: "Log a meal",
    defaultDetail: "Baby food, ate most",
    quickChips: MEAL_CHIPS,
  },
  {
    kind: "nap",
    label: "Nap",
    icon: Moon,
    color: "var(--pv-gold)",
    panelTitle: "Log a nap",
    defaultDetail: "Morning nap, slept well",
    quickChips: NAP_CHIPS,
  },
  {
    kind: "activity",
    label: "Activity",
    icon: Palette,
    color: "var(--pv-coral)",
    panelTitle: "Log an activity",
    defaultDetail: "Tummy time and rattles",
    quickChips: ACTIVITY_CHIPS,
  },
  {
    kind: "photo",
    label: "Photo",
    icon: Camera,
    color: "var(--pv-sky)",
    panelTitle: "Log a photo",
    defaultDetail: "A moment from today",
    quickChips: [],
  },
  {
    kind: "note",
    label: "Note",
    icon: StickyNote,
    color: "var(--pv-plum)",
    panelTitle: "Log a note",
    defaultDetail: "A quick note from the room",
    quickChips: [],
  },
];

export default function RoomPage() {
  const mounted = useMounted();
  const rooms = usePreviewStore((s) => s.rooms);
  const kids = usePreviewStore((s) => s.kids);
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const kidPhotos = usePreviewStore((s) => s.kidPhotos);
  const setKidPhoto = usePreviewStore((s) => s.setKidPhoto);
  const logEvent = usePreviewStore((s) => s.logEvent);
  const feed = usePreviewStore((s) => s.feed);
  const editEvent = usePreviewStore((s) => s.editEvent);
  const removeEvent = usePreviewStore((s) => s.removeEvent);

  const [roomId, setRoomId] = useState("toddlers");
  const [activeKind, setActiveKind] = useState<ActionKind | null>(null);
  const [detail, setDetail] = useState("");
  // Structured helpers for nap (start/end time) and bottle (oz + type). They
  // only build the detail string above; nothing new is stored.
  const [napStart, setNapStart] = useState("");
  const [napEnd, setNapEnd] = useState("");
  const [bottleOz, setBottleOz] = useState("");
  const [bottleType, setBottleType] = useState("");
  const [selectedKidIds, setSelectedKidIds] = useState<string[]>([]);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const roomKids = kids.filter((k) => k.roomId === roomId);
  const presentKids = mounted ? roomKids.filter((k) => checkedIn[k.id]) : [];
  const awayKids = mounted ? roomKids.filter((k) => !checkedIn[k.id]) : roomKids;
  const actions = roomId === "infants" ? INFANT_ACTIONS : STANDARD_ACTIONS;
  const activeAction = actions.find((a) => a.kind === activeKind) ?? null;
  const activeRoom = rooms.find((r) => r.id === roomId) ?? null;
  const todaysLog = mounted
    ? feed.filter(
        (e) =>
          e.roomId === roomId &&
          e.dayLabel === "Today" &&
          e.kind !== "checkin" &&
          e.kind !== "checkout",
      )
    : [];

  function pickRoom(id: string) {
    setRoomId(id);
    setActiveKind(null);
    setEditingId(null);
    setConfirmDeleteId(null);
  }

  function startEdit(eventId: string, currentDetail: string) {
    playClick();
    setEditingId(eventId);
    setEditText(currentDetail);
    setConfirmDeleteId(null);
  }

  function saveEdit() {
    if (editingId && editText.trim()) {
      editEvent(editingId, editText.trim());
      setSuccess("Updated. Families see the change in their feed.");
    }
    setEditingId(null);
  }

  function handleDelete(eventId: string) {
    playClick();
    if (confirmDeleteId !== eventId) {
      setConfirmDeleteId(eventId);
      return;
    }
    removeEvent(eventId);
    setConfirmDeleteId(null);
    setSuccess("Removed. It is off the family feed too.");
  }

  function openAction(action: RoomAction) {
    setActiveKind(action.kind);
    // Nap and bottle start blank so the structured pickers drive the note;
    // everything else keeps its friendly default.
    setDetail(action.kind === "nap" || action.kind === "bottle" ? "" : action.defaultDetail);
    setNapStart("");
    setNapEnd("");
    setBottleOz("");
    setBottleType("");
    setSelectedKidIds(presentKids.map((k) => k.id));
    setPhotoId(null);
    setUploadedUrl(null);
  }

  function closePanel() {
    setActiveKind(null);
  }

  function toggleKid(kidId: string) {
    setSelectedKidIds((prev) =>
      prev.includes(kidId) ? prev.filter((id) => id !== kidId) : [...prev, kidId],
    );
  }

  function save(action: RoomAction) {
    logEvent({
      kind: action.kind,
      roomId,
      kidIds: selectedKidIds,
      title: action.label,
      detail,
      photoId: uploadedUrl ? null : photoId,
      photoUrl: uploadedUrl,
    });
    // Persist each child's entry to the real daily report (the teacher is
    // signed in, so the secure child-entries route stamps it to their session
    // + the child's room, and the family feed reads it back). A real uploaded
    // photo is sent as photo_data so the route stores it in the photo bucket.
    const isPhoto = action.kind === "photo";
    for (const kidId of selectedKidIds) {
      fetch("/api/child-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: kidId,
          type: action.kind,
          detail: detail ? { note: detail } : {},
          ...(isPhoto && uploadedUrl && uploadedUrl.startsWith("data:")
            ? { photo_data: uploadedUrl }
            : {}),
        }),
      }).catch(() => {});
    }
    closePanel();
    setSuccess("Saved. Families will see this in their feed.");
  }

  const ActiveRoomIcon = activeRoom ? ROOM_ICON[activeRoom.id] ?? Baby : Baby;

  return (
    <main className="pv-tad pv-portal-bg min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <BackHome />
        <header className="mb-6">
          <h1 className="pv-tad-title text-3xl sm:text-4xl">Room log</h1>
          <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
            Pick a room, log the day, fix anything you need to. Any teacher, any room.
          </p>
        </header>

        <div className="pv-rise" style={{ animationDelay: "60ms" }}>
          <p className="flex items-center gap-1.5 text-base font-bold">
            <span style={{ color: "var(--pv-muted)" }}>Logging for:</span>
            {activeRoom ? (
              <span className="inline-flex items-center gap-1.5" style={{ color: activeRoom.color }}>
                <ActiveRoomIcon size={18} aria-hidden="true" />
                {activeRoom.name}
              </span>
            ) : null}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {rooms.map((room) => (
              <Chip
                key={room.id}
                label={room.name}
                on={room.id === roomId}
                onColor={room.color}
                onClick={() => pickRoom(room.id)}
              />
            ))}
          </div>
        </div>

        <div className="pv-rise mt-5" style={{ animationDelay: "120ms" }}>
        <div className="pv-tile p-5">
          {presentKids.length > 0 ? (
            <>
              <h2 className="text-2xl">
                {presentKids.length} {presentKids.length === 1 ? "kid" : "kids"} here now
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {presentKids.map((kid) => (
                  <div key={kid.id} className="flex flex-col items-center text-center">
                    <span className="relative inline-flex">
                      <PhotoAvatar
                        id={kid.id}
                        name={`${kid.firstName} ${kid.lastName}`}
                        src={kidPhotos[kid.id]}
                        size={64}
                        rounded="rounded-lg"
                      />
                      <AvatarUpload
                        label={`Upload a photo for ${kid.firstName}`}
                        onPhoto={(d) => setKidPhoto(kid.id, d)}
                        className="absolute -bottom-1 -right-1"
                      />
                    </span>
                    <span className="mt-2 block text-lg font-bold">{kid.firstName}</span>
                    <span className="block text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
                      since {checkedIn[kid.id]}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Sun}
              title="No kids here yet"
              detail="Check someone in at the kiosk and they show up here."
            />
          )}
          {awayKids.length > 0 ? (
            <p className="mt-4 text-base font-semibold" style={{ color: "var(--pv-muted)" }}>
              Not here yet: {awayKids.map((k) => k.firstName).join(", ")}
            </p>
          ) : null}
        </div>
        </div>

        <div className="pv-rise" style={{ animationDelay: "180ms" }}>
          <h2 className="pv-tad-title mt-7 text-2xl">what just happened?</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => (
              <BigButton
                key={action.kind}
                kiosk
                icon={action.icon}
                label={action.label}
                color={action.color}
                onClick={() => openAction(action)}
              />
            ))}
          </div>
        </div>

        {activeAction ? (
          <div className="pv-tile mt-6 p-5">
            <h2 className="pv-tad-title text-2xl">{activeAction.panelTitle.toLowerCase()}</h2>

            {activeAction.quickChips.length > 0 ? (
              <>
                <p className="mt-4 text-base" style={{ color: "var(--pv-muted)" }}>
                  Tap one and it fills the box. You can still change the words.
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {activeAction.quickChips.map((chip) => (
                    <Chip
                      key={chip}
                      label={chip}
                      on={detail === chip}
                      onColor={activeAction.color}
                      onClick={() => setDetail(chip)}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {activeAction.kind === "nap" ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block text-sm font-bold" style={{ color: "var(--pv-ink)" }}>
                  Fell asleep
                  <input
                    type="time"
                    value={napStart}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNapStart(v);
                      setDetail(buildNap(v, napEnd));
                    }}
                    className="mt-1 w-full rounded-lg border px-3 py-3 text-lg"
                    style={{ borderColor: "var(--pv-line)", color: "var(--pv-ink)", backgroundColor: "var(--pv-card)" }}
                  />
                </label>
                <label className="block text-sm font-bold" style={{ color: "var(--pv-ink)" }}>
                  Woke up
                  <input
                    type="time"
                    value={napEnd}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNapEnd(v);
                      setDetail(buildNap(napStart, v));
                    }}
                    className="mt-1 w-full rounded-lg border px-3 py-3 text-lg"
                    style={{ borderColor: "var(--pv-line)", color: "var(--pv-ink)", backgroundColor: "var(--pv-card)" }}
                  />
                </label>
              </div>
            ) : null}

            {activeAction.kind === "bottle" ? (
              <div className="mt-4">
                <label className="block text-sm font-bold" style={{ color: "var(--pv-ink)" }}>
                  How many ounces
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    inputMode="decimal"
                    value={bottleOz}
                    onChange={(e) => {
                      const v = e.target.value;
                      setBottleOz(v);
                      setDetail(buildBottle(v, bottleType));
                    }}
                    className="mt-1 block w-28 rounded-lg border px-3 py-3 text-lg"
                    style={{ borderColor: "var(--pv-line)", color: "var(--pv-ink)", backgroundColor: "var(--pv-card)" }}
                  />
                </label>
                <p className="mt-3 text-sm font-bold" style={{ color: "var(--pv-ink)" }}>What was in it</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {BOTTLE_TYPES.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      on={bottleType === t}
                      onColor={activeAction.color}
                      onClick={() => {
                        setBottleType(t);
                        setDetail(buildBottle(bottleOz, t));
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <label htmlFor="room-log-detail" className="mt-4 block text-base font-bold">
              What happened
            </label>
            <input
              id="room-log-detail"
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3 text-lg"
              style={{ borderColor: "var(--pv-line)", color: "var(--pv-ink)", backgroundColor: "var(--pv-card)" }}
            />

            <h3 className="mt-5 text-xl">Who was part of it</h3>
            <p className="mt-1 text-base" style={{ color: "var(--pv-muted)" }}>
              Everyone here is already picked. Tap a name to take one kid off this log.
            </p>
            {presentKids.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-3">
                {presentKids.map((kid) => (
                  <Chip
                    key={kid.id}
                    label={kid.firstName}
                    on={selectedKidIds.includes(kid.id)}
                    onColor={activeAction.color}
                    onClick={() => toggleKid(kid.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-base font-semibold" style={{ color: "var(--pv-muted)" }}>
                No kids are checked in yet, so there is nobody to log for.
              </p>
            )}

            {activeAction.kind === "photo" ? (
              <>
                <h3 className="mt-5 text-xl">Add a photo</h3>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <PhotoUpload
                    label="Take or upload your own"
                    capture
                    color="var(--pv-teal)"
                    onPhoto={(url) => {
                      setUploadedUrl(url);
                      setPhotoId(null);
                    }}
                  />
                  {uploadedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={uploadedUrl} alt="Your photo" className="h-16 w-16 rounded-lg object-cover" />
                  ) : null}
                </div>
                <p className="mt-3 text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
                  Or pick a sample
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {DEMO_PHOTOS.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      aria-pressed={photoId === photo.id}
                      onClick={() => {
                        playClick();
                        setUploadedUrl(null);
                        setPhotoId((prev) => (prev === photo.id ? null : photo.id));
                      }}
                      className="pv-press pv-target rounded-lg border-2 p-1 text-left"
                      style={{
                        borderColor: photoId === photo.id ? "var(--pv-sky)" : "var(--pv-line)",
                        backgroundColor: "var(--pv-card)",
                      }}
                    >
                      <img
                        src={photo.src}
                        alt={photo.caption}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                      <span className="mt-1 block px-1 pb-1 text-sm font-semibold" style={{ color: "var(--pv-ink)" }}>
                        {photo.caption}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            <div className="mt-6 flex flex-col gap-3">
              <BigButton
                kiosk
                icon={Check}
                label={`Save for ${selectedKidIds.length} ${selectedKidIds.length === 1 ? "kid" : "kids"}`}
                color={activeAction.color}
                disabled={selectedKidIds.length === 0}
                onClick={() => save(activeAction)}
                className="w-full"
              />
              <BigButton icon={Undo2} label="Cancel" color="#8a8378" onClick={closePanel} className="w-full" />
            </div>
          </div>
        ) : null}

        {/* TODAY'S LOG: edit the wording or remove an entry. Any teacher. */}
        <div className="pv-rise" style={{ animationDelay: "240ms" }}>
        <h2 className="pv-tad-title mt-8 text-2xl">today&apos;s log</h2>
        <p className="mt-1 text-base" style={{ color: "var(--pv-muted)" }}>
          Tap Edit to fix the words, or Remove to take an entry off. Families see
          the change right away.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {todaysLog.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Nothing logged here yet" detail="What you log shows up in this list to fix later." />
          ) : (
            todaysLog.map((e) => {
              const KindIcon = KIND_ICON[e.kind] ?? StickyNote;
              return (
              <div key={e.id} className="pv-tile p-5">
                {editingId === e.id ? (
                  <div className="flex flex-col gap-3">
                    <p className="flex items-center gap-1.5 text-base font-extrabold">
                      <KindIcon size={16} aria-hidden="true" style={{ color: "var(--pv-coral)" }} />
                      {e.title}
                    </p>
                    <textarea
                      value={editText}
                      onChange={(ev) => setEditText(ev.target.value)}
                      rows={2}
                      aria-label="Edit the entry"
                      className="rounded-lg border px-4 py-3 text-base"
                      style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)" }}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          saveEdit();
                        }}
                        disabled={!editText.trim()}
                        className="pv-press pv-target rounded-lg px-4 py-2 text-base font-extrabold text-white disabled:opacity-50"
                        style={{ backgroundColor: "var(--pv-teal)" }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          setEditingId(null);
                        }}
                        className="pv-press pv-target rounded-lg px-4 py-2 text-base font-bold"
                        style={{ color: "var(--pv-muted)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: "#f4ece9" }}
                    >
                      <KindIcon size={18} style={{ color: "var(--pv-coral)" }} />
                    </span>
                    <div className="flex-1">
                      <p className="text-base font-extrabold">{e.title}</p>
                      <p className="text-sm" style={{ color: "#4d473f" }}>{e.detail}</p>
                      <p className="text-xs" style={{ color: "var(--pv-muted)" }}>
                        {e.time} · {e.kidIds.length} {e.kidIds.length === 1 ? "kid" : "kids"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(e.id, e.detail)}
                        className="pv-press pv-target rounded-lg px-3 py-2 text-sm font-bold"
                        style={{ color: "var(--pv-sky)" }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(e.id)}
                        className="pv-press pv-target rounded-lg px-3 py-2 text-sm font-bold"
                        style={{ color: "var(--pv-coral)" }}
                      >
                        {confirmDeleteId === e.id ? "Tap to confirm" : "Remove"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              );
            })
          )}
        </div>
        </div>
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
