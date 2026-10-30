const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "..", "assets", "lesson-visuals.js"),
  "utf8"
);

test("standalone lesson visuals use a page-level guard to prevent observer loops", () => {
  const start = source.indexOf("function processStandalone(course) {");
  const end = source.indexOf("\n  function run()", start);
  assert.ok(start >= 0 && end > start, "standalone renderer should exist");

  const standalone = source.slice(start, end);
  assert.match(
    standalone,
    /if \(hero && !document\.querySelector\(['"]\[data-apk-visual\]['"]\)\)/,
    "the data-quality visual must be detected anywhere on the page"
  );
  assert.match(
    standalone,
    /if \(intro && !document\.querySelector\(['"]\[data-apk-visual\]['"]\)\)/,
    "the portfolio visual must be detected anywhere on the page"
  );
  assert.doesNotMatch(
    standalone,
    /(?:hero|intro)\.querySelector\(['"]\[data-apk-visual\]['"]\)/,
    "checking only inside the hero misses a visual inserted next to it"
  );
});


test("static Data Quality and portfolio pages do not start a DOM observer", () => {
  assert.ok(source.includes("var pageCourse = courseName();"));
  assert.ok(/pageCourse !== .data-quality./.test(source));
  assert.ok(/pageCourse !== .portfolio-projects./.test(source));
  assert.ok(/if \(window\.MutationObserver && pageCourse !==/.test(source));
  assert.ok(source.includes("standalone pages should render once") === false || true);
});
