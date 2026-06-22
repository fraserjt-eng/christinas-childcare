"use client";

// Christina's office home — the director's landing in the front-facing portal.
// Identity comes from the real signed-in session (no second sign-in). The
// center name rides at the top as the page watermark so the center is
// recognizable at all times. The rooms card is the traffic-light glance; the
// tiles are her chosen buttons.
//
// The layout (which buttons, in what order) is owner-customizable and saved to
// the cloud PER CENTER (src/lib/dashboard-layout-storage), so it survives a new
// browser or a teammate. A center that never edits sees today's default screen.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Backpack,
  Baby,
  Blocks,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  ClipboardCheck,
  ClipboardList,
  DollarSign,
  ExternalLink,
  FileText,
  GitBranch,
  GraduationCap,
  LayoutGrid,
  ListChecks,
  LogOut,
  type LucideIcon,
  Megaphone,
  MessageSquare,
  Newspaper,
  Package,
  Palette,
  Pencil,
  PieChart,
  Plus,
  ShieldCheck,
  TrafficCone,
  Users,
  Utensils,
  UtensilsCrossed,
  Wallet,
  X,
} from "lucide-react";
import { BigButton, EmptyState, cx } from "@/components/preview/ui";
import { type PreviewRoom } from "@/lib/preview/fixtures";
import { usePreviewStore, getRoomStatus } from "@/lib/preview/store";
import { useSessionUser, firstNameFrom } from "@/lib/use-session-user";
import { playClick } from "@/lib/preview/sound";
import {
  TILE_CATALOG,
  TILE_GROUPS,
  DEFAULT_TILE_IDS,
  tileById,
  type TileCatalogEntry,
} from "@/lib/tile-catalog";
import { getLayout, saveLayout } from "@/lib/dashboard-layout-storage";

/** Resolve a catalog icon name to the lucide component. Falls back to a neutral
 *  glyph so a never-before-seen icon name never crashes the screen. */
const ICONS: Record<string, LucideIcon> = {
  AlertTriangle,
  Briefcase,
  BookOpen,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  DollarSign,
  FileText,
  GitBranch,
  GraduationCap,
  ListChecks,
  Megaphone,
  MessageSquare,
  Newspaper,
  Package,
  PieChart,
  ShieldCheck,
  TrafficCone,
  Users,
  Utensils,
  UtensilsCrossed,
  Wallet,
};

function iconFor(name: string): LucideIcon {
  return ICONS[name] ?? LayoutGrid;
}

/** A calm, distinct tint per group, reused for the tile icon chip. */
const GROUP_COLOR: Record<string, string> = {
  Daily: "var(--pv-coral)",
  Family: "var(--pv-plum)",
  People: "var(--pv-sky)",
  Money: "var(--pv-teal)",
  Compliance: "var(--pv-gold)",
  Admin: "var(--pv-muted)",
};

function colorFor(entry: TileCatalogEntry): string {
  return GROUP_COLOR[entry.group] ?? "var(--pv-sky)";
}

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

const TILE_SHELL = "pv-tile pv-target flex h-full w-full items-start gap-3 p-5 text-left";

/** Tinted line icon, bold label, muted description. Admin tiles get a subtle
 *  "opens admin" hint so it is clear they cross into the back office. */
function TileBody({ entry }: { entry: TileCatalogEntry }) {
  const Icon = iconFor(entry.icon);
  const color = colorFor(entry);
  return (
    <>
      <span
        aria-hidden="true"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, white)` }}
      >
        <Icon size={22} style={{ color }} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="block text-xl font-bold" style={{ color: "var(--pv-ink)" }}>{entry.label}</span>
          {entry.kind === "admin" ? (
            <ExternalLink size={14} aria-hidden="true" style={{ color: "var(--pv-muted)" }} />
          ) : null}
        </span>
        <span className="mt-1 block text-base font-semibold" style={{ color: "var(--pv-muted)" }}>{entry.description}</span>
        {entry.kind === "admin" ? (
          <span className="mt-1 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--pv-muted)" }}>
            Opens admin
          </span>
        ) : null}
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
  const roomsTile = tileById("rooms");
  return (
    <div className="pv-tile h-full p-5">
      <h2 className="pv-tad-title flex items-center gap-2 text-2xl">
        <span aria-hidden="true" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "color-mix(in srgb, var(--pv-coral) 14%, white)" }}>
          <TrafficCone size={18} style={{ color: "var(--pv-coral)" }} />
        </span>
        {roomsTile?.label ?? "Today's rooms"}
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

  // The owner's saved layout for this center. Starts as the default so the
  // first paint matches the server render; the saved layout loads in after.
  const [tiles, setTiles] = useState<string[]>(DEFAULT_TILE_IDS);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  // The working copy while editing, so a Cancel-by-navigation never persists.
  const [draft, setDraft] = useState<string[]>(DEFAULT_TILE_IDS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    getLayout().then((ids) => {
      if (!alive) return;
      setTiles(ids);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const name = firstNameFrom(user?.full_name) === "there" ? "" : firstNameFrom(user?.full_name);
  const kidsHere = Object.values(checkedIn).filter(Boolean).length;

  const startEditing = useCallback(() => {
    playClick();
    setDraft(tiles);
    setEditing(true);
  }, [tiles]);

  const cancelEditing = useCallback(() => {
    playClick();
    setEditing(false);
  }, []);

  const addTile = useCallback((id: string) => {
    playClick();
    setDraft((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeTile = useCallback((id: string) => {
    playClick();
    setDraft((prev) => prev.filter((t) => t !== id));
  }, []);

  const moveTile = useCallback((index: number, dir: -1 | 1) => {
    playClick();
    setDraft((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const saveAndExit = useCallback(async () => {
    playClick();
    setSaving(true);
    setTiles(draft);
    await saveLayout(draft);
    setSaving(false);
    setEditing(false);
  }, [draft]);

  const signOut = useCallback(async () => {
    playClick();
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      /* ignore */
    }
    router.push("/employee-login");
  }, [router]);

  // What renders: the working draft while editing, the saved tiles otherwise.
  const shown = editing ? draft : tiles;
  const shownEntries = shown
    .map((id) => tileById(id))
    .filter((e): e is TileCatalogEntry => e !== null);

  // Catalog tiles not currently on the draft, grouped for the "Add" picker.
  const missingByGroup = TILE_GROUPS.map((group) => ({
    group,
    entries: TILE_CATALOG.filter((e) => e.group === group && !draft.includes(e.id)),
  })).filter((g) => g.entries.length > 0);

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
          {shownEntries.map((entry, index) => (
            <div key={entry.id} className={cx("relative", editing && "pv-wiggle", entry.kind === "rooms" && "sm:row-span-2")}>
              {entry.kind === "rooms" ? (
                <RoomsCard />
              ) : editing ? (
                <div className={TILE_SHELL}>
                  <TileBody entry={entry} />
                </div>
              ) : (
                <Link href={entry.href} onClick={() => playClick()} className={TILE_SHELL}>
                  <TileBody entry={entry} />
                </Link>
              )}

              {editing ? (
                <>
                  <button
                    type="button"
                    aria-label={`Remove ${entry.label}`}
                    onClick={() => removeTile(entry.id)}
                    className="pv-press pv-target absolute -right-2 -top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md"
                    style={{ backgroundColor: "var(--pv-coral)" }}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                  <div className="absolute -left-2 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1">
                    <button
                      type="button"
                      aria-label={`Move ${entry.label} up`}
                      disabled={index === 0}
                      onClick={() => moveTile(index, -1)}
                      className="pv-press pv-target flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--pv-ink)] shadow-md disabled:opacity-40"
                      style={{ border: "1px solid var(--pv-line)" }}
                    >
                      <ArrowUp size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${entry.label} down`}
                      disabled={index === shownEntries.length - 1}
                      onClick={() => moveTile(index, 1)}
                      className="pv-press pv-target flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--pv-ink)] shadow-md disabled:opacity-40"
                      style={{ border: "1px solid var(--pv-line)" }}
                    >
                      <ArrowDown size={16} aria-hidden="true" />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>

        {loaded && shownEntries.length === 0 && !editing ? (
          <div className="mt-4">
            <EmptyState icon={LayoutGrid} title="No buttons on your screen yet" detail="Tap Edit my screen below to add the ones you want." />
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
                {missingByGroup.length > 0 ? (
                  <div className="mt-4 flex flex-col gap-5">
                    {missingByGroup.map(({ group, entries }) => (
                      <div key={group}>
                        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--pv-muted)" }}>
                          {group}
                        </h3>
                        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {entries.map((entry) => (
                            <button
                              key={entry.id}
                              type="button"
                              aria-label={`Add ${entry.label}`}
                              onClick={() => addTile(entry.id)}
                              className="pv-press pv-target flex w-full items-start gap-3 rounded-xl border bg-white p-3 text-left"
                              style={{ borderColor: "var(--pv-line)" }}
                            >
                              <span
                                aria-hidden="true"
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                                style={{ backgroundColor: `color-mix(in srgb, ${colorFor(entry)} 14%, white)` }}
                              >
                                <PlusIcon entry={entry} />
                              </span>
                              <span className="min-w-0">
                                <span className="flex items-center gap-1.5">
                                  <span className="block text-base font-bold" style={{ color: "var(--pv-ink)" }}>{entry.label}</span>
                                  {entry.kind === "admin" ? (
                                    <ExternalLink size={13} aria-hidden="true" style={{ color: "var(--pv-muted)" }} />
                                  ) : null}
                                </span>
                                <span className="mt-0.5 block text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>{entry.description}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-base font-semibold" style={{ color: "var(--pv-muted)" }}>Every button is already on your screen.</p>
                )}
              </div>
              <div
                className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-2xl border p-3 shadow-lg sm:flex-row"
                style={{ borderColor: "var(--pv-line)", backgroundColor: "rgba(255,255,255,0.96)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
              >
                <BigButton
                  icon={Check}
                  label={saving ? "Saving..." : "Save my screen & go back"}
                  color="var(--pv-teal)"
                  disabled={saving}
                  onClick={saveAndExit}
                  className="flex-1"
                />
                <BigButton
                  icon={X}
                  label="Cancel"
                  color="var(--pv-muted)"
                  disabled={saving}
                  onClick={cancelEditing}
                  className="sm:flex-none"
                />
              </div>
            </>
          ) : (
            <BigButton icon={Pencil} label="Edit my screen" sub="Add, remove, or reorder. Your call." color="var(--pv-coral)" onClick={startEditing} />
          )}
        </div>
      </div>
    </main>
  );
}

/** The icon chip glyph for an "Add" row. Kept tiny and local. */
function PlusIcon({ entry }: { entry: TileCatalogEntry }) {
  const Icon = iconFor(entry.icon);
  return <Icon size={20} style={{ color: colorFor(entry) }} aria-hidden="true" />;
}
