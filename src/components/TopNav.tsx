"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from "react";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./TopNav.module.css";

const ITEMS = [
  { id: "project", label: "Project" },
  { id: "experience", label: "Work Experience" },
  { id: "certifications", label: "Credentials" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const EMPTY_HIGHLIGHT = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  visible: false,
  animate: false,
};

function useNavHighlight(
  containerRef: RefObject<HTMLElement>,
  active: string,
  enabled = true,
) {
  const [highlight, setHighlight] = useState(EMPTY_HIGHLIGHT);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const face = container.querySelector<HTMLElement>(
        "[aria-current] [data-nav-face]",
      );
      if (!enabled || !container.offsetWidth || !face) {
        setHighlight((previous) =>
          previous.visible ? EMPTY_HIGHLIGHT : previous,
        );
        return;
      }
      const bounds = face.getBoundingClientRect();
      const parent = container.getBoundingClientRect();
      const next = {
        left:
          bounds.left -
          parent.left -
          container.clientLeft +
          container.scrollLeft,
        top:
          bounds.top - parent.top - container.clientTop + container.scrollTop,
        width: bounds.width,
        height: bounds.height,
      };
      setHighlight((previous) => {
        if (
          previous.visible &&
          Object.entries(next).every(
            ([key, value]) => previous[key as keyof typeof next] === value,
          )
        )
          return previous;
        return { ...next, visible: true, animate: previous.visible };
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    container
      .querySelectorAll("[data-nav-face]")
      .forEach((face) => observer.observe(face));
    return () => observer.disconnect();
  }, [active, enabled, containerRef]);

  return highlight;
}

function NavHighlight({ highlight }: { highlight: typeof EMPTY_HIGHLIGHT }) {
  return (
    <span
      className={styles.indicator}
      data-nav-highlight
      data-animate={highlight.animate}
      aria-hidden="true"
      style={{
        transform: `translate(${highlight.left}px, ${highlight.top}px)`,
        width: highlight.width,
        height: highlight.height,
        opacity: highlight.visible ? 1 : 0,
      }}
    />
  );
}

export function TopNav() {
  const [active, setActive] = useState(ITEMS[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useRef<HTMLElement>(null);
  const desktop = useRef<HTMLDivElement>(null);
  const mobile = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const desktopHighlight = useNavHighlight(desktop, active);
  const mobileHighlight = useNavHighlight(mobile, active, menuOpen);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const sections = ITEMS.map((i) => document.getElementById(i.id)).filter(
        (el): el is HTMLElement => !!el,
      );
      const current = [...sections]
        .reverse()
        .find(
          (el) => el.getBoundingClientRect().top <= window.innerHeight * 0.35,
        );
      const atBottom =
        window.scrollY > 0 &&
        window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 2;
      setActive(
        atBottom ? ITEMS[ITEMS.length - 1].id : (current?.id ?? ITEMS[0].id),
      );
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuButton.current?.focus({ preventScroll: true });
      }
    };
    const closeOutside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !navigation.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    const wideScreen = window.matchMedia("(min-width: 901px)");
    const closeOnResize = () => {
      if (wideScreen.matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    wideScreen.addEventListener("change", closeOnResize);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      wideScreen.removeEventListener("change", closeOnResize);
    };
  }, [menuOpen]);

  function selectSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    setMenuOpen(false);
    const section = document.getElementById(id);
    if (!section) return;
    // Native anchors keep the URL and scrolling; focus leaves the closing menu.
    if (!section.hasAttribute("tabindex")) {
      section.setAttribute("tabindex", "-1");
      section.addEventListener(
        "blur",
        () => section.removeAttribute("tabindex"),
        {
          once: true,
        },
      );
    }
    section.focus({ preventScroll: true });
  }

  return (
    <nav
      ref={navigation}
      className={`site-nav ${styles.nav}`}
      aria-label="Main navigation"
    >
      <div className={`page-width ${styles.inner}`}>
        <a
          href="#top"
          className={styles.brand}
          onClick={() => setMenuOpen(false)}
          aria-label="Tarek Rahman, back to top"
        >
          <span className={styles.brandMark}>
            tr<span>.</span>
          </span>
          <span className={styles.brandName}>Tarek Rahman</span>
        </a>
        <div
          ref={desktop}
          className={styles.desktop}
          data-highlight-ready={desktopHighlight.visible}
        >
          <ul className={styles.links}>
            {ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={styles.navLink}
                  aria-current={active === item.id ? "location" : undefined}
                >
                  <span className={styles.linkFace} data-nav-face>
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <NavHighlight highlight={desktopHighlight} />
        </div>
        <div className={styles.controls}>
          <ThemeToggle />
          <button
            ref={menuButton}
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          >
            {menuOpen ? "Close" : "Index"}
            <span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
          </button>
        </div>
      </div>
      <div
        ref={mobile}
        id="mobile-nav"
        className={`page-width ${styles.mobileNav}`}
        data-highlight-ready={mobileHighlight.visible}
        hidden={!menuOpen}
      >
        <ul className={styles.mobileLinks}>
          {ITEMS.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={styles.navLink}
                onClick={(event) => selectSection(event, item.id)}
                aria-current={active === item.id ? "location" : undefined}
              >
                <span className={styles.linkFace} data-nav-face>
                  <span aria-hidden="true">0{i + 1}</span>
                  {item.label}
                  <span aria-hidden="true">↗</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <NavHighlight highlight={mobileHighlight} />
      </div>
    </nav>
  );
}
