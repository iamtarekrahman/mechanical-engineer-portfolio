"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  HIGHLIGHT_COLORS, editHighlights, resolveAnchor,
  type HighlightColor, type HighlightEntry,
} from "./text-highlight-model";
import { isExcluded, rangesFor, selectedText, textMaps } from "./text-highlight-dom";
import styles from "./TextHighlighter.module.css";

const highlightName = (color: HighlightColor) => `portfolio-${color}`;
type Position = { left: number; top: number };
type PaintedHighlight = { entry: HighlightEntry; ranges: Range[] };
type HoveredHighlight = { entry: HighlightEntry; rect: DOMRect; x: number };

function popupPosition(anchor: DOMRect, box: DOMRect, gap: number, center = anchor.left + anchor.width / 2): Position {
  const viewport = window.visualViewport;
  const x = viewport?.offsetLeft ?? 0;
  const y = viewport?.offsetTop ?? 0;
  const width = viewport?.width ?? window.innerWidth;
  const height = viewport?.height ?? window.innerHeight;
  const navBottom = document.querySelector(".site-nav")?.getBoundingClientRect().bottom ?? y;
  const topLimit = Math.max(y, navBottom) + 10;
  const preferredTop = anchor.top - box.height - gap;
  return {
    left: Math.max(x + 10, Math.min(center - box.width / 2, x + width - box.width - 10)),
    top: Math.max(topLimit, Math.min(preferredTop >= topLimit ? preferredTop : anchor.bottom + gap, y + height - box.height - 10)),
  };
}

/** Browser-owned ranges leave React's rendered text and markup intact. */
export function TextHighlighter() {
  const toolbar = useRef<HTMLDivElement>(null);
  const clearPopup = useRef<HTMLDivElement>(null);
  const pending = useRef<Range | null>(null);
  const hovered = useRef<HoveredHighlight | null>(null);
  const chosenColor = useRef<HighlightColor>("orange");
  const actions = useRef<{
    apply: (color?: HighlightColor) => void;
    clearHovered: () => void;
    dismiss: () => void;
  } | null>(null);
  const [menu, setMenu] = useState<Position | null>(null);
  const [clearMenu, setClearMenu] = useState<Position | null>(null);
  const [defaultColor, setDefaultColor] = useState<HighlightColor>("orange");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const main = document.getElementById("main");
    if (!main || !window.Highlight || !window.CSS?.highlights) return;
    // Remove saved marks from the previous implementation; new marks live only here.
    try { localStorage.removeItem("portfolio:text-highlights:v1"); } catch { /* Storage is optional. */ }
    let highlights: HighlightEntry[] = [];
    let painted: PaintedHighlight[] = [];
    let selecting = false;
    let selectionTimer = 0;
    let clearTimer = 0;
    let paintFrame = 0;
    let hoverFrame = 0;
    let pointer: { x: number; y: number } | null = null;
    const hoverQuery = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");

    function dismissSelection() {
      clearTimeout(selectionTimer);
      pending.current = null;
      setMenu(null);
    }

    function hideClear() {
      clearTimeout(clearTimer);
      clearTimer = 0;
      hovered.current = null;
      setClearMenu(null);
    }

    function dismiss() {
      dismissSelection();
      hideClear();
    }

    function paint() {
      paintFrame = 0;
      const maps = textMaps(main!);
      painted = [];
      for (const entry of highlights) {
        const map = maps.find(item => item.scope === entry.scope);
        if (!map) continue;
        const offsets = resolveAnchor(map.text, entry.anchor);
        if (offsets) painted.push({ entry, ranges: rangesFor(map, offsets.start, offsets.end) });
      }
      for (const color of HIGHLIGHT_COLORS) {
        const ranges = painted.filter(item => item.entry.color === color).flatMap(item => item.ranges);
        CSS.highlights.set(highlightName(color), new Highlight(...ranges));
      }
    }

    function updateHover() {
      hoverFrame = 0;
      if (!pointer || selecting || pending.current || document.querySelector("dialog[open]")) return hideClear();
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) return hideClear();
      const target = document.elementFromPoint(pointer.x, pointer.y);
      if (target && clearPopup.current?.contains(target)) {
        clearTimeout(clearTimer);
        clearTimer = 0;
        return;
      }
      if (target && main!.contains(target) && !isExcluded(target)) {
        for (const item of painted) {
          for (const range of item.ranges) {
            // The hit element must contain the painted text, so overlays and
            // gaps between lines never count as hovering a highlight.
            if (!range.startContainer.isConnected || !target.contains(range.startContainer)) continue;
            const rect = Array.from(range.getClientRects()).find(box =>
              pointer!.x >= box.left && pointer!.x <= box.right && pointer!.y >= box.top && pointer!.y <= box.bottom,
            );
            if (!rect) continue;
            clearTimeout(clearTimer);
            clearTimer = 0;
            if (hovered.current?.entry !== item.entry || hovered.current.rect.top !== rect.top || hovered.current.rect.left !== rect.left) {
              hovered.current = { entry: item.entry, rect, x: pointer.x };
              setClearMenu({ left: pointer.x, top: rect.top });
            }
            return;
          }
        }
      }
      // A brief handoff lets the pointer cross the gap to the clear button.
      if (hovered.current && !clearTimer) clearTimer = window.setTimeout(hideClear, 120);
    }

    function pointerMove(event: PointerEvent) {
      if (event.pointerType === "touch" || !hoverQuery.matches || (!painted.length && !hovered.current)) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (!hoverFrame) hoverFrame = requestAnimationFrame(updateHover);
    }

    function readSelection() {
      if (selecting || toolbar.current?.contains(document.activeElement) || clearPopup.current?.contains(document.activeElement)) return;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount || document.querySelector("dialog[open]")) {
        dismissSelection();
        return;
      }
      const range = selection.getRangeAt(0);
      if (!main!.contains(range.startContainer) || !main!.contains(range.endContainer) ||
          isExcluded(range.startContainer) || isExcluded(range.endContainer) ||
          (document.activeElement && isExcluded(document.activeElement))) {
        dismiss();
        return;
      }
      const selections = selectedText(range, textMaps(main!));
      if (!selections.length || selections.some(item => item.end - item.start > 20000)) {
        dismiss();
        return;
      }
      const bounds = range.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return dismiss();
      hideClear();
      pending.current = range.cloneRange();
      setMenu({ left: bounds.left + bounds.width / 2, top: bounds.top });
      setAnnouncement("Text selected. Press Tab to highlight it or choose a color.");
    }

    function scheduleSelection() {
      clearTimeout(selectionTimer);
      selectionTimer = window.setTimeout(readSelection, 120);
    }

    function pointerDown(event: PointerEvent) {
      if (event.target instanceof Node && (toolbar.current?.contains(event.target) || clearPopup.current?.contains(event.target))) return;
      dismiss();
      selecting = event.pointerType === "mouse" && event.button === 0;
    }

    function pointerUp(event: PointerEvent) {
      selecting = false;
      if (event.target instanceof Node && (toolbar.current?.contains(event.target) || clearPopup.current?.contains(event.target))) return;
      scheduleSelection();
    }

    function focusText() {
      const element = pending.current?.startContainer.parentElement;
      if (!element?.isConnected) return;
      const prior = element.getAttribute("tabindex");
      element.setAttribute("tabindex", "-1");
      element.focus({ preventScroll: true });
      if (prior === null) element.removeAttribute("tabindex");
      else element.setAttribute("tabindex", prior);
    }

    function apply(color = chosenColor.current) {
      const current = pending.current;
      if (!current || !current.startContainer.isConnected || !current.endContainer.isConnected) return dismiss();
      chosenColor.current = color;
      setDefaultColor(color);
      // Re-read the live ranges if a disclosure or client component changed.
      const selections = selectedText(current, textMaps(main!));
      for (const selected of selections) {
        highlights = editHighlights(highlights, selected.scope, selected.text, selected.start, selected.end, color);
      }
      paint();
      if (toolbar.current?.contains(document.activeElement)) focusText();
      window.getSelection()?.removeAllRanges();
      dismiss();
      setAnnouncement(`${color[0].toUpperCase() + color.slice(1)} highlight applied.`);
    }

    function clearHovered() {
      if (!hovered.current) return;
      const entry = hovered.current.entry;
      highlights = highlights.filter(item => item !== entry);
      dismiss();
      paint();
      setAnnouncement("Highlight cleared.");
    }

    function keyDown(event: KeyboardEvent) {
      if (!pending.current && !hovered.current) return;
      const inToolbar = toolbar.current?.contains(document.activeElement);
      if (event.key === "Escape") {
        if (inToolbar) focusText();
        dismiss();
      } else if (event.key === "Tab" && !event.shiftKey && !inToolbar && pending.current) {
        event.preventDefault();
        toolbar.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
      }
    }

    const observer = new MutationObserver(records => {
      if (!records.some(record => !isExcluded(record.target))) return;
      dismiss();
      if (!paintFrame) paintFrame = requestAnimationFrame(paint);
    });
    // Ignore animated style attributes from the drawings and cursor spotlights.
    observer.observe(main, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["data-highlight-scope", "open", "hidden"] });
    actions.current = { apply, clearHovered, dismiss };
    paint();
    document.addEventListener("selectionchange", scheduleSelection);
    document.addEventListener("pointerdown", pointerDown);
    document.addEventListener("pointermove", pointerMove);
    document.addEventListener("pointerleave", hideClear);
    document.addEventListener("pointerup", pointerUp);
    document.addEventListener("pointercancel", pointerUp);
    document.addEventListener("keydown", keyDown);
    document.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    window.visualViewport?.addEventListener("resize", dismiss);
    window.addEventListener("blur", dismiss);
    return () => {
      clearTimeout(selectionTimer);
      clearTimeout(clearTimer);
      cancelAnimationFrame(paintFrame);
      cancelAnimationFrame(hoverFrame);
      observer.disconnect();
      document.removeEventListener("selectionchange", scheduleSelection);
      document.removeEventListener("pointerdown", pointerDown);
      document.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("pointerleave", hideClear);
      document.removeEventListener("pointerup", pointerUp);
      document.removeEventListener("pointercancel", pointerUp);
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
      window.visualViewport?.removeEventListener("resize", dismiss);
      window.removeEventListener("blur", dismiss);
      for (const color of HIGHLIGHT_COLORS) CSS.highlights.delete(highlightName(color));
      actions.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (!menu || !toolbar.current || !pending.current) return;
    const position = popupPosition(pending.current.getBoundingClientRect(), toolbar.current.getBoundingClientRect(), 10);
    if (Math.abs(position.left - menu.left) > 0.5 || Math.abs(position.top - menu.top) > 0.5) setMenu(position);
  }, [menu]);

  useLayoutEffect(() => {
    if (!clearMenu || !clearPopup.current || !hovered.current) return;
    const position = popupPosition(hovered.current.rect, clearPopup.current.getBoundingClientRect(), 0, hovered.current.x);
    if (Math.abs(position.left - clearMenu.left) > 0.5 || Math.abs(position.top - clearMenu.top) > 0.5) setClearMenu(position);
  }, [clearMenu]);

  return <>
    <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    {menu && createPortal(
      <div
        ref={toolbar}
        className={styles.toolbar}
        role="toolbar"
        aria-label="Highlight selected text"
        style={{ left: menu.left, top: menu.top }}
        onPointerDown={event => event.preventDefault()}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) actions.current?.dismiss();
        }}
        onKeyDown={event => {
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
          const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
          let next: number;
          if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
          else if (event.key === "ArrowLeft") next = (index + buttons.length - 1) % buttons.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = buttons.length - 1;
          else return;
          event.preventDefault();
          buttons[next]?.focus();
        }}
      >
        <button
          type="button"
          className={styles.label}
          data-color={defaultColor}
          aria-label={`Highlight selected text in ${defaultColor}`}
          title={`Highlight in ${defaultColor}`}
          onClick={() => actions.current?.apply()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 4 6 6-9 9-6-6 9-9ZM5 13l-2 7 7-2M3 22h10" /></svg>
          <span>Highlight</span>
        </button>
        {HIGHLIGHT_COLORS.map(color => <button
          key={color}
          type="button"
          className={styles.swatch}
          data-color={color}
          aria-label={`Highlight ${color}`}
          aria-pressed={defaultColor === color}
          title={`Highlight ${color} and use it next time`}
          onClick={() => actions.current?.apply(color)}
        ><span /></button>)}
      </div>, document.body,
    )}
    {clearMenu && createPortal(
      <div ref={clearPopup} className={styles.clearPopup} style={clearMenu} onPointerDown={event => event.preventDefault()}>
        <button type="button" className={styles.clearButton} aria-label="Clear highlight" onClick={() => actions.current?.clearHovered()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 3 6 6-12 12H5l-3-3L15 3ZM8 12l6 6M12 21h9" /></svg>
          Clear
        </button>
      </div>, document.body,
    )}
  </>;
}
