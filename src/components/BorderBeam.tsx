"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A glowing accent line that sweeps horizontally across a section's top
 * border when it scrolls into view — like a laser scan or mecha HUD
 * activation line.
 */
export function BorderBeam() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <motion.span
      aria-hidden="true"
      className="absolute left-0 top-[-1px] z-10 h-[2px] w-20"
      style={{
        background:
          "linear-gradient(90deg, transparent, var(--blueline), transparent)",
      }}
      initial={{ x: "-5rem", opacity: 0 }}
      whileInView={{
        x: "100vw",
        opacity: [0, 1, 1, 0],
      }}
      viewport={{ once: true, amount: 0 }}
      transition={{
        x: { duration: 0.8, ease: "easeInOut", delay: 0.1 },
        opacity: { duration: 0.8, times: [0, 0.08, 0.85, 1], delay: 0.1 },
      }}
    />
  );
}
