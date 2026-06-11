"use client";

// Teacher quick-tap logging (design study 03, Brightwheel pattern).
// One tap logs for the whole room. Every present kid starts selected,
// the teacher drops the one or two it does not apply to, then saves.

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
import { DEMO_PHOTOS, ROOMS } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

type ActionKind = "meal" | "nap" | "activity" | "photo" | "note";

interface RoomAction {
  kind: ActionKind;
  label: string;
  emoji: string;
  color: string;
  panelTitle: string;
  defaultDetail: string;
}

const ACTIONS: RoomAction[] = [
  {
    kind: "meal",
    label: "Meal",
    emoji: "🍎",
    color: "var(--pv-teal)",
    panelTitle: "Log a meal",
    defaultDetail: "Morning snack, ate most",
  },
  {
    kind: "nap",
    label: "Nap",
    emoji: "😴",
    color: "var(--pv-plum)",
    panelTitle: "Log a nap",
    defaultDetail: "Slept 12:30 to 2:05",
  },
  {
    kind: "activity",
    label: "Activity",
    emoji: "🎨",
    color: "var(--pv-gold)",
    panelTitle: "Log an activity",
    defaultDetail: "Outdoor play and big blocks",
  },
  {
    kind: "photo",
    label: "Photo",
    emoji: "📷",
    color: "var(--pv-sky)",
    panelTitle: "Log a photo",
    defaultDetail: "A moment from today",
  },
  {
    kind: "note",
    label: "Note",
    emoji: "📝",
    color: "var(--pv-coral)",
    panelTitle: "Log a note",
    defaultDetail: "A quick note from the room",
  },
];

export default function RoomPage() {
  const mounted = useMounted();
  const kids = usePreviewStore((s) => s.kids);
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const logEvent = usePreviewStore((s) => s.logEvent);

  const [roomId, setRoomId] = useState("toddlers");
  const [activeKind, setActiveKind] = useState<ActionKind | null>(null);
  const [detail, setDetail] = useState("");
  const [selectedKidIds, setSelectedKidIds] = useState<string[]>([]);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const roomKids = kids.filter((k) => k.roomId === roomId);
  const presentKids = mounted ? roomKids.filter((k) => checkedIn[k.id]) : [];
  const awayKids = mounted ? roomKids.filter((k) => !checkedIn[k.id]) : roomKids;
  const activeAction = ACTIONS.find((a) => a.kind === activeKind) ?? null;

  function pickRoom(id: string) {
    setRoomId(id);
    setActiveKind(null);
  }

  function openAction(action: RoomAction) {
    setActiveKind(action.kind);
    setDetail(action.defaultDetail);
    setSelectedKidIds(presentKids.map((k) => k.id));
    setPhotoId(null);
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
      photoId,
    });
    closePanel();
    setSuccess("Saved. Families will see this in their feed.");
  }

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <ScreenHeader
          title="Your room"
          emoji="🧸"
          note="Log once for everyone, adjust one child if you need to."
        />
        <StepNote step={4} text="Tap an action. Every kid here starts selected, so saving takes two taps." />

        <div className="flex flex-wrap gap-3">
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
          {ACTIONS.map((action) => (
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
                <h3 className="mt-5 text-xl">Pick the photo</h3>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {DEMO_PHOTOS.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      aria-pressed={photoId === photo.id}
                      onClick={() => {
                        playClick();
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
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
