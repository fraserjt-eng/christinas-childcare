"use client";

// Two-tap food counts (design study 05, KidKare pattern).
// One row per child, three chips, done at the table.
// Marks live in the shared store, so the rest of the preview sees them too.

import { useEffect, useRef, useState } from "react";
import { Card, Chip, EmptyState, ScreenHeader, StepNote, useMounted } from "@/components/preview/ui";
import { ROOMS, type MealMark } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";

const MEAL_NAMES = ["Breakfast", "Morning snack", "Lunch", "Afternoon snack"];

const MARK_CHOICES: Array<{ value: MealMark; label: string; color: string }> = [
  { value: "ate", label: "Ate", color: "var(--pv-teal)" },
  { value: "some", label: "Some", color: "var(--pv-gold)" },
  { value: "none", label: "None", color: "var(--pv-plum)" },
];

export default function MealsPage() {
  const mounted = useMounted();
  const kids = usePreviewStore((s) => s.kids);
  const checkedIn = usePreviewStore((s) => s.checkedIn);
  const meals = usePreviewStore((s) => s.meals);
  const setMealMark = usePreviewStore((s) => s.setMealMark);

  const [roomId, setRoomId] = useState("toddlers");
  const [meal, setMeal] = useState("Lunch");
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const roomName = ROOMS.find((r) => r.id === roomId)?.name ?? "Room";
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
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <ScreenHeader
          title="Food counts"
          emoji="🍽️"
          note="One row per child. Two taps max. Done at the table."
        />
        <StepNote step={6} text="Pick a room and a meal, then tap one chip per child." />

        {/* Room picker maps ROOMS from fixtures. Never hardcode rooms here:
            a fifth room added to fixtures shows up with no code change. */}
        <div className="flex flex-wrap gap-2">
          {ROOMS.map((r) => (
            <Chip
              key={r.id}
              label={`${r.emoji} ${r.name}`}
              on={r.id === roomId}
              onClick={() => setRoomId(r.id)}
              onColor={r.color}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {MEAL_NAMES.map((m) => (
            <Chip key={m} label={m} on={m === meal} onClick={() => setMeal(m)} />
          ))}
        </div>

        <Card className="mt-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl">
              {meal}, {roomName}
            </h2>
            <span
              className="rounded-full px-3 py-1 text-sm font-bold text-white"
              style={{ backgroundColor: "var(--pv-teal)" }}
            >
              {presentKids.length} here now
            </span>
            {saved ? (
              <span role="status" className="text-sm font-bold" style={{ color: "var(--pv-teal)" }}>
                Saved ✓
              </span>
            ) : null}
          </div>

          {!mounted ? null : presentKids.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                emoji="🪑"
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
                      <span aria-hidden="true" className="text-3xl">
                        {kid.avatar}
                      </span>
                      <span className="min-w-[90px] text-lg font-bold">{kid.firstName}</span>
                      {/* Allergy badge is data-driven from kid.allergy, so
                          Luca Garcia (Infants, Dairy) shows it once checked in. */}
                      {kid.allergy ? (
                        <span
                          className="rounded-full px-3 py-1 text-sm font-bold text-white"
                          style={{ backgroundColor: "var(--pv-red-bad)" }}
                        >
                          ⚠️ {kid.allergy}
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
        </Card>

        <p className="mt-5 text-base" style={{ color: "var(--pv-muted)" }}>
          The CACFP paperwork math runs in the background after you tap. It never gets in your way
          at the table.
        </p>
      </div>
    </main>
  );
}
