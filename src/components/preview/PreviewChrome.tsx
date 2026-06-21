"use client";

// Persistent chrome for every signed-in portal screen: the brand bar, a center
// toggle + Admin link for owner/admin sessions, the sound toggle, and sign-out.
// Also rehydrates the persisted store exactly once after mount so the server
// render and the first client paint always match.

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick, setSoundEnabled } from "@/lib/preview/sound";

const ADMIN_ROLES = ["admin", "owner", "superadmin"];
const CENTERS = [
  { id: "3104ae69-4f26-4c1e-a767-3ff45b534860", name: "Brooklyn Park" },
  { id: "b2000000-0000-0000-0000-000000000002", name: "Crystal" },
];

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : "";
}

export function PreviewChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const soundOn = usePreviewStore((s) => s.soundOn);
  const toggleSound = usePreviewStore((s) => s.toggleSound);
  const [isAdmin, setIsAdmin] = useState(false);
  // Cross-center directors (owner/superadmin, or an admin with no home center)
  // can switch the active center from the simplified portal too.
  const [canSwitch, setCanSwitch] = useState(false);
  const [centerId, setCenterId] = useState<string>("");

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
    setCenterId(readCookie("cc_center") || CENTERS[0].id);
    let alive = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d?.user?.role) return;
        const role = String(d.user.role).toLowerCase();
        setIsAdmin(ADMIN_ROLES.includes(role));
        setCanSwitch(role === "owner" || role === "superadmin" || !d.user.center_id);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  function pickCenter(id: string) {
    playClick();
    document.cookie = `cc_center=${id}; path=/; max-age=86400; samesite=lax`;
    document.cookie = "cc_view=single; path=/; max-age=86400; samesite=lax";
    // Reload so the office watermark + data reflect the new center.
    window.location.reload();
  }

  async function handleSignOut() {
    playClick();
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      /* best effort; redirect regardless */
    }
    window.location.href = "/start";
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="px-4 py-3 text-white sm:px-8" style={{ backgroundColor: "var(--pv-coral)" }}>
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-2 sm:gap-3">
          <span className="pv-serif text-lg font-semibold leading-none sm:text-xl">
            Christina&apos;s Child Care Center
          </span>
          <span className="ml-auto flex flex-wrap items-center gap-2">
            {isAdmin && canSwitch && (
              <span className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ backgroundColor: "rgba(0,0,0,0.22)" }}>
                {CENTERS.map((c) => {
                  const active = centerId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => !active && pickCenter(c.id)}
                      className="rounded-md px-2.5 py-1 text-xs font-bold transition-colors"
                      style={active ? { backgroundColor: "#fff", color: "var(--pv-coral)" } : { color: "#fff" }}
                      aria-pressed={active}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </span>
            )}
            {isAdmin && (
              <a
                href="/admin"
                className="pv-target rounded-lg px-3 py-1.5 text-sm font-bold"
                style={{ backgroundColor: "rgba(0,0,0,0.28)" }}
              >
                🗂️ Admin
              </a>
            )}
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
