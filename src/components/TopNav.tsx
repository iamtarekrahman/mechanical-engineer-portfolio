"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = { id: string; label: string };

const ITEMS: NavItem[] = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "project", label: "Project" },
  { id: "certifications", label: "Certificates" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "affiliations", label: "Awards" },
  { id: "contact", label: "Contact" },
];

/**
 * Slim sticky top navigation with jump links to every major section. Uses the
 * browser's native anchor scrolling (globals.css sets scroll-behavior +
 * scroll-margin, and respects prefers-reduced-motion). Highlights the section
 * currently in view. Collapses to a scrollable strip on narrow screens.
 */
export function TopNav() {
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = ITEMS.map((i) => document.getElementById(i.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry nearest the top that is intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-0 z-40 border-b border-hairline bg-paper/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-2.5 sm:px-8">
        {/* Drawing-sheet mark / home link */}
        <a
          href="#top"
          className="mono-label shrink-0 text-ink transition-colors hover:text-blueline"
        >
          HOME <span className="text-graphite">/ DWG</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? "true" : undefined}
                className={`mono-label rounded-sm px-2 py-1 transition-colors hover:bg-blueline/10 hover:text-blueline ${
                  active === item.id
                    ? "bg-blueline/10 text-blueline"
                    : "text-graphite"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="mono-label inline-flex items-center gap-2 border border-hairline px-2.5 py-1 text-ink lg:hidden"
          >
            {menuOpen ? "CLOSE" : "INDEX"}
            <span aria-hidden="true" className="flex flex-col gap-[3px]">
              <span className="block h-px w-3.5 bg-current" />
              <span className="block h-px w-3.5 bg-current" />
              <span className="block h-px w-3.5 bg-current" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen ? (
        <ul
          id="mobile-nav"
          className="grid grid-cols-2 gap-1 border-t border-hairline bg-paper px-5 py-3 sm:px-8 lg:hidden"
        >
          {ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                aria-current={active === item.id ? "true" : undefined}
                className={`mono-label block rounded-sm px-2 py-2 transition-colors hover:bg-blueline/10 hover:text-blueline ${
                  active === item.id ? "text-blueline" : "text-graphite"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}
