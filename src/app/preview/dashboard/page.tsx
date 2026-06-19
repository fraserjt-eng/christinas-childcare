"use client";

// The flagship director dashboard, styled to read like the Tadpoles
// operations screen the owners already know: a clean light canvas, thin
// neutral gray typography, the diagonal kids/staff classroom cards, flat
// colored stat squares, photo tiles with the name on a bar across the top,
// and a colored attendance table. Christina-red is the accent throughout and
// the children are real photos, not emoji. Everything reads the one shared
// preview store, so a kiosk check-in on another screen lands here too: tap a
// child in the OUT list and the counts, the ratio, and the table all move.

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Baby,
  Backpack,
  Blocks,
  type LucideIcon,
  Palette,
  ShieldAlert,
} from "lucide-react";
import { StepNote, cx, useMounted } from "@/components/preview/ui";
import { PhotoAvatar } from "@/components/preview/PhotoAvatar";
import { AvatarUpload } from "@/components/preview/AvatarUpload";
import { Reveal } from "@/components/preview/Reveal";
import { ROOMS, type PreviewKid, type PreviewRoom } from "@/lib/preview/fixtures";
import { usePreviewStore, getRoomStatus } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

const ROOM_ICON: Record<string, LucideIcon> = {
  infants: Baby,
  toddlers: Blocks,
  preschool: Palette,
  schoolage: Backpack,
};

type TabId =
  | "attendance"
  | "photos"
  | "lessons"
  | "reports"
  | "portfolio"
  | "notes"
  | "pipeline"
  | "billing";

const TABS: { id: TabId; label: string }[] = [
  { id: "attendance", label: "Attendance" },
  { id: "photos", label: "Photos & Videos" },
  { id: "lessons", label: "Lesson Plans" },
  { id: "reports", label: "Daily Reports" },
  { id: "portfolio", label: "Portfolio" },
  { id: "notes", label: "Notes & Alerts" },
  { id: "pipeline", label: "Pipeline" },
  { id: "billing", label: "Billing" },
];

type ViewId = "combined" | "students" | "staff";

/** White panel with layered depth that lifts on hover. */
function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("pv-lift pv-deep rounded-xl border bg-white p-5", className)} style={{ borderColor: "var(--tad-line)" }}>
      {children}
    </div>
  );
}

/** Minutes since midnight from a display time like "7:42 AM", or null. */
function minutesFromDisplay(t: string | null | undefined): number | null {
  if (!t) return null;
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + Number(m[2]);
}

/** A child as a photo tile with the name on a bar across the top (Tadpoles). */
function ChildTile({
  kid,
  inHere,
  onToggle,
}: {
  kid: PreviewKid;
  inHere: boolean;
  onToggle: () => void;
}) {
  const kidPhotos = usePreviewStore((s) => s.kidPhotos);
  const setKidPhoto = usePreviewStore((s) => s.setKidPhoto);
  const photo = kidPhotos[kid.id];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          playClick();
          onToggle();
        }}
        className="pv-press pv-target relative block w-full overflow-hidden rounded-md border bg-white"
        style={{ borderColor: "var(--tad-line)" }}
        aria-label={inHere ? `Check ${kid.firstName} out` : `Check ${kid.firstName} in`}
      >
        <PhotoAvatar
          id={kid.id}
          name={`${kid.firstName} ${kid.lastName}`}
          src={photo}
          block
          rounded="rounded-none"
          className={inHere ? "" : "opacity-75 grayscale"}
        />
        <span className="absolute inset-x-0 top-0 flex items-center gap-1 bg-gradient-to-b from-black/70 to-transparent px-1.5 pb-4 pt-1 text-left text-[11px] font-semibold text-white">
          <span className="truncate">
            {kid.firstName} {kid.lastName.charAt(0)}.
          </span>
          {kid.allergy ? <ShieldAlert size={12} className="ml-auto flex-shrink-0" style={{ color: "#ffd54f" }} /> : null}
        </span>
      </button>
      <AvatarUpload
        label={`Upload a photo for ${kid.firstName}`}
        onPhoto={(d) => setKidPhoto(kid.id, d)}
        className="absolute bottom-1 right-1"
      />
    </div>
  );
}

/** A classroom card with the Tadpoles diagonal split: kids upper-left on the
 *  room tint, staff lower-right on gray. The counts are live from the store. */
function RoomCard({
  room,
  selected,
  onSelect,
}: {
  room: PreviewRoom;
  selected: boolean;
  onSelect: () => void;
}) {
  const kids = usePreviewStore((s) => s.kids);
  const staff = usePreviewStore((s) => s.staff);
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const clockedIn = usePreviewStore((s) => s.clockedIn);
  const status = getRoomStatus({ kids, staff, checkedIn, clockedIn }, room.id);
  const Icon = ROOM_ICON[room.id] ?? Baby;
  const band =
    status.level === "good" ? "var(--pv-teal)" : status.level === "near" ? "var(--pv-gold)" : "var(--pv-red-bad)";
  return (
    <button
      type="button"
      onClick={() => {
        playClick();
        onSelect();
      }}
      className="pv-press pv-target overflow-hidden rounded-md border-2 bg-white text-left"
      style={{ borderColor: selected ? "var(--pv-coral)" : "var(--tad-line)" }}
      aria-pressed={selected}
    >
      <div
        className="relative h-20"
        style={{ background: `linear-gradient(to bottom right, ${room.color}30 0 49.5%, #ececec 50.5% 100%)` }}
      >
        <span className="absolute left-2 top-1.5 font-bold leading-none" style={{ color: room.color }}>
          <span className="text-2xl">{status.present}</span>
          <span className="ml-0.5 text-[11px] font-semibold">kids</span>
        </span>
        <span className="absolute bottom-1.5 right-2 text-xs font-semibold" style={{ color: "#7b7f84" }}>
          staff {status.staffIn}
        </span>
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: band }} aria-hidden="true" />
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <Icon size={13} style={{ color: room.color }} />
        <span className="truncate text-xs font-bold" style={{ color: "var(--tad-ink)" }}>
          {room.name}
        </span>
      </div>
    </button>
  );
}

/** Stat card: a big Fraunces number in the accent color on a white card,
 *  with an uppercase tracked label. The number is the "pop". */
function StatSquare({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="pv-lift pv-deep flex flex-col rounded-xl border bg-white p-4" style={{ borderColor: "var(--tad-line)" }}>
      <span className="pv-serif text-4xl font-semibold leading-none sm:text-5xl" style={{ color }}>
        {value}
      </span>
      <span className="pv-tad-label mt-2">{label}</span>
    </div>
  );
}

/** Small flat colored action button (Add Class, Export to CSV, etc.). */
function PillButton({
  children,
  color,
  onClick,
}: {
  children: ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        playClick();
        onClick();
      }}
      className="pv-press pv-target rounded px-3 py-1.5 text-xs font-bold text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      {children}
    </button>
  );
}

export default function DashboardPage() {
  const mounted = useMounted();
  const kids = usePreviewStore((s) => s.kids);
  const staff = usePreviewStore((s) => s.staff);
  const families = usePreviewStore((s) => s.families);
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const clockedIn = usePreviewStore((s) => s.clockedIn);
  const kidPhotos = usePreviewStore((s) => s.kidPhotos);
  const threads = usePreviewStore((s) => s.threads);
  const checkInKid = usePreviewStore((s) => s.checkInKid);
  const checkOutKid = usePreviewStore((s) => s.checkOutKid);
  const clockInStaff = usePreviewStore((s) => s.clockInStaff);
  const clockOutStaff = usePreviewStore((s) => s.clockOutStaff);

  const [tab, setTab] = useState<TabId>("attendance");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [view, setView] = useState<ViewId>("combined");
  const [query, setQuery] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const unread = useMemo(
    () => Object.values(threads).reduce((n, msgs) => n + msgs.filter((m) => m.unread).length, 0),
    [threads],
  );

  const scopeKids = useMemo(() => (roomId ? kids.filter((k) => k.roomId === roomId) : kids), [kids, roomId]);
  const scopeStaff = useMemo(() => (roomId ? staff.filter((s) => s.roomId === roomId) : staff), [staff, roomId]);

  const q = query.trim().toLowerCase();
  const matches = (first: string, last: string) => !q || `${first} ${last}`.toLowerCase().includes(q);

  const inKids = scopeKids.filter((k) => checkedIn[k.id] && matches(k.firstName, k.lastName));
  const outKids = scopeKids.filter((k) => !checkedIn[k.id] && matches(k.firstName, k.lastName));

  const presentCount = scopeKids.filter((k) => checkedIn[k.id]).length;
  const enrolledCount = scopeKids.length;
  const allergyToday = scopeKids.filter((k) => checkedIn[k.id] && k.allergy).length;
  const remindersCount = families
    .filter((f) => f.kidIds.some((id) => scopeKids.some((k) => k.id === id)))
    .reduce((n, f) => n + f.formsToSign.length, 0);

  const nowMin = mounted
    ? (() => {
        const d = new Date();
        return d.getHours() * 60 + d.getMinutes();
      })()
    : null;
  const dateLabel = mounted
    ? new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
    : "";

  function hoursFor(kidId: string): string {
    const inMin = minutesFromDisplay(checkedIn[kidId]);
    if (inMin == null || nowMin == null) return "—";
    const h = Math.max(0, (nowMin - inMin) / 60);
    return h.toFixed(1);
  }

  function exportCsv() {
    const rows = [["Student", "Room", "In", "Hours"]];
    for (const k of scopeKids) {
      const room = ROOMS.find((r) => r.id === k.roomId);
      rows.push([`${k.firstName} ${k.lastName}`, room?.name ?? "", checkedIn[k.id] ?? "", checkedIn[k.id] ? hoursFor(k.id) : ""]);
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `christinas-attendance-${dateLabel.replace(/\//g, "-") || "today"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const scopeTitle = roomId ? `${ROOMS.find((r) => r.id === roomId)?.name} Room` : "All Classrooms";
  const staffIn = Object.values(clockedIn).filter(Boolean).length;

  return (
    <main className="pv-tad px-4 py-6 sm:px-8">
      <div className="mx-auto w-full max-w-[1800px]">
        {/* header (Tadpoles thin gray lowercase title) */}
        <Link
          href="/preview/office"
          onClick={() => playClick()}
          className="pv-target inline-flex items-center gap-1 text-sm font-bold"
          style={{ color: "var(--pv-coral)" }}
        >
          ← office
        </Link>
        <h1 className="pv-tad-title mt-1 text-4xl sm:text-5xl">{scopeTitle}</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--tad-muted)" }}>
          Every room at a glance: who is here, the ratios, the day.
        </p>
        <div className="mt-3">
          <StepNote step={4} text="Tap a child in the OUT list to check them in, and watch the ratios and counts move." />
        </div>

        {/* tabs: plain gray text, active is a filled red pill */}
        <div className="-mx-1 overflow-x-auto border-b" style={{ borderColor: "var(--tad-line)" }}>
          <div className="flex min-w-max items-end gap-1 px-1" role="tablist" aria-label="Center sections">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    playClick();
                    setTab(t.id);
                  }}
                  className="pv-press pv-target relative mb-1 whitespace-nowrap rounded px-3 py-1.5 text-sm font-semibold"
                  style={{
                    backgroundColor: active ? "var(--pv-coral)" : "transparent",
                    color: active ? "#ffffff" : "var(--tad-muted)",
                  }}
                >
                  {t.label}
                  {t.id === "notes" && unread > 0 ? (
                    <span
                      className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-extrabold"
                      style={{
                        backgroundColor: active ? "#ffffff" : "var(--pv-coral)",
                        color: active ? "var(--pv-coral)" : "#ffffff",
                      }}
                    >
                      {unread}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {tab !== "attendance" ? (
          <div className="mt-5">
            <OtherTabPanel tab={tab} unread={unread} families={families} />
          </div>
        ) : (
          <>
            {/* choose a classroom */}
            <div className="mb-2 mt-5 flex items-center justify-between gap-3">
              <h2 className="pv-tad-label pv-accent-rule">choose a classroom</h2>
              <div className="flex gap-2">
                <PillButton color="var(--pv-teal)" onClick={() => setNote("Add Class is in the full version.")}>
                  + Add Class
                </PillButton>
                <PillButton color="var(--pv-sky)" onClick={() => setNote("Change Metric switches ratios, head counts, or open spots.")}>
                  Change Metric ▾
                </PillButton>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setRoomId(null);
                }}
                className="pv-press pv-target overflow-hidden rounded-md border-2 bg-white text-left"
                style={{ borderColor: roomId === null ? "var(--pv-coral)" : "var(--tad-line)" }}
                aria-pressed={roomId === null}
              >
                <div
                  className="relative h-20"
                  style={{ background: "linear-gradient(to bottom right, rgba(198,40,40,0.18) 0 49.5%, #ececec 50.5% 100%)" }}
                >
                  <span className="absolute left-2 top-1.5 font-bold leading-none" style={{ color: "var(--pv-coral)" }}>
                    <span className="text-2xl">{presentCount}</span>
                    <span className="ml-0.5 text-[11px] font-semibold">kids</span>
                  </span>
                  <span className="absolute bottom-1.5 right-2 text-xs font-semibold" style={{ color: "#7b7f84" }}>
                    staff {staffIn}
                  </span>
                </div>
                <div className="px-2 py-1.5">
                  <span className="text-xs font-bold" style={{ color: "var(--tad-ink)" }}>
                    All
                  </span>
                </div>
              </button>
              {ROOMS.map((room) => (
                <RoomCard key={room.id} room={room} selected={roomId === room.id} onSelect={() => setRoomId(room.id)} />
              ))}
            </div>
            <p className="mb-5 mt-2 text-xs" style={{ color: "var(--tad-muted)" }}>
              Showing <b style={{ color: "var(--tad-ink)" }}>ratios</b> for each classroom.
            </p>

            {/* flat colored stat squares */}
            <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatSquare value={presentCount} label="in the building" color="var(--pv-coral)" />
              <StatSquare value={enrolledCount - presentCount} label="out today" color="var(--pv-sky)" />
              <StatSquare value={allergyToday} label="allergies in today" color="var(--pv-red-bad)" />
              <StatSquare value={remindersCount} label="reminders" color="var(--pv-gold)" />
            </div>

            {/* view toggle + filter + add buttons + date */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {(["combined", "students", "staff"] as ViewId[]).map((v) => {
                  const on = view === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        playClick();
                        setView(v);
                      }}
                      className="pv-press rounded px-3 py-1.5 text-sm font-semibold capitalize"
                      style={{
                        backgroundColor: on ? "var(--pv-coral)" : "transparent",
                        color: on ? "#ffffff" : "var(--tad-muted)",
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="filter by name"
                aria-label="Filter by name"
                className="pv-target flex-1 rounded border px-3 py-1.5 text-sm"
                style={{ borderColor: "var(--tad-line)", backgroundColor: "#fff", minWidth: "160px", color: "var(--tad-ink)" }}
              />
              <PillButton color="var(--pv-teal)" onClick={() => setNote("Add Child opens enrollment in the full version.")}>
                + Add Child
              </PillButton>
              <PillButton color="var(--pv-plum)" onClick={() => setNote("Add Employee opens staff setup in the full version.")}>
                + Add Employee
              </PillButton>
              <span
                className="rounded border px-3 py-1.5 text-sm font-semibold"
                style={{ borderColor: "var(--tad-line)", backgroundColor: "#fff", color: "var(--tad-muted)" }}
              >
                {dateLabel || "today"}
              </span>
            </div>

            {note ? (
              <div
                className="mb-4 flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "var(--tad-line)", backgroundColor: "#fff", color: "var(--tad-ink)" }}
                role="status"
              >
                <span>{note}</span>
                <button type="button" onClick={() => setNote(null)} className="pv-press text-base font-bold" style={{ color: "var(--tad-muted)" }} aria-label="Dismiss">
                  ✕
                </button>
              </div>
            ) : null}

            {view === "staff" ? (
              <StaffView
                scopeStaff={scopeStaff}
                clockedIn={clockedIn}
                matches={matches}
                onToggle={(id) => (clockedIn[id] ? clockOutStaff(id) : clockInStaff(id))}
              />
            ) : view === "students" ? (
              <StudentsView scopeKids={scopeKids} checkedIn={checkedIn} kidPhotos={kidPhotos} matches={matches} hoursFor={hoursFor} />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Panel>
                  <h2 className="text-base">
                    <span className="text-2xl font-bold" style={{ color: "var(--pv-teal)" }}>
                      {inKids.length}
                    </span>{" "}
                    <span className="pv-tad-label">in</span>
                  </h2>
                  {inKids.length === 0 ? (
                    <p className="mt-3 text-sm" style={{ color: "var(--tad-muted)" }}>
                      No one is checked in here yet.
                    </p>
                  ) : (
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {inKids.map((k) => (
                        <ChildTile key={k.id} kid={k} inHere onToggle={() => checkOutKid(k.id, "Front desk")} />
                      ))}
                    </div>
                  )}
                </Panel>
                <Panel>
                  <h2 className="text-base">
                    <span className="text-2xl font-bold" style={{ color: "var(--tad-muted)" }}>
                      {outKids.length}
                    </span>{" "}
                    <span className="pv-tad-label">out · tap to check in</span>
                  </h2>
                  {outKids.length === 0 ? (
                    <p className="mt-3 text-sm" style={{ color: "var(--tad-muted)" }}>
                      Everyone in this view is here.
                    </p>
                  ) : (
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {outKids.map((k) => (
                        <ChildTile key={k.id} kid={k} inHere={false} onToggle={() => checkInKid(k.id, "Front desk")} />
                      ))}
                    </div>
                  )}
                </Panel>
              </div>
            )}

            {/* attendance table with a colored header row */}
            <Reveal className="mt-4" delay={80}>
            <Panel className="!p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <h2 className="pv-tad-label pv-accent-rule">attendance</h2>
                <div className="flex flex-wrap gap-2">
                  <PillButton color="var(--pv-coral)" onClick={() => setNote("15-minute counts print the licensing ratio log.")}>
                    15 Minute Counts
                  </PillButton>
                  <PillButton color="var(--pv-sky)" onClick={() => setNote("Reports build attendance and billing summaries.")}>
                    Reports
                  </PillButton>
                  <PillButton color="var(--pv-teal)" onClick={exportCsv}>
                    Export to CSV
                  </PillButton>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "var(--pv-coral)", color: "#fff" }}>
                      <th className="px-4 py-2 font-semibold">student</th>
                      <th className="px-4 py-2 font-semibold">room</th>
                      <th className="px-4 py-2 font-semibold">in</th>
                      <th className="px-4 py-2 font-semibold">hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopeKids
                      .filter((k) => matches(k.firstName, k.lastName))
                      .sort((a, b) => Number(Boolean(checkedIn[b.id])) - Number(Boolean(checkedIn[a.id])))
                      .map((k, i) => {
                        const room = ROOMS.find((r) => r.id === k.roomId);
                        const here = Boolean(checkedIn[k.id]);
                        return (
                          <tr key={k.id} style={{ backgroundColor: i % 2 ? "#fafafa" : "#fff" }}>
                            <td className="px-4 py-2 font-semibold" style={{ color: "var(--tad-ink)" }}>
                              <span className="flex items-center gap-2">
                                <PhotoAvatar id={k.id} name={`${k.firstName} ${k.lastName}`} src={kidPhotos[k.id]} size={30} rounded="rounded" />
                                <span>
                                  {k.firstName} {k.lastName}
                                  {k.allergy ? (
                                    <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold" style={{ color: "var(--pv-red-bad)" }}>
                                      <ShieldAlert size={12} /> {k.allergy}
                                    </span>
                                  ) : null}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-2" style={{ color: "var(--tad-muted)" }}>
                              {room?.name}
                            </td>
                            <td className="px-4 py-2 font-semibold" style={{ color: "var(--tad-ink)" }}>
                              {here ? checkedIn[k.id] : <span style={{ color: "var(--tad-muted)" }}>not in</span>}
                            </td>
                            <td className="px-4 py-2 font-semibold" style={{ color: "var(--tad-ink)" }}>
                              {here ? hoursFor(k.id) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Panel>
            </Reveal>

            <p className="mt-6 pb-4 text-center text-xs" style={{ color: "var(--tad-muted)" }}>
              This is the same data the kiosk and the room logs write. One source, every screen.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function StudentsView({
  scopeKids,
  checkedIn,
  kidPhotos,
  matches,
  hoursFor,
}: {
  scopeKids: PreviewKid[];
  checkedIn: Record<string, string | null>;
  kidPhotos: Record<string, string>;
  matches: (first: string, last: string) => boolean;
  hoursFor: (id: string) => string;
}) {
  const setKidPhoto = usePreviewStore((s) => s.setKidPhoto);
  const list = scopeKids.filter((k) => matches(k.firstName, k.lastName));
  return (
    <Panel>
      <h2 className="pv-tad-label text-base">students</h2>
      <div className="mt-2 flex flex-col divide-y" style={{ borderColor: "var(--tad-line)" }}>
        {list.map((k) => {
          const here = Boolean(checkedIn[k.id]);
          const room = ROOMS.find((r) => r.id === k.roomId);
          const RoomIcon = ROOM_ICON[k.roomId] ?? Baby;
          return (
            <div key={k.id} className="flex items-center gap-3 py-2.5">
              <span className="relative flex-shrink-0">
                <PhotoAvatar id={k.id} name={`${k.firstName} ${k.lastName}`} src={kidPhotos[k.id]} size={44} rounded="rounded-md" />
                <AvatarUpload label={`Upload a photo for ${k.firstName}`} onPhoto={(d) => setKidPhoto(k.id, d)} className="absolute -bottom-1 -right-1" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold" style={{ color: "var(--tad-ink)" }}>
                  {k.firstName} {k.lastName}
                  {k.allergy ? (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold" style={{ color: "var(--pv-red-bad)" }}>
                      <ShieldAlert size={12} /> {k.allergy}
                    </span>
                  ) : null}
                </span>
                <span className="flex items-center gap-1 text-sm" style={{ color: "var(--tad-muted)" }}>
                  <RoomIcon size={12} /> {room?.name}
                </span>
              </span>
              {here ? (
                <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: "var(--pv-teal)" }}>
                  in since {checkedIn[k.id]} · {hoursFor(k.id)}h
                </span>
              ) : (
                <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: "#eef0f1", color: "var(--tad-muted)" }}>
                  not in yet
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function StaffView({
  scopeStaff,
  clockedIn,
  matches,
  onToggle,
}: {
  scopeStaff: { id: string; firstName: string; lastName: string; role: string; roomId: string | null }[];
  clockedIn: Record<string, string | null>;
  matches: (first: string, last: string) => boolean;
  onToggle: (id: string) => void;
}) {
  const staffPhotos = usePreviewStore((s) => s.staffPhotos);
  const setStaffPhoto = usePreviewStore((s) => s.setStaffPhoto);
  const list = scopeStaff.filter((s) => matches(s.firstName, s.lastName));
  return (
    <Panel>
      <h2 className="pv-tad-label text-base">staff</h2>
      <div className="mt-2 flex flex-col divide-y" style={{ borderColor: "var(--tad-line)" }}>
        {list.map((s) => {
          const here = Boolean(clockedIn[s.id]);
          const room = ROOMS.find((r) => r.id === s.roomId);
          return (
            <div key={s.id} className="flex items-center gap-3 py-2.5">
              <span className="relative flex-shrink-0">
                <PhotoAvatar id={s.id} name={`${s.firstName} ${s.lastName}`} src={staffPhotos[s.id]} size={44} rounded="rounded-md" />
                <AvatarUpload label={`Upload a photo for ${s.firstName}`} onPhoto={(d) => setStaffPhoto(s.id, d)} className="absolute -bottom-1 -right-1" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold" style={{ color: "var(--tad-ink)" }}>
                  {s.firstName} {s.lastName}
                </span>
                <span className="block text-sm capitalize" style={{ color: "var(--tad-muted)" }}>
                  {s.role}
                  {room ? ` · ${room.name}` : " · floats"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  onToggle(s.id);
                }}
                className="pv-press pv-target rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: here ? "var(--tad-muted)" : "var(--pv-teal)" }}
              >
                {here ? `clocked in ${clockedIn[s.id]}` : "clock in"}
              </button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/** Every non-attendance tab opens its preview surface or shows what is coming.
 *  No tab is ever a dead end. */
function OtherTabPanel({
  tab,
  unread,
  families,
}: {
  tab: TabId;
  unread: number;
  families: { id: string; name: string; formsToSign: string[] }[];
}) {
  const balances = usePreviewStore((s) => s.balances);
  const totalOwed = Object.values(balances).reduce((n, b) => n + b, 0);

  const panels: Record<Exclude<TabId, "attendance">, { title: string; body: string; href?: string; cta?: string; stat?: string }> = {
    photos: {
      title: "photos & videos",
      body: "Every photo a teacher snaps lands in the family feed the same minute, tagged to the child. No upload queue, no waiting until pickup.",
      href: "/preview/family",
      cta: "Open the family feed",
    },
    lessons: {
      title: "lesson plans",
      body: "This week's plan per room, with one tap to copy a planned activity straight into the day's report so teachers write it once.",
    },
    reports: {
      title: "daily reports",
      body: "The end-of-day report assembles itself from the meals, naps, bottles, and photos logged in the room. Families get it at pickup, not hours later.",
      href: "/preview/family",
      cta: "See a family's day",
    },
    portfolio: {
      title: "portfolio",
      body: "Learning stories that link a photo to a milestone, so a parent sees not just that their child painted, but what they are growing into.",
    },
    notes: {
      title: "notes & alerts",
      body: unread > 0 ? `${unread} message${unread === 1 ? "" : "s"} from families waiting for a reply.` : "Two-way messages with families, and the alerts that need the office's eyes.",
      href: "/preview/office/messages",
      cta: "Open messages",
    },
    pipeline: {
      title: "pipeline",
      body: "Every inquiry and tour from first call to enrolled, on one board, so no family slips through the cracks.",
    },
    billing: {
      title: "billing",
      body: "Who owes what, statements families can actually see on their phone, and one tap to mark a balance paid.",
      href: "/preview/office/billing",
      cta: "Open billing",
      stat: `$${totalOwed.toLocaleString()} outstanding across ${families.length} families`,
    },
  };

  const p = panels[tab as Exclude<TabId, "attendance">];
  return (
    <Panel className="text-center">
      <h2 className="pv-tad-title text-2xl">{p.title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm" style={{ color: "var(--tad-muted)" }}>
        {p.body}
      </p>
      {p.stat ? (
        <p className="mt-3 text-lg font-bold" style={{ color: "var(--pv-coral)" }}>
          {p.stat}
        </p>
      ) : null}
      {p.href ? (
        <Link
          href={p.href}
          onClick={() => playClick()}
          className="pv-press pv-target mt-4 inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-bold text-white shadow-sm"
          style={{ backgroundColor: "var(--pv-coral)" }}
        >
          {p.cta} <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <p className="mt-4 inline-block rounded-full px-3 py-1.5 text-xs font-bold" style={{ backgroundColor: "#eef0f1", color: "var(--tad-muted)" }}>
          Built into the full version
        </p>
      )}
    </Panel>
  );
}
