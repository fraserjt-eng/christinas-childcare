"use client";

// Christina's office home — the director's landing in the front-facing portal.
// Identity comes from the real signed-in session (no second sign-in). The
// center name rides at the top so the center is recognizable at all times.
// The rooms card is the traffic-light glance; the tiles are her chosen buttons.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  ArrowRight,
  Backpack,
  Baby,
  Blocks,
  Calendar,
  Check,
  ClipboardList,
  DollarSign,
  GraduationCap,
  Heart,
  LayoutGrid,
  LogOut,
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
import { BigButton, EmptyState, cx } from "@/components/preview/ui";
import { type OfficeTileId, type PreviewRoom } from "@/lib/preview/fixtures";
import { usePreviewStore, getRoomStatus } from "@/lib/preview/store";
import { useSessionUser, firstNameFrom } from "@/lib/use-session-user";
import { playClick } from "@/lib/preview/sound";

/** Room icon by name keyword, so live classrooms (real names, UUID ids) still
 *  get a sensible glyph instead of all falling back to one. */
function roomIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("infant")) return Baby;
  if (n.includes("toddler")) return Blocks;
  if (n.includes("school")) return Backpack;
  if (n.includes("pre-k") || n.includes("prek") || n.includes("pre k")) return GraduationCap;
  if (n.includes("preschool")) return Palette;
  return Baby;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

type TileDef =
  | { kind: "rooms"; icon: LucideIcon; color: string; label: string; sub: string }
  | { kind: "link"; icon: LucideIcon; color: string; label: string; sub: string; href: string }
  | { kind: "stub"; icon: LucideIcon; color: string; label: string; sub: string; message: string };

const TILES: Record<OfficeTileId, TileDef> = {
  rooms: { kind: "rooms", icon: TrafficCone, color: "var(--pv-coral)", label: "Today's rooms", sub: "Who is in each room right now" },
  people: { kind: "link", icon: Users, color: "var(--pv-sky)", label: "People", sub: "Add someone or reset a code", href: "/preview/office/people" },
  newsletter: { kind: "link", icon: Newspaper, color: "var(--pv-plum)", label: "Newsletter", sub: "Three blocks, then send", href: "/preview/newsletter" },
  schedule: { kind: "link", icon: Calendar, color: "var(--pv-sky)", label: "Schedule", sub: "The whole week on one screen", href: "/preview/schedule" },
  reports: { kind: "stub", icon: ClipboardList, color: "var(--pv-muted)", label: "Reports", sub: "Sent to you weekly", message: "Reports are sent to you weekly. Nothing for you to do here." },
  training: { kind: "link", icon: GraduationCap, color: "var(--pv-gold)", label: "Training", sub: "Who is current", href: "/preview/office/training" },
  food: { kind: "link", icon: Utensils, color: "var(--pv-teal)", label: "Food counts", sub: "Tap who ate what", href: "/preview/meals" },
  feed: { kind: "link", icon: Heart, color: "var(--pv-coral)", label: "Family feed", sub: "What families see", href: "/preview/family" },
  messages: { kind: "link", icon: MessageSquare, color: "var(--pv-sky)", label: "Messages", sub: "Read and write families", href: "/preview/office/messages" },
  billing: { kind: "link", icon: DollarSign, color: "var(--pv-teal)", label: "Billing", sub: "Who owes what", href: "/preview/office/billing" },
};

const TILE_SHELL = "pv-tile pv-target flex h-full w-full items-start gap-3 p-5 text-left";

/** Tinted line icon, bold label, muted sub. */
function TileBody({ def }: { def: TileDef }) {
  const Icon = def.icon;
  return (
    <>
      <span
        aria-hidden="true"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${def.color} 14%, white)` }}
      >
        <Icon size={22} style={{ color: def.color }} />
      </span>
      <span>
        <span className="block text-xl font-bold" style={{ color: "var(--pv-ink)" }}>{def.label}</span>
        <span className="mt-1 block text-base font-semibold" style={{ color: "var(--pv-muted)" }}>{def.sub}</span>
      </span>
    </>
  );
}

/** One room's live line inside the traffic-light card. */
function RoomRow({ room }: { room: PreviewRoom }) {
  const kids = usePreviewStore((s) => s.kids);
  const staff = usePreviewStore((s) => s.staff);
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const clockedIn = usePreviewStore((s) => s.clockedIn);
  const rooms = usePreviewStore((s) => s.rooms);
  const status = getRoomStatus({ kids, staff, checkedIn, clockedIn, rooms }, room.id);
  const bg =
    status.level === "good" ? "var(--pv-teal)" : status.level === "near" ? "var(--pv-gold)" : "var(--pv-red-bad)";
  const RoomIcon = roomIcon(room.name);
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-white p-3" style={{ borderColor: "var(--pv-line)" }}>
      <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: bg }} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-lg font-bold" style={{ color: "var(--pv-ink)" }}>
            <RoomIcon size={18} aria-hidden="true" style={{ color: "var(--pv-muted)" }} />
            {room.name}
          </span>
          <span className="text-3xl font-extrabold" style={{ color: bg }}>{status.ratioText}</span>
        </span>
        <p className="mt-1 text-base font-bold" style={{ color: "var(--pv-ink)" }}>{status.message}</p>
        <p className="text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>{status.limitText}</p>
      </span>
    </div>
  );
}

/** The double-height rooms card. Color answers "are we okay" at a glance. */
function RoomsCard() {
  const rooms = usePreviewStore((s) => s.rooms);
  return (
    <div className="pv-tile h-full p-5">
      <h2 className="pv-tad-title flex items-center gap-2 text-2xl">
        <span aria-hidden="true" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "color-mix(in srgb, var(--pv-coral) 14%, white)" }}>
          <TrafficCone size={18} style={{ color: "var(--pv-coral)" }} />
        </span>
        {TILES.rooms.label}
      </h2>
      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
        Green means all good. Gold means near the limit. Red needs you.
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {rooms.map((room) => (
          <RoomRow key={room.id} room={room} />
        ))}
      </div>
      <Link
        href="/preview/dashboard"
        onClick={() => playClick()}
        className="pv-press pv-target mt-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-base font-bold"
        style={{ borderColor: "var(--pv-line)", color: "var(--pv-coral)" }}
      >
        Open the full center dashboard <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function OfficePage() {
  const router = useRouter();
  const { user } = useSessionUser();
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const officeTiles = usePreviewStore((s) => s.officeTiles);
  const addOfficeTile = usePreviewStore((s) => s.addOfficeTile);
  const removeOfficeTile = usePreviewStore((s) => s.removeOfficeTile);

  const [editing, setEditing] = useState(false);

  const name = firstNameFrom(user?.full_name) === "there" ? "" : firstNameFrom(user?.full_name);
  const kidsHere = Object.values(checkedIn).filter(Boolean).length;
  const missingTiles = (Object.keys(TILES) as OfficeTileId[]).filter((id) => !officeTiles.includes(id));

  const signOut = useCallback(async () => {
    playClick();
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      /* ignore */
    }
    router.push("/employee-login");
  }, [router]);

  return (
    <main className="pv-portal-bg min-h-[100dvh] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Identity row: a real sign-out. The center name is the page watermark now. */}
        <div className="mb-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={signOut}
            className="pv-press pv-target inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold"
            style={{ color: "var(--pv-muted)" }}
          >
            <LogOut size={15} aria-hidden="true" /> Sign out
          </button>
        </div>

        {/* Greeting */}
        <section className="pv-rise mb-6" style={{ animationDelay: "60ms" }}>
          <h1 className="pv-tad-title text-3xl sm:text-4xl">
            {greeting()}{name ? `, ${name}` : ""}.
          </h1>
          <p className="mt-2 text-lg font-semibold" style={{ color: "var(--pv-muted)" }}>
            <span className="pv-metric text-2xl">{kidsHere}</span>{" "}
            {kidsHere === 1 ? "child" : "children"} in the building right now
          </p>
        </section>

        {/* Tiles */}
        <div className="pv-rise grid grid-cols-1 gap-4 sm:grid-cols-2" style={{ animationDelay: "120ms" }}>
          {officeTiles.map((id) => {
            const def = TILES[id];
            return (
              <div key={id} className={cx("relative", editing && "pv-wiggle", def.kind === "rooms" && "sm:row-span-2")}>
                {def.kind === "rooms" ? (
                  <RoomsCard />
                ) : editing ? (
                  <div className={TILE_SHELL}>
                    <TileBody def={def} />
                  </div>
                ) : def.kind === "link" ? (
                  <Link href={def.href} onClick={() => playClick()} className={TILE_SHELL}>
                    <TileBody def={def} />
                  </Link>
                ) : (
                  <Link href="/preview/office" onClick={(e) => { e.preventDefault(); playClick(); }} className={TILE_SHELL}>
                    <TileBody def={def} />
                  </Link>
                )}
                {editing ? (
                  <button
                    type="button"
                    aria-label={`Remove ${def.label}`}
                    onClick={() => { playClick(); removeOfficeTile(id); }}
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
            <EmptyState icon={LayoutGrid} title="No buttons on your screen yet" detail="Tap Edit my buttons below to add the ones you want." />
          </div>
        ) : null}

        {/* Customize */}
        <div className="pv-rise mt-6 flex flex-col gap-4" style={{ animationDelay: "180ms" }}>
          {editing ? (
            <>
              <div className="pv-tile p-5">
                <h2 className="pv-tad-title flex items-center gap-2 text-xl">
                  <Plus size={18} aria-hidden="true" style={{ color: "var(--pv-coral)" }} /> Add a button
                </h2>
                {missingTiles.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {missingTiles.map((id) => {
                      const def = TILES[id];
                      return (
                        <BigButton key={id} icon={def.icon} label={def.label} sub={def.sub} color="var(--pv-sky)" onClick={() => addOfficeTile(id)} />
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-base font-semibold" style={{ color: "var(--pv-muted)" }}>Every button is already on your screen.</p>
                )}
              </div>
              <BigButton icon={Check} label="Done editing" color="var(--pv-teal)" onClick={() => setEditing(false)} />
            </>
          ) : (
            <BigButton icon={Pencil} label="Edit my buttons" sub="Add or remove. Your call." color="var(--pv-coral)" onClick={() => setEditing(true)} />
          )}
        </div>
      </div>
    </main>
  );
}
