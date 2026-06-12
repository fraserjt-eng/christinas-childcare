"use client";

// The parent's phone (the answer to "what families see when they log in").
// NOT the lobby kiosk. A parent opens the app, signs in, and lands on a home
// built around their kids: are they here, how is their day, what needs me.
//
// Honesty tags mark each block: "Live today" = the real app already has this,
// "To build" = the real app cannot do this yet (the review flagged it). The
// demo shows the shape so Christina reacts to the plan, not a polished fake.

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, ScreenHeader, StepNote, useMounted } from "@/components/preview/ui";
import {
  CENTER_EVENTS,
  FAMILIES,
  FAMILY_MESSAGES,
  photoById,
  roomById,
  type FeedEvent,
  type PreviewFamily,
  type PreviewKid,
} from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

const KIND_LOOK: Record<FeedEvent["kind"], { emoji: string; bg: string }> = {
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

/** Tells Christina whether a block is real today or to build. */
function Tag({ kind }: { kind: "live" | "new" }) {
  const live = kind === "live";
  return (
    <span
      className="ml-2 rounded-full px-2 py-0.5 text-xs font-extrabold"
      style={{
        backgroundColor: live ? "#e7f4f2" : "#fdeae6",
        color: live ? "var(--pv-teal)" : "var(--pv-coral)",
      }}
    >
      {live ? "Live today" : "To build"}
    </span>
  );
}

export default function ParentPhonePage() {
  const mounted = useMounted();
  const kids = usePreviewStore((s) => s.kids);
  const feed = usePreviewStore((s) => s.feed);
  const checkedIn = usePreviewStore((s) => s.checkedIn);

  const [familyId, setFamilyId] = useState<string | null>(null);
  const family = familyId ? FAMILIES.find((f) => f.id === familyId) ?? null : null;

  if (!family) {
    return <SignIn onPick={(id) => setFamilyId(id)} />;
  }

  return (
    <ParentHome
      family={family}
      kids={kids}
      feed={feed}
      checkedIn={mounted ? checkedIn : {}}
      onSignOut={() => setFamilyId(null)}
    />
  );
}

/** The sign-in moment. In the real app this is email + password. For the demo
 *  you pick which parent to sign in as, then you see ONLY that family. */
function SignIn({ onPick }: { onPick: (familyId: string) => void }) {
  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-md">
        <ScreenHeader
          title="On a parent's phone"
          emoji="📱"
          note="What a parent opens at home or at work. Not the lobby iPad."
        />
        <StepNote step={5} text="Sign in as a demo parent to see their home." />
        <Card>
          <h2 className="text-2xl">Sign in</h2>
          <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
            Real families sign in with their email and password. For this demo,
            pick a parent to sign in as. You will see only their own kids.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            {FAMILIES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  playClick();
                  onPick(f.id);
                }}
                className="pv-press pv-kiosk-target flex items-center gap-3 rounded-2xl border-2 p-4 text-left"
                style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)" }}
              >
                <span aria-hidden="true" className="text-4xl">{f.avatar}</span>
                <span>
                  <span className="block text-lg font-extrabold">{f.parentName}</span>
                  <span className="block text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
                    {f.email}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}

function ParentHome({
  family,
  kids,
  feed,
  checkedIn,
  onSignOut,
}: {
  family: PreviewFamily;
  kids: PreviewKid[];
  feed: FeedEvent[];
  checkedIn: Record<string, string | null>;
  onSignOut: () => void;
}) {
  const myKids = useMemo(
    () => kids.filter((k) => family.kidIds.includes(k.id)),
    [kids, family.kidIds],
  );
  const message = FAMILY_MESSAGES[family.id];
  const nextEvent = CENTER_EVENTS[0];

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <ScreenHeader
          title={`Hi, ${family.parentName.split(" ")[0]}`}
          emoji="📱"
          note="Your kids first. Then anything that needs you."
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

        {/* MY KIDS RIGHT NOW: the first thing every parent checks. */}
        <section className="mb-6">
          <h2 className="flex items-center text-xl">
            My kids right now <Tag kind="new" />
          </h2>
          <div className="mt-3 flex flex-col gap-4">
            {myKids.map((kid) => (
              <KidCard key={kid.id} kid={kid} feed={feed} checkedIn={checkedIn} />
            ))}
          </div>
        </section>

        {/* THINGS THAT NEED ME. */}
        <section className="mb-6">
          <h2 className="text-xl">Things that need you</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {message ? (
              <NeedTile
                emoji="💬"
                title="Message from the room"
                body={`${message.from}: ${message.body}`}
                tag={message.unread ? "1 new" : null}
                accent="var(--pv-sky)"
              />
            ) : null}
            <NeedTile
              emoji="💵"
              title={family.balanceOwed > 0 ? `You owe $${family.balanceOwed}` : "Paid up"}
              body={family.balanceDueLabel}
              tag={family.balanceOwed > 0 ? "Pay" : null}
              accent={family.balanceOwed > 0 ? "var(--pv-coral)" : "var(--pv-teal)"}
            />
            <NeedTile
              emoji="📝"
              title={
                family.formsToSign.length > 0
                  ? `${family.formsToSign.length} form${family.formsToSign.length === 1 ? "" : "s"} to sign`
                  : "No forms to sign"
              }
              body={
                family.formsToSign.length > 0
                  ? family.formsToSign.join(", ")
                  : "You are all caught up"
              }
              tag={family.formsToSign.length > 0 ? "Sign" : null}
              accent="var(--pv-gold)"
            />
            <NeedTile
              emoji={nextEvent.kind === "closure" ? "🚫" : "📅"}
              title={nextEvent.kind === "closure" ? "Next closure" : "Coming up"}
              body={`${nextEvent.title}, ${nextEvent.dateLabel}`}
              tag={null}
              accent="var(--pv-plum)"
            />
          </div>
          <p className="mt-2 text-sm" style={{ color: "var(--pv-muted)" }}>
            The Pay and Sign tags are not built yet. The owner already makes
            the statements; parents just have no screen for them.
          </p>
        </section>

        {/* QUIETER STUFF. Photos already show in each kid's feed above; the
            newsletter is a real page, so it links out. */}
        <section className="mb-6">
          <Link
            href="/preview/newsletter"
            onClick={() => playClick()}
            className="pv-press pv-target flex items-center gap-3 rounded-2xl border bg-[var(--pv-card)] p-4"
            style={{ borderColor: "var(--pv-line)" }}
          >
            <span aria-hidden="true" className="text-2xl">📰</span>
            <span>
              <span className="block text-base font-extrabold">This week&apos;s newsletter</span>
              <span className="block text-xs font-semibold" style={{ color: "var(--pv-teal)" }}>
                Photos and reminders from the room
              </span>
            </span>
            <span aria-hidden="true" className="ml-auto text-xl" style={{ color: "var(--pv-coral)" }}>→</span>
          </Link>
        </section>

        {/* FAMILY DETAILS. */}
        <section className="mb-6">
          <h2 className="flex items-center text-xl">
            Your family&apos;s details <Tag kind="new" />
          </h2>
          <Card className="mt-3">
            <h3 className="text-base font-extrabold" style={{ color: "var(--pv-muted)" }}>
              Allergies and notes
            </h3>
            <div className="mt-2 flex flex-col gap-2">
              {myKids.map((kid) => (
                <div key={kid.id} className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold">{kid.firstName}</span>
                  {kid.allergy ? (
                    <span
                      className="rounded-full px-3 py-1 text-sm font-bold text-white"
                      style={{ backgroundColor: "var(--pv-coral)" }}
                    >
                      ⚠️ {kid.allergy}
                    </span>
                  ) : (
                    <span className="text-sm" style={{ color: "var(--pv-muted)" }}>
                      No allergies on file
                    </span>
                  )}
                  {kid.note ? (
                    <span className="text-sm" style={{ color: "var(--pv-muted)" }}>
                      {kid.note}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <h3 className="mt-5 text-base font-extrabold" style={{ color: "var(--pv-muted)" }}>
              Emergency contact
            </h3>
            <p className="mt-1 text-base">
              {family.emergencyContact.name} ({family.emergencyContact.relationship}),{" "}
              {family.emergencyContact.phone}
            </p>

            <h3 className="mt-5 flex items-center text-base font-extrabold" style={{ color: "var(--pv-muted)" }}>
              Who can pick up <Tag kind="new" />
            </h3>
            <div className="mt-2 flex flex-col gap-1">
              {family.approvedPickups.map((p) => (
                <p key={p.name} className="text-base">
                  <span className="font-bold">{p.name}</span>{" "}
                  <span style={{ color: "var(--pv-muted)" }}>({p.relationship})</span>
                </p>
              ))}
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--pv-coral)" }}>
              The real app has no pickup list at all today. Anyone with the
              family code can check a child out. This is the most important one
              to build.
            </p>
          </Card>
        </section>
      </div>
    </main>
  );
}

/** One kid: presence pill on top, then today's feed. */
function KidCard({
  kid,
  feed,
  checkedIn,
}: {
  kid: PreviewKid;
  feed: FeedEvent[];
  checkedIn: Record<string, string | null>;
}) {
  const here = checkedIn[kid.id];
  const room = roomById(kid.roomId);
  const today = feed
    .filter(
      (e) =>
        e.dayLabel === "Today" &&
        e.kidIds.includes(kid.id) &&
        e.kind !== "checkin" &&
        e.kind !== "checkout",
    )
    .slice(0, 5);

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="text-4xl">{kid.avatar}</span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-extrabold">{kid.firstName}</span>
            {kid.allergy ? (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: "var(--pv-coral)" }}
              >
                ⚠️ {kid.allergy}
              </span>
            ) : null}
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
            {room ? `${room.emoji} ${room.name}` : ""}
          </span>
        </div>
        <span
          className="rounded-full px-3 py-2 text-center text-sm font-extrabold text-white"
          style={{ backgroundColor: here ? "var(--pv-teal)" : "#8a8378" }}
        >
          {here ? `Here since ${here}` : "Not dropped off yet"}
        </span>
      </div>

      {today.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {today.map((e) => {
            const look = KIND_LOOK[e.kind];
            const photo = photoById(e.photoId);
            return (
              <div
                key={e.id}
                className="rounded-xl border p-3"
                style={{ borderColor: "var(--pv-line)" }}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ backgroundColor: look.bg }}
                  >
                    {look.emoji}
                  </span>
                  <div className="flex-1">
                    <span className="block text-base font-bold">{e.title}</span>
                    <span className="block text-sm" style={{ color: "#4d473f" }}>{e.detail}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "var(--pv-muted)" }}>
                    {e.time}
                  </span>
                </div>
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.src} alt={photo.caption} className="mt-2 w-full rounded-lg" />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-base" style={{ color: "var(--pv-muted)" }}>
          {here
            ? "Nothing logged yet today. Check back soon."
            : "Their day starts once they are dropped off."}
        </p>
      )}
    </Card>
  );
}

function NeedTile({
  emoji,
  title,
  body,
  tag,
  accent,
}: {
  emoji: string;
  title: string;
  body: string;
  tag: string | null;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={() => playClick()}
      className="pv-press pv-target rounded-2xl border bg-[var(--pv-card)] p-4 text-left"
      style={{ borderColor: "var(--pv-line)" }}
    >
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-2xl">{emoji}</span>
        <span className="text-base font-extrabold" style={{ color: accent }}>{title}</span>
        {tag ? (
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-xs font-extrabold text-white"
            style={{ backgroundColor: "var(--pv-coral)" }}
          >
            {tag}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm" style={{ color: "#4d473f" }}>{body}</p>
    </button>
  );
}

