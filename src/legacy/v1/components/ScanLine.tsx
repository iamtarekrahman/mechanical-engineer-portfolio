"use client";

import { useReducedMotion } from "framer-motion";

export function ScanLine() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] animate-scanline"
      style={{
        background:
          "linear-gradient(90deg, transparent 5%, var(--blueline) 50%, transparent 95%)",
        opacity: 0.07,
      }}
    />
  );
}
