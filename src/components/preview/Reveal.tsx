"use client";

// Scroll-reveal flow for the /preview layer. A section rises + fades in once,
// the first time it enters the viewport (FlowState "down-the-page" flow), with
// an optional stagger delay. Pure IntersectionObserver + CSS, no dependency.
// Reduced-motion is handled in preview.css (the reveal classes no-op there).

import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/components/preview/ui";

export function useReveal<T extends HTMLElement = HTMLDivElement>(delay = 0) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("pv-reveal-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delay) el.style.transitionDelay = `${delay}ms`;
            el.classList.add("pv-reveal-in");
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return ref;
}

/** Wrap a section so it rises + fades in as it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>(delay);
  return (
    <div ref={ref} className={cx("pv-reveal", className)}>
      {children}
    </div>
  );
}
