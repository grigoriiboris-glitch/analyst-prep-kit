const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
function read(file) { return fs.readFileSync(path.join(root, file), "utf8"); }

test("the homepage gives the core learning skills a stable 1–18 recommended order", () => {
  const home = read("index.html");
  const order = read("assets/learning-order.js");
  assert.ok(home.includes('src="assets/learning-order.js"'), "Homepage must load its skill-order badges");
  assert.ok(home.includes('data-static-ru="true"'), "Homepage must keep statically rendered Russian content");
  assert.ok(!/src=["\'][^"\']*ru-localization(?:-boot)?\.js/i.test(home), "Homepage must not reintroduce the removed runtime translator");
  assert.ok(order.includes("Рекомендуемый маршрут — 18 шагов"), "The learning sequence must be explained to the student");
  const expected = [
    "foundations", "business-analysis", "data-quality", "excel", "sql",
    "chart-literacy", "postgresql", "python", "stats", "forecasting",
    "powerbi", "tableau", "decision-making", "portfolio-projects",
    "projects", "simulator", "interview", "final"
  ];
  const matched = Array.from(order.matchAll(/\['([^']+)',(\d+),'([^']+)'\]/g))
    .map((m) => ({ id: m[1], step: Number(m[2]), title: m[3] }));
  assert.deepEqual(matched.map((x) => x.id), expected, "Skills should be ordered by prerequisites and practical progression");
  assert.deepEqual(matched.map((x) => x.step), expected.map((_, i) => i + 1), "Every main skill needs one unique sequential number");
  assert.ok(order.includes("data-learning-step"), "The visible card must retain its step number in the DOM");
  assert.ok(order.includes("aria-label"), "Numbered badges must expose their meaning to assistive technology");
  for (const id of expected) {
    assert.ok(home.includes('data-kit="' + id + '"'), "Homepage is missing the numbered skill link: " + id);
  }
});

test("the shared AI context button is added to static and dynamically rendered lesson sections", () => {
  const copy = read("assets/ai-context-copy.js");
  assert.ok(copy.includes("Скопировать контекст для ИИ"));
  assert.ok(copy.includes("article.lesson,section.lesson"), "Section-based lesson pages must be detected too");
  assert.ok(copy.includes("data-lesson-root"), "Custom interactive lessons must be supportable with an explicit context root");
  assert.ok(copy.includes("function buildContext(root)"), "Context must be generated from the current lesson rather than the whole course");
  assert.ok(copy.includes("editorContext(root)"), "The current code or answer from a visible editor should be included");
  assert.ok(copy.includes("navigator.clipboard.writeText"), "Modern clipboard API should be used when available");
  assert.ok(copy.includes("document.execCommand('copy')"), "There must be a fallback for environments without clipboard access");
  assert.ok(copy.includes("MAX_CONTEXT_CHARS"), "Copied context must have a length limit");
});

test("core course pages load AI context without a runtime translator", () => {
  const visuals = read("assets/lesson-visuals.js");
  assert.ok(visuals.includes("ai-context-copy.js"), "Shared lesson visuals should load the AI-context feature");
  const coursePages = [
    "foundations/index.html", "business-analysis/index.html", "data-quality/index.html",
    "decision-making/index.html", "portfolio-projects/index.html", "sql/index.html",
    "postgresql/index.html"
  ];
  for (const route of coursePages) {
    const html = read(route);
    const direct = html.includes('src="../assets/ai-context-copy.js"') || html.includes('src="assets/ai-context-copy.js"');
    const shared = /<script[^>]+lesson-visuals\.js/i.test(html);
    assert.ok(direct || shared, route + " must load AI context directly or through the shared lesson component");
  }
  const sql = read("sql/index.html");
  assert.ok(sql.includes('src="../assets/sql-mermaid.js?v=1"'), "SQL lessons must keep their diagram renderer");
  assert.ok(!/src=["\'][^"\']*ru-localization(?:-boot)?\.js/i.test(sql), "SQL must remain compatible with static Russian pages");
});
test("pages without the shared localization loader declare a lesson root and keep Russian content", () => {
  const expectations = [
    ["foundations/index.html", "Основы аналитики данных"],
    ["business-analysis/index.html", "Основы бизнес-анализа"],
    ["data-quality/index.html", "Качество данных"],
    ["decision-making/index.html", "Логика и решения"],
    ["portfolio-projects/index.html", "Проекты для портфолио"]
  ];
  for (const [route, russianText] of expectations) {
    const html = read(route);
    assert.ok(html.includes('src="../assets/lesson-visuals.js"'), route + " must keep its shared lesson script, which loads the AI context feature");
    assert.ok(html.includes(russianText), route + " must preserve its current Russian page text");
  }
  const foundations = read("foundations/index.html");
  const business = read("business-analysis/index.html");
  const quality = read("data-quality/index.html");
  const decision = read("decision-making/index.html");
  const portfolio = read("portfolio-projects/index.html");
  assert.ok((foundations.match(/<article class="lesson/g) || []).length >= 8, "Foundations lesson blocks must remain unchanged");
  assert.ok((business.match(/<article class="lesson/g) || []).length >= 9, "Business analysis lesson blocks must remain unchanged");
  assert.ok(quality.includes('data-lesson-root data-course-title="Качество данных"'), "The data-quality practical needs a full-page context root");
  assert.ok(decision.includes('<body data-lesson-root data-course-title="Логика и решения">'), "The interactive decision course should provide a context root for its current lesson");
  assert.ok(portfolio.includes('data-lesson-root data-course-title="Проекты для портфолио"'), "The portfolio context should cover the active project brief");
});
