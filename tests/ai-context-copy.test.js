const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("AI context-copy component parses and includes a safe clipboard fallback", () => {
  const source = read("assets/ai-context-copy.js");
  assert.doesNotThrow(() => new Function(source), "AI context-copy script must parse");
  for (const token of [
    "Скопировать контекст для ИИ",
    "navigator.clipboard.writeText",
    "document.execCommand('copy')",
    "Текущий текст из редактора",
    "КОНТЕКСТ УРОКА",
    "MAX_CONTEXT_CHARS",
    "MutationObserver",
    "root.contains(other)",
    ".study-section",
    "section.lesson",
    "[data-lesson-root]",
    "#lessonContent",
    "#lessonView",
    "#app"
  ]) assert.ok(source.includes(token), "AI context-copy feature missing: " + token);
  assert.ok(!source.includes("localStorage.setItem('apk-sync-queue"), "Context copy must not transmit or queue private lesson text");
});

test("custom lesson pages expose focused context roots without changing lesson copy", () => {
  const dataQuality = read("data-quality/index.html");
  const decision = read("decision-making/index.html");
  const portfolio = read("portfolio-projects/index.html");
  assert.ok(dataQuality.includes('data-lesson-root data-course-title="Качество данных"'));
  assert.ok(dataQuality.includes("Найди проблемы в данных до того, как считать показатели"));
  assert.equal((decision.match(/data-lesson-root data-course-title="Логика и решения"/g) || []).length, 6);
  assert.ok(decision.includes("Не просто найти ответ — понять, какое решение стоит принять"));
  assert.ok(portfolio.includes('data-lesson-root data-course-title="Проекты для портфолио"'));
  assert.ok(portfolio.includes("Три проекта для портфолио"));
});

test("AI context copy is loaded by shared course shells and the new PostgreSQL module", () => {
  const visuals = read("assets/lesson-visuals.js");
  const progressState = read("assets/progress-state.js");
  const postgres = read("postgresql/index.html");
  assert.ok(visuals.includes("ai-context-copy.js"), "Legacy learning modules should load AI context copy");
  assert.ok(progressState.includes("ai-context-copy.js"), "Course shells should load AI context copy through the shared progress helper");
  assert.ok(postgres.includes('src="../assets/ai-context-copy.js"'), "PostgreSQL lesson page should load AI context copy directly");

  const pages = [
    "foundations/index.html", "business-analysis/index.html", "data-quality/index.html",
    "chart-literacy/index.html", "decision-making/index.html", "excel/index.html",
    "excel-cert/index.html", "excel-expert-cert/index.html", "final/index.html",
    "forecasting/index.html", "interview/index.html", "portfolio-projects/index.html",
    "powerbi/index.html", "powerbi-cert/index.html", "python/index.html", "sql/index.html",
    "stats/index.html", "tableau/index.html", "alteryx-cert/index.html", "azure-data-cert/index.html",
    "databricks-cert/index.html", "docusign-cert/index.html", "simulator/index.html", "drill/index.html",
    "viz/index.html"
  ];
  for (const page of pages) {
    const html = read(page);
    assert.ok(
      html.includes("progress-state.js") || html.includes("lesson-visuals.js") || html.includes("ai-context-copy.js"),
      "No shared AI-context loader on " + page
    );
  }
});

test("recommended learning order is numbered sequentially and respects foundational prerequisites", () => {
  const source = read("assets/learning-order.js");
  assert.doesNotThrow(() => new Function(source), "Learning-order script must parse");
  const steps = [...source.matchAll(/\['([^']+)',(\d+),'([^']+)'\]/g)].map((m) => ({ id: m[1], step: Number(m[2]), title: m[3] }));
  assert.equal(steps.length, 18, "The recommended path should have 18 numbered modules");
  assert.deepEqual(steps.map((x) => x.step), Array.from({ length: 18 }, (_, i) => i + 1));
  assert.deepEqual(steps.slice(0, 7).map((x) => x.id), [
    "foundations", "business-analysis", "data-quality", "excel", "sql", "chart-literacy", "postgresql"
  ]);
  assert.equal(steps[steps.length - 1].id, "final");
  const home = read("index.html");
  assert.ok(home.includes('src="assets/learning-order.js"'), "Homepage should render step badges");
  assert.ok(home.includes('data-kit="postgresql"'), "PostgreSQL should be part of the learning path");
});

test("DataCraft map numbers the same sequence and its lesson list has context-copy actions", () => {
  const map = read("datacraft/curriculum-map.js");
  assert.doesNotThrow(() => new Function(map), "DataCraft map script must parse");
  assert.ok(map.includes("var RECOMMENDED_ORDER"), "DataCraft should share the recommended step order");
  assert.ok(map.includes("formattedStep(course)") && map.includes("formattedStep(c)"), "Course cards and details should show sequence numbers");
  assert.ok(map.includes("curriculum-copy-context"), "Individual lesson rows should expose AI context copy");
  assert.ok(map.includes("data-lesson-goal"), "Lesson context should include its learning goal");
});
