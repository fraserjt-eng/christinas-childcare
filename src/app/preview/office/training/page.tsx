"use client";

// The office training screen (director view). A simple at-a-glance of where
// each staff member is on their required training. Maps to the existing
// employee_training records in the real app.

import { ScreenHeader, StepNote, Card } from "@/components/preview/ui";
import { usePreviewStore } from "@/lib/preview/store";

// Demo training status per staff id. Real app: employee_training table.
const TRAINING: Record<string, { label: string; level: "done" | "due" | "progress" }> = {
  "st-dana": { label: "All current", level: "done" },
  "st-maria": { label: "All current", level: "done" },
  "st-tasha": { label: "CPR renewal due", level: "due" },
  "st-keisha": { label: "Infant safety in progress", level: "progress" },
  "st-marcus": { label: "All current", level: "done" },
};

const LOOK: Record<string, { bg: string; text: string }> = {
  done: { bg: "var(--pv-teal)", text: "Up to date" },
  due: { bg: "var(--pv-coral)", text: "Action needed" },
  progress: { bg: "var(--pv-gold)", text: "In progress" },
};

export default function OfficeTrainingPage() {
  const staff = usePreviewStore((s) => s.staff);
  const teachers = staff.filter((s) => s.role === "teacher");

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <ScreenHeader
          title="Training"
          emoji="🎓"
          backHref="/preview/office"
          backLabel="The office"
          note="Where each teacher is on their required training."
        />
        <StepNote step={9} text="A glance tells you who is current and who needs a renewal." />

        <div className="flex flex-col gap-3">
          {teachers.map((t) => {
            const status = TRAINING[t.id] ?? { label: "All current", level: "done" as const };
            const look = LOOK[status.level];
            return (
              <Card key={t.id}>
                <div className="flex flex-wrap items-center gap-3">
                  <span aria-hidden="true" className="text-3xl">{t.avatar}</span>
                  <div className="flex-1">
                    <p className="text-lg font-extrabold">{t.firstName} {t.lastName}</p>
                    <p className="text-sm" style={{ color: "var(--pv-muted)" }}>{status.label}</p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-sm font-extrabold text-white"
                    style={{ backgroundColor: look.bg }}
                  >
                    {look.text}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        <p className="mt-4 text-sm" style={{ color: "var(--pv-coral)" }}>
          To build. The real app already tracks training records; this is the
          one-glance view for the office.
        </p>
      </div>
    </main>
  );
}
