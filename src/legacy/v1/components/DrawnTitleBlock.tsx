"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ReactNode } from "react";

/**
 * Wraps a title block with an SVG overlay whose border and leader ticks
 * "draw themselves" via pathLength (stroke-dashoffset under the hood) each time
 * the block scrolls into view — it re-draws every time it re-enters, so the
 * effect is continuous as the reader scrolls up and down.
 * prefers-reduced-motion renders everything fully drawn with no motion.
 *
 * The overlay uses a fixed 100x100 viewBox stretched to fill (preserveAspect
 * "none"), so pathLength has real geometry to measure while still fitting any
 * block size.
 */
export function DrawnTitleBlock({
  children,
  className = "",
  showDivider = true,
}: {
  children: ReactNode;
  className?: string;
  /** Draw the interior vertical divider line (title blocks only). */
  showDivider?: boolean;
}) {
  const reduce = useReducedMotion();

  const draw: Variants = {
    hidden: { pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 },
    shown: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.7, ease: "easeInOut", delay: i * 0.15 },
        opacity: { duration: 0.01, delay: i * 0.15 },
      },
    }),
  };

  const pop: Variants = {
    hidden: { scale: reduce ? 1 : 0, opacity: reduce ? 1 : 0 },
    shown: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, delay: 0.55, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className={`relative ${className}`}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: false, amount: 0.5 }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-blueline"
      >
        {/* Border traced clockwise from top-left */}
        <motion.path
          d="M2 2 H98 V98 H2 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          variants={draw}
          custom={0}
        />
        {/* Interior divider (vertical center), drawn after the border */}
        {showDivider ? (
          <motion.path
            d="M50 2 V98"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
            opacity={0.6}
            variants={draw}
            custom={1}
          />
        ) : null}
      </svg>

      {/* Redline datum dot at the origin corner */}
      <motion.span
        aria-hidden="true"
        className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-redline"
        variants={pop}
      />

      {children}
    </motion.div>
  );
}
