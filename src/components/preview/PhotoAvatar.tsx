"use client";

// Photographic avatar for the preview layer. Prefers a real photo (an
// uploaded data URL from the store, or a generated portrait at
// /preview/people/<id>.jpg); on a missing file it falls back to clean
// initials on a soft brand-tinted ground. No emoji, no cartoon. This is the
// piece that makes the whole preview read as contemporary and photographic.

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
  // One shared placeholder (a fully-dressed child) stands in for every photo
  // until a real one is uploaded. An uploaded data URL (src) always wins.
  const path = src || "/preview/people/placeholder.jpg";
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
          src={path}
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
