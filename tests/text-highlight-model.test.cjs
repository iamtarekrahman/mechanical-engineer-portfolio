const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const filename = path.join(__dirname, "../src/components/text-highlight-model.ts");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText;
const loaded = { exports: {} };
new Function("exports", "module", compiled)(loaded.exports, loaded);
const { HIGHLIGHT_COLORS, createAnchor, resolveAnchor, editHighlights } = loaded.exports;
const mark = (text, start, end, color = "yellow", scope = "experience") => ({ scope, color, anchor: createAnchor(text, start, end) });
const ranges = (entries) => entries.map(({ color, anchor }) => [anchor.start, anchor.end, color]).sort((a, b) => a[0] - b[0]);

test("partial recoloring preserves the original marker on both sides", () => {
  const text = "0123456789";
  const original = [mark(text, 0, 10)];
  const updated = editHighlights(original, "experience", text, 3, 7, "pink");
  assert.deepEqual(ranges(updated), [[0, 3, "yellow"], [3, 7, "pink"], [7, 10, "yellow"]]);
  assert.deepEqual(ranges(original), [[0, 10, "yellow"]], "Edits must not mutate state held by the caller");
  for (const entry of updated) assert.deepEqual(resolveAnchor(text, entry.anchor), { start: entry.anchor.start, end: entry.anchor.end });
});

test("erasing part of a highlight preserves both ends and other sections", () => {
  const text = "0123456789";
  const other = mark("Other words", 0, 5, "cyan", "about");
  const updated = editHighlights([mark(text, 0, 10), other], "experience", text, 3, 7, null);
  assert.deepEqual(ranges(updated.filter((item) => item.scope === "experience")), [[0, 3, "yellow"], [7, 10, "yellow"]]);
  assert.ok(updated.includes(other));
  assert.deepEqual(editHighlights(updated.filter((item) => item.scope === "experience"), "experience", text, 0, 10, null), []);
});

test("selection crossing old colors replaces only its overlap and merges adjacent matching marks", () => {
  const text = "0123456789abcdef";
  let entries = [mark(text, 0, 5, "orange"), mark(text, 7, 12, "green")];
  entries = editHighlights(entries, "experience", text, 3, 9, "cyan");
  assert.deepEqual(ranges(entries), [[0, 3, "orange"], [3, 9, "cyan"], [9, 12, "green"]]);
  entries = editHighlights(entries, "experience", text, 0, 3, "cyan");
  assert.deepEqual(ranges(entries), [[0, 9, "cyan"], [9, 12, "green"]]);
});

test("anchors relocate a uniquely identifiable phrase after surrounding text changes", () => {
  const text = "Precision in mechanical design matters.";
  const start = text.indexOf("mechanical");
  const anchor = createAnchor(text, start, start + "mechanical design".length);
  assert.deepEqual(resolveAnchor(text, anchor), { start, end: start + 17 });
  const changed = "Updated: " + text;
  assert.deepEqual(resolveAnchor(changed, anchor), { start: start + 9, end: start + 26 });
  assert.deepEqual(resolveAnchor("Mechanical work: mechanical design.", anchor), { start: 17, end: 34 });
  assert.equal(resolveAnchor("Mechanical work only.", anchor), null);
});

test("repeated phrases retain verified context but ambiguous replacement content is skipped", () => {
  const text = "First design and second design.";
  const start = text.lastIndexOf("design");
  const anchor = createAnchor(text, start, start + 6);
  assert.deepEqual(resolveAnchor(text, anchor), { start, end: start + 6 });
  assert.deepEqual(resolveAnchor("Note: " + text, anchor), { start: start + 6, end: start + 12 });
  assert.equal(resolveAnchor("New design and another design.", anchor), null);
  assert.equal(resolveAnchor("x".repeat(start) + "design and extra design", anchor), null, "A quote still at its old offset is not enough when context changed");
});

test("editing unrelated text retains anchors for temporarily absent dynamic content", () => {
  const inactive = mark("Earlier notebook page", 0, 7, "green", "project");
  const current = "Current notebook text";
  const updated = editHighlights([inactive], "project", current, 0, 7, "pink");
  assert.ok(updated.includes(inactive));
  assert.equal(updated.length, 2);
});

test("the palette offers exactly the five supported colors", () => {
  assert.deepEqual(HIGHLIGHT_COLORS, ["orange", "yellow", "green", "cyan", "pink"]);
});

test("invalid selections are ignored and UTF-16 offsets preserve emoji correctly", () => {
  const text = "Design ⚙️ and 🔧 testing";
  const start = text.indexOf("🔧");
  const anchor = createAnchor(text, start, start + 2);
  assert.equal(anchor.quote, "🔧");
  assert.deepEqual(resolveAnchor(text, anchor), { start, end: start + 2 });
  for (const [from, to] of [[0, 0], [-1, 2], [0.5, 2], [0, 999], [NaN, 1]]) assert.equal(createAnchor(text, from, to), null);
  assert.equal(createAnchor("   ", 0, 3), null);
  const entries = [mark("Valid", 0, 5)];
  assert.equal(editHighlights(entries, "experience", text, 0, 0, "yellow"), entries);
});

test("the latest edit is retained when the highlight limit is reached", () => {
  const text = "New highlight";
  const existing = Array.from({ length: 200 }, (_, index) => mark("Previous text", 0, 8, "yellow", `section-${index}`));
  const updated = editHighlights(existing, "experience", text, 0, 3, "pink");
  assert.equal(updated.length, 200);
  assert.ok(updated.some((entry) => entry.scope === "experience" && entry.color === "pink"));
});

test("adjacent large selections remain painted when their union exceeds one anchor's limit", () => {
  const text = "a".repeat(15_000) + "b".repeat(15_000);
  const updated = editHighlights([mark(text, 0, 15_000)], "experience", text, 15_000, 30_000, "yellow");
  assert.deepEqual(ranges(updated), [[0, 15_000, "yellow"], [15_000, 30_000, "yellow"]]);
});
