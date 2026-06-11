"use client";

import { useFormState, useFormStatus } from "react-dom";
import { enterPreview, type GateResult } from "./actions";

const initialState: GateResult = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="pv-press pv-kiosk-target w-full rounded-2xl px-5 py-4 text-xl font-extrabold text-white shadow-md disabled:opacity-60"
      style={{ backgroundColor: "var(--pv-teal)" }}
    >
      {pending ? "Checking..." : "Open the preview"}
    </button>
  );
}

export function GateForm() {
  const [state, formAction] = useFormState(enterPreview, initialState);

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div
        className="w-full max-w-md rounded-3xl border bg-[var(--pv-card)] p-8 shadow-lg"
        style={{ borderColor: "var(--pv-line)" }}
      >
        <p
          className="text-xs font-extrabold uppercase tracking-widest"
          style={{ color: "var(--pv-coral)" }}
        >
          Preview
        </p>
        <h1 className="mt-2 text-3xl">Christina&apos;s Simplified Summer</h1>
        <p className="mt-3 text-base" style={{ color: "var(--pv-muted)" }}>
          This is a clickable design preview with demo data only. Enter the
          preview code Josh gave you.
        </p>
        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <label className="text-lg font-bold" htmlFor="passcode">
            Preview code
          </label>
          <input
            id="passcode"
            name="passcode"
            type="password"
            inputMode="text"
            autoComplete="off"
            autoFocus
            className="rounded-2xl border-2 px-5 py-4 text-2xl tracking-widest"
            style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-paper)" }}
          />
          {state.error ? (
            <p role="alert" className="text-base font-bold" style={{ color: "var(--pv-coral)" }}>
              {state.error}
            </p>
          ) : null}
          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
