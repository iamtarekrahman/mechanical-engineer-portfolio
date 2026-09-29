"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

const SIZE = 14;

function Bracket({
  position,
  delay,
}: {
  position: "tl" | "tr" | "bl" | "br";
  delay: number;
}) {
  const posStyles: Record<string, React.CSSProperties> = {
    tl: { top: -1, left: -1 },
    tr: { top: -1, right: -1, transform: "scaleX(-1)" },
    bl: { bottom: -1, left: -1, transform: "scaleY(-1)" },
    br: { bottom: -1, right: -1, transform: "scale(-1)" },
  };

  return (
    <motion.svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      fill="none"
      className="absolute"
      style={posStyles[position]}
    >
      <motion.path
        d={`M${SIZE},0 L0,0 L0,${SIZE}`}
        className="stroke-blueline"
        strokeWidth="1.5"
        strokeLinecap="square"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          pathLength: { duration: 0.4, ease: "easeOut", delay },
          opacity: { duration: 0.15, delay },
        }}
      />
    </motion.svg>
  );
}

export function HudCorners({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className={`relative ${className}`}>
      {children}
      {!reduce && (
        <>
          <Bracket position="tl" delay={0.15} />
          <Bracket position="tr" delay={0.25} />
          <Bracket position="br" delay={0.35} />
          <Bracket position="bl" delay={0.45} />
        </>
      )}
    </div>
  );
}
