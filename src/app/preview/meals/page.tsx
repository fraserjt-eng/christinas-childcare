"use client";

// Two-tap food counts (design study 05, KidKare pattern).
// One row per child, three chips, done at the table.
// Marks live in the shared store, so the rest of the preview sees them too.

import { useEffect, useRef, useState } from "react";
import { Armchair, Check, ShieldAlert } from "lucide-react";
import { Chip, EmptyState, useMounted } from "@/components/preview/ui";
import { PhotoAvatar } from "@/components/preview/PhotoAvatar";
import { AvatarUpload } from "@/components/preview/AvatarUpload";
import { BackHome } from "@/components/preview/BackHome";
import { type MealMark } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";

const MEAL_NAMES = ["Breakfast", "Morning snack", "Lunch", "Afternoon snack"];

const MARK_CHOICES: Array<{ value: MealMark; label: string; color: string }> = [
  { value: "ate", label: "Ate", color: "var(--pv-teal)" },
  { value: "some", label: "Some", color: "var(--pv-gold)" },
  { value: "none", label: "None", color: "var(--pv-plum)" },
];

export default function MealsPage() {
  const mounted = useMounted();
  const rooms = usePreviewStore((s) => s.rooms);
  const kids = usePreviewStore((s) => s.kids);
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const meals = usePreviewStore((s) => s.meals);
  const setMealMark = usePreviewStore((s) => s.setMealMark);
  const kidPhotos = usePreviewStore((s) => s.kidPhotos);
  const setKidPhoto = usePreviewStore((s) => s.setKidPhoto);

  const [roomId, setRoomId] = useState("toddlers");
  const [meal, setMeal] = useState("Lunch");
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const roomName = rooms.find((r) => r.id === roomId)?.name ?? "Room";
  const presentKids = mounted
    ? kids.filter((k) => k.roomId === roomId && checkedIn[k.id])
    : [];
  const mealKey = `${roomId}|${meal}`;
  const marks = mounted ? meals[mealKey] ?? {} : {};

  function markKid(kidId: string, mark: MealMark) {
    setMealMark(roomId, meal, kidId, mark);
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="pv-portal-bg min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <BackHome />
        {/* Branded header: the real screen title (center identity now lives in
            the global watermark behind the content). */}
        <header className="pv-rise mb-6">
          <h1 className="pv-tad-title text-3xl sm:text-4xl">Food counts</h1>
          <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
            One row per child. Two taps max. Done at the table.
          </p>
        </header>

        {/* Room picker maps rooms from the store (seeded from fixtures in demo
            mode, replaced with the center's real classrooms when signed in).
            Never hardcode rooms here: a new room shows up with no code change. */}
        <div className="pv-rise flex flex-wrap gap-2" style={{ animationDelay: "60ms" }}>
          {rooms.map((r) => (
            <Chip
              key={r.id}
              label={r.name}
              on={r.id === roomId}
              onClick={() => setRoomId(r.id)}
              onColor={r.color}
            />
          ))}
        </div>
        <div className="pv-rise mt-3 flex flex-wrap gap-2" style={{ animationDelay: "120ms" }}>
          {MEAL_NAMES.map((m) => (
            <Chip key={m} label={m} on={m === meal} onClick={() => setMeal(m)} />
          ))}
        </div>

        <div className="pv-rise mt-5" style={{ animationDelay: "180ms" }}>
        <div className="pv-tile p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="pv-tad-title text-2xl">
              {meal}, {roomName}
            </h2>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
              style={{
                backgroundColor: "color-mix(in srgb, var(--pv-teal) 12%, #fff)",
                color: "var(--pv-teal)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--pv-teal)" }}
                aria-hidden="true"
              />
              {presentKids.length} here now
            </span>
            {saved ? (
              <span
                role="status"
                className="inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: "var(--pv-teal)" }}
              >
                <Check size={14} aria-hidden="true" /> Saved
              </span>
            ) : null}
          </div>

          {!mounted ? null : presentKids.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                icon={Armchair}
                title="Nobody is here yet"
                detail="Check kids in at the kiosk and they appear on this roster."
              />
            </div>
          ) : (
            <ul className="mt-4">
              {presentKids.map((kid) => (
                <li
                  key={kid.id}
                  className="border-t py-3 first:border-t-0 first:pt-1 last:pb-1"
                  style={{ borderColor: "var(--pv-line)" }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="relative flex-shrink-0">
                        <PhotoAvatar
                          id={kid.id}
                          name={`${kid.firstName} ${kid.lastName}`}
                          src={kidPhotos[kid.id]}
                          size={44}
                          rounded="rounded-md"
                        />
                        <AvatarUpload
                          label={`Upload a photo for ${kid.firstName}`}
                          onPhoto={(d) => setKidPhoto(kid.id, d)}
                          className="absolute -bottom-1 -right-1"
                        />
                      </span>
                      <span className="min-w-[90px] text-lg font-bold">{kid.firstName}</span>
                      {/* Allergy badge is data-driven from kid.allergy, so
                          Luca Garcia (Infants, Dairy) shows it once checked in. */}
                      {kid.allergy ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold"
                          style={{
                            backgroundColor: "color-mix(in srgb, var(--pv-red-bad) 12%, #fff)",
                            color: "var(--pv-red-bad)",
                          }}
                        >
                          <ShieldAlert size={14} aria-hidden="true" /> {kid.allergy}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {MARK_CHOICES.map((choice) => (
                        <Chip
                          key={choice.value}
                          label={choice.label}
                          on={marks[kid.id] === choice.value}
                          onClick={() => markKid(kid.id, choice.value)}
                          onColor={choice.color}
                        />
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        </div>

        <p className="mt-5 text-base" style={{ color: "var(--pv-muted)" }}>
          The CACFP paperwork math runs in the background after you tap. It never gets in your way
          at the table.
        </p>
      </div>
    </main>
  );
}
