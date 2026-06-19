"use client";

// Sets the --pv-center CSS variable from the active center's name, which the
// .pv-portal-bg::before watermark renders huge and faint behind the content.
// No center (the public demo) => no watermark. Strips a trailing "Center" so
// "Brooklyn Park Center" reads as "Brooklyn Park" in the big mark.

import { useEffect } from "react";
import { usePreviewStore } from "@/lib/preview/store";

export default function CenterWatermark() {
  const centerName = usePreviewStore((s) => s.centerName);

  useEffect(() => {
    const root = document.documentElement;
    if (centerName) {
      const short = centerName.replace(/\s*Center$/i, "").trim();
      root.style.setProperty("--pv-center", `"${short}"`);
    } else {
      root.style.removeProperty("--pv-center");
    }
    return () => {
      root.style.removeProperty("--pv-center");
    };
  }, [centerName]);

  return null;
}
