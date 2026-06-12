"use client";

// Christina's office home (design studies 07 and 09).
// One screen with exactly the buttons she asked for, rendered from the
// store's officeTiles list in order. Edit mode works like a phone home
// screen: wiggle, remove with the corner button, add from the list below.
// The rooms tile is the traffic-light glance: color answers "are we okay",
// the numbers carry the detail.

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  BigButton,
  Card,
  EmptyState,
  ScreenHeader,
  StepNote,
  SuccessBanner,
  cx,
} from "@/components/preview/ui";
import { ROOMS, type OfficeTileId } from "@/lib/preview/fixtures";
import { usePreviewStore, getRoomStatus } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

type TileDef =
  | { kind: "rooms"; emoji: string; label: string; sub: string }
  | { kind: "link"; emoji: string; label: string; sub: string; href: string }
  | { kind: "stub"; emoji: string; label: string; sub: string; message: string };

const TILES: Record<OfficeTileId, TileDef> = {
  rooms: {
    kind: "rooms",
    emoji: "🚦",
    label: "Today's rooms",
    sub: "Who is in each room right now",
  },
  people: {
    kind: "link",
    emoji: "🧑🏾‍🤝‍🧑🏾",
    label: "People",
    sub: "Add someone or reset a code",
    href: "/preview/office/people",
  },
  newsletter: {
    kind: "link",
    emoji: "📰",
    label: "Newsletter",
    sub: "Three blocks, then send",
    href: "/preview/newsletter",
  },
  schedule: {
    kind: "link",
    emoji: "📅",
    label: "Schedule",
    sub: "The whole week on one screen",
    href: "/preview/schedule",
  },
  reports: {
    kind: "stub",
    emoji: "📊",
    label: "Reports",
    sub: "Josh sends these weekly",
    message: "Josh sends these weekly. Nothing for you to do here.",
  },
  training: {
    kind: "link",
    emoji: "🎓",
    label: "Training",
    sub: "Who is current",
    href: "/preview/office/training",
  },
  food: {
    kind: "link",
    emoji: "🍽️",
    label: "Food counts",
    sub: "Tap who ate what",
    href: "/preview/meals",
  },
  feed: {
    kind: "link",
    emoji: "💛",
    label: "Family feed",
    sub: "What families see",
    href: "/preview/family",
  },
  messages: {
    kind: "link",
    emoji: "💬",
    label: "Messages",
    sub: "Read and write families",
    href: "/preview/office/messages",
  },
  billing: {
    kind: "link",
    emoji: "💵",
    label: "Billing",
    sub: "Who owes what",
    href: "/preview/office/billing",
  },
};

const TILE_SHELL =
  "pv-target flex h-full w-full items-start gap-3 rounded-2xl border p-5 text-left shadow-sm";
const TILE_STYLE = {
  backgroundColor: "var(--pv-card)",
  borderColor: "var(--pv-line)",
} as const;

/** Emoji, bold label, muted sub. Shared by link, stub, and inert tiles. */
function TileBody({ def }: { def: TileDef }) {
  return (
    <>
      <span aria-hidden="true" className="text-3xl">
        {def.emoji}
      </span>
      <span>
        <span className="block text-xl font-extrabold" style={{ color: "var(--pv-ink)" }}>
          {def.label}
        </span>
        <span className="mt-1 block text-base font-semibold" style={{ color: "var(--pv-muted)" }}>
          {def.sub}
        </span>
      </span>
    </>
  );
}

/** One room's live line inside the traffic-light card.
 *  Select raw fields, compute the status in render: a selector that returns
 *  a fresh object every call makes zustand v5 re-render forever. */
function RoomRow({ room }: { room: (typeof ROOMS)[number] }) {
  const kids = usePreviewStore((s) => s.kids);
  const staff = usePreviewStore((s) => s.staff);
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const clockedIn = usePreviewStore((s) => s.clockedIn);
  const status = getRoomStatus({ kids, staff, checkedIn, clockedIn }, room.id);
  const bg =
    status.level === "good"
      ? "var(--pv-teal)"
      : status.level === "near"
        ? "var(--pv-gold)"
        : "var(--pv-red-bad)";
  return (
    <div className="rounded-xl p-4 text-white" style={{ backgroundColor: bg }}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-lg font-extrabold">
          <span aria-hidden="true" className="mr-1">
            {room.emoji}
          </span>
          {room.name}
        </span>
        <span className="text-3xl font-extrabold">{status.ratioText}</span>
      </div>
      <p className="mt-1 text-base font-bold">{status.message}</p>
      <p className="text-sm font-semibold opacity-90">{status.limitText}</p>
    </div>
  );
}

/** The double-height rooms card. Color answers "are we okay" at a glance. */
function RoomsCard() {
  return (
    <Card className="h-full">
      <h2 className="text-xl">
        <span aria-hidden="true" className="mr-2">
          {TILES.rooms.emoji}
        </span>
        {TILES.rooms.label}
      </h2>
      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
        Green means all good. Gold means near the limit. Red needs you.
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {ROOMS.map((room) => (
          <RoomRow key={room.id} room={room} />
        ))}
      </div>
    </Card>
  );
}

export default function OfficePage() {
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const officeTiles = usePreviewStore((s) => s.officeTiles);
  const addOfficeTile = usePreviewStore((s) => s.addOfficeTile);
  const removeOfficeTile = usePreviewStore((s) => s.removeOfficeTile);

  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Stable callback for the success banner. The banner chimes once per mount
  // inside an effect keyed on onDone; a fresh arrow function here made every
  // unrelated re-render (a kiosk check-in, tapping Edit) replay the chime and
  // restart the timer. That was the page's share of the "noise and delay".
  const handleSuccessDone = useCallback(() => setSuccess(null), []);

  const kidsHere = Object.values(checkedIn).filter(Boolean).length;
  const missingTiles = (Object.keys(TILES) as OfficeTileId[]).filter(
    (id) => !officeTiles.includes(id),
  );

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <ScreenHeader
          title="The office"
          emoji="🗝️"
          backHref="/preview/door"
          backLabel="Front door"
          note="Exactly the buttons you asked for. Nothing else."
        />
        <StepNote
          step={9}
          text="Check a kid in at the kiosk and watch the number and room colors move here."
        />

        <section className="mb-6">
          <h2 className="text-2xl sm:text-3xl">Good morning, Christina.</h2>
          <p className="mt-1 text-lg font-semibold">
            <span className="text-2xl font-extrabold" style={{ color: "var(--pv-coral)" }}>
              {kidsHere}
            </span>{" "}
            {kidsHere === 1 ? "kid" : "kids"} in the building right now
          </p>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {officeTiles.map((id) => {
            const def = TILES[id];
            return (
              <div
                key={id}
                className={cx(
                  "relative",
                  editing && "pv-wiggle",
                  def.kind === "rooms" && "sm:row-span-2",
                )}
              >
                {def.kind === "rooms" ? (
                  <RoomsCard />
                ) : editing ? (
                  <div className={TILE_SHELL} style={TILE_STYLE}>
                    <TileBody def={def} />
                  </div>
                ) : def.kind === "link" ? (
                  <Link
                    href={def.href}
                    onClick={() => playClick()}
                    className={cx("pv-press", TILE_SHELL)}
                    style={TILE_STYLE}
                  >
                    <TileBody def={def} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setSuccess(def.message);
                    }}
                    className={cx("pv-press", TILE_SHELL)}
                    style={TILE_STYLE}
                  >
                    <TileBody def={def} />
                  </button>
                )}
                {editing ? (
                  <button
                    type="button"
                    aria-label={`Remove ${def.label}`}
                    onClick={() => {
                      playClick();
                      removeOfficeTile(id);
                    }}
                    className="pv-press pv-target absolute -right-2 -top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold text-white shadow-md"
                    style={{ backgroundColor: "var(--pv-coral)" }}
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {officeTiles.length === 0 && !editing ? (
          <div className="mt-4">
            <EmptyState
              emoji="🧺"
              title="No buttons on your screen yet"
              detail="Tap Edit my buttons below to add the ones you want."
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-4">
          {editing ? (
            <>
              <Card>
                <h2 className="text-xl">＋ Add a button</h2>
                {missingTiles.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {missingTiles.map((id) => {
                      const def = TILES[id];
                      return (
                        <BigButton
                          key={id}
                          emoji={def.emoji}
                          label={def.label}
                          sub={def.sub}
                          color="var(--pv-sky)"
                          onClick={() => addOfficeTile(id)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-base font-semibold" style={{ color: "var(--pv-muted)" }}>
                    Every button is already on your screen.
                  </p>
                )}
              </Card>
              <BigButton
                label="Done editing"
                color="var(--pv-teal)"
                onClick={() => setEditing(false)}
              />
            </>
          ) : (
            <BigButton
              emoji="✏️"
              label="Edit my buttons"
              sub="Add or remove. Your call."
              color="var(--pv-plum)"
              onClick={() => setEditing(true)}
            />
          )}
        </div>

        <p className="mt-6 pb-4 text-center text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
          Your buttons stay how you set them on this screen.
        </p>
      </div>

      {success ? <SuccessBanner message={success} onDone={handleSuccessDone} /> : null}
    </main>
  );
}
