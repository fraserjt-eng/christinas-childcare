"use client";

// Persistent chrome for every unlocked preview screen: the demo banner,
// the sound toggle, the two-tap Reset Demo, and the link back to the index.
// Also rehydrates the persisted demo store exactly once after mount so the
// server render and the first client paint always match.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick, setSoundEnabled } from "@/lib/preview/sound";

export function PreviewChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const soundOn = usePreviewStore((s) => s.soundOn);
  const toggleSound = usePreviewStore((s) => s.toggleSound);
  const resetDemo = usePreviewStore((s) => s.resetDemo);
  const [resetArmed, setResetArmed] = useState(false);
  const disarmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const result = usePreviewStore.persist.rehydrate();
    const sync = () => setSoundEnabled(usePreviewStore.getState().soundOn);
    if (result && typeof (result as Promise<void>).then === "function") {
      (result as Promise<void>).then(sync);
    } else {
      sync();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (disarmTimer.current) clearTimeout(disarmTimer.current);
    };
  }, []);

  function handleReset() {
    playClick();
    if (!resetArmed) {
      setResetArmed(true);
      disarmTimer.current = setTimeout(() => setResetArmed(false), 4000);
      return;
    }
    if (disarmTimer.current) clearTimeout(disarmTimer.current);
    setResetArmed(false);
    resetDemo();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div
        className="sticky top-0 z-40 flex flex-wrap items-center gap-2 px-3 py-2 text-sm font-bold text-white"
        style={{ backgroundColor: "var(--pv-ink)" }}
      >
        <span
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: "var(--pv-coral)" }}
        >
          PREVIEW
        </span>
        <span className="opacity-90">Demo data only. Nothing here is real.</span>
        <span className="ml-auto flex items-center gap-2">
          <Link
            href="/preview"
            onClick={() => playClick()}
            className="pv-target flex items-center rounded-lg px-3 py-1.5 font-bold underline-offset-4 hover:underline"
          >
            All screens
          </Link>
          <button
            type="button"
            onClick={() => {
              playClick();
              toggleSound();
            }}
            className="pv-target rounded-lg px-3 py-1.5 font-bold"
            style={{ backgroundColor: "#4a4440" }}
          >
            {soundOn ? "🔊 Sound on" : "🔇 Sound off"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="pv-target rounded-lg px-3 py-1.5 font-bold"
            style={{ backgroundColor: resetArmed ? "var(--pv-coral)" : "#4a4440" }}
          >
            {resetArmed ? "Tap again to reset" : "↺ Reset demo"}
          </button>
        </span>
      </div>
      <div className="px-4 py-3 text-white sm:px-8" style={{ backgroundColor: "var(--pv-coral)" }}>
        <div className="mx-auto flex max-w-[1800px] items-center gap-3">
          <span className="pv-serif text-lg font-semibold leading-none sm:text-xl">
            Christina&apos;s Child Care Center
          </span>
          <span
            className="ml-auto hidden text-[0.68rem] font-bold uppercase tracking-[0.18em] sm:block"
            style={{ color: "rgba(255,255,255,0.82)" }}
          >
            Summer Preview
          </span>
        </div>
      </div>
      <div key={pathname} className="pv-page-enter flex-1">
        {children}
      </div>
    </div>
  );
}
