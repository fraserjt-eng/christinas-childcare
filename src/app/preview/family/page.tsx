"use client";

// The parent's phone (the answer to "what families see when they log in").
// NOT the lobby kiosk. A parent opens the app, signs in, and lands on a home
// built around their kids: are they here, how is their day, what needs me.
//
// Branded as the Christina's portal: pv-portal-bg canvas, pv-tile glow cards.
// The center name shows as the faint watermark behind the content (handled
// globally by the preview layout), so no chip is needed on each screen.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSessionUser, type SessionUser } from "@/lib/use-session-user";
import PrivacyNoticeBanner from "@/components/preview/PrivacyNoticeBanner";
import {
  AlertTriangle,
  Apple,
  ArrowRight,
  Baby,
  Backpack,
  Blocks,
  CalendarDays,
  CheckCircle2,
  CircleSlash,
  Droplet,
  FileText,
  type LucideIcon,
  Milk,
  Moon,
  Newspaper,
  Palette,
  PartyPopper,
  Camera as CameraIcon,
  Car,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  Home,
  MessageSquare,
  Send,
  StickyNote,
} from "lucide-react";
import { BigButton, EmptyState, useMounted } from "@/components/preview/ui";
import { PhotoUpload } from "@/components/preview/PhotoUpload";
import { PhotoAvatar } from "@/components/preview/PhotoAvatar";
import { AvatarUpload } from "@/components/preview/AvatarUpload";
import {
  CENTER_EVENTS,
  FAMILIES,
  photoById,
  roomById,
  type FeedEvent,
  type PreviewFamily,
  type PreviewKid,
} from "@/lib/preview/fixtures";
import { usePreviewStore, type PreviewMessage } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

const KIND_LOOK: Record<FeedEvent["kind"], { Icon: LucideIcon; color: string; bg: string }> = {
  meal: { Icon: Apple, color: "var(--pv-gold)", bg: "#fdebd2" },
  bottle: { Icon: Milk, color: "var(--pv-sky)", bg: "#eaf4fd" },
  diaper: { Icon: Droplet, color: "#8a8378", bg: "#f1ede6" },
  nap: { Icon: Moon, color: "var(--pv-teal)", bg: "#dff0ee" },
  activity: { Icon: Palette, color: "var(--pv-plum)", bg: "#ece5f1" },
  photo: { Icon: CameraIcon, color: "var(--pv-coral)", bg: "#fdeae6" },
  note: { Icon: StickyNote, color: "var(--pv-gold)", bg: "#fdf8ef" },
  checkin: { Icon: Car, color: "var(--pv-teal)", bg: "#e7f4f2" },
  checkout: { Icon: Home, color: "#8a8378", bg: "#f1ede6" },
};

/** Room glyph (small lucide line icon) keyed by room id, replaces room emoji. */
const ROOM_ICON: Record<string, LucideIcon> = {
  infants: Baby,
  toddlers: Blocks,
  preschool: Palette,
  schoolage: Backpack,
};

export default function ParentPhonePage() {
  const { user, loading } = useSessionUser();

  // A real signed-in parent sees their OWN family, pulled live from the server
  // (their kids, their real daily reports). Staff previewing the design with no
  // parent session fall through to the fixture picker below, so the demo still
  // works without touching real data.
  if (loading) {
    return (
      <main className="pv-portal-bg min-h-[100dvh] px-4 py-6">
        <div className="mx-auto max-w-2xl pv-rise">
          <p className="text-base" style={{ color: "var(--pv-muted)" }}>Loading your family…</p>
        </div>
      </main>
    );
  }
  if (user && user.role === "parent") {
    return <RealParentHome user={user} />;
  }
  return <PreviewParentPhone />;
}

function PreviewParentPhone() {
  const mounted = useMounted();
  const kids = usePreviewStore((s) => s.kids);
  const feed = usePreviewStore((s) => s.feed);
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const kidPhotos = usePreviewStore((s) => s.kidPhotos);
  const setKidPhoto = usePreviewStore((s) => s.setKidPhoto);
  const balances = usePreviewStore((s) => s.balances);
  const threads = usePreviewStore((s) => s.threads);
  const sendToFamily = usePreviewStore((s) => s.sendToFamily);

  const [familyId, setFamilyId] = useState<string | null>(null);
  const family = familyId ? FAMILIES.find((f) => f.id === familyId) ?? null : null;

  if (!family) {
    return <SignIn onPick={(id) => setFamilyId(id)} />;
  }

  // The office can change these; the parent phone reads the live values.
  const balanceOwed = mounted ? balances[family.id] ?? family.balanceOwed : family.balanceOwed;
  const thread = mounted ? threads[family.id] ?? [] : [];

  return (
    <ParentHome
      family={family}
      kids={kids}
      feed={feed}
      checkedIn={mounted ? checkedIn : {}}
      kidPhotos={mounted ? kidPhotos : {}}
      setKidPhoto={setKidPhoto}
      balanceOwed={balanceOwed}
      thread={thread}
      onReply={(body) => sendToFamily(family.id, family.parentName, body, false)}
      onSignOut={() => setFamilyId(null)}
    />
  );
}

/** The sign-in moment: email + password. Pick a family to sign in as, then you
 *  see ONLY that family's kids. */
function SignIn({ onPick }: { onPick: (familyId: string) => void }) {
  return (
    <main className="pv-portal-bg min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md">
        <header className="pv-rise mb-6">
          <h1 className="pv-tad-title text-3xl sm:text-4xl">Family sign in</h1>
          <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
            Sign in with your email and password to see your own kids.
          </p>
        </header>
        <div className="pv-tile pv-rise p-5" style={{ animationDelay: "60ms" }}>
          <div className="flex flex-col gap-3">
            {FAMILIES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  playClick();
                  onPick(f.id);
                }}
                className="pv-tile pv-kiosk-target flex items-center gap-3 p-4 text-left"
              >
                <PhotoAvatar id={f.id} name={f.parentName} size={48} rounded="rounded-md" />
                <span>
                  <span className="block text-lg font-bold" style={{ color: "var(--pv-ink)" }}>{f.parentName}</span>
                  <span className="block text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
                    {f.email}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function ParentHome({
  family,
  kids,
  feed,
  checkedIn,
  kidPhotos,
  setKidPhoto,
  balanceOwed,
  thread,
  onReply,
  onSignOut,
}: {
  family: PreviewFamily;
  kids: PreviewKid[];
  feed: FeedEvent[];
  checkedIn: Record<string, string | null>;
  kidPhotos: Record<string, string>;
  setKidPhoto: (kidId: string, dataUrl: string) => void;
  balanceOwed: number;
  thread: PreviewMessage[];
  onReply: (body: string) => void;
  onSignOut: () => void;
}) {
  const myKids = useMemo(
    () => kids.filter((k) => family.kidIds.includes(k.id)),
    [kids, family.kidIds],
  );
  const message = thread[0];
  const nextEvent = CENTER_EVENTS[0];
  const [detail, setDetail] = useState<DetailKind | null>(null);

  if (detail) {
    return (
      <DetailView
        kind={detail}
        family={family}
        balanceOwed={balanceOwed}
        thread={thread}
        onReply={onReply}
        onBack={() => setDetail(null)}
      />
    );
  }

  return (
    <main className="pv-portal-bg min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        {/* A real sign-out, kept top-right. */}
        <div className="mb-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              playClick();
              onSignOut();
            }}
            className="pv-press pv-target inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold"
            style={{ color: "var(--pv-muted)" }}
          >
            Sign out
          </button>
        </div>

        <header className="pv-rise mb-6">
          <h1 className="pv-tad-title text-3xl sm:text-4xl">
            Hi, {family.parentName.split(" ")[0]}
          </h1>
          <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
            Your kids first. Then anything that needs you.
          </p>
        </header>

        {/* MY KIDS RIGHT NOW: the first thing every parent checks. */}
        <section className="pv-rise mb-6" style={{ animationDelay: "60ms" }}>
          <h2 className="pv-tad-title text-xl">my kids right now</h2>
          <div className="mt-3 flex flex-col gap-4">
            {myKids.map((kid) => (
              <KidCard
                key={kid.id}
                kid={kid}
                feed={feed}
                checkedIn={checkedIn}
                photo={kidPhotos[kid.id]}
                onAddPhoto={(url) => setKidPhoto(kid.id, url)}
              />
            ))}
          </div>
          <Link
            href="/kiosk"
            onClick={() => playClick()}
            className="pv-tile pv-target mt-3 flex items-center gap-2 p-3 text-base font-bold"
            style={{ color: "var(--pv-teal)" }}
          >
            <ClipboardCheck size={18} aria-hidden="true" className="flex-shrink-0" />
            Dropping off or picking up? Check in or out at the front desk
            <ArrowRight size={18} aria-hidden="true" className="ml-auto flex-shrink-0" />
          </Link>
        </section>

        {/* THINGS THAT NEED ME. */}
        <section className="pv-rise mb-6" style={{ animationDelay: "120ms" }}>
          <h2 className="pv-tad-title text-xl">things that need you</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {message ? (
              <NeedTile
                Icon={MessageSquare}
                title="Message from the room"
                body={`${message.fromOffice ? message.from : "You"}: ${message.body}`}
                tag={message.unread && message.fromOffice ? "1 new" : null}
                accent="var(--pv-sky)"
                onOpen={() => setDetail("messages")}
              />
            ) : null}
            <NeedTile
              Icon={DollarSign}
              title={balanceOwed > 0 ? `You owe $${balanceOwed}` : "Paid up"}
              body={balanceOwed > 0 ? family.balanceDueLabel : "Thank you"}
              tag={balanceOwed > 0 ? "Pay" : null}
              accent={balanceOwed > 0 ? "var(--pv-coral)" : "var(--pv-teal)"}
              onOpen={() => setDetail("billing")}
            />
            <NeedTile
              Icon={FileText}
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
              onOpen={() => setDetail("forms")}
            />
            <NeedTile
              Icon={nextEvent.kind === "closure" ? CircleSlash : CalendarDays}
              title={nextEvent.kind === "closure" ? "Next closure" : "Coming up"}
              body={`${nextEvent.title}, ${nextEvent.dateLabel}`}
              tag={null}
              accent="var(--pv-plum)"
              onOpen={() => setDetail("calendar")}
            />
          </div>
        </section>

        {/* QUIETER STUFF. Photos already show in each kid's feed above; the
            newsletter is a real page, so it links out. */}
        <section className="pv-rise mb-6" style={{ animationDelay: "180ms" }}>
          <Link
            href="/preview/newsletter"
            onClick={() => playClick()}
            className="pv-tile pv-target flex items-center gap-3 p-4"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: "#fdeae6" }}
            >
              <Newspaper size={20} style={{ color: "var(--pv-coral)" }} />
            </span>
            <span>
              <span className="block text-base font-bold" style={{ color: "var(--pv-ink)" }}>This week&apos;s newsletter</span>
              <span className="block text-xs font-semibold" style={{ color: "var(--pv-muted)" }}>
                Photos and reminders from the room
              </span>
            </span>
            <ArrowRight size={20} aria-hidden="true" className="ml-auto flex-shrink-0" style={{ color: "var(--pv-coral)" }} />
          </Link>
        </section>

        {/* FAMILY DETAILS. */}
        <section className="pv-rise mb-6" style={{ animationDelay: "240ms" }}>
          <h2 className="pv-tad-title text-xl">your family&apos;s details</h2>
          <div className="pv-tile mt-3 p-5">
            <h3 className="pv-tad-label text-base">
              allergies and notes
            </h3>
            <div className="mt-2 flex flex-col gap-2">
              {myKids.map((kid) => (
                <div key={kid.id} className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold" style={{ color: "var(--pv-ink)" }}>{kid.firstName}</span>
                  {kid.allergy ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold"
                      style={{ backgroundColor: "#fdeae6", color: "var(--pv-red-bad)" }}
                    >
                      <AlertTriangle size={13} aria-hidden="true" /> {kid.allergy}
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

            <h3 className="pv-tad-label mt-5 text-base">
              emergency contact
            </h3>
            <p className="mt-1 text-base">
              {family.emergencyContact.name} ({family.emergencyContact.relationship}),{" "}
              {family.emergencyContact.phone}
            </p>

            <h3 className="pv-tad-label mt-5 text-base">
              who can pick up
            </h3>
            <div className="mt-2 flex flex-col gap-1">
              {family.approvedPickups.map((p) => (
                <p key={p.name} className="text-base">
                  <span className="font-bold">{p.name}</span>{" "}
                  <span style={{ color: "var(--pv-muted)" }}>({p.relationship})</span>
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/** One kid: presence pill on top, a photo you can add, then today's feed. */
function KidCard({
  kid,
  feed,
  checkedIn,
  photo,
  onAddPhoto,
}: {
  kid: PreviewKid;
  feed: FeedEvent[];
  checkedIn: Record<string, string | null>;
  photo: string | undefined;
  onAddPhoto: (dataUrl: string) => void;
}) {
  const here = checkedIn[kid.id];
  const room = roomById(kid.roomId);
  const RoomIcon = ROOM_ICON[kid.roomId] ?? Baby;
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
    <div className="pv-tile p-5">
      <div className="flex items-center gap-3">
        <span className="relative flex-shrink-0">
          <PhotoAvatar
            id={kid.id}
            name={`${kid.firstName} ${kid.lastName}`}
            src={photo}
            size={56}
            rounded="rounded-md"
          />
          <AvatarUpload
            label={`Upload a photo for ${kid.firstName}`}
            onPhoto={onAddPhoto}
            className="absolute -bottom-1 -right-1"
          />
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold" style={{ color: "var(--pv-ink)" }}>{kid.firstName}</span>
            {kid.allergy ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: "#fdeae6", color: "var(--pv-red-bad)" }}
              >
                <AlertTriangle size={11} aria-hidden="true" /> {kid.allergy}
              </span>
            ) : null}
          </div>
          {room ? (
            <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
              <RoomIcon size={13} aria-hidden="true" /> {room.name}
            </span>
          ) : null}
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-center text-sm font-semibold"
          style={{
            backgroundColor: here ? "#e7f4f2" : "#f1ede6",
            color: here ? "var(--pv-teal)" : "var(--pv-muted)",
          }}
        >
          <span className="h-2 w-2 flex-shrink-0 rounded-full" aria-hidden="true" style={{ backgroundColor: here ? "var(--pv-teal)" : "#8a8378" }} />
          {here ? `Here since ${here}` : "Not dropped off yet"}
        </span>
      </div>

      <div className="mt-3">
        <PhotoUpload
          label={photo ? "Change photo" : "Add a photo"}
          onPhoto={onAddPhoto}
          color="var(--pv-sky)"
        />
      </div>

      {today.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {today.map((e) => {
            const look = KIND_LOOK[e.kind];
            const demo = photoById(e.photoId);
            const imgSrc = e.photoUrl ?? demo?.src ?? null;
            const imgAlt = demo?.caption ?? e.title;
            return (
              <div
                key={e.id}
                className="rounded-lg border p-3"
                style={{ borderColor: "var(--pv-line)" }}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: look.bg }}
                  >
                    <look.Icon size={18} style={{ color: look.color }} />
                  </span>
                  <div className="flex-1">
                    <span className="block text-base font-bold">{e.title}</span>
                    <span className="block text-sm" style={{ color: "#4d473f" }}>{e.detail}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "var(--pv-muted)" }}>
                    {e.time}
                  </span>
                </div>
                {imgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imgSrc} alt={imgAlt} className="mt-2 w-full rounded-lg" />
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
    </div>
  );
}

function NeedTile({
  Icon,
  title,
  body,
  tag,
  accent,
  onOpen,
}: {
  Icon: LucideIcon;
  title: string;
  body: string;
  tag: string | null;
  accent: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        playClick();
        onOpen();
      }}
      className="pv-tile pv-target p-4 text-left"
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, white)` }}
        >
          <Icon size={18} style={{ color: accent }} />
        </span>
        <span className="text-base font-bold" style={{ color: "var(--pv-ink)" }}>{title}</span>
        {tag ? (
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: "#fdeae6", color: "var(--pv-coral)" }}
          >
            {tag}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm" style={{ color: "#4d473f" }}>{body}</p>
    </button>
  );
}

type DetailKind = "billing" | "messages" | "forms" | "calendar";

/** The four screens behind the needs-me tiles. Each opens in place so the
 *  signed-in family stays, like drilling into a phone app. */
function DetailView({
  kind,
  family,
  balanceOwed,
  thread,
  onReply,
  onBack,
}: {
  kind: DetailKind;
  family: PreviewFamily;
  balanceOwed: number;
  thread: PreviewMessage[];
  onReply: (body: string) => void;
  onBack: () => void;
}) {
  const titles: Record<DetailKind, { title: string; Icon: LucideIcon }> = {
    billing: { title: "What you owe", Icon: DollarSign },
    messages: { title: "Messages with the room", Icon: MessageSquare },
    forms: { title: "Forms to sign", Icon: FileText },
    calendar: { title: "Closures and events", Icon: CalendarDays },
  };
  const head = titles[kind];

  return (
    <main className="pv-portal-bg min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              playClick();
              onBack();
            }}
            className="pv-press pv-target inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold"
            style={{ color: "var(--pv-muted)" }}
          >
            Back to home
          </button>
        </div>
        <h1 className="pv-tad-title flex items-center text-3xl">
          <head.Icon size={26} aria-hidden="true" className="mr-2 flex-shrink-0" style={{ color: "var(--pv-coral)" }} />
          {head.title}
        </h1>

        <div className="mt-5">
          {kind === "billing" ? <BillingDetail family={family} balanceOwed={balanceOwed} /> : null}
          {kind === "messages" ? <MessagesDetail thread={thread} onReply={onReply} /> : null}
          {kind === "forms" ? <FormsDetail family={family} /> : null}
          {kind === "calendar" ? <CalendarDetail /> : null}
        </div>
      </div>
    </main>
  );
}

function BillingDetail({ family, balanceOwed }: { family: PreviewFamily; balanceOwed: number }) {
  const weekly = 120;
  const lines = [
    { label: "Weekly tuition, week of June 9", amount: weekly },
    { label: "Weekly tuition, week of June 2", amount: weekly },
  ];
  return (
    <>
      <div className="pv-tile p-5">
        <p className="text-base font-semibold" style={{ color: "var(--pv-muted)" }}>
          Current balance
        </p>
        <p className="text-4xl font-extrabold" style={{ color: balanceOwed > 0 ? "var(--pv-coral)" : "var(--pv-teal)" }}>
          ${balanceOwed}
        </p>
        <p className="text-base">{balanceOwed > 0 ? family.balanceDueLabel : "Thank you, you are paid up"}</p>
        <div className="mt-4 flex flex-col gap-2">
          {balanceOwed > 0
            ? lines.map((l) => (
                <div key={l.label} className="flex items-center justify-between border-t pt-2 text-base" style={{ borderColor: "var(--pv-line)" }}>
                  <span>{l.label}</span>
                  <span className="font-bold">${l.amount}</span>
                </div>
              ))
            : <p className="text-base" style={{ color: "var(--pv-muted)" }}>Nothing due. You are paid through the end of June.</p>}
        </div>
        {balanceOwed > 0 ? (
          <BigButton icon={CreditCard} label="Pay now" color="var(--pv-coral)" kiosk className="mt-5 w-full text-center" onClick={() => {}} />
        ) : null}
      </div>
    </>
  );
}

function MessagesDetail({
  thread,
  onReply,
}: {
  thread: PreviewMessage[];
  onReply: (body: string) => void;
}) {
  const [reply, setReply] = useState("");
  const ordered = [...thread].reverse(); // oldest first for a chat read

  return (
    <>
      <div className="pv-tile p-5">
        <div className="flex flex-col gap-2">
          {ordered.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg p-3 ${m.fromOffice ? "" : "ml-auto text-white"}`}
              style={{ backgroundColor: m.fromOffice ? "#eef1f4" : "var(--pv-teal)" }}
            >
              <p className="text-base">{m.body}</p>
              <p className="mt-1 text-xs" style={{ color: m.fromOffice ? "var(--pv-muted)" : "rgba(255,255,255,0.85)" }}>
                {m.fromOffice ? m.from : "You"}, {m.time}
              </p>
            </div>
          ))}
          {ordered.length === 0 ? (
            <p className="text-base" style={{ color: "var(--pv-muted)" }}>No messages yet.</p>
          ) : null}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write back to the room"
            rows={2}
            aria-label="Write a reply to the room"
            className="rounded-lg border px-4 py-3 text-base"
            style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)" }}
          />
          <BigButton
            icon={Send}
            label="Send"
            color="var(--pv-sky)"
            disabled={!reply.trim()}
            onClick={() => {
              onReply(reply.trim());
              setReply("");
            }}
            className="w-full text-center"
          />
        </div>
      </div>
    </>
  );
}

function FormsDetail({ family }: { family: PreviewFamily }) {
  const [signed, setSigned] = useState<string[]>([]);
  if (family.formsToSign.length === 0) {
    return <EmptyState icon={CheckCircle2} title="Nothing to sign" detail="You are all caught up on forms." />;
  }
  return (
    <>
      <div className="flex flex-col gap-3">
        {family.formsToSign.map((form) => {
          const isSigned = signed.includes(form);
          return (
            <div key={form} className="pv-tile p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: "#fdf8ef" }}
                >
                  <FileText size={18} style={{ color: "var(--pv-gold)" }} />
                </span>
                <span className="text-base font-bold" style={{ color: "var(--pv-ink)" }}>{form}</span>
                {isSigned ? (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold" style={{ backgroundColor: "#e7f4f2", color: "var(--pv-teal)" }}>
                    <CheckCircle2 size={14} aria-hidden="true" /> Signed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setSigned((s) => [...s, form]);
                    }}
                    className="pv-press pv-target ml-auto rounded-full border px-4 py-2 text-sm font-bold"
                    style={{ borderColor: "var(--pv-line)", color: "var(--pv-coral)" }}
                  >
                    Review and sign
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function CalendarDetail() {
  return (
    <>
      <div className="flex flex-col gap-3">
        {CENTER_EVENTS.map((ev) => (
          <div key={ev.id} className="pv-tile p-5">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: ev.kind === "closure" ? "#fdeae6" : "#ece5f1" }}
              >
                {ev.kind === "closure" ? (
                  <CircleSlash size={22} style={{ color: "var(--pv-coral)" }} />
                ) : (
                  <PartyPopper size={22} style={{ color: "var(--pv-plum)" }} />
                )}
              </span>
              <div>
                <p className="text-base font-bold" style={{ color: "var(--pv-ink)" }}>{ev.title}</p>
                <p className="text-sm" style={{ color: "var(--pv-muted)" }}>{ev.dateLabel}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// REAL parent home: the signed-in parent's OWN family + live daily reports.
// Pulls /api/parent/me (their kids, profile, today's presence) and each kid's
// real per-child report from /api/child-entries (parent-scoped server-side, so
// a parent can only ever see their own children). Only renders what has a real
// source; billing, forms, and two-way messages have no parent-facing data yet,
// so they are omitted rather than shown as fake numbers.
// ---------------------------------------------------------------------------

interface ApiParent {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  is_primary: boolean;
}
interface ApiChild {
  id: string;
  name: string;
  classroom: string;
  allergies: string[];
  medical_notes?: string;
  checked_in_at: string | null;
}
interface ApiFamily {
  id: string;
  email: string;
  address?: string;
  parents: ApiParent[];
  children: ApiChild[];
}
interface ApiEntry {
  id: string;
  type: string;
  detail?: Record<string, unknown>;
  occurred_at?: string;
  classroom_id?: string | null;
}

const KNOWN_KINDS: FeedEvent["kind"][] = [
  "meal",
  "bottle",
  "diaper",
  "nap",
  "activity",
  "photo",
  "note",
];

function entryToFeed(e: ApiEntry, kidId: string): FeedEvent {
  const detail = e.detail ?? {};
  const text =
    (detail.note as string) ||
    (detail.text as string) ||
    (detail.summary as string) ||
    "";
  const type = (e.type || "note").toLowerCase();
  const kind = (KNOWN_KINDS.includes(type as FeedEvent["kind"])
    ? type
    : "note") as FeedEvent["kind"];
  const when = e.occurred_at ? new Date(e.occurred_at) : null;
  const time =
    when && !isNaN(when.getTime())
      ? when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "";
  return {
    id: e.id,
    kind,
    roomId: (e.classroom_id as string) || "",
    kidIds: [kidId],
    title: type.charAt(0).toUpperCase() + type.slice(1),
    detail: text,
    time,
    dayLabel: "Today",
    photoId: null,
    photoUrl: (detail.photo_url as string) || null,
  };
}

async function realSignOut() {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch {
    /* best effort */
  }
  window.location.href = "/login";
}

function SignOutBar() {
  return (
    <div className="mb-6 flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={() => {
          playClick();
          realSignOut();
        }}
        className="pv-press pv-target inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold"
        style={{ color: "var(--pv-muted)" }}
      >
        Sign out
      </button>
    </div>
  );
}

function RealParentHome({ user }: { user: SessionUser }) {
  const [family, setFamily] = useState<ApiFamily | null>(null);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [phase, setPhase] = useState<"loading" | "ready" | "empty" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meRes = await fetch("/api/parent/me");
        const meJson = meRes.ok ? await meRes.json() : null;
        const fam: ApiFamily | null = meJson?.family ?? null;
        if (cancelled) return;
        if (!fam) {
          setPhase("empty");
          return;
        }
        setFamily(fam);
        const lists = await Promise.all(
          (fam.children ?? []).map((k) =>
            fetch(`/api/child-entries?child_id=${encodeURIComponent(k.id)}`)
              .then((r) => (r.ok ? r.json() : { entries: [] }))
              .then((d) => ({ kidId: k.id, entries: (d.entries ?? []) as ApiEntry[] }))
              .catch(() => ({ kidId: k.id, entries: [] as ApiEntry[] })),
          ),
        );
        if (cancelled) return;
        const events: FeedEvent[] = [];
        for (const { kidId, entries } of lists) {
          for (const e of entries) events.push(entryToFeed(e, kidId));
        }
        setFeed(events);
        setPhase("ready");
      } catch {
        if (!cancelled) setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === "loading") {
    return (
      <main className="pv-portal-bg min-h-[100dvh] px-4 py-6">
        <div className="mx-auto max-w-2xl pv-rise">
          <p className="text-base" style={{ color: "var(--pv-muted)" }}>Loading your kids…</p>
        </div>
      </main>
    );
  }

  if (phase === "error" || !family) {
    return (
      <main className="pv-portal-bg min-h-[100dvh] px-4 py-6">
        <div className="mx-auto max-w-md pv-rise">
          <SignOutBar />
          <div className="pv-tile p-6">
            <h1 className="pv-tad-title text-2xl">We could not find your family</h1>
            <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
              {phase === "error"
                ? "Something went wrong loading your kids. Please try again."
                : "Your account is not linked to a family yet. The office can connect it."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const fam = family;
  const firstName = (user.full_name || fam.email).split(" ")[0];
  const primary = fam.parents.find((p) => p.is_primary) ?? fam.parents[0];
  const checkedIn: Record<string, string | null> = {};
  for (const k of fam.children) checkedIn[k.id] = k.checked_in_at;

  return (
    <main className="pv-portal-bg min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <SignOutBar />

        <header className="pv-rise mb-6">
          <h1 className="pv-tad-title text-3xl sm:text-4xl">Hi, {firstName}</h1>
          <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
            Your kids first. Then anything that needs you.
          </p>
        </header>

        <PrivacyNoticeBanner />

        <section className="pv-rise mb-6" style={{ animationDelay: "60ms" }}>
          <h2 className="pv-tad-title text-xl">my kids right now</h2>
          <div className="mt-3 flex flex-col gap-4">
            {fam.children.map((kid) => (
              <RealKidCard key={kid.id} kid={kid} feed={feed} checkedIn={checkedIn} />
            ))}
            {fam.children.length === 0 ? (
              <EmptyState
                icon={Baby}
                title="No children on file yet"
                detail="The office can add your kids to your account."
              />
            ) : null}
          </div>
          <Link
            href="/kiosk"
            onClick={() => playClick()}
            className="pv-tile pv-target mt-3 flex items-center gap-2 p-3 text-base font-bold"
            style={{ color: "var(--pv-teal)" }}
          >
            <ClipboardCheck size={18} aria-hidden="true" className="flex-shrink-0" />
            Dropping off or picking up? Check in or out at the front desk
            <ArrowRight size={18} aria-hidden="true" className="ml-auto flex-shrink-0" />
          </Link>
        </section>

        <section className="pv-rise mb-6" style={{ animationDelay: "120ms" }}>
          <Link
            href="/preview/newsletter"
            onClick={() => playClick()}
            className="pv-tile pv-target flex items-center gap-3 p-4"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: "#fdeae6" }}
            >
              <Newspaper size={20} style={{ color: "var(--pv-coral)" }} />
            </span>
            <span>
              <span className="block text-base font-bold" style={{ color: "var(--pv-ink)" }}>This week&apos;s newsletter</span>
              <span className="block text-xs font-semibold" style={{ color: "var(--pv-muted)" }}>
                Photos and reminders from the room
              </span>
            </span>
            <ArrowRight size={20} aria-hidden="true" className="ml-auto flex-shrink-0" style={{ color: "var(--pv-coral)" }} />
          </Link>
        </section>

        <section className="pv-rise mb-6" style={{ animationDelay: "180ms" }}>
          <h2 className="pv-tad-title text-xl">your family&apos;s details</h2>
          <div className="pv-tile mt-3 p-5">
            <h3 className="pv-tad-label text-base">allergies and notes</h3>
            <div className="mt-2 flex flex-col gap-2">
              {fam.children.map((kid) => (
                <div key={kid.id} className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold" style={{ color: "var(--pv-ink)" }}>
                    {kid.name.split(" ")[0]}
                  </span>
                  {kid.allergies.length ? (
                    kid.allergies.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold"
                        style={{ backgroundColor: "#fdeae6", color: "var(--pv-red-bad)" }}
                      >
                        <AlertTriangle size={13} aria-hidden="true" /> {a}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm" style={{ color: "var(--pv-muted)" }}>No allergies on file</span>
                  )}
                  {kid.medical_notes ? (
                    <span className="text-sm" style={{ color: "var(--pv-muted)" }}>{kid.medical_notes}</span>
                  ) : null}
                </div>
              ))}
            </div>

            {primary ? (
              <>
                <h3 className="pv-tad-label mt-5 text-base">primary contact</h3>
                <p className="mt-1 text-base">
                  {primary.name}
                  {primary.relationship ? ` (${primary.relationship})` : ""}
                  {primary.phone ? `, ${primary.phone}` : ""}
                </p>
              </>
            ) : null}

            {fam.parents.length ? (
              <>
                <h3 className="pv-tad-label mt-5 text-base">who can pick up</h3>
                <div className="mt-2 flex flex-col gap-1">
                  {fam.parents.map((p) => (
                    <p key={p.id} className="text-base">
                      <span className="font-bold">{p.name}</span>{" "}
                      <span style={{ color: "var(--pv-muted)" }}>({p.relationship || "guardian"})</span>
                    </p>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function RealKidCard({
  kid,
  feed,
  checkedIn,
}: {
  kid: ApiChild;
  feed: FeedEvent[];
  checkedIn: Record<string, string | null>;
}) {
  const here = checkedIn[kid.id];
  const firstName = kid.name.split(" ")[0];
  const today = feed
    .filter((e) => e.kidIds.includes(kid.id) && e.kind !== "checkin" && e.kind !== "checkout")
    .slice(0, 8);

  return (
    <div className="pv-tile p-5">
      <div className="flex items-center gap-3">
        <PhotoAvatar id={kid.id} name={kid.name} size={56} rounded="rounded-md" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold" style={{ color: "var(--pv-ink)" }}>{firstName}</span>
            {kid.allergies.slice(0, 1).map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: "#fdeae6", color: "var(--pv-red-bad)" }}
              >
                <AlertTriangle size={11} aria-hidden="true" /> {a}
              </span>
            ))}
          </div>
          {kid.classroom ? (
            <span className="text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>{kid.classroom}</span>
          ) : null}
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-center text-sm font-semibold"
          style={{
            backgroundColor: here ? "#e7f4f2" : "#f1ede6",
            color: here ? "var(--pv-teal)" : "var(--pv-muted)",
          }}
        >
          <span className="h-2 w-2 flex-shrink-0 rounded-full" aria-hidden="true" style={{ backgroundColor: here ? "var(--pv-teal)" : "#8a8378" }} />
          {here ? `Here since ${here}` : "Not dropped off yet"}
        </span>
      </div>

      {today.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {today.map((e) => {
            const look = KIND_LOOK[e.kind];
            return (
              <div key={e.id} className="rounded-lg border p-3" style={{ borderColor: "var(--pv-line)" }}>
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: look.bg }}
                  >
                    <look.Icon size={18} style={{ color: look.color }} />
                  </span>
                  <div className="flex-1">
                    <span className="block text-base font-bold">{e.title}</span>
                    {e.detail ? (
                      <span className="block text-sm" style={{ color: "#4d473f" }}>{e.detail}</span>
                    ) : null}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "var(--pv-muted)" }}>{e.time}</span>
                </div>
                {e.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.photoUrl} alt={e.title} className="mt-2 w-full rounded-lg" />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-base" style={{ color: "var(--pv-muted)" }}>
          {here ? "Nothing logged yet today. Check back soon." : "Their day starts once they are dropped off."}
        </p>
      )}
    </div>
  );
}

