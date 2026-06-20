"use client";

// The shared PIN kiosk (design exploration section 02).
// Phone-unlock muscle memory: filled dots, shake-and-clear on error.
// Nobody picks a mode. The code decides what happens next:
// staff code, clock in or out. Family code, tap your kids. Office code, office.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Backpack,
  Baby,
  Blocks,
  Calendar,
  Check,
  ChevronRight,
  ClipboardList,
  Delete,
  Hand,
  KeyRound,
  type LucideIcon,
  Palette,
  Sun,
  Utensils,
} from "lucide-react";
import { BigButton, SuccessBanner, cx } from "@/components/preview/ui";
import { PhotoUpload } from "@/components/preview/PhotoUpload";
import { PhotoAvatar } from "@/components/preview/PhotoAvatar";
import { PrivacyNotice, SeeStaffScreen } from "@/components/kiosk/PrivacyNotice";
import { roomById } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";
import { useMounted } from "@/components/preview/ui";
import { playClick, playError } from "@/lib/preview/sound";

const ROOM_ICON: Record<string, LucideIcon> = {
  infants: Baby,
  toddlers: Blocks,
  preschool: Palette,
  schoolage: Backpack,
};

type Mode =
  | { kind: "pad" }
  | { kind: "staff"; staffId: string }
  // MN DCYF gate: a resolved family must clear the privacy notice before the
  // check-in screen. "privacy" shows the notice; "seeStaff" is the decline path.
  | { kind: "privacy"; familyId: string }
  | { kind: "seeStaff" }
  | { kind: "family"; familyId: string };

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function KioskPage() {
  const router = useRouter();
  const mounted = useMounted();
  const staff = usePreviewStore((s) => s.staff);
  const families = usePreviewStore((s) => s.families);
  const kids = usePreviewStore((s) => s.kids);
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const clockedIn = usePreviewStore((s) => s.clockedIn);
  const checkInKid = usePreviewStore((s) => s.checkInKid);
  const checkOutKid = usePreviewStore((s) => s.checkOutKid);
  const clockInStaff = usePreviewStore((s) => s.clockInStaff);
  const clockOutStaff = usePreviewStore((s) => s.clockOutStaff);
  const setKidPhoto = usePreviewStore((s) => s.setKidPhoto);
  const logEvent = usePreviewStore((s) => s.logEvent);
  const kidPhotos = usePreviewStore((s) => s.kidPhotos);
  const staffPhotos = usePreviewStore((s) => s.staffPhotos);
  const setStaffPhoto = usePreviewStore((s) => s.setStaffPhoto);
  const centerId = usePreviewStore((s) => s.centerId);

  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<Mode>({ kind: "pad" });
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const activeStaff = mode.kind === "staff" ? staff.find((s) => s.id === mode.staffId) ?? null : null;
  const activeFamily = mode.kind === "family" ? families.find((f) => f.id === mode.familyId) ?? null : null;
  const privacyFamily = mode.kind === "privacy" ? families.find((f) => f.id === mode.familyId) ?? null : null;
  const familyKids = useMemo(
    () => (activeFamily ? kids.filter((k) => activeFamily.kidIds.includes(k.id)) : []),
    [activeFamily, kids],
  );

  function failPin() {
    playError();
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setPin("");
    }, 450);
  }

  async function submitPin(value: string) {
    // Staff codes match this center's staff (the store carries them).
    const hitStaff = staff.find((s) => s.pin === value);
    if (hitStaff) {
      if (hitStaff.role === "owner") {
        router.push("/preview/office");
        return;
      }
      setMode({ kind: "staff", staffId: hitStaff.id });
      setPin("");
      return;
    }
    // Family codes are validated SERVER-SIDE (the PIN is never matched in the
    // browser): the secure /api/kiosk route checks it against this center and
    // returns the family id. We then render that family from the loaded data.
    try {
      const res = await fetch("/api/kiosk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "lookup", pin: value, centerId }),
      });
      const json = await res.json().catch(() => null);
      const famId = json?.data?.id as string | undefined;
      if (famId && families.some((f) => f.id === famId)) {
        setPin("");
        // MN DCYF gate: before check-in is possible, confirm the family's
        // privacy-notice agreement is current. If not, route to the notice;
        // they cannot reach the check-in screen until they agree.
        const current = await checkAttestation(famId);
        setMode(current ? { kind: "family", familyId: famId } : { kind: "privacy", familyId: famId });
        return;
      }
    } catch {
      /* fall through to the error shake */
    }
    failPin();
  }

  // Is this family's privacy-notice agreement current for this center? Mirrors
  // the live kiosk: /api/kiosk 'attest_status' returns { data: { current } }.
  // Fail closed (treat as not current) on any error, so the notice is shown.
  async function checkAttestation(familyId: string): Promise<boolean> {
    try {
      const res = await fetch("/api/kiosk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "attest_status", familyId, centerId }),
      });
      const json = await res.json().catch(() => null);
      return Boolean(json?.data?.current);
    } catch {
      return false;
    }
  }

  // Record the family's agreement, then proceed to the check-in screen.
  async function recordAttestation(familyId: string, agreedName: string) {
    try {
      await fetch("/api/kiosk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "record_attestation", familyId, agreedName, centerId }),
      });
    } catch {
      /* best effort; still let them through this session */
    }
    setMode({ kind: "family", familyId });
  }

  function pressKey(key: string) {
    playClick();
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (!key) return;
    const next = (pin + key).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => submitPin(next), 120);
    }
  }

  function backToPad() {
    setMode({ kind: "pad" });
    setPin("");
  }

  // MN DCYF privacy-notice gate (full-screen, reuses the live kiosk component so
  // the notice text is never duplicated). Shown after a family is resolved and
  // before check-in is possible; decline routes to the see-staff screen.
  if (mode.kind === "privacy" && privacyFamily) {
    const familyId = mode.familyId;
    return (
      <PrivacyNotice
        familyName={privacyFamily.name}
        onAgree={() => recordAttestation(familyId, privacyFamily.name)}
        onDecline={() => setMode({ kind: "seeStaff" })}
      />
    );
  }

  if (mode.kind === "seeStaff") {
    return <SeeStaffScreen onDone={backToPad} />;
  }

  return (
    <main className="pv-portal-bg min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <header className="pv-rise mb-8 text-center" style={{ animationDelay: "30ms" }}>
          <h1 className="pv-tad-title text-4xl sm:text-5xl">Christina&apos;s Child Care</h1>
          <p className="mt-3 text-lg font-semibold" style={{ color: "var(--pv-muted)" }}>
            One pad for everyone. The code decides what happens next.
          </p>
        </header>

        {mode.kind === "pad" ? (
          <div className="pv-rise" style={{ animationDelay: "60ms" }}>
          <div className={cx("pv-tile mx-auto max-w-md p-7 text-center sm:p-8", shake && "pv-shake")}>
            <span
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "color-mix(in srgb, var(--pv-coral) 12%, white)" }}
              aria-hidden="true"
            >
              <KeyRound size={26} style={{ color: "var(--pv-coral)" }} />
            </span>
            <h2 className="pv-tad-title mt-4 text-3xl">Enter your code</h2>
            <div className="mt-6 flex justify-center gap-4" aria-label={`${pin.length} of 4 digits entered`}>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="h-5 w-5 rounded-full border-2"
                  style={{
                    borderColor: "var(--pv-coral)",
                    backgroundColor: i < pin.length ? "var(--pv-coral)" : "transparent",
                  }}
                />
              ))}
            </div>
            <div className="mx-auto mt-8 grid w-fit grid-cols-3 gap-4">
              {KEYS.map((key, i) =>
                key ? (
                  <button
                    key={`${key}-${i}`}
                    type="button"
                    onClick={() => pressKey(key)}
                    className="pv-press flex h-[76px] w-[76px] items-center justify-center rounded-2xl border text-3xl font-semibold"
                    style={{ backgroundColor: "#fbfaf8", borderColor: "var(--pv-line)", color: "var(--pv-ink)" }}
                    aria-label={key === "⌫" ? "Delete a digit" : key}
                  >
                    {key === "⌫" ? <Delete size={28} aria-hidden="true" /> : key}
                  </button>
                ) : (
                  <span key={`blank-${i}`} className="h-[76px] w-[76px]" />
                ),
              )}
            </div>
          </div>
          </div>
        ) : null}

        {mode.kind === "staff" && activeStaff ? (
          <div className="pv-rise" style={{ animationDelay: "60ms" }}>
          <div className="pv-tile mx-auto max-w-md p-6 text-center sm:p-7">
            <span className="inline-block">
              <PhotoAvatar
                id={activeStaff.id}
                name={`${activeStaff.firstName} ${activeStaff.lastName}`}
                src={mounted ? staffPhotos[activeStaff.id] : undefined}
                size={96}
                rounded="rounded-2xl"
              />
            </span>
            <h2 className="pv-tad-title mt-3 text-3xl">Hi {activeStaff.firstName}!</h2>
            <p className="mt-2 text-lg" style={{ color: "var(--pv-muted)" }}>
              {mounted && clockedIn[activeStaff.id]
                ? `You clocked in at ${clockedIn[activeStaff.id]}.`
                : "You are not clocked in yet."}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {mounted && clockedIn[activeStaff.id] ? (
                <BigButton
                  kiosk
                  icon={Hand}
                  label="Clock out"
                  color="var(--pv-plum)"
                  onClick={() => {
                    fetch("/api/kiosk", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "clockout", employeeId: activeStaff.id, centerId }),
                    }).catch(() => {});
                    clockOutStaff(activeStaff.id);
                    setSuccess(`Bye ${activeStaff.firstName}. You are clocked out. See you tomorrow!`);
                  }}
                />
              ) : (
                <BigButton
                  kiosk
                  icon={Sun}
                  label="Clock in"
                  color="var(--pv-teal)"
                  onClick={() => {
                    fetch("/api/kiosk", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "clockin", employeeId: activeStaff.id, centerId }),
                    }).catch(() => {});
                    clockInStaff(activeStaff.id);
                    setSuccess(`Hi ${activeStaff.firstName}. You are clocked in. Have a great day!`);
                  }}
                />
              )}
            </div>
            <div className="mt-4">
              <PhotoUpload
                label={mounted && staffPhotos[activeStaff.id] ? "Change your photo" : "Add your photo"}
                capture
                color="var(--pv-sky)"
                className="w-full text-center"
                onPhoto={(url) => {
                  setStaffPhoto(activeStaff.id, url);
                  setSuccess(`Photo saved, ${activeStaff.firstName}.`);
                }}
              />
            </div>
            <div className="mt-7 text-left">
              <h3 className="pv-tad-label text-base">Your tools</h3>
              <div className="mt-3 grid grid-cols-1 gap-3">
                {[
                  {
                    href: "/preview/room",
                    icon: ClipboardList,
                    title: "Log the day",
                    sub: "Any room: meals, naps, photos, notes",
                    color: "var(--pv-teal)",
                    tint: "rgba(0,150,136,0.12)",
                  },
                  {
                    href: "/preview/meals",
                    icon: Utensils,
                    title: "Food counts",
                    sub: "Two taps per child at the table",
                    color: "var(--pv-gold)",
                    tint: "rgba(255,179,0,0.14)",
                  },
                  {
                    href: "/preview/schedule",
                    icon: Calendar,
                    title: "Your week",
                    sub: "See your shifts",
                    color: "var(--pv-sky)",
                    tint: "rgba(3,155,229,0.12)",
                  },
                ].map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => playClick()}
                      className="pv-lift pv-kiosk-target flex items-center gap-3 rounded-lg border bg-white px-5 py-4 shadow-sm"
                      style={{ borderColor: "var(--pv-line)" }}
                    >
                      <span
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: tool.tint }}
                        aria-hidden="true"
                      >
                        <ToolIcon size={24} style={{ color: tool.color }} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-lg font-bold" style={{ color: "var(--pv-ink)" }}>
                          {tool.title}
                        </span>
                        <span className="block text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
                          {tool.sub}
                        </span>
                      </span>
                      <ChevronRight size={20} aria-hidden="true" style={{ color: "var(--pv-muted)" }} className="flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="mt-6">
              <BigButton icon={Check} label="Done" color="#8a8378" onClick={backToPad} className="w-full text-center" />
            </div>
          </div>
          </div>
        ) : null}

        {mode.kind === "family" && activeFamily ? (
          <div className="pv-rise" style={{ animationDelay: "60ms" }}>
          <div className="pv-tile mx-auto max-w-lg p-6 sm:p-7">
            <div className="text-center">
              <span className="inline-block">
                <PhotoAvatar id={activeFamily.id} name={activeFamily.name} size={80} rounded="rounded-2xl" />
              </span>
              <h2 className="pv-tad-title mt-2 text-3xl">{activeFamily.name}</h2>
              <p className="mt-1 text-lg" style={{ color: "var(--pv-muted)" }}>
                Tap a child to check them in or out.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {familyKids.map((kid) => {
                const inAt = mounted ? checkedIn[kid.id] : null;
                const photo = mounted ? kidPhotos[kid.id] : undefined;
                const room = roomById(kid.roomId);
                const RoomIcon = ROOM_ICON[kid.roomId] ?? Baby;
                return (
                  <div
                    key={kid.id}
                    className="pv-lift rounded-lg border p-4 text-center"
                    style={{
                      borderColor: inAt ? "var(--pv-teal)" : "var(--pv-line)",
                      backgroundColor: inAt ? "#e7f4f2" : "var(--pv-card)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        const action = inAt ? "checkout" : "checkin";
                        // Persist to the real attendance table, center-scoped.
                        fetch("/api/kiosk", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action,
                            childId: kid.id,
                            childName: `${kid.firstName} ${kid.lastName}`.trim(),
                            familyId: activeFamily.id,
                            centerId,
                          }),
                        }).catch(() => {});
                        if (inAt) {
                          checkOutKid(kid.id, activeFamily.name);
                          setSuccess(`${kid.firstName} is checked out. See you tomorrow!`);
                        } else {
                          checkInKid(kid.id, activeFamily.name);
                          setSuccess(`${kid.firstName} is checked in. Have a great day!`);
                        }
                      }}
                      className="pv-press pv-kiosk-target w-full"
                    >
                      <span className="block">
                        <PhotoAvatar
                          id={kid.id}
                          name={`${kid.firstName} ${kid.lastName}`}
                          src={photo}
                          size={80}
                          rounded="rounded-lg"
                          className={cx("mx-auto", inAt ? "" : "opacity-75 grayscale")}
                        />
                      </span>
                      <span className="mt-2 block text-xl font-bold">{kid.firstName}</span>
                      <span className="flex items-center justify-center gap-1 text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
                        {room ? (
                          <>
                            <RoomIcon size={13} aria-hidden="true" style={{ color: room.color }} /> {room.name}
                          </>
                        ) : null}
                      </span>
                      <span
                        className="mt-2 inline-block rounded-full px-3 py-1 text-sm font-bold text-white"
                        style={{ backgroundColor: inAt ? "var(--pv-teal)" : "#8a8378" }}
                      >
                        {inAt ? `Here since ${inAt}` : "Not here yet"}
                      </span>
                    </button>
                    <div className="mt-3">
                      <PhotoUpload
                        label="Add a drop-off photo"
                        capture
                        color="var(--pv-sky)"
                        className="w-full text-center"
                        onPhoto={(url) => {
                          setKidPhoto(kid.id, url);
                          logEvent({
                            kind: "photo",
                            roomId: kid.roomId,
                            kidIds: [kid.id],
                            title: "Photo",
                            detail: "Drop-off photo",
                            photoUrl: url,
                          });
                          setSuccess(`Photo added for ${kid.firstName}. Family will see it.`);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6">
              <BigButton icon={Check} label="Done" color="var(--pv-plum)" onClick={backToPad} className="w-full text-center" />
            </div>
          </div>
          </div>
        ) : null}
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
