const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

test("SQL exercises keep SQL keywords and condition syntax in English", () => {
  const sql = read("sql/index.html");
  assert.match(sql, /opts:\["WHERE amount > 100"/);
  assert.doesNotMatch(sql, /opts:\["ГДЕ сумма > 100"/);
  assert.match(sql, /WHERE region IS NULL/);
});

test("Excel exercises keep English functions and Latin cell references", () => {
  const excel = read("excel/index.html");
  assert.doesNotMatch(excel, /=СУММА\(/);
  assert.doesNotMatch(excel, /formula:"[^"]*Б\d/);
});

test("Python exercises keep executable keywords, identifiers, and pandas calls", () => {
  const python = read("python/index.html");
  assert.match(python, /formula:"def total\(values\):/);
  assert.match(python, /import pandas as pd/);
  assert.doesNotMatch(python, /общая сумма определения|formula:"интервал\(|импортировать pandas как ПД/i);
});

test("Power BI DAX uses English table and column identifiers", () => {
  const powerbi = read("powerbi/index.html");
  assert.match(powerbi, /SUM\(Sales\[Revenue\]\)/);
  assert.doesNotMatch(powerbi, /SUM\(Продажи\[Доход\]\)|РАЗДЕЛИТЬ\(/);
});

test("Tableau calculations keep English field names", () => {
  const tableau = read("tableau/index.html");
  assert.match(tableau, /SUM\(Revenue\)/);
  assert.doesNotMatch(tableau, /СУММ(?:А)?\(Доход\)|\[Единицы измерения\]/);
});

test("Statistics and final-exam Python examples keep valid identifiers and methods", () => {
  const stats = read("stats/index.html");
  const exam = read("final/index.html");
  assert.match(stats, /answer:'q1=df\["revenue"\]\.quantile\(0\.25\)/);
  assert.doesNotMatch(stats, /q1=дф\[|статистика\.т\.интервал/i);
  assert.doesNotMatch(exam, /df\.groupby\('регион'\)\['доход'\]\.сумма\(\)|df\.isnull\(\)\.сумма\(\)/);
});

test("Analyst simulator examples keep executable Python and SQL syntax", () => {
  const simulator = read("simulator/index.html");
  assert.match(simulator, /CURRENT_DATE - INTERVAL '30 days'/);
  assert.match(simulator, /df = pd\.read_csv\(FILE\)/);
  assert.doesNotMatch(simulator, /дф\s*=\s*pd\.read_csv|COUNT\(идентификатор заказа\)|СУММ\(количество\)/);
});
