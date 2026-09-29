const SCOPES = "[data-highlight-scope], #main > section[id], #main > header[id]";
const EXCLUDED = "button, input, textarea, select, form, nav, dialog, svg, canvas, script, style, [contenteditable]:not([contenteditable='false']), [aria-hidden='true'], [hidden], [inert], [role='button'], [role='status'], [aria-live], .sr-only, [data-no-highlight]";

export type TextMap = {
  scope: string;
  element: HTMLElement;
  text: string;
  nodes: { node: Text; start: number; end: number }[];
};

export type SelectedText = { scope: string; text: string; start: number; end: number };

export function elementFor(node: Node) {
  return node instanceof Element ? node : node.parentElement;
}

export function isExcluded(node: Node) {
  return Boolean(elementFor(node)?.closest(EXCLUDED));
}

export function textMaps(main: HTMLElement): TextMap[] {
  return Array.from(main.querySelectorAll<HTMLElement>(SCOPES)).map(element => {
    const nodes: TextMap["nodes"] = [];
    let text = "";
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return !isExcluded(node) && elementFor(node)?.closest(SCOPES) === element
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });
    let node: Node | null;
    while ((node = walker.nextNode())) {
      nodes.push({ node: node as Text, start: text.length, end: text.length + (node.textContent?.length ?? 0) });
      text += node.textContent;
    }
    return { scope: element.dataset.highlightScope || element.id, element, text, nodes };
  });
}

export function selectedText(range: Range, maps: TextMap[]): SelectedText[] {
  const selections: SelectedText[] = [];
  for (const map of maps) {
    let start = Infinity;
    let end = -1;
    const finish = () => {
      while (start < end && /\s/.test(map.text[start])) start++;
      while (end > start && /\s/.test(map.text[end - 1])) end--;
      if (start < end) selections.push({ scope: map.scope, text: map.text, start, end });
      start = Infinity;
      end = -1;
    };
    for (const entry of map.nodes) {
      if (!range.intersectsNode(entry.node)) {
        finish();
        continue;
      }
      const from = entry.start + (range.startContainer === entry.node ? range.startOffset : 0);
      const to = range.endContainer === entry.node ? entry.start + range.endOffset : entry.end;
      if (to <= from) continue;
      // Keep the text map stable across native disclosure toggles, but do not
      // let a drag across a closed disclosure select its invisible contents.
      if (!visibleText(entry.node, from - entry.start, to - entry.start)) {
        finish();
        continue;
      }
      if (end !== -1 && end !== from) finish();
      start = Math.min(start, from);
      end = Math.max(end, to);
    }
    finish();
  }
  return selections;
}

function visibleText(node: Text, start: number, end: number): boolean {
  const element = node.parentElement;
  if (!element) return false;
  let disclosure = element.closest("details:not([open])");
  while (disclosure) {
    const summary = disclosure.querySelector(":scope > summary");
    if (!summary?.contains(node)) return false;
    disclosure = disclosure.parentElement?.closest("details:not([open])") ?? null;
  }
  const visibility = getComputedStyle(element).visibility;
  if (visibility === "hidden" || visibility === "collapse") return false;
  const fragment = document.createRange();
  fragment.setStart(node, start);
  fragment.setEnd(node, end);
  return Array.from(fragment.getClientRects()).some(rect => rect.width > 0 && rect.height > 0);
}

/** Paint individual text nodes so a selection never colors intervening controls. */
export function rangesFor(map: TextMap, start: number, end: number): Range[] {
  return map.nodes.flatMap(entry => {
    const from = Math.max(start, entry.start);
    const to = Math.min(end, entry.end);
    if (from >= to) return [];
    const range = document.createRange();
    range.setStart(entry.node, from - entry.start);
    range.setEnd(entry.node, to - entry.start);
    return [range];
  });
}
