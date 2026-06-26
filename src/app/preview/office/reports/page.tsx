"use client";

// Daily reports, in the office layer. The office "Daily Reports" tile used to
// jump the owner out to the back-office /admin/reports; now it stays here and
// shows the SELECTED site's per-child daily activity (the center comes from the
// office center switcher's cc_center cookie, which the API reads). Any past day,
// any room, real entries logged by staff.

import { useCallback, useEffect, useState } from "react";
import { centerDate, shiftCenterDate } from "@/lib/center-time";
import { Card, ScreenHeader, Chip, useMounted } from "@/components/preview/ui";
import { PhotoAvatar } from "@/components/preview/PhotoAvatar";
import { usePreviewStore } from "@/lib/preview/store";

interface Entry {
  id: string;
  type: string;
  detail: Record<string, unknown>;
  occurred_at: string;
}
interface ReportChild {
  id: string;
  name: string;
  classroom: string;
  entries: Entry[];
}

function timeOf(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function OfficeReportsPage() {
  const mounted = useMounted();
  const kidPhotos = usePreviewStore((s) => s.kidPhotos);
  const [date, setDate] = useState<string>(() => centerDate());
  const [classrooms, setClassrooms] = useState<string[]>([]);
  const [children, setChildren] = useState<ReportChild[]>([]);
  const [room, setRoom] = useState("All");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/daily-report?date=${date}`, {
        cache: "no-store",
      });
      if (r.ok) {
        const d = await r.json();
        setClassrooms(["All", ...(d.classrooms || [])]);
        setChildren(d.children || []);
      } else {
        setChildren([]);
        setClassrooms(["All"]);
      }
    } catch {
      setChildren([]);
      setClassrooms(["All"]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const isToday = date === centerDate();
  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const filtered =
    room === "All" ? children : children.filter((c) => c.classroom === room);
  const withEntries = filtered.filter((c) => c.entries.length > 0).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <ScreenHeader
        title="Daily reports"
        backHref="/preview/office"
        backLabel="Office"
        note="Every child's day at this site. Pick a day, pick a room."
      />

      {/* Day navigator */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setDate(shiftCenterDate(date, -1))}
          className="pv-press pv-target rounded-lg px-3 py-2 text-base font-bold"
          style={{ backgroundColor: "var(--pv-card)", color: "var(--pv-ink)", border: "1px solid var(--pv-line)" }}
        >
          ← Prev
        </button>
        <span className="min-w-48 text-center text-base font-bold" style={{ color: "var(--pv-ink)" }}>
          {dateLabel}
        </span>
        <button
          type="button"
          onClick={() => setDate(shiftCenterDate(date, 1))}
          disabled={isToday}
          className="pv-press pv-target rounded-lg px-3 py-2 text-base font-bold disabled:opacity-40"
          style={{ backgroundColor: "var(--pv-card)", color: "var(--pv-ink)", border: "1px solid var(--pv-line)" }}
        >
          Next →
        </button>
        {!isToday ? (
          <button
            type="button"
            onClick={() => setDate(centerDate())}
            className="pv-target rounded-lg px-3 py-2 text-sm font-bold"
            style={{ color: "var(--pv-coral)" }}
          >
            Today
          </button>
        ) : null}
      </div>

      {/* Room filter */}
      {classrooms.length > 1 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {classrooms.map((c) => (
            <Chip key={c} label={c} on={room === c} onClick={() => setRoom(c)} />
          ))}
        </div>
      ) : null}

      <p className="mb-4 text-base" style={{ color: "var(--pv-muted)" }}>
        {withEntries} of {filtered.length} {filtered.length === 1 ? "child" : "children"} have
        entries {isToday ? "today" : "that day"}.
      </p>

      {!mounted || loading ? (
        <Card className="text-center" >
          <span style={{ color: "var(--pv-muted)" }}>Loading the day…</span>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="text-center">
          <span style={{ color: "var(--pv-muted)" }}>
            No children {room === "All" ? "" : `in ${room} `}on file for this site yet.
          </span>
        </Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((child) => {
            const counts = child.entries.reduce<Record<string, number>>((acc, e) => {
              acc[e.type] = (acc[e.type] || 0) + 1;
              return acc;
            }, {});
            const done = child.entries.length > 0;
            return (
              <li key={child.id}>
                <Card>
                  <div className="flex items-center gap-3">
                    <PhotoAvatar
                      id={child.id}
                      name={child.name}
                      src={kidPhotos[child.id]}
                      size={44}
                      rounded="rounded-md"
                      className="shrink-0"
                    />
                    <span className="flex-1">
                      <span className="block text-lg font-bold" style={{ color: "var(--pv-ink)" }}>
                        {child.name}
                      </span>
                      <span className="block text-sm" style={{ color: "var(--pv-muted)" }}>
                        {child.classroom}
                      </span>
                    </span>
                    <span
                      className="shrink-0 rounded-full px-3 py-1 text-sm font-bold"
                      style={
                        done
                          ? { backgroundColor: "color-mix(in srgb, var(--pv-teal) 16%, white)", color: "var(--pv-teal)" }
                          : { backgroundColor: "var(--pv-card)", color: "var(--pv-muted)", border: "1px solid var(--pv-line)" }
                      }
                    >
                      {done ? `${child.entries.length} logged` : "Nothing yet"}
                    </span>
                  </div>

                  {done ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(counts).map(([type, n]) => (
                          <span
                            key={type}
                            className="rounded-full px-2.5 py-0.5 text-xs font-bold capitalize"
                            style={{ backgroundColor: "var(--pv-card)", color: "var(--pv-ink)", border: "1px solid var(--pv-line)" }}
                          >
                            {type}: {n}
                          </span>
                        ))}
                      </div>
                      <ul className="mt-1">
                        {[...child.entries]
                          .sort((a, b) => (a.occurred_at || "").localeCompare(b.occurred_at || ""))
                          .map((e) => (
                            <li
                              key={e.id}
                              className="flex items-center gap-2 border-b py-1.5 text-sm last:border-b-0"
                              style={{ borderColor: "var(--pv-line)" }}
                            >
                              <span className="font-bold capitalize" style={{ color: "var(--pv-ink)", minWidth: "5.5rem" }}>
                                {e.type}
                              </span>
                              <span className="text-xs" style={{ color: "var(--pv-muted)" }}>
                                {timeOf(e.occurred_at)}
                              </span>
                              <span className="flex-1 truncate" style={{ color: "var(--pv-ink)" }}>
                                {typeof e.detail?.note === "string" ? e.detail.note : ""}
                              </span>
                              {e.type === "photo" && typeof e.detail?.photo_url === "string" ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={e.detail.photo_url as string}
                                  alt="Logged"
                                  className="h-10 w-10 shrink-0 rounded object-cover"
                                  style={{ border: "1px solid var(--pv-line)" }}
                                />
                              ) : null}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
