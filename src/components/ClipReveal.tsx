"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

/**
 * Clip-path wipe reveal — content slides open like a display panel powering on.
 * "left" wipes from left edge, "bottom" wipes upward.
 */
export function ClipReveal({
  children,
  className = "",
  delay = 0,
  direction = "left",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "left" | "bottom";
}) {
  const reduce = useReducedMotion();

  const clipFrom =
    direction === "left" ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)";
  const clipTo = "inset(0 0% 0 0)";

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { clipPath: clipFrom, opacity: 0 }}
      whileInView={reduce ? undefined : { clipPath: clipTo, opacity: 1 }}
      viewport={{ once: true, amount: "some" }}
      transition={{
        clipPath: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay },
        opacity: { duration: 0.3, delay },
      }}
    >
      {children}
    </motion.div>
  );
}
