"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useEffect } from "react";

/* ---- Geometry (SVG user units; viewBox is 1:1 with px) ---- */
const VB_W = 120;
const VB_H = 250;
const CX = 60; // gear center x
const CY = 168; // gear center y
const R_PITCH = 30;
const R_ROOT = 24;
const R_HUB = 8;
const TEETH = 16;
const CRANK_R = 18; // crank-pin radius from gear center
const ROD_LEN = 86; // connecting-rod length
const REVOLUTIONS = 4; // gear turns across full page scroll
const STATIC_ANGLE = 300; // reduced-motion resting angle (deg), mid-stroke

/**
 * Slider-crank solution. For a crank angle, compute the crank-pin point (on the
 * gear) and the piston-pin point (constrained to the vertical centerline x=CX).
 * The connecting rod is simply the segment between these two points, so both of
 * its ends are pinned by construction — it can never detach from either joint.
 */
function solve(deg: number) {
  const r = (deg * Math.PI) / 180;
  const pinX = CX + CRANK_R * Math.cos(r);
  const pinY = CY + CRANK_R * Math.sin(r);
  const dx = pinX - CX; // horizontal offset of crank pin from the piston line
  const dy = Math.sqrt(Math.max(0, ROD_LEN * ROD_LEN - dx * dx));
  const pistonY = pinY - dy; // piston sits above the crank pin
  return { pinX, pinY, pistonY };
}

/** Simple gear outline: alternate tip/root radius to form teeth. */
function gearPath(): string {
  const pts: string[] = [];
  const steps = TEETH * 2;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = i % 2 === 0 ? R_PITCH : R_ROOT;
    const x = CX + rr * Math.cos(a);
    const y = CY + rr * Math.sin(a);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ") + " Z";
}
const GEAR_PATH = gearPath();

const START = solve(STATIC_ANGLE);
const PISTON_TOP = solve(90).pistonY; // highest the piston ever reaches

/**
 * Blueprint gear + slider-crank fixed to the right edge of the viewport. The
 * gear rotation is driven directly by page scroll progress; a connecting rod
 * whose two endpoints are pinned to the crank pin and the piston converts that
 * rotation into believable vertical piston travel. Because both rod endpoints
 * are derived from the same crank angle every frame, the rod ALWAYS keeps
 * contact with the crank at one end and the piston head at the other.
 *
 * Perf: the gear and piston use only transforms; the rod is a single thin
 * <line> whose endpoints update (cheap, no layout). prefers-reduced-motion
 * renders the whole assembly static in its end state with no motion.
 */
export function GearMechanism() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    mass: 0.5,
  });

  const angle = useTransform(smooth, [0, 1], [0, REVOLUTIONS * 360]);
  const gearRotate = reduce ? STATIC_ANGLE : angle;

  // Live rod endpoints + piston offset, derived from the solved geometry.
  const rodBottomX = useMotionValue(START.pinX);
  const rodBottomY = useMotionValue(START.pinY);
  const rodTopY = useMotionValue(START.pistonY);
  const pistonShift = useMotionValue(0);

  useMotionValueEvent(angle, "change", (deg) => {
    if (reduce) return;
    const { pinX, pinY, pistonY } = solve(deg);
    rodBottomX.set(pinX);
    rodBottomY.set(pinY);
    rodTopY.set(pistonY);
    pistonShift.set(pistonY - START.pistonY);
  });

  // Cursor parallax: the fixed panel drifts slightly with the mouse so the
  // decorative mechanism feels layered above the fixed sheet content.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const spy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    function onMove(e: MouseEvent) {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      px.set(nx * 16);
      py.set(ny * 16);
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, px, py]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-3 top-1/2 z-20 hidden -translate-y-1/2 lg:block xl:right-6"
    >
      <motion.div
        style={reduce ? undefined : { x: spx, y: spy }}
        className="ink-border bg-paper/85 p-2 shadow-sm backdrop-blur-[1px]"
      >
        <span className="mono-label mb-1 block text-center text-graphite">
          FIG. 0 — CRANK
        </span>
        <svg
          width={VB_W}
          height={VB_H}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          fill="none"
          className="text-ink"
        >
          {/* Cylinder guide for the piston (dashed blueline) */}
          <rect
            x={CX - 13}
            y={PISTON_TOP - 24}
            width={26}
            height={CY - PISTON_TOP + 34}
            className="stroke-blueline"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
          {/* Vertical centerline the piston pin travels along */}
          <line
            x1={CX}
            y1={PISTON_TOP - 24}
            x2={CX}
            y2={CY}
            className="stroke-hairline"
            strokeWidth={0.75}
          />

          {/* Piston head — vertical translate only (transform) */}
          <motion.g style={{ y: reduce ? 0 : pistonShift }}>
            <rect
              x={CX - 14}
              y={START.pistonY - 20}
              width={28}
              height={18}
              rx={1}
              className="fill-paper stroke-ink"
              strokeWidth={1.6}
            />
            <line
              x1={CX - 14}
              y1={START.pistonY - 14}
              x2={CX + 14}
              y2={START.pistonY - 14}
              className="stroke-graphite"
              strokeWidth={0.75}
            />
            <line
              x1={CX - 14}
              y1={START.pistonY - 8}
              x2={CX + 14}
              y2={START.pistonY - 8}
              className="stroke-graphite"
              strokeWidth={0.75}
            />
            {/* Wrist pin — the rod's TOP end is pinned to this point */}
            <circle
              cx={CX}
              cy={START.pistonY}
              r={2.6}
              className="fill-paper stroke-blueline"
              strokeWidth={1.4}
            />
          </motion.g>

          {/* Connecting rod: top end = piston pin (x=CX, y=rodTopY),
              bottom end = crank pin (rodBottomX, rodBottomY). Endpoints are
              MotionValues, so the rod always spans exactly between both joints. */}
          <motion.line
            x1={CX}
            y1={reduce ? START.pistonY : rodTopY}
            x2={reduce ? START.pinX : rodBottomX}
            y2={reduce ? START.pinY : rodBottomY}
            className="stroke-ink"
            strokeWidth={2.6}
            strokeLinecap="round"
          />

          {/* Rotating gear (teeth, pitch circle, hub, crank arm). */}
          <motion.g
            style={{
              rotate: gearRotate,
              transformBox: "view-box",
              transformOrigin: `${CX}px ${CY}px`,
            }}
          >
            <path
              d={GEAR_PATH}
              className="fill-blueline/5 stroke-ink"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R_PITCH - 4}
              className="stroke-blueline"
              strokeWidth={0.75}
              strokeDasharray="2 2"
              fill="none"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R_HUB}
              className="fill-paper stroke-ink"
              strokeWidth={1.4}
            />
            <circle cx={CX} cy={CY} r={2.4} className="fill-ink" />
            {/* Crank arm from center to pin (redline) */}
            <line
              x1={CX}
              y1={CY}
              x2={CX + CRANK_R}
              y2={CY}
              className="stroke-redline"
              strokeWidth={1.8}
            />
          </motion.g>

          {/* Crank-pin joint marker — sits on the rod's bottom end, on top of
              everything so the pinned connection reads clearly. */}
          <motion.circle
            cx={reduce ? START.pinX : rodBottomX}
            cy={reduce ? START.pinY : rodBottomY}
            r={2.8}
            className="fill-paper stroke-redline"
            strokeWidth={1.5}
          />
        </svg>
      </motion.div>
    </div>
  );
}
