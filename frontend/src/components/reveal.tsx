"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveals a block once it enters the viewport. Content is visible on the server
 * and stays visible without JavaScript; the hidden state is only applied after
 * mount, and only to blocks that start below the fold.
 */
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setState("hidden");

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("shown");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const revealClass =
    state === "hidden" ? "reveal is-hidden" : state === "shown" ? "reveal is-shown" : "";

  return (
    <div ref={ref} className={`${className} ${revealClass}`.trim()}>
      {children}
    </div>
  );
}
