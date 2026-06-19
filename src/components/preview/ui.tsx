"use client";

// Shared UI kit for the /preview layer. Every piece follows the section 10
// rules from the design exploration: big targets, labels on every icon,
// visible press feedback, plain-language success states, tap and scroll only.

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { playClick, playSuccess } from "@/lib/preview/sound";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Big friendly action button. kiosk=true raises the floor to 56px. */
export function BigButton({
  icon: Icon,
  label,
  sub,
  onClick,
  color = "var(--pv-coral)",
  kiosk = false,
  className,
  disabled = false,
}: {
  /** Optional line icon. Emoji prop is accepted for back-compat but never rendered. */
  icon?: LucideIcon;
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
        "pv-press rounded-lg px-5 py-4 text-left font-bold text-white shadow-sm",
        kiosk ? "pv-kiosk-target text-2xl" : "pv-target text-lg",
        disabled && "opacity-50",
        className,
      )}
      style={{ backgroundColor: color }}
    >
      <span className="flex items-center gap-3">
        {Icon ? <Icon size={kiosk ? 28 : 22} aria-hidden="true" className="flex-shrink-0" /> : null}
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
      className={cx("pv-lift pv-deep rounded-xl border bg-white p-5", className)}
      style={{ borderColor: "var(--pv-line)" }}
    >
      {children}
    </div>
  );
}

/** Screen header: big title, optional back link, optional walkthrough note. */
export function ScreenHeader({
  title,
  backHref = "/preview",
  backLabel = "All screens",
  note,
}: {
  title: string;
  /** Accepted for backward compatibility; no longer rendered (Tadpoles header). */
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
        style={{ color: "var(--pv-coral)" }}
        onClick={() => playClick()}
      >
        <span aria-hidden="true">←</span> {backLabel}
      </Link>
      <h1 className="pv-tad-title mt-2 text-3xl sm:text-4xl">{title}</h1>
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
  icon: Icon,
  title,
  detail,
}: {
  /** Optional line icon. Emoji prop is accepted for back-compat but never rendered. */
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  detail: string;
}) {
  return (
    <Card className="text-center">
      {Icon ? (
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--pv-coral) 12%, white)" }}>
          <Icon size={24} aria-hidden="true" style={{ color: "var(--pv-coral)" }} />
        </span>
      ) : null}
      <h3 className="mt-3 text-xl">{title}</h3>
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
