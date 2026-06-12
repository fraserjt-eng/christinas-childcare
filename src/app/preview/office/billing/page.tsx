"use client";

// The office billing screen (director view). Christina sees every family's
// balance, the total outstanding, and can mark a family paid or send a
// statement. Marking paid writes to the shared store, so that family's phone
// shows Paid up the next time they look. Maps to family_statements in the
// real app (the owner already makes these; this gives her the screen).

import { useState } from "react";
import { Card, ScreenHeader, StepNote, SuccessBanner } from "@/components/preview/ui";
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

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <ScreenHeader
          title="Billing"
          emoji="💵"
          backHref="/preview/office"
          backLabel="The office"
          note="Who owes what, at a glance. Mark a family paid and their phone updates."
        />
        <StepNote step={9} text="Mark the Williams family paid, then open their phone to see it clear." />

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>Outstanding</p>
            <p className="text-3xl font-extrabold" style={{ color: totalOwed > 0 ? "var(--pv-coral)" : "var(--pv-teal)" }}>
              ${totalOwed}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-semibold" style={{ color: "var(--pv-muted)" }}>Families with a balance</p>
            <p className="text-3xl font-extrabold">{pastDueCount}</p>
          </Card>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {rows.map(({ family, owed }) => (
            <Card key={family.id}>
              <div className="flex flex-wrap items-center gap-3">
                <span aria-hidden="true" className="text-3xl">{family.avatar}</span>
                <div className="flex-1">
                  <p className="text-lg font-extrabold">{family.name}</p>
                  <p className="text-sm" style={{ color: "var(--pv-muted)" }}>
                    {owed > 0 ? family.balanceDueLabel : "Paid up"}
                  </p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-base font-extrabold text-white"
                  style={{ backgroundColor: owed > 0 ? "var(--pv-coral)" : "var(--pv-teal)" }}
                >
                  {owed > 0 ? `$${owed}` : "Paid"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setSuccess(`Statement sent to the ${family.name}. In the real app this emails them.`);
                  }}
                  className="pv-press pv-target rounded-xl px-4 py-2 text-base font-bold text-white"
                  style={{ backgroundColor: "var(--pv-sky)" }}
                >
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
                    className="pv-press pv-target rounded-xl px-4 py-2 text-base font-bold text-white"
                    style={{ backgroundColor: "var(--pv-teal)" }}
                  >
                    Mark paid
                  </button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-4 text-sm" style={{ color: "var(--pv-coral)" }}>
          To build. The owner already creates these statements today; this is the
          screen that lets her see balances and act on them, and lets a parent
          see and pay from their phone.
        </p>
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
