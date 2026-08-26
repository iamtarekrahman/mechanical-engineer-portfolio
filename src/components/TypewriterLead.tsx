"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useInView } from "framer-motion";

type TypewriterLeadProps = {
  text: string;
  className?: string;
  /** ms per character while typing */
  speed?: number;
  /** ms per character while erasing */
  eraseSpeed?: number;
  /** ms to hold the full sentence before erasing */
  holdFull?: number;
  /** ms to pause when empty before retyping */
  holdEmpty?: number;
  /** Type once and stop (default). Set true to loop type→erase→retype. */
  loop?: boolean;
};

type Phase = "typing" | "holding" | "erasing" | "waiting";

/**
 * Types `text` out character by character, holds it, erases it, then repeats —
 * a continuous typewriter loop with a blinking caret, in the typewriter font.
 * Starts once the element enters view. Respects prefers-reduced-motion by
 * rendering the full text immediately with no motion and no loop.
 */
export function TypewriterLead({
  text,
  className = "",
  speed = 32,
  eraseSpeed = 16,
  holdFull = 8000,
  holdEmpty = 500,
  loop = false,
}: TypewriterLeadProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    if (reduce || !inView) return;

    let timer: number;

    if (phase === "typing") {
      if (count < text.length) {
        timer = window.setTimeout(() => setCount((c) => c + 1), speed);
      } else if (loop) {
        timer = window.setTimeout(() => setPhase("holding"), holdFull);
      }
      // Not looping: typing is complete — leave the full sentence in place
      // and let the caret keep blinking. No erase, no resize.
    } else if (phase === "holding") {
      timer = window.setTimeout(() => setPhase("erasing"), 0);
    } else if (phase === "erasing") {
      if (count > 0) {
        timer = window.setTimeout(() => setCount((c) => c - 1), eraseSpeed);
      } else {
        timer = window.setTimeout(() => setPhase("waiting"), holdEmpty);
      }
    } else if (phase === "waiting") {
      timer = window.setTimeout(() => setPhase("typing"), 0);
    }

    return () => window.clearTimeout(timer);
  }, [
    reduce,
    inView,
    phase,
    count,
    text.length,
    speed,
    eraseSpeed,
    holdFull,
    holdEmpty,
    loop,
  ]);

  const shown = reduce ? text : text.slice(0, count);

  return (
    <p ref={ref} className={`font-typewriter ${className}`} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
      {!reduce ? (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block w-[0.55ch] animate-caret bg-redline align-[-0.1em]"
          style={{ height: "1.05em" }}
        />
      ) : null}
    </p>
  );
}
