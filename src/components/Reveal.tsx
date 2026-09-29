"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Content is visible in the server render. Only groups below the initial
 * viewport receive a one-time reveal, with no persistent transform afterward.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      !window.IntersectionObserver ||
      !element.animate ||
      !window.matchMedia
    ) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isHashTarget = () => {
      if (!window.location.hash) return false;
      try {
        const target = document.getElementById(
          decodeURIComponent(window.location.hash.slice(1)),
        );
        return Boolean(
          target && (element.contains(target) || target.contains(element)),
        );
      } catch {
        return false;
      }
    };

    // Avoid hiding content that was already painted or reached directly.
    if (
      reducedMotion.matches ||
      element.getBoundingClientRect().top < window.innerHeight ||
      element.contains(document.activeElement) ||
      isHashTarget()
    ) {
      return;
    }

    let animation: Animation | null = null;
    let complete = false;
    const showImmediately = () => {
      complete = true;
      observer.disconnect();
      animation?.cancel();
      animation = null;
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (complete || !entries.some((entry) => entry.isIntersecting)) return;
        if (
          reducedMotion.matches ||
          element.contains(document.activeElement) ||
          isHashTarget()
        ) {
          showImmediately();
          return;
        }

        complete = true;
        observer.disconnect();
        animation = element.animate(
          [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 450,
            delay: Math.min(Math.max(delay, 0), 0.3) * 1000,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "both",
          },
        );
        // Remove the animation entirely, so fixed descendants keep their
        // viewport positioning and no opacity/transform styles linger.
        animation.onfinish = () => {
          animation?.cancel();
          animation = null;
        };
      },
      { threshold: 0 },
    );

    const onPreferenceChange = () => {
      if (reducedMotion.matches) showImmediately();
    };
    const onHashChange = () => {
      if (isHashTarget()) showImmediately();
    };

    observer.observe(element);
    element.addEventListener("focusin", showImmediately);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("beforeprint", showImmediately);
    reducedMotion.addEventListener("change", onPreferenceChange);

    return () => {
      showImmediately();
      element.removeEventListener("focusin", showImmediately);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("beforeprint", showImmediately);
      reducedMotion.removeEventListener("change", onPreferenceChange);
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
