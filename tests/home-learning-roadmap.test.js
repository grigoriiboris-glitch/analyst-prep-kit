const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
function read(file) { return fs.readFileSync(path.join(root, file), "utf8"); }

const expected = [
  "foundations", "business-analysis", "data-quality", "excel", "sql",
  "chart-literacy", "postgresql", "python", "stats", "forecasting",
  "powerbi", "tableau", "decision-making", "portfolio-projects",
  "projects", "simulator", "interview", "final"
];

test("homepage renders an accessible visual roadmap using the existing 18-step learning order", () => {
  const home = read("index.html");
  const order = read("assets/learning-order.js");

  assert.ok(home.includes('src="assets/learning-order.js"'), "The homepage must load the roadmap script");
  assert.ok(order.includes("Рекомендуемый маршрут — 18 шагов"), "The existing ordered-skill explanation must remain");
  assert.ok(order.includes("apkHomeLearningMap"), "The visual roadmap must be mounted on the homepage");
  assert.ok(order.includes("apk-roadmap-list"), "The roadmap must render a timeline list");
  assert.ok(order.includes("insertBefore(map, kits)"), "The roadmap must appear before the skill catalog");
  assert.ok(order.includes('role="progressbar"'), "The aggregate progress must expose progressbar semantics");
  assert.ok(order.includes('aria-current="step"'), "The next unfinished stage must be announced to assistive technology");
  assert.ok(order.includes("@media(max-width:760px)"), "The timeline must adapt to narrow screens");

  const matched = Array.from(order.matchAll(/\['([^']+)',(\d+),'([^']+)'\]/g))
    .map((match) => ({ id: match[1], step: Number(match[2]) }));
  assert.deepEqual(matched.map((item) => item.id), expected);
  assert.deepEqual(matched.map((item) => item.step), expected.map((_, index) => index + 1));

  for (const id of expected) {
    assert.ok(home.includes('data-kit="' + id + '"'), "Homepage is missing the course link: " + id);
    const configPattern = new RegExp("['\\"]?" + id + "['\\"]?\\s*:");
    assert.ok(configPattern.test(order), "The roadmap is missing course metadata or progress mapping: " + id);
  }
});

test("roadmap reads progress from existing course saves without adding a second progress store", () => {
  const order = read("assets/learning-order.js");
  const expectedStorageKeys = [
    "apk-foundations-progress-v1", "apk-business-analysis-progress-v1",
    "apk-quality-passed-v1", "epk", "sqlkit-v1", "clk-v1",
    "apk-postgresql-progress-v1", "ppk", "spk", "fmk-v1",
    "pbikt-v1", "tpk", "apk-decision-thinking-progress-v1",
    "apk-portfolio-' + project + '-checks", "apk-projects-v1", "sim2", "ipk", "apk-final"
  ];

  assert.ok(order.includes("function readProgress(id)"));
  assert.ok(order.includes("function readStorage(key)"));
  assert.ok(order.includes("function renderRoadmap()"));
  for (const key of expectedStorageKeys) {
    assert.ok(order.includes(key), "The roadmap is missing an existing progress source: " + key);
  }
  assert.ok(order.includes("Следующий шаг"));
  assert.ok(order.includes("В процессе"));
  assert.ok(order.includes("Пройдено"));
});
