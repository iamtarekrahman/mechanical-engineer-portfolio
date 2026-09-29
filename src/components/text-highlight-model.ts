export const HIGHLIGHT_COLORS = ["orange", "yellow", "green", "cyan", "pink"] as const;

export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];

export type TextAnchor = {
  start: number;
  end: number;
  quote: string;
  prefix: string;
  suffix: string;
};

export type HighlightEntry = {
  scope: string;
  color: HighlightColor;
  anchor: TextAnchor;
};

const CONTEXT_LENGTH = 32;
const MAX_HIGHLIGHTS = 200;
const MAX_QUOTE_LENGTH = 20_000;
const MAX_OFFSET = 1_000_000;
const MAX_SCOPE_LENGTH = 200;

function isColor(value: unknown): value is HighlightColor {
  return typeof value === "string" && HIGHLIGHT_COLORS.some((color) => color === value);
}

function isScope(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_SCOPE_LENGTH && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validOffsets(start: number, end: number): boolean {
  return Number.isSafeInteger(start) && Number.isSafeInteger(end) && start >= 0 && end > start && end <= MAX_OFFSET;
}

function isAnchor(value: unknown): value is TextAnchor {
  if (!isRecord(value)) return false;
  const { start, end, quote, prefix, suffix } = value;
  return typeof start === "number" && typeof end === "number" && validOffsets(start, end)
    && typeof quote === "string" && quote.length === end - start && quote.length <= MAX_QUOTE_LENGTH && quote.trim().length > 0
    && typeof prefix === "string" && prefix.length <= Math.min(CONTEXT_LENGTH, start)
    && typeof suffix === "string" && suffix.length <= CONTEXT_LENGTH;
}

/** Character offsets use UTF-16, matching DOM Text and Range offsets. */
export function createAnchor(text: string, start: number, end: number): TextAnchor | null {
  if (!validOffsets(start, end) || end > text.length || end - start > MAX_QUOTE_LENGTH) return null;
  const quote = text.slice(start, end);
  if (!quote.trim()) return null;
  return {
    start,
    end,
    quote,
    prefix: text.slice(Math.max(0, start - CONTEXT_LENGTH), start),
    suffix: text.slice(end, end + CONTEXT_LENGTH),
  };
}

/** Verify the quote and its context when client content changes during a visit. */
export function resolveAnchor(text: string, anchor: TextAnchor): { start: number; end: number } | null {
  if (!isAnchor(anchor)) return null;
  const matchesContext = (start: number) => {
    const end = start + anchor.quote.length;
    return text.slice(Math.max(0, start - anchor.prefix.length), start) === anchor.prefix
      && text.slice(end, end + anchor.suffix.length) === anchor.suffix;
  };
  if (text.slice(anchor.start, anchor.end) === anchor.quote && matchesContext(anchor.start)) {
    return { start: anchor.start, end: anchor.end };
  }

  let candidate = -1;
  let candidateCount = 0;
  let contextualCandidate = -1;
  let contextualCount = 0;
  let position = text.indexOf(anchor.quote);
  while (position !== -1) {
    candidate = position;
    candidateCount++;
    if (matchesContext(position)) {
      contextualCandidate = position;
      contextualCount++;
    }
    position = text.indexOf(anchor.quote, position + 1);
  }
  const start = contextualCount === 1 ? contextualCandidate : candidateCount === 1 ? candidate : -1;
  return start === -1 ? null : { start, end: start + anchor.quote.length };
}

/** Recolor or erase only the selected text, preserving either side of older marks. */
export function editHighlights(
  entries: HighlightEntry[],
  scope: string,
  text: string,
  start: number,
  end: number,
  color: HighlightColor | null,
): HighlightEntry[] {
  if (!isScope(scope) || (color !== null && !isColor(color)) || !createAnchor(text, start, end)) return entries;

  const untouched: HighlightEntry[] = [];
  const intervals: { start: number; end: number; color: HighlightColor }[] = [];
  for (const entry of entries) {
    if (entry.scope !== scope) {
      untouched.push(entry);
      continue;
    }
    const range = resolveAnchor(text, entry.anchor);
    if (!range) {
      // A temporarily inactive notebook page can return later with the same text.
      untouched.push(entry);
      continue;
    }
    if (range.end <= start || range.start >= end) {
      intervals.push({ ...range, color: entry.color });
    } else {
      if (range.start < start) intervals.push({ start: range.start, end: start, color: entry.color });
      if (range.end > end) intervals.push({ start: end, end: range.end, color: entry.color });
    }
  }
  if (color !== null) intervals.push({ start, end, color });
  intervals.sort((left, right) => left.start - right.start || left.end - right.end);

  const merged: typeof intervals = [];
  for (const interval of intervals) {
    const previous = merged[merged.length - 1];
    if (previous && previous.color === interval.color && previous.end >= interval.start
      && Math.max(previous.end, interval.end) - previous.start <= MAX_QUOTE_LENGTH) {
      previous.end = Math.max(previous.end, interval.end);
    } else {
      merged.push({ ...interval });
    }
  }

  const edited: HighlightEntry[] = [];
  const current: HighlightEntry[] = [];
  for (const interval of merged) {
    const anchor = createAnchor(text, interval.start, interval.end);
    if (!anchor) continue;
    const entry = { scope, color: interval.color, anchor };
    // Keep the latest chosen color if splitting many old highlights reaches the cap.
    if (color !== null && interval.start < end && interval.end > start) edited.push(entry);
    else current.push(entry);
  }
  return [...untouched, ...current, ...edited].slice(-MAX_HIGHLIGHTS);
}
