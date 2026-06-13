"use client";

// The shared PIN kiosk (design exploration section 02).
// Phone-unlock muscle memory: filled dots, shake-and-clear on error.
// Nobody picks a mode. The code decides what happens next:
// staff code, clock in or out. Family code, tap your kids. Office code, office.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BigButton, Card, ScreenHeader, StepNote, SuccessBanner, cx } from "@/components/preview/ui";
import { PhotoUpload } from "@/components/preview/PhotoUpload";
import { roomById } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";
import { useMounted } from "@/components/preview/ui";
import { playClick, playError } from "@/lib/preview/sound";

type Mode =
  | { kind: "pad" }
  | { kind: "staff"; staffId: string }
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

  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<Mode>({ kind: "pad" });
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const activeStaff = mode.kind === "staff" ? staff.find((s) => s.id === mode.staffId) ?? null : null;
  const activeFamily = mode.kind === "family" ? families.find((f) => f.id === mode.familyId) ?? null : null;
  const familyKids = useMemo(
    () => (activeFamily ? kids.filter((k) => activeFamily.kidIds.includes(k.id)) : []),
    [activeFamily, kids],
  );

  function submitPin(value: string) {
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
    const hitFamily = families.find((f) => f.pin === value);
    if (hitFamily) {
      setMode({ kind: "family", familyId: hitFamily.id });
      setPin("");
      return;
    }
    playError();
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setPin("");
    }, 450);
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

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <ScreenHeader
          title="The kiosk"
          emoji="🔢"
          backHref="/preview/door"
          backLabel="Front door"
          note="One pad for everyone. The code decides what happens next."
        />
        <StepNote step={2} text="Try staff code 7321, family code 1234, or office code 9999." />

        {mode.kind === "pad" ? (
          <Card className={cx("mx-auto max-w-md text-center", shake && "pv-shake")}>
            <h2 className="text-2xl">Enter your code</h2>
            <div className="mt-5 flex justify-center gap-4" aria-label={`${pin.length} of 4 digits entered`}>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="h-5 w-5 rounded-full border-2"
                  style={{
                    borderColor: "var(--pv-ink)",
                    backgroundColor: i < pin.length ? "var(--pv-ink)" : "transparent",
                  }}
                />
              ))}
            </div>
            <div className="mx-auto mt-7 grid w-fit grid-cols-3 gap-4">
              {KEYS.map((key, i) =>
                key ? (
                  <button
                    key={`${key}-${i}`}
                    type="button"
                    onClick={() => pressKey(key)}
                    className="pv-press flex h-[72px] w-[72px] items-center justify-center rounded-full text-3xl font-bold"
                    style={{ backgroundColor: "#f4f0e9", color: "var(--pv-ink)" }}
                    aria-label={key === "⌫" ? "Delete a digit" : key}
                  >
                    {key}
                  </button>
                ) : (
                  <span key={`blank-${i}`} className="h-[72px] w-[72px]" />
                ),
              )}
            </div>
          </Card>
        ) : null}

        {mode.kind === "staff" && activeStaff ? (
          <Card className="mx-auto max-w-md text-center">
            {mounted && staffPhotos[activeStaff.id] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={staffPhotos[activeStaff.id]}
                alt={activeStaff.firstName}
                className="mx-auto h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div aria-hidden="true" className="text-6xl">{activeStaff.avatar}</div>
            )}
            <h2 className="mt-3 text-3xl">Hi {activeStaff.firstName}!</h2>
            <p className="mt-2 text-lg" style={{ color: "var(--pv-muted)" }}>
              {mounted && clockedIn[activeStaff.id]
                ? `You clocked in at ${clockedIn[activeStaff.id]}.`
                : "You are not clocked in yet."}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {mounted && clockedIn[activeStaff.id] ? (
                <BigButton
                  kiosk
                  emoji="👋"
                  label="Clock out"
                  color="var(--pv-plum)"
                  onClick={() => {
                    clockOutStaff(activeStaff.id);
                    setSuccess(`Bye ${activeStaff.firstName}. You are clocked out. See you tomorrow!`);
                  }}
                />
              ) : (
                <BigButton
                  kiosk
                  emoji="☀️"
                  label="Clock in"
                  color="var(--pv-teal)"
                  onClick={() => {
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
              <h3 className="text-lg font-extrabold">Your tools</h3>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <Link
                  href="/preview/room"
                  onClick={() => playClick()}
                  className="pv-press pv-kiosk-target flex items-center gap-3 rounded-2xl px-5 py-4 text-lg font-extrabold text-white shadow-md"
                  style={{ backgroundColor: "var(--pv-teal)" }}
                >
                  <span aria-hidden="true" className="text-2xl">📋</span>
                  <span>
                    Log the day
                    <span className="block text-sm font-semibold opacity-90">Any room: meals, naps, photos, notes</span>
                  </span>
                </Link>
                <Link
                  href="/preview/meals"
                  onClick={() => playClick()}
                  className="pv-press pv-kiosk-target flex items-center gap-3 rounded-2xl px-5 py-4 text-lg font-extrabold text-white shadow-md"
                  style={{ backgroundColor: "var(--pv-gold)" }}
                >
                  <span aria-hidden="true" className="text-2xl">🍽️</span>
                  <span>
                    Food counts
                    <span className="block text-sm font-semibold opacity-90">Two taps per child at the table</span>
                  </span>
                </Link>
                <Link
                  href="/preview/schedule"
                  onClick={() => playClick()}
                  className="pv-press pv-kiosk-target flex items-center gap-3 rounded-2xl px-5 py-4 text-lg font-extrabold text-white shadow-md"
                  style={{ backgroundColor: "var(--pv-sky)" }}
                >
                  <span aria-hidden="true" className="text-2xl">📅</span>
                  <span>
                    Your week
                    <span className="block text-sm font-semibold opacity-90">See your shifts</span>
                  </span>
                </Link>
              </div>
            </div>
            <div className="mt-6">
              <BigButton emoji="✅" label="Done" color="#8a8378" onClick={backToPad} className="w-full text-center" />
            </div>
          </Card>
        ) : null}

        {mode.kind === "family" && activeFamily ? (
          <Card className="mx-auto max-w-lg">
            <div className="text-center">
              <div aria-hidden="true" className="text-5xl">{activeFamily.avatar}</div>
              <h2 className="mt-2 text-3xl">{activeFamily.name}</h2>
              <p className="mt-1 text-lg" style={{ color: "var(--pv-muted)" }}>
                Tap a child to check them in or out.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {familyKids.map((kid) => {
                const inAt = mounted ? checkedIn[kid.id] : null;
                const photo = mounted ? kidPhotos[kid.id] : undefined;
                const room = roomById(kid.roomId);
                return (
                  <div
                    key={kid.id}
                    className="rounded-2xl border-2 p-4 text-center"
                    style={{
                      borderColor: inAt ? "var(--pv-teal)" : "var(--pv-line)",
                      backgroundColor: inAt ? "#e7f4f2" : "var(--pv-card)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
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
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt={kid.firstName} className="mx-auto h-20 w-20 rounded-2xl object-cover" />
                      ) : (
                        <span aria-hidden="true" className="block text-5xl">{kid.avatar}</span>
                      )}
                      <span className="mt-2 block text-xl font-extrabold">{kid.firstName}</span>
                      <span className="block text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
                        {room ? `${room.emoji} ${room.name}` : ""}
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
              <BigButton emoji="✅" label="Done" color="var(--pv-plum)" onClick={backToPad} className="w-full text-center" />
            </div>
          </Card>
        ) : null}
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
