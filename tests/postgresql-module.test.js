const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { PGlite } = require("@electric-sql/pglite");

const root = path.join(__dirname, "..");
const courseDir = path.join(root, "postgresql");
const read = (name) => fs.readFileSync(path.join(courseDir, name), "utf8");

function readLessons() {
  const source = read("course-data.js");
  const marker = "window.PostgreSQLLessons = ";
  assert.ok(source.startsWith(marker), "Course data must expose window.PostgreSQLLessons");
  return JSON.parse(source.slice(marker.length).trim().replace(/;\s*$/, ""));
}
function plain(value) {
  if (value === null || typeof value === "undefined") return "NULL";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
  if (value instanceof Date) return value.toISOString();
  try { return JSON.stringify(value); } catch (_) { return String(value); }
}
function resultSets(value) { return Array.isArray(value) ? value : (value ? [value] : []); }
function comparableValue(value) {
  const text = plain(value);
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return text.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
  return text;
}

function columnsOf(result) {
  if (Array.isArray(result.fields) && result.fields.length) return result.fields.map((field) => String(field.name || field));
  if (Array.isArray(result.rows) && result.rows.length) return Object.keys(result.rows[0]);
  return [];
}
function validateOutput(results, check, sql) {
  const expected = check || {};
  const normalizedSql = String(sql || "").replace(/--[^\n]*/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  if (Array.isArray(expected.sqlIncludes)) {
    const missing = expected.sqlIncludes.filter((part) => !normalizedSql.includes(String(part).replace(/\s+/g, " ").trim().toLowerCase()));
    if (missing.length) return { ok: false, why: "missing SQL construction: " + missing.join(", ") };
  }
  let chosen = null, columns = [];
  for (const result of results) {
    const actual = columnsOf(result);
    if ((expected.columns || []).every((name) => actual.some((c) => c.toLowerCase() === String(name).toLowerCase())) && Array.isArray(result.rows)) {
      chosen = result; columns = actual; break;
    }
  }
  if (!chosen) return { ok: false, why: "Не найдена выборка с колонками " + ((expected.columns || []).join(", ")) };
  if (expected.columnOrder && (columns.length !== expected.columns.length || !expected.columns.every((name, index) => columns[index].toLowerCase() === String(name).toLowerCase()))) {
    return { ok: false, why: "Неверный порядок выходных столбцов: " + columns.join(", ") };
  }
  if (Number.isFinite(expected.exactRows) && chosen.rows.length !== expected.exactRows) return { ok: false, why: "ожидалось ровно " + expected.exactRows + " строк, получено " + chosen.rows.length };
  if (Number.isFinite(expected.minRows) && chosen.rows.length < expected.minRows) return { ok: false, why: "ожидалось не меньше " + expected.minRows + " строк, получено " + chosen.rows.length };
  if (expected.firstRow) {
    const mismatch = Object.keys(expected.firstRow).find((name) => {
      const key = Object.keys(chosen.rows[0] || {}).find((k) => k.toLowerCase() === name.toLowerCase());
      return key === undefined || comparableValue(chosen.rows[0][key]) !== comparableValue(expected.firstRow[name]);
    });
    if (mismatch) return { ok: false, why: "первая строка: ожидалось " + mismatch + "=" + expected.firstRow[mismatch] };
  }
  if (expected.contains) {
    const key = columns.find((c) => c.toLowerCase() === String(expected.contains.column).toLowerCase());
    const found = key !== undefined && chosen.rows.some((row) => {
      const rowKey = Object.keys(row).find((k) => k.toLowerCase() === String(expected.contains.column).toLowerCase());
      return rowKey !== undefined && plain(row[rowKey]).includes(String(expected.contains.value));
    });
    if (!found) return { ok: false, why: "не найдено значение «" + expected.contains.value + "» в " + expected.contains.column };
  }
  return { ok: true, rows: chosen.rows.length };
}

test("PostgreSQL course is a complete Russian-first 30-lesson curriculum", () => {
  const lessons = readLessons();
  assert.equal(lessons.length, 30, "PostgreSQL course must contain exactly 30 lessons");
  assert.equal(new Set(lessons.map((l) => String(l.id))).size, 30, "Lesson IDs must be unique");
  for (const lesson of lessons) {
    assert.ok(lesson.title && lesson.unit && lesson.goal && lesson.explain, "Lesson " + lesson.id + " needs a title, unit, goal and explanation");
    assert.ok(lesson.exampleSql && lesson.starterSql && lesson.task && lesson.gotcha, "Lesson " + lesson.id + " needs example SQL, starter SQL, task and a gotcha");
    assert.ok(lesson.hint && lesson.expected && lesson.solutionSql && lesson.solutionExplain, "Lesson " + lesson.id + " needs a hint, expected output and explained solution");
    assert.ok(lesson.exampleSql === lesson.solutionSql, "Lesson " + lesson.id + " example must match the explained solution");
    assert.ok(Array.isArray(lesson.blocks), "Lesson " + lesson.id + " needs interactive SQL blocks");
    const solutionBlocks = lesson.solutionSql.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    assert.ok(solutionBlocks.every((block) => lesson.blocks.includes(block)), "Lesson " + lesson.id + " must provide every correct solution fragment");
    assert.ok(lesson.blocks.length >= solutionBlocks.length + 2, "Lesson " + lesson.id + " needs at least two distractor blocks");
    assert.ok(Array.isArray(lesson.visual) && lesson.visual.length >= 2, "Lesson " + lesson.id + " needs a visual explanation");
    assert.ok(lesson.quiz && Array.isArray(lesson.quiz.options) && lesson.quiz.options.length >= 3, "Lesson " + lesson.id + " needs a multiple-choice quiz");
    assert.ok(Number.isInteger(lesson.quiz.correct) && lesson.quiz.correct >= 0 && lesson.quiz.correct < lesson.quiz.options.length, "Lesson " + lesson.id + " has an invalid quiz answer");
    assert.ok(lesson.checks && Array.isArray(lesson.checks.columns) && lesson.checks.columns.length > 0, "Lesson " + lesson.id + " needs verifiable output criteria");
  }
  const content = lessons.map((l) => l.title + " " + l.explain + " " + l.gotcha).join(" ").toLocaleLowerCase("ru");
  for (const topic of ["null", "timestamptz", "group by", "having", "join", "exists", "recursive", "оконн", "jsonb", "distinct on", "explain", "транзакц", "grant"]) {
    assert.ok(content.includes(topic), "PostgreSQL curriculum should cover " + topic);
  }
});

test("seed schema includes relational integrity, realistic edge cases and sample data", async () => {
  const db = new PGlite();
  try {
    await db.exec(read("seed.sql"));
    const tableResult = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
    assert.deepEqual(tableResult.rows.map((r) => r.table_name), ["customers", "order_items", "orders", "page_events", "payments", "products", "support_tickets"]);
    const stats = await db.query(
      "SELECT (SELECT count(*) FROM customers) AS customers, " +
      "(SELECT count(*) FROM orders) AS orders, " +
      "(SELECT count(*) FROM order_items) AS order_items, " +
      "(SELECT count(*) FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)) AS customers_without_orders, " +
      "(SELECT count(*) FROM orders WHERE coupon IS NULL) AS orders_without_coupon"
    );
    assert.equal(Number(stats.rows[0].customers), 13);
    assert.equal(Number(stats.rows[0].orders), 20);
    assert.ok(Number(stats.rows[0].order_items) >= 25);
    assert.ok(Number(stats.rows[0].customers_without_orders) >= 1, "Seed should include customers without orders");
    assert.ok(Number(stats.rows[0].orders_without_coupon) >= 1, "Seed should include NULL coupons");
  } finally { await db.close(); }
});

test("every lesson starter is valid SQL and every solution satisfies its PostgreSQL output contract", async () => {
  const lessons = readLessons(), db = new PGlite();
  try {
    await db.exec(read("seed.sql"));
    for (const lesson of lessons) {
      try { await db.exec(lesson.starterSql); }
      catch (error) { assert.fail("Starter SQL failed in lesson " + lesson.id + " («" + lesson.title + "»): " + (error && error.message || error)); }
    }
    for (const lesson of lessons) {
      let results;
      try { results = resultSets(await db.exec(lesson.solutionSql)); }
      catch (error) { assert.fail("Solution SQL failed in lesson " + lesson.id + " («" + lesson.title + "»): " + (error && error.message || error)); }
      const validation = validateOutput(results, lesson.checks, lesson.solutionSql);
      assert.ok(validation.ok, "Solution output failed for lesson " + lesson.id + " («" + lesson.title + "»): " + validation.why);
    }
    const order = await db.query("SELECT status FROM orders WHERE id = 101");
    assert.equal(order.rows[0].status, "paid", "Transaction lesson must roll back its sample change");
  } finally { await db.close(); }
});

test("PostgreSQL lesson examples use uppercase SQL keywords and terminated statements", () => {
  const lessons = readLessons();
  const keywordPattern = /\b(SELECT|FROM|WHERE|ORDER|BY|GROUP|HAVING|AS|INNER|JOIN|ON|ILIKE|IS|NULL|TRUE|LIMIT|OFFSET|DISTINCT|UNION|ALL|WITH|RECURSIVE|INSERT|INTO|VALUES|CONFLICT|DO|UPDATE|RETURNING|BEGIN|ROLLBACK|COMMIT|CREATE|INDEX|EXPLAIN|ANALYZE|AND|OR|NOT|SET|DESC|ASC|DELETE|ALTER|TABLE|PRIMARY|KEY|FOREIGN|REFERENCES|CHECK|UNIQUE|DEFAULT|COUNT|SUM|AVG|MIN|MAX|FILTER|PARTITION|OVER|EXTRACT|DATE|INTERVAL|CURRENT_DATE|NOW)\b/gi;
  for (const lesson of lessons) {
    for (const [label, sql] of [["starter", lesson.starterSql], ["solution", lesson.solutionSql]]) {
      assert.match(sql, /;\s*$/, "Lesson " + lesson.id + " " + label + " must end with a semicolon");
      const withoutStrings = sql.replace(/'(?:''|[^'])*'/g, "''").replace(/--[^\n]*/g, " ");
      for (const match of withoutStrings.matchAll(keywordPattern)) {
        assert.equal(match[0], match[0].toUpperCase(), "Keyword case in lesson " + lesson.id + ": " + match[0]);
      }
      assert.doesNotMatch(sql, /\b(TOP|GETDATE|NVL|IFNULL|DATEADD)\b/i, "Lesson SQL must use PostgreSQL syntax");
    }
  }
});

test("PostgreSQL lesson page wires progress sync and keeps drafts and query history local-only", () => {
  const html = read("index.html"), app = read("app.js");
  const progressState = fs.readFileSync(path.join(root, "assets/progress-state.js"), "utf8");
  const sync = fs.readFileSync(path.join(root, "assets/supabase_auth_sync.js"), "utf8");
  const economy = fs.readFileSync(path.join(root, "assets/datacraft-economy.js"), "utf8");
  const dataCraft = fs.readFileSync(path.join(root, "datacraft/lesson-catalog.js"), "utf8");
  assert.match(html, /<html lang="ru"/);
  assert.ok(html.includes('src="../assets/progress-state.js"'));
  assert.ok(html.includes('src="../assets/supabase_auth_sync.js?v=3"'));
  assert.ok(html.includes('src="../assets/datacraft-economy.js"'));
  assert.ok(html.includes("Mermaid.js") && html.includes("PGlite"));
  assert.ok(app.includes("apk-postgresql-progress-v1"));
  assert.ok(app.includes("apk-postgresql-drafts-v1") && app.includes("apk-postgresql-history-v1"));
  assert.ok(!progressState.includes("apk-postgresql-drafts-v1"), "SQL drafts must not be included in shared cloud progress");
  assert.ok(!progressState.includes("apk-postgresql-history-v1"), "SQL history must not be included in shared cloud progress");
  assert.ok(sync.includes("apkProgressApi().getKitIdForKey"), "Shared sync must use the progress allowlist");
  assert.ok(economy.includes("postgresql: {key:'apk-postgresql-progress-v1',prop:'doneLessons',rate:1,total:30,bonus:8}"));
  assert.ok(dataCraft.includes('"postgresql": ['), "DataCraft needs the PostgreSQL lesson catalog");
  assert.ok(app.includes("statement_timeout") || html.includes("изоля"), "Sandbox constraints must be documented");
  new Function(app);
});

test("PostgreSQL lessons render drag-and-drop SQL assembly with inline query feedback", () => {
  const app = read("app.js");
  const html = read("index.html");
  const lessons = readLessons();
  assert.equal(lessons.length, 30);
  assert.ok(lessons.every((lesson) => Array.isArray(lesson.blocks) && lesson.blocks.length >= 3),
    "All PostgreSQL lessons must include selectable SQL fragments and distractors");
  for (const token of [
    "pg-interactive-blocks",
    "pgAvailableBlocks",
    "pgAssembledBlocks",
    "draggable=\"true\"",
    "dragstart",
    "dragover",
    "drop",
    "pointerdown",
    "pgMovePointerBlock",
    "movePgBlockItem",
    "resetPgBlockAssembly"
  ]) assert.ok(app.includes(token), "PostgreSQL drag-and-drop implementation is missing: " + token);
  assert.ok(!app.includes("onclick="), "PostgreSQL block interaction should use bound event handlers");
  const renderStart = app.indexOf("function renderLesson(){");
  const renderEnd = app.indexOf("function openLesson(", renderStart);
  const render = app.slice(renderStart, renderEnd);
  const editorPosition = render.indexOf('<textarea id="sqlEditor"');
  const feedbackPosition = render.indexOf('id="taskFeedback"');
  const outputPosition = render.indexOf('id="queryOutput"');
  assert.ok(editorPosition >= 0 && feedbackPosition > editorPosition && outputPosition > feedbackPosition,
    "SQL feedback must appear immediately below the assembled query and before the result table");
  assert.ok(app.includes("showTaskFeedback(explainSQLError(technical)") && app.includes("'error')"),
    "SQL execution errors must be shown directly below the query");
  assert.ok(app.includes("showTaskFeedback('Верно!") && app.includes("showTaskFeedback('Запрос выполнился"),
    "Successful and incorrect SQL results must have inline feedback");
  assert.ok(html.includes(".pg-sql-block") && html.includes(".pg-task-feedback.error") && html.includes(".pg-blocks-area.is-drop-target"),
    "Drag blocks and inline query feedback need visible styles");
});

test("PostgreSQL quiz answers retain valid HTML attributes and click handlers", () => {
  const app = read("app.js");
  const course = read("course-data.js");

  // The answers are generated dynamically; the HTML attribute must stay English
  // so querySelectorAll('[data-answer]') can attach the click handler.
  assert.ok(app.includes("data-answer=\"'+i+'\""), "Quiz buttons must render data-answer attributes");
  assert.ok(app.includes("document.querySelectorAll('[data-answer]')"), "Quiz click listeners must target generated answer buttons");
  assert.ok(app.includes("answerQuiz(Number(btn.dataset.answer))"), "Clicking an answer must submit its selected index");
  assert.ok(app.includes("state.quizPassed[String(l.id)]"), "A correct answer must be persisted in lesson progress");
  assert.doesNotMatch(app, /данные-ответ|тип=["']кнопка|макс\. ширина|оператор_таймаут|семя\.sql/);

  // SQL identifiers and syntax inside lesson explanations and examples must not
  // be translated into Russian words.
  assert.ok(course.includes("coupon IS NULL"), "SQL predicates must stay valid inside examples");
  assert.ok(course.includes("PARTITION BY customer_id"), "Window-function syntax must stay valid");
  assert.ok(course.includes('"title": "Массивы PostgreSQL: оператор @> проверяет наличие элемента"'), "The PostgreSQL array operator topic must stay intact");
  assert.doesNotMatch(course, /путь_поиска|`купон НУЛЬ`|РАЗДЕЛЕНИЕ ПО customer_id/);
});
