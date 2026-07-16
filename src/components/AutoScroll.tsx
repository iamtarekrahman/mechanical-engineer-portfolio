"use client";

import { ReactNode, useEffect, useRef } from "react";

const INTERVAL_MS = 3000;
const RESUME_AFTER_MS = 5000;

/**
 * Horizontal card strip that auto-advances one card every INTERVAL_MS.
 * After the last card, loops back to the first. Only runs on narrow (mobile)
 * viewports — above `sm` the container is a normal grid/stack (via the caller's
 * className, e.g. `h-scroll sm:grid ...`) and this component becomes a no-op.
 *
 * Pauses on user interaction (touch, wheel, pointer) and resumes after
 * RESUME_AFTER_MS of inactivity. Also pauses when the tab is hidden and when
 * the strip is not intersecting the viewport.
 */
export function AutoScroll({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const self = stripRef.current;
    if (!self) return;
    // The strip is either this element (when className includes `h-scroll`)
    // or a descendant with the `.h-scroll` class (when the caller renders
    // its own scrolling container inside, e.g. a <ul>).
    const strip: HTMLElement | null = self.classList.contains("h-scroll")
      ? self
      : self.querySelector<HTMLElement>(".h-scroll");
    if (!strip) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function isMobile() {
      return window.matchMedia("(max-width: 639.98px)").matches;
    }

    function step() {
      if (!strip || pausedRef.current || !visibleRef.current) return;
      if (!isMobile()) return;

      const kids = Array.from(strip.children) as HTMLElement[];
      if (kids.length === 0) return;

      const currentLeft = strip.scrollLeft;
      let idx = 0;
      for (let i = 0; i < kids.length; i++) {
        if (kids[i].offsetLeft <= currentLeft + 4) idx = i;
      }
      const next = idx + 1;
      const atEnd =
        strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4;
      const target = atEnd || next >= kids.length ? kids[0] : kids[next];
      strip.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    }

    function start() {
      if (timerRef.current) return;
      timerRef.current = window.setInterval(step, INTERVAL_MS);
    }
    function stop() {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    function pause() {
      pausedRef.current = true;
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = window.setTimeout(() => {
        pausedRef.current = false;
      }, RESUME_AFTER_MS);
    }
    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visibleRef.current = e.isIntersecting;
      },
      { threshold: 0.1 },
    );
    io.observe(strip);

    strip.addEventListener("touchstart", pause, { passive: true });
    strip.addEventListener("pointerdown", pause);
    strip.addEventListener("wheel", pause, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    start();

    return () => {
      stop();
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
      io.disconnect();
      strip.removeEventListener("touchstart", pause);
      strip.removeEventListener("pointerdown", pause);
      strip.removeEventListener("wheel", pause);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={stripRef} className={className}>
      {children}
    </div>
  );
}
