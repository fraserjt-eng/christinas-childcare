"use client";

// The family feed (design exploration section 03, parent side).
// Everything the teachers log shows up here as it happens. The "Today so far"
// card writes itself from the day's events: nobody types a summary.

import { useState } from "react";
import { Card, Chip, EmptyState, ScreenHeader, StepNote, useMounted } from "@/components/preview/ui";
import { photoById, type FeedEvent, type FeedKind } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";

const DAY_ORDER = ["Today", "Fri", "Thu", "Wed", "Tue", "Mon"];

const KIND_LOOK: Record<FeedKind, { emoji: string; bg: string }> = {
  meal: { emoji: "🍎", bg: "#fdebd2" },
  bottle: { emoji: "🍼", bg: "#eaf4fd" },
  diaper: { emoji: "🧷", bg: "#f1ede6" },
  nap: { emoji: "😴", bg: "#dff0ee" },
  activity: { emoji: "🎨", bg: "#ece5f1" },
  photo: { emoji: "📷", bg: "#fdeae6" },
  note: { emoji: "📝", bg: "#fdf8ef" },
  checkin: { emoji: "🚗", bg: "#e7f4f2" },
  checkout: { emoji: "🏠", bg: "#f1ede6" },
};

/** Plain sentence per category, only for categories that have entries today. */
function summaryLines(todayEvents: FeedEvent[]): Array<{ emoji: string; text: string }> {
  const count = (kind: FeedKind) => todayEvents.filter((e) => e.kind === kind).length;
  const lines: Array<{ emoji: string; text: string }> = [];
  const meals = count("meal");
  if (meals > 0) lines.push({ emoji: "🍎", text: meals === 1 ? "1 meal logged" : `${meals} meals logged` });
  const bottles = count("bottle");
  if (bottles > 0) lines.push({ emoji: "🍼", text: bottles === 1 ? "1 bottle" : `${bottles} bottles` });
  const diapers = count("diaper");
  if (diapers > 0) lines.push({ emoji: "🧷", text: diapers === 1 ? "1 diaper change" : `${diapers} diaper changes` });
  const naps = count("nap");
  if (naps > 0) lines.push({ emoji: "😴", text: naps === 1 ? "1 nap" : `${naps} naps` });
  const activities = count("activity");
  if (activities > 0) lines.push({ emoji: "🎨", text: activities === 1 ? "1 activity" : `${activities} activities` });
  const photos = count("photo");
  if (photos > 0) lines.push({ emoji: "📷", text: photos === 1 ? "1 photo" : `${photos} photos` });
  const notes = count("note");
  if (notes > 0) lines.push({ emoji: "📝", text: notes === 1 ? "1 note" : `${notes} notes` });
  return lines;
}

export default function FamilyFeedPage() {
  const mounted = useMounted();
  const families = usePreviewStore((s) => s.families);
  const kids = usePreviewStore((s) => s.kids);
  const feed = usePreviewStore((s) => s.feed);
  const checkedIn = usePreviewStore((s) => s.checkedIn);

  const [familyId, setFamilyId] = useState("fam-brown");

  const family = families.find((f) => f.id === familyId) ?? families[0] ?? null;
  const familyKidIds = family ? family.kidIds : [];
  const familyKids = kids.filter((k) => familyKidIds.includes(k.id));
  const familyEvents = feed.filter((e) => e.kidIds.some((id) => familyKidIds.includes(id)));
  const todayEvents = familyEvents.filter((e) => e.dayLabel === "Today");
  const todayLines = summaryLines(todayEvents);

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <ScreenHeader
          title="Your family's day"
          emoji="💛"
          note="Everything the teachers log lands here, as it happens."
        />
        <StepNote step={5} text="Pick a family below, then watch teacher logs land in this feed." />

        <p className="mb-2 text-sm font-bold" style={{ color: "var(--pv-muted)" }}>
          Viewing as
        </p>
        <div className="mb-6 flex flex-wrap gap-2">
          {families.map((f) => (
            <Chip key={f.id} label={f.name} on={family?.id === f.id} onClick={() => setFamilyId(f.id)} />
          ))}
        </div>

        {family ? (
          <>
            <Card>
              <h2 className="text-2xl">Today so far</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--pv-muted)" }}>
                Nobody writes this. It builds itself from the day.
              </p>
              {todayLines.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {todayLines.map((line) => (
                    <span key={line.text} className="text-base font-semibold">
                      <span aria-hidden="true" className="mr-1">{line.emoji}</span>
                      {line.text}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-base" style={{ color: "var(--pv-muted)" }}>
                  Nothing logged for your kids yet today.
                </p>
              )}
              <div className="mt-4 grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2" style={{ borderColor: "var(--pv-line)" }}>
                {familyKids.map((kid) => {
                  const inAt = mounted ? checkedIn[kid.id] : null;
                  return (
                    <div key={kid.id} className="flex items-center gap-3">
                      <span aria-hidden="true" className="text-3xl">{kid.avatar}</span>
                      <span>
                        <span className="block text-lg font-extrabold leading-tight">{kid.firstName}</span>
                        <span
                          className="block text-sm font-semibold"
                          style={{ color: inAt ? "var(--pv-teal)" : "var(--pv-muted)" }}
                        >
                          {inAt ? `Here since ${inAt}` : "Not here right now"}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {familyEvents.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  emoji="📭"
                  title="Nothing here yet"
                  detail="Log something in the teacher room view and watch it appear."
                />
              </div>
            ) : (
              DAY_ORDER.map((day) => {
                const dayEvents = familyEvents.filter((e) => e.dayLabel === day);
                if (dayEvents.length === 0) return null;
                return (
                  <section key={day} className="mt-8">
                    <h2 className="text-xl font-extrabold">{day}</h2>
                    <div className="mt-3 flex flex-col gap-3">
                      {dayEvents.map((event) => {
                        const look = KIND_LOOK[event.kind];
                        const photo = photoById(event.photoId);
                        return (
                          <Card key={event.id}>
                            <div className="flex items-start gap-3">
                              <span
                                aria-hidden="true"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
                                style={{ backgroundColor: look.bg }}
                              >
                                {look.emoji}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-lg font-extrabold leading-tight">{event.title}</p>
                                <p className="truncate text-base" style={{ color: "var(--pv-ink)" }}>
                                  {event.detail}
                                </p>
                              </div>
                              <span className="shrink-0 text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
                                {event.time}
                              </span>
                            </div>
                            {photo ? (
                              <img src={photo.src} alt={photo.caption} className="mt-3 w-full rounded-xl" />
                            ) : null}
                          </Card>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </>
        ) : (
          <EmptyState
            emoji="📭"
            title="Nothing here yet"
            detail="Log something in the teacher room view and watch it appear."
          />
        )}

        <p className="mt-10 text-center text-sm" style={{ color: "var(--pv-muted)" }}>
          In the real version this also becomes the printed daily summary.
        </p>
      </div>
    </main>
  );
}
