"use client";

// Shared UI kit for the /preview layer. Every piece follows the section 10
// rules from the design exploration: big targets, labels on every icon,
// visible press feedback, plain-language success states, tap and scroll only.

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { playClick, playSuccess } from "@/lib/preview/sound";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Big friendly action button. kiosk=true raises the floor to 56px. */
export function BigButton({
  emoji,
  label,
  sub,
  onClick,
  color = "var(--pv-teal)",
  kiosk = false,
  className,
  disabled = false,
}: {
  emoji?: string;
  label: string;
  sub?: string;
  onClick?: () => void;
  color?: string;
  kiosk?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        playClick();
        onClick?.();
      }}
      className={cx(
        "pv-press rounded-2xl px-5 py-4 text-left font-bold text-white shadow-md",
        kiosk ? "pv-kiosk-target text-2xl" : "pv-target text-lg",
        disabled && "opacity-50",
        className,
      )}
      style={{ backgroundColor: color }}
    >
      <span className="flex items-center gap-3">
        {emoji ? <span aria-hidden="true" className={kiosk ? "text-4xl" : "text-2xl"}>{emoji}</span> : null}
        <span>
          <span className="block">{label}</span>
          {sub ? <span className="block text-sm font-semibold opacity-90">{sub}</span> : null}
        </span>
      </span>
    </button>
  );
}

/** Card surface on the paper background. */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx("rounded-2xl border bg-[var(--pv-card)] p-5 shadow-sm", className)}
      style={{ borderColor: "var(--pv-line)" }}
    >
      {children}
    </div>
  );
}

/** Screen header: big title, optional back link, optional walkthrough note. */
export function ScreenHeader({
  title,
  emoji,
  backHref = "/preview",
  backLabel = "All screens",
  note,
}: {
  title: string;
  emoji?: string;
  backHref?: string;
  backLabel?: string;
  note?: string;
}) {
  return (
    <header className="mb-6">
      <Link
        href={backHref}
        className="pv-target inline-flex items-center gap-2 rounded-xl px-3 py-2 text-base font-bold"
        style={{ color: "var(--pv-plum)" }}
        onClick={() => playClick()}
      >
        <span aria-hidden="true">←</span> {backLabel}
      </Link>
      <h1 className="mt-2 text-3xl sm:text-4xl">
        {emoji ? <span aria-hidden="true" className="mr-2">{emoji}</span> : null}
        {title}
      </h1>
      {note ? (
        <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
          {note}
        </p>
      ) : null}
    </header>
  );
}

/** Plain-language success state. Says what just happened, then fades. */
export function SuccessBanner({
  message,
  onDone,
}: {
  message: string;
  onDone?: () => void;
}) {
  useEffect(() => {
    playSuccess();
    const timer = setTimeout(() => onDone?.(), 3500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-2xl px-5 py-4 text-center text-lg font-bold text-white shadow-lg"
      style={{ backgroundColor: "var(--pv-teal)" }}
    >
      <span aria-hidden="true" className="mr-2">✓</span>
      {message}
    </div>
  );
}

/** Selectable chip (Ate / Some / None and friends). */
export function Chip({
  label,
  on,
  onClick,
  onColor = "var(--pv-teal)",
}: {
  label: string;
  on: boolean;
  onClick: () => void;
  onColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        playClick();
        onClick();
      }}
      className={cx(
        "pv-press pv-target rounded-full border-2 px-5 py-2 text-base font-bold",
      )}
      style={
        on
          ? { backgroundColor: onColor, borderColor: onColor, color: "#ffffff" }
          : { borderColor: "var(--pv-line)", color: "var(--pv-ink)", backgroundColor: "var(--pv-card)" }
      }
      aria-pressed={on}
    >
      {label}
    </button>
  );
}

/** Small walkthrough step badge so the preview self-guides in solo mode. */
export function StepNote({ step, text }: { step: number; text: string }) {
  return (
    <div
      className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
      style={{ backgroundColor: "#f1ede6", color: "var(--pv-plum)" }}
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
        style={{ backgroundColor: "var(--pv-plum)" }}
      >
        {step}
      </span>
      {text}
    </div>
  );
}

/** Friendly empty state with a next step, never a dead end. */
export function EmptyState({
  emoji,
  title,
  detail,
}: {
  emoji: string;
  title: string;
  detail: string;
}) {
  return (
    <Card className="text-center">
      <div aria-hidden="true" className="text-4xl">{emoji}</div>
      <h3 className="mt-2 text-xl">{title}</h3>
      <p className="mt-1 text-base" style={{ color: "var(--pv-muted)" }}>
        {detail}
      </p>
    </Card>
  );
}

/** Mount gate: render dynamic store values only after hydration so the
 *  server render always matches the first client paint. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
