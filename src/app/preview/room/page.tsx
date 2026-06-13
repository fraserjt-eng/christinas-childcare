"use client";

// Teacher quick-tap logging (design study 03, Brightwheel pattern).
// One tap logs for the whole room. Every present kid starts selected,
// the teacher drops the one or two it does not apply to, then saves.
// The Infants room gets two extra actions, Bottle and Diaper, and most
// actions carry quick-detail chips that fill the detail box in one tap.

import { useState } from "react";
import {
  BigButton,
  Card,
  Chip,
  EmptyState,
  ScreenHeader,
  StepNote,
  SuccessBanner,
  useMounted,
} from "@/components/preview/ui";
import { PhotoUpload } from "@/components/preview/PhotoUpload";
import { DEMO_PHOTOS, ROOMS } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

type ActionKind = "meal" | "bottle" | "diaper" | "nap" | "activity" | "photo" | "note";

interface RoomAction {
  kind: ActionKind;
  label: string;
  emoji: string;
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

const STANDARD_ACTIONS: RoomAction[] = [
  {
    kind: "meal",
    label: "Meal",
    emoji: "🍎",
    color: "var(--pv-teal)",
    panelTitle: "Log a meal",
    defaultDetail: "Morning snack, ate most",
    quickChips: MEAL_CHIPS,
  },
  {
    kind: "nap",
    label: "Nap",
    emoji: "😴",
    color: "var(--pv-plum)",
    panelTitle: "Log a nap",
    defaultDetail: "Slept 12:30 to 2:05",
    quickChips: NAP_CHIPS,
  },
  {
    kind: "activity",
    label: "Activity",
    emoji: "🎨",
    color: "var(--pv-gold)",
    panelTitle: "Log an activity",
    defaultDetail: "Outdoor play and big blocks",
    quickChips: [],
  },
  {
    kind: "photo",
    label: "Photo",
    emoji: "📷",
    color: "var(--pv-sky)",
    panelTitle: "Log a photo",
    defaultDetail: "A moment from today",
    quickChips: [],
  },
  {
    kind: "note",
    label: "Note",
    emoji: "📝",
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
    emoji: "🍼",
    color: "var(--pv-sky)",
    panelTitle: "Log a bottle",
    defaultDetail: "4 oz",
    quickChips: BOTTLE_CHIPS,
  },
  {
    kind: "diaper",
    label: "Diaper",
    emoji: "🧷",
    color: "var(--pv-plum)",
    panelTitle: "Log a diaper change",
    defaultDetail: "Wet, changed",
    quickChips: DIAPER_CHIPS,
  },
  {
    kind: "meal",
    label: "Meal",
    emoji: "🍎",
    color: "var(--pv-teal)",
    panelTitle: "Log a meal",
    defaultDetail: "Baby food, ate most",
    quickChips: MEAL_CHIPS,
  },
  {
    kind: "nap",
    label: "Nap",
    emoji: "😴",
    color: "var(--pv-gold)",
    panelTitle: "Log a nap",
    defaultDetail: "Morning nap, slept well",
    quickChips: NAP_CHIPS,
  },
  {
    kind: "activity",
    label: "Activity",
    emoji: "🎨",
    color: "var(--pv-coral)",
    panelTitle: "Log an activity",
    defaultDetail: "Tummy time and rattles",
    quickChips: [],
  },
  {
    kind: "photo",
    label: "Photo",
    emoji: "📷",
    color: "var(--pv-sky)",
    panelTitle: "Log a photo",
    defaultDetail: "A moment from today",
    quickChips: [],
  },
  {
    kind: "note",
    label: "Note",
    emoji: "📝",
    color: "var(--pv-plum)",
    panelTitle: "Log a note",
    defaultDetail: "A quick note from the room",
    quickChips: [],
  },
];

const KIND_EMOJI: Record<string, string> = {
  meal: "🍎",
  bottle: "🍼",
  diaper: "🧷",
  nap: "😴",
  activity: "🎨",
  photo: "📷",
  note: "📝",
};

export default function RoomPage() {
  const mounted = useMounted();
  const kids = usePreviewStore((s) => s.kids);
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const logEvent = usePreviewStore((s) => s.logEvent);
  const feed = usePreviewStore((s) => s.feed);
  const editEvent = usePreviewStore((s) => s.editEvent);
  const removeEvent = usePreviewStore((s) => s.removeEvent);

  const [roomId, setRoomId] = useState("toddlers");
  const [activeKind, setActiveKind] = useState<ActionKind | null>(null);
  const [detail, setDetail] = useState("");
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
  const activeRoom = ROOMS.find((r) => r.id === roomId) ?? null;
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
    setDetail(action.defaultDetail);
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
    closePanel();
    setSuccess("Saved. Families will see this in their feed.");
  }

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <ScreenHeader
          title="Room log"
          emoji="📋"
          note="Pick a room, log the day, fix anything you need to. Any teacher, any room."
        />
        <StepNote step={4} text="Pick a room, tap an action. Every kid here starts selected, so saving takes two taps." />

        <p className="text-base font-bold">
          Logging for:{" "}
          <span style={{ color: activeRoom?.color ?? "var(--pv-ink)" }}>
            {activeRoom ? `${activeRoom.emoji} ${activeRoom.name}` : ""}
          </span>
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          {ROOMS.map((room) => (
            <Chip
              key={room.id}
              label={`${room.emoji} ${room.name}`}
              on={room.id === roomId}
              onColor={room.color}
              onClick={() => pickRoom(room.id)}
            />
          ))}
        </div>

        <Card className="mt-5">
          {presentKids.length > 0 ? (
            <>
              <h2 className="text-2xl">
                {presentKids.length} {presentKids.length === 1 ? "kid" : "kids"} here now
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {presentKids.map((kid) => (
                  <div key={kid.id} className="text-center">
                    <span aria-hidden="true" className="block text-4xl">{kid.avatar}</span>
                    <span className="mt-1 block text-lg font-bold">{kid.firstName}</span>
                    <span className="block text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
                      since {checkedIn[kid.id]}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              emoji="🌅"
              title="No kids here yet"
              detail="Check someone in at the kiosk and they show up here."
            />
          )}
          {awayKids.length > 0 ? (
            <p className="mt-4 text-base font-semibold" style={{ color: "var(--pv-muted)" }}>
              Not here yet: {awayKids.map((k) => k.firstName).join(", ")}
            </p>
          ) : null}
        </Card>

        <h2 className="mt-7 text-2xl">What just happened?</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <BigButton
              key={action.kind}
              kiosk
              emoji={action.emoji}
              label={action.label}
              color={action.color}
              onClick={() => openAction(action)}
            />
          ))}
        </div>

        {activeAction ? (
          <Card className="mt-6">
            <h2 className="text-2xl">{activeAction.panelTitle}</h2>

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

            <label htmlFor="room-log-detail" className="mt-4 block text-base font-bold">
              What happened
            </label>
            <input
              id="room-log-detail"
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="mt-2 w-full rounded-xl border-2 px-4 py-3 text-lg"
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
                    label={`${kid.avatar} ${kid.firstName}`}
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
                      className="pv-press pv-target rounded-xl border-4 p-1 text-left"
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
                emoji="✅"
                label={`Save for ${selectedKidIds.length} ${selectedKidIds.length === 1 ? "kid" : "kids"}`}
                color={activeAction.color}
                disabled={selectedKidIds.length === 0}
                onClick={() => save(activeAction)}
                className="w-full"
              />
              <BigButton emoji="↩️" label="Cancel" color="#8a8378" onClick={closePanel} className="w-full" />
            </div>
          </Card>
        ) : null}

        {/* TODAY'S LOG: edit the wording or remove an entry. Any teacher. */}
        <h2 className="mt-8 text-2xl">Today&apos;s log</h2>
        <p className="mt-1 text-base" style={{ color: "var(--pv-muted)" }}>
          Tap Edit to fix the words, or Remove to take an entry off. Families see
          the change right away.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {todaysLog.length === 0 ? (
            <EmptyState emoji="📋" title="Nothing logged here yet" detail="What you log shows up in this list to fix later." />
          ) : (
            todaysLog.map((e) => (
              <Card key={e.id}>
                {editingId === e.id ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-base font-extrabold">
                      <span aria-hidden="true" className="mr-1">{KIND_EMOJI[e.kind] ?? "📝"}</span>
                      {e.title}
                    </p>
                    <textarea
                      value={editText}
                      onChange={(ev) => setEditText(ev.target.value)}
                      rows={2}
                      aria-label="Edit the entry"
                      className="rounded-xl border-2 px-4 py-3 text-base"
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
                        className="pv-press pv-target rounded-xl px-4 py-2 text-base font-extrabold text-white disabled:opacity-50"
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
                        className="pv-press pv-target rounded-xl px-4 py-2 text-base font-bold"
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
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
                      style={{ backgroundColor: "#f1ede6" }}
                    >
                      {KIND_EMOJI[e.kind] ?? "📝"}
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
                        className="pv-press pv-target rounded-xl px-3 py-2 text-sm font-bold"
                        style={{ color: "var(--pv-sky)" }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(e.id)}
                        className="pv-press pv-target rounded-xl px-3 py-2 text-sm font-bold"
                        style={{ color: "var(--pv-coral)" }}
                      >
                        {confirmDeleteId === e.id ? "Tap to confirm" : "Remove"}
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
