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
function columnsOf(result) {
  if (Array.isArray(result.fields) && result.fields.length) return result.fields.map((field) => String(field.name || field));
  if (Array.isArray(result.rows) && result.rows.length) return Object.keys(result.rows[0]);
  return [];
}
function validateOutput(results, check) {
  const expected = check || {};
  let chosen = null, columns = [];
  for (const result of results) {
    const actual = columnsOf(result);
    if ((expected.columns || []).every((name) => actual.some((c) => c.toLowerCase() === String(name).toLowerCase())) && Array.isArray(result.rows)) {
      chosen = result; columns = actual; break;
    }
  }
  if (!chosen) return { ok: false, why: "Не найдена выборка с колонками " + ((expected.columns || []).join(", ")) };
  if (Number.isFinite(expected.exactRows) && chosen.rows.length !== expected.exactRows) return { ok: false, why: "ожидалось ровно " + expected.exactRows + " строк, получено " + chosen.rows.length };
  if (Number.isFinite(expected.minRows) && chosen.rows.length < expected.minRows) return { ok: false, why: "ожидалось не меньше " + expected.minRows + " строк, получено " + chosen.rows.length };
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

test("every lesson starter SQL executes and satisfies its output contract on PostgreSQL", async () => {
  const lessons = readLessons(), db = new PGlite();
  try {
    await db.exec(read("seed.sql"));
    for (const lesson of lessons) {
      let results;
      try { results = resultSets(await db.exec(lesson.starterSql)); }
      catch (error) { assert.fail("Starter SQL failed in lesson " + lesson.id + " («" + lesson.title + "»): " + (error && error.message || error)); }
      const validation = validateOutput(results, lesson.checks);
      assert.ok(validation.ok, "Starter SQL output failed for lesson " + lesson.id + " («" + lesson.title + "»): " + validation.why);
    }
    const order = await db.query("SELECT status FROM orders WHERE id = 101");
    assert.equal(order.rows[0].status, "paid", "Transaction lesson must roll back its sample change");
  } finally { await db.close(); }
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
  assert.ok(course.includes("`coupon IS NULL`"), "SQL predicates must stay valid inside examples");
  assert.ok(course.includes("PARTITION BY customer_id"), "Window-function syntax must stay valid");
  assert.ok(course.includes('"title": "Массивы, ANY и unnest"'), "The unnest function name must not be translated");
  assert.doesNotMatch(course, /путь_поиска|`купон НУЛЬ`|РАЗДЕЛЕНИЕ ПО customer_id/);
});
