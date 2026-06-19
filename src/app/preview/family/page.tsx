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
import { BigButton, Card, EmptyState, ScreenHeader, StepNote, useMounted } from "@/components/preview/ui";
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

/** Tells Christina whether a block is real today or to build. */
function Tag({ kind }: { kind: "live" | "new" }) {
  const live = kind === "live";
  return (
    <span
      className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold"
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

/** The sign-in moment. In the real app this is email + password. For the demo
 *  you pick which parent to sign in as, then you see ONLY that family. */
function SignIn({ onPick }: { onPick: (familyId: string) => void }) {
  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-md">
        <ScreenHeader
          title="On a parent's phone"
          note="What a parent opens at home or at work. Not the lobby iPad."
        />
        <StepNote step={5} text="Sign in as a demo parent to see their home." />
        <Card className="pv-rise">
          <h2 className="pv-tad-title text-2xl">sign in</h2>
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
                className="pv-lift pv-kiosk-target flex items-center gap-3 rounded-lg border p-4 text-left"
                style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)" }}
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
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <ScreenHeader
          title={`hi, ${family.parentName.split(" ")[0].toLowerCase()}`}
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
            style={{ color: "var(--pv-coral)" }}
          >
            ← Sign out
          </button>
        </div>

        {/* MY KIDS RIGHT NOW: the first thing every parent checks. */}
        <section className="pv-rise mb-6" style={{ animationDelay: "60ms" }}>
          <h2 className="pv-tad-title flex items-center text-xl">
            my kids right now <Tag kind="new" />
          </h2>
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
            href="/preview/kiosk"
            onClick={() => playClick()}
            className="pv-lift pv-target mt-3 flex items-center gap-2 rounded-lg border bg-[var(--pv-card)] p-3 text-base font-bold"
            style={{ borderColor: "var(--pv-line)", color: "var(--pv-teal)" }}
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
          <p className="mt-2 text-sm" style={{ color: "var(--pv-muted)" }}>
            Tap any of these to see the screen behind it. The Pay and Sign
            tags are not built yet; the owner already makes the statements,
            parents just have no screen for them.
          </p>
        </section>

        {/* QUIETER STUFF. Photos already show in each kid's feed above; the
            newsletter is a real page, so it links out. */}
        <section className="pv-rise mb-6" style={{ animationDelay: "180ms" }}>
          <Link
            href="/preview/newsletter"
            onClick={() => playClick()}
            className="pv-lift pv-target flex items-center gap-3 rounded-lg border bg-[var(--pv-card)] p-4 shadow-sm"
            style={{ borderColor: "var(--pv-line)" }}
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
          <h2 className="pv-tad-title flex items-center text-xl">
            your family&apos;s details <Tag kind="new" />
          </h2>
          <Card className="mt-3">
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

            <h3 className="pv-tad-label mt-5 flex items-center text-base">
              who can pick up <Tag kind="new" />
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
    <Card>
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
    </Card>
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
      className="pv-lift pv-target rounded-lg border bg-[var(--pv-card)] p-4 text-left shadow-sm"
      style={{ borderColor: "var(--pv-line)" }}
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
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => {
            playClick();
            onBack();
          }}
          className="pv-press pv-target rounded-xl px-3 py-2 text-base font-bold"
          style={{ color: "var(--pv-plum)" }}
        >
          ← Back to home
        </button>
        <h1 className="pv-tad-title mt-2 flex items-center text-3xl">
          <head.Icon size={26} aria-hidden="true" className="mr-2 flex-shrink-0" style={{ color: "var(--pv-coral)" }} />
          {head.title}
          <Tag kind="new" />
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
      <Card>
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
      </Card>
      <p className="mt-3 text-sm" style={{ color: "var(--pv-coral)" }}>
        To build. The owner makes these statements in the office; when she marks
        you paid there, this balance clears. A parent just has no screen yet.
      </p>
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
      <Card>
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
      </Card>
      <p className="mt-3 text-sm" style={{ color: "var(--pv-coral)" }}>
        To build. Your reply here reaches Christina&apos;s office in this demo. In
        the real app that two-way thread is the piece that still needs building.
      </p>
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
            <Card key={form}>
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
            </Card>
          );
        })}
      </div>
      <p className="mt-3 text-sm" style={{ color: "var(--pv-coral)" }}>
        To build. There is no documents or forms table in the real app yet. The
        live Documents page shows fake sample files with buttons that do nothing.
      </p>
    </>
  );
}

function CalendarDetail() {
  return (
    <>
      <div className="flex flex-col gap-3">
        {CENTER_EVENTS.map((ev) => (
          <Card key={ev.id}>
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
          </Card>
        ))}
      </div>
      <p className="mt-3 text-sm" style={{ color: "var(--pv-coral)" }}>
        To build. The live Calendar page is a fixed list of old 2023 dates that
        never change. A real closures list is what a parent needs to plan around.
      </p>
    </>
  );
}

