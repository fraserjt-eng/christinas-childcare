"use client";

// A compact camera button that swaps a placeholder avatar for a real photo.
// Lives as a sibling overlay (never nested inside another button) so a tap on
// it does not trigger the tile it sits on. The picked file is downscaled to a
// small data URL and handed to the store, which persists it on the device.

import { useRef } from "react";
import { Camera } from "lucide-react";
import { fileToDataUrl } from "@/lib/preview/image";
import { playClick, playSuccess } from "@/lib/preview/sound";
import { cx } from "@/components/preview/ui";

export function AvatarUpload({
  label,
  onPhoto,
  className,
}: {
  label: string;
  onPhoto: (dataUrl: string) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = await fileToDataUrl(file);
    if (url) {
      playSuccess();
      onPhoto(url);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation();
          playClick();
          inputRef.current?.click();
        }}
        className={cx("pv-press inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow", className)}
        style={{ border: "1px solid var(--tad-line, #e2e4e7)" }}
      >
        <Camera size={13} style={{ color: "var(--pv-coral)" }} />
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" aria-hidden="true" />
    </>
  );
}
