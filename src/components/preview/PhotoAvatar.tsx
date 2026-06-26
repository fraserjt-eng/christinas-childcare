"use client";

// Photographic avatar for the preview layer. Prefers a real photo (a child's
// signed photo_url passed as src, or an uploaded data URL from the store).
//
// Fallback when there is no real photo:
//   - DEMO sandbox (NEXT_PUBLIC_DEMO_MODE): a shared stock portrait, so the
//     marketing demo still reads as photographic.
//   - LIVE: clean initials on a soft brand-tinted ground. We never show the
//     stock face to real families — one identical stock child across every
//     family is exactly what reads as "fake" on a production roster.

import { useState } from "react";
import { cx } from "@/components/preview/ui";

export function PhotoAvatar({
  id,
  name,
  src,
  color = "#c62828",
  size = 64,
  block = false,
  rounded = "rounded-2xl",
  className,
}: {
  id: string;
  name: string;
  /** An explicit image source (e.g. an uploaded data URL). Wins over the file path. */
  src?: string | null;
  color?: string;
  /** Pixel size for the inline (non-block) variant. */
  size?: number;
  /** Fill the parent width as a square photo card instead of a fixed circle/tile. */
  block?: boolean;
  rounded?: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  // A real photo (src) always wins. With no real photo, the demo sandbox shows
  // a shared stock portrait so it stays photographic; LIVE shows initials so a
  // real, un-photographed family is never given the same stock child's face.
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const path = src || (isDemo ? "/preview/people/placeholder.jpg" : null);
  const showImg = Boolean(path) && !errored;
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeStyle = block
    ? { aspectRatio: "1 / 1" as const }
    : { width: size, height: size };

  return (
    <span
      data-avatar-id={id}
      className={cx(
        "relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden",
        block && "block w-full",
        rounded,
        className,
      )}
      style={{
        ...sizeStyle,
        backgroundColor: showImg ? "#efece6" : `${color}24`,
      }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={path ?? undefined}
          alt={name}
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="font-extrabold leading-none"
          style={{ color, fontSize: block ? "1.6rem" : Math.round(size * 0.36) }}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
