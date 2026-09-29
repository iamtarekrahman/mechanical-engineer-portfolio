"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type AriaAttributes,
  type PointerEvent,
  type ReactNode,
} from "react";
import styles from "./SpotlightCard.module.css";

export function SpotlightCard({
  children,
  className = "",
  as: Component = "article",
  variant = "card",
  accent = "amber",
  ...ariaProps
}: AriaAttributes & {
  children: ReactNode;
  className?: string;
  as?: "article" | "div" | "aside" | "h4";
  variant?: "card" | "panel" | "heading";
  accent?: "amber" | "teal";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const setRef = useCallback((element: HTMLElement | null) => {
    ref.current = element;
  }, []);
  const frame = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const canFollowPointer = useRef(false);

  const clearSpotlight = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    const element = ref.current;
    if (!element) return;
    delete element.dataset.spotlight;
    element.style.removeProperty("--spotlight-x");
    element.style.removeProperty("--spotlight-y");
  }, []);

  useEffect(() => {
    const pointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      canFollowPointer.current = pointerQuery.matches && !motionQuery.matches;
      if (!canFollowPointer.current) clearSpotlight();
    };

    updatePreference();
    pointerQuery.addEventListener("change", updatePreference);
    motionQuery.addEventListener("change", updatePreference);
    return () => {
      clearSpotlight();
      pointerQuery.removeEventListener("change", updatePreference);
      motionQuery.removeEventListener("change", updatePreference);
    };
  }, [clearSpotlight]);

  const followPointer = (event: PointerEvent<HTMLElement>) => {
    if (!canFollowPointer.current || event.pointerType === "touch") return;
    // Image previews use the top layer and should not move the panel's glow.
    if (
      event.target instanceof Element &&
      event.target.closest("dialog[open]")
    ) {
      clearSpotlight();
      return;
    }
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current !== null) return;

    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const element = ref.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      element.style.setProperty(
        "--spotlight-x",
        `${pointer.current.x - bounds.left}px`,
      );
      element.style.setProperty(
        "--spotlight-y",
        `${pointer.current.y - bounds.top}px`,
      );
      element.dataset.spotlight = "true";
    });
  };

  return (
    <Component
      {...ariaProps}
      ref={setRef}
      className={`${styles.surface} ${styles[variant]} ${accent === "teal" ? styles.teal : ""} ${className}`}
      onPointerMove={followPointer}
      onPointerLeave={clearSpotlight}
      onPointerCancel={clearSpotlight}
    >
      {children}
    </Component>
  );
}
