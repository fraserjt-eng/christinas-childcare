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
  ArrowRight,
  Baby,
  Backpack,
  Blocks,
  Calendar,
  Check,
  ClipboardList,
  DollarSign,
  GraduationCap,
  Heart,
  LayoutGrid,
  type LucideIcon,
  MessageSquare,
  Newspaper,
  Palette,
  Pencil,
  Plus,
  TrafficCone,
  Users,
  Utensils,
  X,
} from "lucide-react";
import {
  BigButton,
  Card,
  EmptyState,
  ScreenHeader,
  StepNote,
  SuccessBanner,
  cx,
} from "@/components/preview/ui";
import { PhotoAvatar } from "@/components/preview/PhotoAvatar";
import { ROOMS, type OfficeTileId } from "@/lib/preview/fixtures";
import { usePreviewStore, getRoomStatus } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

const ROOM_ICON: Record<string, LucideIcon> = {
  infants: Baby,
  toddlers: Blocks,
  preschool: Palette,
  schoolage: Backpack,
};

type TileDef =
  | { kind: "rooms"; icon: LucideIcon; color: string; label: string; sub: string }
  | { kind: "link"; icon: LucideIcon; color: string; label: string; sub: string; href: string }
  | { kind: "stub"; icon: LucideIcon; color: string; label: string; sub: string; message: string };

const TILES: Record<OfficeTileId, TileDef> = {
  rooms: {
    kind: "rooms",
    icon: TrafficCone,
    color: "var(--pv-coral)",
    label: "Today's rooms",
    sub: "Who is in each room right now",
  },
  people: {
    kind: "link",
    icon: Users,
    color: "var(--pv-sky)",
    label: "People",
    sub: "Add someone or reset a code",
    href: "/preview/office/people",
  },
  newsletter: {
    kind: "link",
    icon: Newspaper,
    color: "var(--pv-plum)",
    label: "Newsletter",
    sub: "Three blocks, then send",
    href: "/preview/newsletter",
  },
  schedule: {
    kind: "link",
    icon: Calendar,
    color: "var(--pv-sky)",
    label: "Schedule",
    sub: "The whole week on one screen",
    href: "/preview/schedule",
  },
  reports: {
    kind: "stub",
    icon: ClipboardList,
    color: "var(--pv-muted)",
    label: "Reports",
    sub: "Josh sends these weekly",
    message: "Josh sends these weekly. Nothing for you to do here.",
  },
  training: {
    kind: "link",
    icon: GraduationCap,
    color: "var(--pv-gold)",
    label: "Training",
    sub: "Who is current",
    href: "/preview/office/training",
  },
  food: {
    kind: "link",
    icon: Utensils,
    color: "var(--pv-teal)",
    label: "Food counts",
    sub: "Tap who ate what",
    href: "/preview/meals",
  },
  feed: {
    kind: "link",
    icon: Heart,
    color: "var(--pv-coral)",
    label: "Family feed",
    sub: "What families see",
    href: "/preview/family",
  },
  messages: {
    kind: "link",
    icon: MessageSquare,
    color: "var(--pv-sky)",
    label: "Messages",
    sub: "Read and write families",
    href: "/preview/office/messages",
  },
  billing: {
    kind: "link",
    icon: DollarSign,
    color: "var(--pv-teal)",
    label: "Billing",
    sub: "Who owes what",
    href: "/preview/office/billing",
  },
};

const TILE_SHELL =
  "pv-target flex h-full w-full items-start gap-3 rounded-lg border p-5 text-left shadow-sm";
const TILE_STYLE = {
  backgroundColor: "var(--pv-card)",
  borderColor: "var(--pv-line)",
} as const;

/** Tinted line icon, bold label, muted sub. Shared by link, stub, inert tiles. */
function TileBody({ def }: { def: TileDef }) {
  const Icon = def.icon;
  return (
    <>
      <span
        aria-hidden="true"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `color-mix(in srgb, ${def.color} 14%, white)` }}
      >
        <Icon size={22} style={{ color: def.color }} />
      </span>
      <span>
        <span className="block text-xl font-bold" style={{ color: "var(--pv-ink)" }}>
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
  const RoomIcon = ROOM_ICON[room.id] ?? Baby;
  return (
    <div
      className="pv-lift flex items-start gap-3 rounded-md border bg-white p-3 shadow-sm"
      style={{ borderColor: "var(--pv-line)" }}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
        style={{ backgroundColor: bg }}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-lg font-bold" style={{ color: "var(--pv-ink)" }}>
            <RoomIcon size={18} aria-hidden="true" style={{ color: "var(--pv-muted)" }} />
            {room.name}
          </span>
          <span className="text-3xl font-extrabold" style={{ color: bg }}>
            {status.ratioText}
          </span>
        </span>
        <p className="mt-1 text-base font-bold" style={{ color: "var(--pv-ink)" }}>
          {status.message}
        </p>
        <p className="text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
          {status.limitText}
        </p>
      </span>
    </div>
  );
}

/** The double-height rooms card. Color answers "are we okay" at a glance. */
function RoomsCard() {
  return (
    <Card className="h-full">
      <h2 className="pv-tad-title flex items-center gap-2 text-2xl">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: "color-mix(in srgb, var(--pv-coral) 14%, white)" }}
        >
          <TrafficCone size={18} style={{ color: "var(--pv-coral)" }} />
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
      <Link
        href="/preview/dashboard"
        onClick={() => playClick()}
        className="pv-press pv-target mt-4 flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-base font-bold"
        style={{ borderColor: "var(--pv-line)", color: "var(--pv-coral)" }}
      >
        Open the full center dashboard <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </Card>
  );
}

export default function OfficePage() {
  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  if (!signedInAs) {
    return <OfficeSignIn onSignIn={(name) => setSignedInAs(name)} />;
  }
  return <OfficeHome name={signedInAs} onSignOut={() => setSignedInAs(null)} />;
}

/** The office team. Each person has their own login. For this demo only
 *  Christina's password is set up; the others are placeholders for now.
 *  In the real app this is the admin login (email and password, or Google). */
type OfficeAccount = {
  name: string;
  role: string;
  password: string | null;
};

const OFFICE_ACCOUNTS: OfficeAccount[] = [
  { name: "Christina", role: "Owner and director", password: "summer2026" },
  { name: "Ophelia", role: "Office", password: null },
  { name: "Stephan", role: "Office", password: null },
  { name: "Garhjuan", role: "Office", password: null },
];

function OfficeSignIn({ onSignIn }: { onSignIn: (name: string) => void }) {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const account = OFFICE_ACCOUNTS.find((a) => a.name === selectedName) ?? null;

  function pick(name: string) {
    playClick();
    setSelectedName(name);
    setPassword("");
    setError(false);
  }

  function back() {
    playClick();
    setSelectedName(null);
    setPassword("");
    setError(false);
  }

  function submit() {
    if (!account) return;
    if (account.password && password === account.password) {
      onSignIn(account.name);
    } else {
      setError(true);
    }
  }

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-md">
        <ScreenHeader
          title="The office"
          backHref="/preview/door"
          backLabel="Front door"
          note="The office account: who is here, billing, messages, the whole center."
        />

        {!account ? (
          <Card>
            <h2 className="text-2xl">Who is signing in?</h2>
            <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
              Everyone in the office has their own login. Tap your name.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {OFFICE_ACCOUNTS.map((a) => (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => pick(a.name)}
                  className="pv-press pv-kiosk-target flex w-full items-center gap-3 rounded-lg border p-4 text-left"
                  style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)" }}
                >
                  <PhotoAvatar id={`office-${a.name}`} name={a.name} size={48} rounded="rounded-md" />
                  <span>
                    <span className="block text-lg font-extrabold">{a.name}</span>
                    <span className="block text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
                      {a.role}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </Card>
        ) : (
          <Card>
            <button
              type="button"
              onClick={back}
              className="pv-press text-base font-bold"
              style={{ color: "var(--pv-plum)" }}
            >
              ← Pick a different name
            </button>

            <div className="mt-4 flex items-center gap-3">
              <PhotoAvatar id={`office-${account.name}`} name={account.name} size={48} rounded="rounded-md" />
              <span>
                <span className="block text-xl font-extrabold">{account.name}</span>
                <span className="block text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
                  {account.role}
                </span>
              </span>
            </div>

            {account.password === null ? (
              <p className="mt-5 rounded-lg border p-4 text-base" style={{ borderColor: "var(--pv-line)", color: "var(--pv-muted)" }}>
                This account does not have a password set up yet. For now only
                Christina can sign in to the office.
              </p>
            ) : (
              <>
                <label htmlFor="office-password" className="mt-5 block text-lg font-bold">
                  Password
                </label>
                <input
                  id="office-password"
                  type="password"
                  value={password}
                  autoComplete="off"
                  autoFocus
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                  }}
                  className="mt-2 w-full rounded-lg border px-5 py-4 text-2xl tracking-widest"
                  style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-paper)" }}
                />
                {error ? (
                  <p role="alert" className="mt-2 text-base font-bold" style={{ color: "var(--pv-coral)" }}>
                    That password did not match. Try again.
                  </p>
                ) : null}
                <div className="mt-4">
                  <BigButton label="Sign in" onClick={submit} kiosk color="var(--pv-sky)" />
                </div>
                <p className="mt-3 text-sm" style={{ color: "var(--pv-muted)" }}>
                  Demo password for Christina: <b>summer2026</b>
                </p>
              </>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}

function OfficeHome({ name, onSignOut }: { name: string; onSignOut: () => void }) {
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
          backHref="/preview/door"
          backLabel="Front door"
          note="Exactly the buttons you asked for. Nothing else."
        />
        <div className="-mt-3 mb-4">
          <button
            type="button"
            onClick={() => {
              playClick();
              onSignOut();
            }}
            className="pv-press pv-target rounded-xl px-3 py-2 text-base font-bold"
            style={{ color: "var(--pv-plum)" }}
          >
            ← Sign out
          </button>
        </div>
        <StepNote
          step={9}
          text="Check a kid in at the kiosk and watch the number and room colors move here."
        />

        <section className="pv-rise mb-6" style={{ animationDelay: "60ms" }}>
          <h2 className="pv-tad-title text-2xl sm:text-3xl">Good morning, {name}.</h2>
          <p className="mt-1 text-lg font-semibold" style={{ color: "var(--pv-muted)" }}>
            <span className="text-2xl font-extrabold" style={{ color: "var(--pv-coral)" }}>
              {kidsHere}
            </span>{" "}
            {kidsHere === 1 ? "kid" : "kids"} in the building right now
          </p>
        </section>

        <div className="pv-rise grid grid-cols-1 gap-4 sm:grid-cols-2" style={{ animationDelay: "120ms" }}>
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
                    className={cx("pv-lift", TILE_SHELL)}
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
                    className={cx("pv-lift", TILE_SHELL)}
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
                    className="pv-press pv-target absolute -right-2 -top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md"
                    style={{ backgroundColor: "var(--pv-coral)" }}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {officeTiles.length === 0 && !editing ? (
          <div className="mt-4">
            <EmptyState
              icon={LayoutGrid}
              title="No buttons on your screen yet"
              detail="Tap Edit my buttons below to add the ones you want."
            />
          </div>
        ) : null}

        <div className="pv-rise mt-6 flex flex-col gap-4" style={{ animationDelay: "180ms" }}>
          {editing ? (
            <>
              <Card>
                <h2 className="pv-tad-title flex items-center gap-2 text-xl">
                  <Plus size={18} aria-hidden="true" style={{ color: "var(--pv-coral)" }} />
                  add a button
                </h2>
                {missingTiles.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {missingTiles.map((id) => {
                      const def = TILES[id];
                      return (
                        <BigButton
                          key={id}
                          icon={def.icon}
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
                icon={Check}
                label="Done editing"
                color="var(--pv-teal)"
                onClick={() => setEditing(false)}
              />
            </>
          ) : (
            <BigButton
              icon={Pencil}
              label="Edit my buttons"
              sub="Add or remove. Your call."
              color="var(--pv-coral)"
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
