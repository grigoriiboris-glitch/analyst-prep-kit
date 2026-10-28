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


test("Final exam keeps English technical syntax and Russian explanatory copy", () => {
  const exam = read("final/index.html");
  assert.match(exam, /WHERE order_date BETWEEN '2026-01-01' AND '2026-03-31'/);
  assert.match(exam, /COUNT\(DISTINCT column\)/);
  assert.match(exam, /COALESCE\(column, 0\)/);
  assert.match(exam, /df\.groupby\('region'\)\['revenue'\]\.sum\(\)/);
  assert.doesNotMatch(exam, /ГДЕ дата МЕЖДУ|СЧИТАТЬ\(\*\)|СОЕДИНЕНИЕ \(столбец, 0\)|df\.groupby\('регион'\)|df\.где\(Регион=/);
  assert.match(exam, /Если бы реального эффекта не было/);
  assert.match(exam, /Создавайте информационные панели визуально/);
  assert.doesNotMatch(exam, /If there were no real effect|Create dashboards visually\.|In the first phone screen|In your application cover letter/);
});

test("Excel certification course keeps English formulas and cell references", () => {
  const excel = read("excel-cert/index.html");
  assert.match(excel, /=SUM\(Revenue\)/);
  assert.match(excel, /=IF\(B2>=100,\"High\",\"Low\"\)/);
  assert.match(excel, /=SORT\(range\)/);
  assert.match(excel, /=UNIQUE\(range\)/);
  assert.match(excel, /TEXTJOIN\(", ",TRUE,A2:A10\)/);
  assert.match(excel, /\$A1/);
  assert.match(excel, /A\$1/);
  assert.match(excel, /#SPILL!/);
  assert.doesNotMatch(excel, /=СУММ\(|=ЕСЛИ\(|=СОРТИРОВАТЬ|=УНИКАЛЬНЫЙ|\$А1|1 австралийский доллар|СЦЕП\(|ИСТИНА,A2:A10/);
});

test("Power BI certification course keeps English DAX function and model identifiers", () => {
  const powerbi = read("powerbi-cert/index.html");
  assert.match(powerbi, /CALCULATE\(SUM\(Sales\[Amount\]\), Region\[Name\] = \"West\"\)/);
  assert.match(powerbi, /SUMX\(Sales, Sales\[Quantity\] \* Sales\[Price\]\)/);
  assert.match(powerbi, /USERELATIONSHIP\(Sales\[Ship Date\], 'Date'\[Date\]\)/);
  assert.match(powerbi, /USERPRINCIPALNAME\(\)/);
  assert.doesNotMatch(powerbi, /РАССЧИТАТЬ\(|ПОЛЬЗОВАТЕЛЬСКИЕ ОТНОШЕНИЯ|SUMX\(Продажи|\[Регион\] = ИМЯ ПРИНЦИПА/);
});

test("Tableau certification course keeps English calculation syntax", () => {
  const tableau = read("tableau-cert/index.html");
  assert.match(tableau, /\[Revenue\] - \[Cost\]/);
  assert.match(tableau, /IF \[Units\] > 100 THEN \"High\" END/);
  assert.match(tableau, /T\|F/);
  assert.doesNotMatch(tableau, /\[Доход\] – \[Стоимость\]|ЕСЛИ \[Единицы\].*ТО|Т\|Ф/);
});


test("Excel learning module keeps English function syntax in inline examples", () => {
  const excel = read("excel/index.html");
  assert.match(excel, /SUMPRODUCT\(1\/COUNTIF\(range,range\)\)/);
  assert.match(excel, /IF\(A2<100, \"Низкий\", IF\(A2<200, \"Средний\", \"Высокий\"\)\)/);
  assert.doesNotMatch(excel, /=ЕСЛИ\(|СУММПРОИЗВ\(|СЧЁТЕСЛИ\(|=СЦЕП\(|=ТЕКСТ\(|#ДЕЛ\/0!/);
});

test("Power BI learning modules use English DAX functions and identifiers", () => {
  const powerbi = read("powerbi/index.html");
  const certificate = read("powerbi-cert/index.html");
  assert.match(powerbi, /CALCULATE\(/);
  assert.match(powerbi, /SUM\(Sales\[Amount\]\)/);
  assert.match(certificate, /LOOKUPVALUE\(Sales\[Amount\], Sales\[Year\], 2025\)/);
  assert.match(certificate, /CALCULATE\(\[Revenue\], SAMEPERIODLASTYEAR\('Date'\[Date\]\)\)/);
  assert.doesNotMatch(powerbi, /РАССЧИТАТЬ\(|РАСЧЕТ\(|SUM\(Продажи\[|SUMX\(ВСЕ\(|ПРОСМОТРЗНАЧ\(/);
  assert.doesNotMatch(certificate, /РАССЧИТАТЬ\(|РАСЧЕТ\(|SUM\(Продажи\[|SUMX\(ВСЕ\(|ПРОСМОТРЗНАЧ\(/);
});

test("Tableau learning modules keep English field calculations", () => {
  const tableau = read("tableau/index.html");
  const certificate = read("tableau-cert/index.html");
  assert.match(tableau, /SUM\(Revenue\)/);
  assert.match(certificate, /\[Revenue\] - \[Cost\]/);
  assert.match(certificate, /IF \[Units\] > 100 THEN \"High\" END/);
  assert.doesNotMatch(tableau, /СУММ\s*\(\s*(?:Доход|Единицы|Единицы измерения)|\[Доход\]\s*[–-]\s*\[Стоимость\]/);
  assert.doesNotMatch(certificate, /СУММ\s*\(\s*(?:Доход|Единицы|Единицы измерения)|\[Доход\]\s*[–-]\s*\[Стоимость\]|ЕСЛИ \[Единицы\].*ТО/);
});
