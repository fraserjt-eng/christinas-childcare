"use client";

// Calm, dismissible heads-up for the parent portal: tells families that starting
// June 22 the kiosk will ask them to agree to a short privacy notice at check-in.
// Brand: pv-tile surface, christina-red (var(--pv-coral)) accent. Once dismissed
// it stays dismissed on this device (localStorage), so it never nags.
//
// The orchestrator places this on the family page. It renders nothing once
// dismissed and nothing before mount (so the server render matches first paint).

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "cc_privacy_notice_banner_dismissed_v1";

export default function PrivacyNoticeBanner() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // localStorage can be unavailable (private mode); hiding in-memory is fine.
    }
  }

  if (!mounted || dismissed) return null;

  return (
    <div
      role="status"
      className="pv-tile mb-4 flex items-start gap-3 p-4"
      style={{ borderLeft: "4px solid var(--pv-coral)" }}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: "var(--pv-coral)" }}
      >
        i
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: "var(--pv-ink)" }}>
          A small change at check-in
        </p>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--pv-ink)" }}>
          Starting June 22, the kiosk will ask you to agree to a short privacy
          notice when you check in. It takes a few seconds and you only do it
          once a year.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss this notice"
        className="pv-target -mr-1 -mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ color: "var(--pv-muted)" }}
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
