"use client";

// Hydrates the /preview store from the signed-in user's REAL center data
// (/api/portal/center-data), so the new design renders live two-center data
// instead of fixtures. With no session (the public demo passcode only) the
// fetch 401s and the fixtures remain, so the sealed demo is unchanged.
//
// This is the seam between the new design and the real database: every preview
// screen already reads kids / staff / check-ins / rooms from the store, so
// hydrating the store here lights up all of them at once.

import { useEffect } from "react";
import { usePreviewStore } from "@/lib/preview/store";

export default function LivePortalHydrator() {
  const hydrateFromLive = usePreviewStore((s) => s.hydrateFromLive);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/portal/center-data", { cache: "no-store" });
        if (!res.ok) return; // not signed in -> keep the fixtures demo
        const payload = await res.json();
        if (!cancelled && payload && Array.isArray(payload.rooms)) {
          hydrateFromLive(payload);
        }
      } catch {
        /* keep fixtures on any error */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateFromLive]);

  return null;
}
