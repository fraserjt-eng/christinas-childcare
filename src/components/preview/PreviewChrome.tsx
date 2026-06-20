"use client";

// Persistent chrome for every signed-in portal screen: the brand bar, the
// sound toggle, and sign-out. Also rehydrates the persisted store exactly once
// after mount so the server render and the first client paint always match.

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick, setSoundEnabled } from "@/lib/preview/sound";

export function PreviewChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const soundOn = usePreviewStore((s) => s.soundOn);
  const toggleSound = usePreviewStore((s) => s.toggleSound);

  useEffect(() => {
    const result = usePreviewStore.persist.rehydrate();
    const sync = () => setSoundEnabled(usePreviewStore.getState().soundOn);
    if (result && typeof (result as Promise<void>).then === "function") {
      (result as Promise<void>).then(sync);
    } else {
      sync();
    }
  }, []);

  async function handleSignOut() {
    playClick();
    // Clear the real server session cookie, not just client state, so Sign Out
    // actually signs out. Hard-navigate to the login (matches DashboardLayout).
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      /* best effort; redirect regardless */
    }
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="px-4 py-3 text-white sm:px-8" style={{ backgroundColor: "var(--pv-coral)" }}>
        <div className="mx-auto flex max-w-[1800px] items-center gap-3">
          <span className="pv-serif text-lg font-semibold leading-none sm:text-xl">
            Christina&apos;s Child Care Center
          </span>
          <span className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playClick();
                toggleSound();
              }}
              className="pv-target rounded-lg px-3 py-1.5 text-sm font-bold"
              style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
            >
              {soundOn ? "🔊 Sound on" : "🔇 Sound off"}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="pv-target rounded-lg px-3 py-1.5 text-sm font-bold"
              style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
            >
              Sign out
            </button>
          </span>
        </div>
      </div>
      <div key={pathname} className="pv-page-enter flex-1">
        {children}
      </div>
    </div>
  );
}
