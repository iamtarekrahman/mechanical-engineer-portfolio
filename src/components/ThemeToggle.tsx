"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "./icons";

type Mode = "light" | "dark" | "system";

function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function isDark(mode: Mode) {
  return mode === "dark" || (mode === "system" && systemPrefersDark());
}

function applyTheme(mode: Mode) {
  document.documentElement.setAttribute(
    "data-theme",
    isDark(mode) ? "dark" : "light",
  );
}

/**
 * Sliding Sun / Moon theme switch. Toggles between light and dark; the initial
 * state resolves from the saved choice or the OS preference (applied pre-paint
 * by the layout's inline script, so there's no flash). Choosing a side stores
 * an explicit "light" or "dark" preference.
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Mode | null) ?? "system";
    setMode(stored);
    setMounted(true);
  }, []);

  // Track OS changes while still on "system".
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyTheme("system");
      // force re-render so the knob reflects the new system state
      setMode("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const dark = mounted ? isDark(mode) : false;

  function toggle() {
    const next: Mode = dark ? "light" : "dark";
    setMode(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Dark theme" : "Light theme"}
      onClick={toggle}
      className="relative inline-flex h-7 w-14 items-center rounded-full border border-hairline bg-[color-mix(in_srgb,var(--blueline)_8%,var(--paper))] transition-colors"
    >
      {/* Track icons */}
      <span className="pointer-events-none absolute left-1.5 text-graphite">
        <SunIcon size={13} />
      </span>
      <span className="pointer-events-none absolute right-1.5 text-graphite">
        <MoonIcon size={13} />
      </span>
      {/* Sliding knob showing the active icon */}
      <span
        className={`pointer-events-none z-10 flex h-5 w-5 items-center justify-center rounded-full bg-paper text-blueline shadow-sm ring-1 ring-hairline transition-transform duration-200 ${
          dark ? "translate-x-[1.85rem]" : "translate-x-[0.15rem]"
        }`}
      >
        {dark ? <MoonIcon size={12} /> : <SunIcon size={12} />}
      </span>
    </button>
  );
}
