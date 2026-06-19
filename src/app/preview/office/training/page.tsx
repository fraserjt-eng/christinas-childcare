"use client";

// The office training screen (director view). A simple at-a-glance of where
// each staff member is on their required training. Maps to the existing
// employee_training records in the real app.

import { CheckCircle2, Clock, type LucideIcon, AlertCircle } from "lucide-react";
import { ScreenHeader, StepNote, Card } from "@/components/preview/ui";
import { PhotoAvatar } from "@/components/preview/PhotoAvatar";
import { AvatarUpload } from "@/components/preview/AvatarUpload";
import { usePreviewStore } from "@/lib/preview/store";

// Demo training status per staff id. Real app: employee_training table.
const TRAINING: Record<string, { label: string; level: "done" | "due" | "progress" }> = {
  "st-dana": { label: "All current", level: "done" },
  "st-maria": { label: "All current", level: "done" },
  "st-tasha": { label: "CPR renewal due", level: "due" },
  "st-keisha": { label: "Infant safety in progress", level: "progress" },
  "st-marcus": { label: "All current", level: "done" },
};

// A restrained chip: a soft tinted background with a colored icon + colored
// label, instead of a saturated full fill. Christina-red carries the one item
// that needs action; the others stay muted.
const LOOK: Record<string, { color: string; text: string; icon: LucideIcon }> = {
  done: { color: "var(--pv-teal)", text: "Up to date", icon: CheckCircle2 },
  due: { color: "var(--pv-coral)", text: "Action needed", icon: AlertCircle },
  progress: { color: "var(--pv-gold)", text: "In progress", icon: Clock },
};

export default function OfficeTrainingPage() {
  const staff = usePreviewStore((s) => s.staff);
  const staffPhotos = usePreviewStore((s) => s.staffPhotos);
  const setStaffPhoto = usePreviewStore((s) => s.setStaffPhoto);
  const teachers = staff.filter((s) => s.role === "teacher");

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <ScreenHeader
          title="training"
          backHref="/preview/office"
          backLabel="the office"
          note="Where each teacher is on their required training."
        />
        <div className="pv-rise" style={{ animationDelay: "60ms" }}>
          <StepNote step={9} text="A glance tells you who is current and who needs a renewal." />
        </div>

        <div className="flex flex-col gap-3">
          {teachers.map((t, i) => {
            const status = TRAINING[t.id] ?? { label: "All current", level: "done" as const };
            const look = LOOK[status.level];
            const StatusIcon = look.icon;
            return (
              <div key={t.id} className="pv-rise" style={{ animationDelay: `${120 + i * 60}ms` }}>
              <Card>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="relative flex-shrink-0">
                    <PhotoAvatar
                      id={t.id}
                      name={`${t.firstName} ${t.lastName}`}
                      src={staffPhotos[t.id]}
                      size={48}
                      rounded="rounded-md"
                    />
                    <AvatarUpload
                      label={`Upload a photo for ${t.firstName} ${t.lastName}`}
                      onPhoto={(d) => setStaffPhoto(t.id, d)}
                      className="absolute -bottom-1 -right-1"
                    />
                  </span>
                  <div className="flex-1">
                    <p className="text-base font-semibold" style={{ color: "var(--pv-ink)" }}>
                      {t.firstName} {t.lastName}
                    </p>
                    <p className="text-sm" style={{ color: "var(--pv-muted)" }}>{status.label}</p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-semibold"
                    style={{
                      color: look.color,
                      backgroundColor: "color-mix(in srgb, var(--pv-card) 88%, currentColor)",
                      borderColor: "color-mix(in srgb, var(--pv-line) 70%, currentColor)",
                    }}
                  >
                    <StatusIcon size={14} aria-hidden="true" style={{ color: look.color }} />
                    {look.text}
                  </span>
                </div>
              </Card>
              </div>
            );
          })}
        </div>

        <p className="pv-rise mt-4 text-sm" style={{ color: "var(--pv-muted)", animationDelay: "240ms" }}>
          To build. The real app already tracks training records; this is the
          one-glance view for the office.
        </p>
      </div>
    </main>
  );
}
