"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

/**
 * Heading reveal with a brief horizontal jitter — looks like a holographic
 * display initialising. Uses only transform + opacity (GPU-composited).
 */
export function GlitchReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, x: -8 }}
      whileInView={
        reduce
          ? undefined
          : {
              opacity: 1,
              x: [null, -4, 5, -2, 1, 0],
            }
      }
      viewport={{ once: true, amount: "some" }}
      transition={{
        opacity: { duration: 0.25, delay },
        x: {
          duration: 0.45,
          delay: delay + 0.05,
          times: [0, 0.12, 0.28, 0.48, 0.72, 1],
        },
      }}
    >
      {children}
    </motion.div>
  );
}
