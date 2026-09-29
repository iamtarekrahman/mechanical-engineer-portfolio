"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./icons";
import type { ThemeToggleScene } from "./theme-toggle-scene";
import "./theme-toggle.css";

type Preference = "light" | "dark" | "system";
let memoryPreference: Preference | null = null;

function preference(): Preference {
  if (memoryPreference) return memoryPreference;
  try {
    const saved = window.localStorage.getItem("theme");
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

function readDark() {
  const declared = document.documentElement.dataset.theme;
  if (declared === "light" || declared === "dark") return declared === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyPreference(selected: Preference) {
  const dark = selected === "dark" ||
    (selected === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

function subscribeTheme(notify: () => void) {
  const root = document.documentElement;
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystem = () => {
    if (preference() === "system") applyPreference("system");
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== "theme" && event.key !== null) return;
    memoryPreference = null;
    applyPreference(preference());
  };
  const observer = new MutationObserver(notify);
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  system.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  return () => {
    observer.disconnect();
    system.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
  };
}

const serverDark = () => false;

/** A real theme control with a compact ThreeUI shader treatment over a CSS fallback. */
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeTheme, readDark, serverDark);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ThemeToggleScene | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;

    // The CSS switch is immediately useful; load WebGL only after hydration.
    void import("./theme-toggle-scene").then(({ createThemeToggleScene }) => {
      if (disposed) return;
      try {
        sceneRef.current = createThemeToggleScene(canvas, {
          dark: readDark(),
          onFailure: () => { if (!disposed) setRendered(false); },
        });
        setRendered(true);
      } catch {
        // The underlying CSS control keeps the same interaction and geometry.
        setRendered(false);
      }
    }).catch(() => { if (!disposed) setRendered(false); });

    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => { sceneRef.current?.setDark(dark); }, [dark]);

  function toggle() {
    // Read the document so an external theme change cannot make a click stale.
    const next = readDark() ? "light" : "dark";
    try {
      window.localStorage.setItem("theme", next);
      memoryPreference = null;
    } catch {
      memoryPreference = next;
    }
    applyPreference(next);
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title="Toggle dark mode"
      className="theme-switch"
      data-renderer={rendered ? "webgl" : "css"}
      onClick={toggle}
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        sceneRef.current?.setPointer(
          ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
          -((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
        );
      }}
      onPointerLeave={() => sceneRef.current?.setPointer(0, 0)}
      onFocus={() => sceneRef.current?.wake()}
    >
      <span className="theme-switch__track" aria-hidden="true">
        <span className="theme-switch__fallback-thumb" />
        <canvas ref={canvasRef} className="theme-switch__canvas" width="160" height="72" />
      </span>
      <span className="theme-switch__symbol" aria-hidden="true">
        <SunIcon size={13} className="theme-switch__sun" />
        <MoonIcon size={12} className="theme-switch__moon" />
      </span>
    </button>
  );
}
