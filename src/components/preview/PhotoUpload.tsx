"use client";

// Reusable photo upload control for the /preview layer. Wraps a hidden file
// input so the button matches the rest of the kit. On phones, capture lets
// the camera open straight away. The picked file is downscaled to a small
// data URL before it reaches the store.

import { useRef, useState } from "react";
import { fileToDataUrl } from "@/lib/preview/image";
import { playClick, playSuccess } from "@/lib/preview/sound";
import { cx } from "@/components/preview/ui";

export function PhotoUpload({
  label,
  emoji = "📷",
  onPhoto,
  color = "var(--pv-sky)",
  kiosk = false,
  capture = false,
  className,
}: {
  label: string;
  emoji?: string;
  onPhoto: (dataUrl: string) => void;
  color?: string;
  kiosk?: boolean;
  capture?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    const url = await fileToDataUrl(file);
    setBusy(false);
    if (url) {
      playSuccess();
      onPhoto(url);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          playClick();
          inputRef.current?.click();
        }}
        className={cx(
          "pv-press rounded-2xl px-4 py-3 text-left font-bold text-white shadow-sm",
          kiosk ? "pv-kiosk-target text-lg" : "pv-target text-base",
          busy && "opacity-60",
          className,
        )}
        style={{ backgroundColor: color }}
      >
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="text-xl">{emoji}</span>
          <span>{busy ? "Adding..." : label}</span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        {...(capture ? { capture: "environment" } : {})}
        onChange={handleFile}
        className="hidden"
        aria-hidden="true"
      />
    </>
  );
}
