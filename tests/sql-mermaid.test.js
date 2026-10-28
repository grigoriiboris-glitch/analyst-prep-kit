const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const SqlMermaid = require("../assets/sql-mermaid.js");

test("builds a visual table and row-filter flow for a single-table SQL lesson", () => {
  const source = SqlMermaid.diagramSource({
    id: 7,
    title: "Filtering customers",
    ral: { sql: "SELECT name, email FROM customers WHERE status = 'active' ORDER BY name LIMIT 5;" }
  });
  assert.match(source, /^flowchart LR/m);
  assert.match(source, /T1\["customers<br\/>name<br\/>email<br\/>status"\]/);
  assert.match(source, /WHERE<br\/>отфильтровать строки/);
  assert.match(source, /ORDER BY<br\/>отсортировать/);
  assert.match(source, /OUT\["Результат запроса<br\/>таблица ниже"\]/);
});

test("connects joined tables and assigns qualified columns to the right source", () => {
  const source = SqlMermaid.diagramSource({
    id: 8,
    title: "Join customers and orders",
    ral: { sql: "SELECT c.name, o.total FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.total > 100;" }
  });
  assert.match(source, /T1\["customers<br\/>name<br\/>id"\]/);
  assert.match(source, /T2\["orders<br\/>total<br\/>customer_id"\]/);
  assert.match(source, /JOIN<br\/>связать таблицы/);
  assert.match(source, /T1 --> S1/);
  assert.match(source, /T2 --> S1/);
});

test("uses authored table-name examples for a database-introduction lesson", () => {
  const source = SqlMermaid.diagramSource({
    id: 101,
    title: "What a Database Is",
    ral: { sql: "-- orders table\n-- customers table\n-- products table" },
    viz: {
      columns: ["table_name", "one_row_represents", "example_columns"],
      rows: [
        ["orders", "one order", "order_id, customer_id, revenue"],
        ["customers", "one customer", "customer_id, name, region"],
        ["products", "one product", "product_id, name, category"]
      ]
    }
  });
  assert.match(source, /T1\["orders<br\/>order_id<br\/>customer_id<br\/>revenue"\]/);
  assert.match(source, /T2\["customers<br\/>customer_id<br\/>name<br\/>region"\]/);
  assert.match(source, /T3\["products<br\/>product_id<br\/>name<br\/>category"\]/);
  assert.match(source, /БАЗА ДАННЫХ<br\/>набор отдельных таблиц/);
});

test("escapes the rendered Mermaid source and exposes it as readable text", () => {
  const html = SqlMermaid.panelHTML({
    id: 9,
    title: "Customers",
    ral: { sql: "SELECT name FROM customers;" }
  });
  assert.match(html, /class="sql-mermaid-panel"/);
  assert.match(html, /class="mermaid sql-mermaid-source"/);
  assert.match(html, /Показать текст схемы/);
  assert.match(html, /customers<br\\/>name/);
  assert.match(html, /&lt;br\\/\&gt;/);
  assert.doesNotMatch(html, /<script/i);
});

test("does not create an empty panel when a lesson has no SQL or table example", () => {
  assert.equal(SqlMermaid.diagramSource({ id: 10, title: "No query" }), "");
  assert.equal(SqlMermaid.panelHTML({ id: 10, title: "No query" }), "");
});

test("integrates Mermaid into both SQL lesson render paths without replacing result tables", () => {
  const html = fs.readFileSync(path.join(__dirname, "../sql/index.html"), "utf8");
  assert.ok(html.includes('src="https://cdn.jsdelivr.net/npm/mermaid@11.17.2/dist/mermaid.min.js"'));
  assert.ok(html.includes('src="../assets/sql-mermaid.js?v=1"'));
  assert.equal((html.match(/SqlMermaid\.panelHTML\(l\)/g) || []).length, 2);
  assert.ok(html.includes("function lessonResultHTML(v)"));
  assert.ok(html.includes("SqlMermaid.render(document)"));
  const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  for (const [, attributes, source] of inlineScripts) {
    if (!source.trim() || /\bsrc\s*=/i.test(attributes)) continue;
    const typeMatch = attributes.match(/\btype\s*=\s*["']([^"']+)["']/i);
    if (typeMatch && !/(?:text|application)\/(?:javascript|ecmascript)|module/i.test(typeMatch[1])) continue;
    assert.doesNotThrow(() => new Function(source), "SQL inline JavaScript must parse");
  }
});
