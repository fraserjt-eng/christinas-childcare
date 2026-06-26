"use client";

// The office billing screen (director view). Christina sees every family's
// balance, the total outstanding, and can mark a family paid or send a
// statement. Marking paid writes to the shared store, so that family's phone
// shows Paid up the next time they look. Maps to family_statements in the
// real app (the owner already makes these; this gives her the screen).

import { useState } from "react";
import { CheckCircle2, DollarSign, Mail, Users } from "lucide-react";
import { Card, ScreenHeader, StepNote, SuccessBanner } from "@/components/preview/ui";
import { PhotoAvatar } from "@/components/preview/PhotoAvatar";
import { FAMILIES } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";
import { useMounted } from "@/components/preview/ui";
import { playClick } from "@/lib/preview/sound";

export default function OfficeBillingPage() {
  const mounted = useMounted();
  const balances = usePreviewStore((s) => s.balances);
  const markFamilyPaid = usePreviewStore((s) => s.markFamilyPaid);
  const [success, setSuccess] = useState<string | null>(null);

  const rows = FAMILIES.map((f) => ({
    family: f,
    owed: mounted ? balances[f.id] ?? f.balanceOwed : f.balanceOwed,
  }));
  const totalOwed = mounted ? rows.reduce((sum, r) => sum + r.owed, 0) : 0;
  const pastDueCount = mounted ? rows.filter((r) => r.owed > 0).length : 0;

  // Live site: this screen is a design preview built on sample families, and
  // real billing is not built yet. Never show fake families on production.
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return (
      <main className="px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <ScreenHeader
            title="billing"
            backHref="/preview/office"
            backLabel="The office"
            note="Family billing is being built."
          />
          <p className="pv-rise mt-4 text-base" style={{ color: "var(--pv-muted)" }}>
            Real billing isn&rsquo;t live yet. When it is, every family&rsquo;s
            balance will show here. For now, statements live in the back office.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <ScreenHeader
          title="billing"
          backHref="/preview/office"
          backLabel="The office"
          note="Who owes what, at a glance. Mark a family paid and their phone updates."
        />
        <div className="pv-rise">
          <StepNote step={9} text="Mark the Williams family paid, then open their phone to see it clear." />
        </div>

        <div className="pv-rise grid grid-cols-2 gap-3" style={{ animationDelay: "60ms" }}>
          <Card>
            <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-md"
                style={{ backgroundColor: "color-mix(in srgb, var(--pv-coral) 12%, transparent)" }}
                aria-hidden="true"
              >
                <DollarSign size={15} style={{ color: "var(--pv-coral)" }} />
              </span>
              Outstanding
            </p>
            <p className="mt-1 text-3xl font-bold" style={{ color: totalOwed > 0 ? "var(--pv-coral)" : "var(--pv-teal)" }}>
              ${totalOwed}
            </p>
          </Card>
          <Card>
            <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-md"
                style={{ backgroundColor: "color-mix(in srgb, var(--pv-sky) 14%, transparent)" }}
                aria-hidden="true"
              >
                <Users size={15} style={{ color: "var(--pv-sky)" }} />
              </span>
              Families with a balance
            </p>
            <p className="mt-1 text-3xl font-bold" style={{ color: "var(--pv-ink)" }}>{pastDueCount}</p>
          </Card>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {rows.map(({ family, owed }, i) => (
            <div key={family.id} className="pv-rise" style={{ animationDelay: `${120 + Math.min(i, 6) * 40}ms` }}>
            <Card>
              <div className="flex flex-wrap items-center gap-3">
                <PhotoAvatar id={family.id} name={family.name} size={48} rounded="rounded-md" />
                <div className="flex-1">
                  <p className="text-lg font-bold" style={{ color: "var(--pv-ink)" }}>{family.name}</p>
                  <p className="text-sm" style={{ color: "var(--pv-muted)" }}>
                    {owed > 0 ? family.balanceDueLabel : "Paid up"}
                  </p>
                </div>
                {owed > 0 ? (
                  <span
                    className="inline-flex items-center rounded-md px-2.5 py-1 text-base font-bold"
                    style={{
                      color: "var(--pv-coral)",
                      backgroundColor: "color-mix(in srgb, var(--pv-coral) 12%, transparent)",
                    }}
                  >
                    ${owed}
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-bold"
                    style={{
                      color: "var(--pv-teal)",
                      backgroundColor: "color-mix(in srgb, var(--pv-teal) 12%, transparent)",
                    }}
                  >
                    <CheckCircle2 size={14} aria-hidden="true" />
                    Paid
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setSuccess(`Statement sent to the ${family.name}. In the real app this emails them.`);
                  }}
                  className="pv-press pv-target inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-base font-bold shadow-sm"
                  style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)", color: "var(--pv-ink)" }}
                >
                  <Mail size={16} style={{ color: "var(--pv-sky)" }} aria-hidden="true" />
                  Send statement
                </button>
                {owed > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      markFamilyPaid(family.id);
                      setSuccess(`Marked the ${family.name} paid. Their phone shows Paid up now.`);
                    }}
                    className="pv-press pv-target inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-base font-bold text-white shadow-sm"
                    style={{ backgroundColor: "var(--pv-coral)" }}
                  >
                    <CheckCircle2 size={16} aria-hidden="true" />
                    Mark paid
                  </button>
                ) : null}
              </div>
            </Card>
            </div>
          ))}
        </div>

        <p className="pv-rise mt-4 text-sm" style={{ color: "var(--pv-coral)", animationDelay: "200ms" }}>
          To build. The owner already creates these statements today; this is the
          screen that lets her see balances and act on them, and lets a parent
          see and pay from their phone.
        </p>
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
