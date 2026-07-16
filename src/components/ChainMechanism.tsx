"use client";

import {
  motion,
  MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ---- Geometry (CSS pixels) ---- */
const R_PITCH = 15; // sprocket pitch radius (chain rides here)
const R_ROOT = 10;
const R_HUB = 4.5;
const TEETH = 10;
const SPROCKET_BOX = 40; // square pixel size of the sprocket sub-SVG
const CHAIN_LOOPS = 2; // full chain revolutions across full page scroll
const STATIC_ANGLE = 18; // reduced-motion resting angle (deg)
const CAP = 28; // distance from container top/bottom to sprocket center

/** Sprocket path centered at (0,0). */
function sprocketPath(): string {
  const pts: string[] = [];
  const steps = TEETH * 2;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? R_PITCH : R_ROOT;
    const x = rr * Math.cos(a);
    const y = rr * Math.sin(a);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ") + " Z";
}
const SPROCKET = sprocketPath();

/**
 * Sprocket anchored to the container's top OR bottom edge via CSS. Using
 * CSS `top` / `bottom` (not JS-measured pixels) guarantees the sprocket is
 * always in view regardless of container height or mobile URL-bar resizing.
 */
function Sprocket({
  side,
  rotate,
}: {
  side: "top" | "bottom";
  rotate: MotionValue<number> | number;
}) {
  const positional: React.CSSProperties =
    side === "top"
      ? { top: CAP - SPROCKET_BOX / 2 }
      : { bottom: CAP - SPROCKET_BOX / 2 };

  return (
    <motion.svg
      viewBox={`${-SPROCKET_BOX / 2} ${-SPROCKET_BOX / 2} ${SPROCKET_BOX} ${SPROCKET_BOX}`}
      style={{
        position: "absolute",
        left: "50%",
        marginLeft: -SPROCKET_BOX / 2,
        width: SPROCKET_BOX,
        height: SPROCKET_BOX,
        rotate,
        ...positional,
      }}
      fill="none"
      className="text-ink"
    >
      <path
        d={SPROCKET}
        className="fill-paper stroke-ink"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <circle
        r={R_PITCH - 3}
        className="stroke-blueline"
        strokeWidth={0.7}
        strokeDasharray="2 2"
        fill="none"
      />
      <circle r={R_HUB} className="fill-paper stroke-ink" strokeWidth={1.4} />
      <circle r={1.6} className="fill-ink" />
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={-R_PITCH + 3}
        className="stroke-redline"
        strokeWidth={1.4}
      />
    </motion.svg>
  );
}

/**
 * Roller chain + two sprockets fixed to the right edge of the viewport. The
 * chain SVG stretches the full container; sprockets are absolutely positioned
 * to the container's top/bottom via CSS so they're always visible. Chain
 * geometry uses the container's measured pixel size so the path stays tangent
 * to both sprocket circles.
 */
export function ChainMechanism() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({
    w: 44,
    h: 800,
  });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ w: width, h: height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const CX = size.w / 2;
  const CY_TOP = CAP;
  const CY_BOT = Math.max(CAP + 2 * R_PITCH + 40, size.h - CAP);

  const CHAIN_PATH =
    `M ${CX + R_PITCH},${CY_TOP} ` +
    `L ${CX + R_PITCH},${CY_BOT} ` +
    `A ${R_PITCH},${R_PITCH} 0 0 1 ${CX - R_PITCH},${CY_BOT} ` +
    `L ${CX - R_PITCH},${CY_TOP} ` +
    `A ${R_PITCH},${R_PITCH} 0 0 1 ${CX + R_PITCH},${CY_TOP} ` +
    `Z`;

  const CHAIN_LENGTH = 2 * (CY_BOT - CY_TOP) + 2 * Math.PI * R_PITCH;

  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    mass: 0.5,
  });

  const chainOffset = useTransform(
    smooth,
    [0, 1],
    [0, -CHAIN_LOOPS * CHAIN_LENGTH]
  );
  const rotationDeg = useTransform(
    smooth,
    [0, 1],
    [0, ((CHAIN_LOOPS * CHAIN_LENGTH) / R_PITCH) * (180 / Math.PI)]
  );
  const rotate = reduce ? STATIC_ANGLE : rotationDeg;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 right-0 top-14 z-10 w-[40px] sm:w-[48px] lg:w-[52px]"
    >
      <svg
        viewBox={`0 0 ${size.w} ${size.h}`}
        preserveAspectRatio="none"
        fill="none"
        className="absolute inset-0 h-full w-full text-ink"
      >
        <line
          x1={CX + R_PITCH}
          y1={CY_TOP}
          x2={CX + R_PITCH}
          y2={CY_BOT}
          className="stroke-blueline"
          strokeWidth={0.6}
          strokeDasharray="2 3"
          opacity={0.5}
        />
        <line
          x1={CX - R_PITCH}
          y1={CY_TOP}
          x2={CX - R_PITCH}
          y2={CY_BOT}
          className="stroke-blueline"
          strokeWidth={0.6}
          strokeDasharray="2 3"
          opacity={0.5}
        />

        <path
          d={CHAIN_PATH}
          className="stroke-hairline"
          strokeWidth={4.4}
          fill="none"
          opacity={0.55}
        />

        <motion.path
          d={CHAIN_PATH}
          className="stroke-ink"
          strokeWidth={3.4}
          strokeLinecap="round"
          fill="none"
          strokeDasharray="3.5 6"
          style={{ strokeDashoffset: reduce ? 0 : chainOffset }}
        />
      </svg>

      <Sprocket side="top" rotate={rotate} />
      <Sprocket side="bottom" rotate={rotate} />
    </div>
  );
}
