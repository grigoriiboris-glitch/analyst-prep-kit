const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { isTechnicalSnippet, shouldSkipTechnicalElement } = require("../tools/technical-syntax-guard.cjs");
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
  assert.match(python, /formula:"def log_calls\(func\):/);
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
  assert.match(excel, /IF\(A2<100,/);
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


test("Excel nested IF examples use valid English formula syntax", () => {
  const excel = read("excel/index.html");
  assert.match(excel, /IF\(A2<100,/);
  assert.doesNotMatch(excel, /IF\(A2<100, «Низкий», IF\(A2<200, «Средний», «Высокий»\)\)/);
});

test("Tableau and DAX field expressions use English identifiers", () => {
  const tableau = read("tableau-cert/index.html");
  const powerbi = read("powerbi/index.html");
  assert.match(tableau, /\[Revenue\] - \[Cost\]/);
  assert.match(powerbi, /SUM\(Sales\[Profit\]\)/);
  assert.doesNotMatch(powerbi, /РАССЧИТАТЬ|РАСЧЕТ|SUM\(Продажи\[Прибыль\]\)/);
});


test("Learner-facing explanations stay Russian while technical expressions stay English", () => {
  const sql = read("sql/index.html");
  const excel = read("excel/index.html");
  const python = read("python/index.html");
  const powerbi = read("powerbi/index.html");
  const tableau = read("tableau/index.html");
  const stats = read("stats/index.html");
  const exam = read("final/index.html");
  const simulator = read("simulator/index.html");
  const excelCert = read("excel-cert/index.html");
  const powerbiCert = read("powerbi-cert/index.html");
  const tableauCert = read("tableau-cert/index.html");
  assert.doesNotMatch(sql, /SELECT \* pulls every column/);
  assert.doesNotMatch(excel, /SUM can't handle this range|what does this return\?|If B2 is greater than 1000|Return column 2 of the range/);
  assert.doesNotMatch(python, /How do you get the value 'West'|return sends a value out of the function|df\.shape returns \(25, 7\)\. How do you get/);
  assert.doesNotMatch(powerbi, /Tap the piece that fills the blank|Select the Revenue column|Those same three wells drive nearly every chart/);
  assert.doesNotMatch(tableau, /When you have more than 5 categories|When showing change over time or a trend|Set the mark type to Line/);
  assert.doesNotMatch(stats, /Report a confidence interval for the difference|Both lists have mean = 50|Set the fences:/);
  assert.doesNotMatch(exam, /Here's what you should know|All rows from the left table; matching rows from the right/);
  assert.doesNotMatch(simulator, /Manager notes: lead with|HAVING filters after grouping|Slack reply: lead with the answer/);
  assert.doesNotMatch(excelCert, /Freeze Panes locks everything|MID\(text, start, count\) slices from inside/);
  assert.doesNotMatch(powerbiCert, /A duplicate is an independent copy|Dashboards are a Service-side canvas/);
  assert.doesNotMatch(tableauCert, /Objective 2\.3\.1\. A computed sort is a rule/);
});


test("Residual exercise questions, answers, and explanations are Russian while syntax stays English", () => {
  const sql = read("sql/index.html");
  const excel = read("excel/index.html");
  const python = read("python/index.html");
  const powerbi = read("powerbi/index.html");
  const tableau = read("tableau/index.html");
  const stats = read("stats/index.html");

  for (const phrase of [
    "SELECT region names the group;",
    "COALESCE(phone, 'Missing') returns phone",
    "COUNT(*) counts every row;",
    "Select the name and email columns from the customers table.",
    "Show only the customer statuses that have more than 1 customer."
  ]) assert.ok(!sql.includes(phrase), "SQL still contains English learner-facing text: " + phrase);
  assert.ok(sql.includes("SELECT region задаёт группы"));
  assert.ok(sql.includes("WHERE фильтрует строки"));

  for (const phrase of [
    "COUNTA counts everything",
    "VLOOKUP is like a reader",
    "=COUNTIF(A:A,B2) counts 0",
    "SUM doesn't work on that range",
    "Return all rows from A2:D200"
  ]) assert.ok(!excel.includes(phrase), "Excel still contains English learner-facing text: " + phrase);
  assert.ok(excel.includes("COUNTA учитывает все непустые ячейки"));

  for (const phrase of [
    "df['rep'].str.strip() runs without error",
    "It returns a new Series — assign it back",
    "df.dtypes returns the type of every column",
    "df.dropna() with no arguments does what?"
  ]) assert.ok(!python.includes(phrase), "Python still contains English learner-facing text: " + phrase);
  assert.ok(python.includes("df['rep'].str.strip() выполняется без ошибки"));

  for (const phrase of [
    "A calculated column stamps an answer",
    "Select the key column, then Remove Duplicates",
    "DISTINCTCOUNT counts people, not events",
    "DIVIDE works with text columns"
  ]) assert.ok(!powerbi.includes(phrase), "Power BI still contains English learner-facing text: " + phrase);

  for (const phrase of [
    "Tableau picked its top 10 from the whole company",
    "The exam's favorite trap is",
    "Same columns, you just want more rows",
    "Filter out the small regions"
  ]) assert.ok(!tableau.includes(phrase), "Tableau still contains English learner-facing text: " + phrase);

  for (const phrase of [
    "Variance averages squared deviations",
    "The interval is a net cast at one number",
    "r = 0.88 is too weak to be meaningful",
    "If H₀ were true, 3% chance of seeing results this extreme"
  ]) assert.ok(!stats.includes(phrase), "Statistics still contains English learner-facing text: " + phrase);
  assert.ok(stats.includes("Дисперсия — это среднее квадратов отклонений"));
});


test("Answer choices and step-by-step instructions are localized", () => {
  const sql = read("sql/index.html");
  const excel = read("excel/index.html");
  const python = read("python/index.html");
  const powerbi = read("powerbi/index.html");
  const tableau = read("tableau/index.html");
  const stats = read("stats/index.html");

  for (const phrase of ["WHERE filters rows, HAVING filters groups", "Swap LIMIT for TOP 5"]) {
    assert.ok(!sql.includes(phrase), "SQL answer choice remains English: " + phrase);
  }
  for (const phrase of ["SUM doesn't work on that range", "Insert → Charts → choose type", "Select column B → uncheck Locked"]) {
    assert.ok(!excel.includes(phrase), "Excel answer or instruction remains English: " + phrase);
  }
  for (const phrase of ["It returns a new Series — assign it back", "Sort both frames by state first", "When the function is called repeatedly with the same args"]) {
    assert.ok(!python.includes(phrase), "Python answer choice remains English: " + phrase);
  }
  for (const phrase of ["DIVIDE works with text columns", "Use DIVIDE() instead of /", "Create it as a Measure, not a calculated column"]) {
    assert.ok(!powerbi.includes(phrase), "Power BI answer choice remains English: " + phrase);
  }
  for (const phrase of ["Filter out the small regions", "Right-click the 2nd pill → Dual Axis", "Create Calculated Field"]) {
    assert.ok(!tableau.includes(phrase), "Tableau answer or instruction remains English: " + phrase);
  }
  for (const phrase of ["Count for Revenue; count for Region", "r = 0.88 is too weak to be meaningful", "Divide by n: std_dev / len(data)"]) {
    assert.ok(!stats.includes(phrase), "Statistics answer choice remains English: " + phrase);
  }
  assert.ok(excel.includes("Вставка → Диаграммы → выберите тип"));
  assert.ok(tableau.includes("Создать вычисляемое поле"));
  assert.ok(stats.includes("Разделить на n: std_dev / len(data)"));
});


test("DAX explanations do not translate functions or identifiers into broken code", () => {
  const powerbi = read("powerbi/index.html");
  assert.ok(!powerbi.includes("DIVIDE(Дядя"));
  assert.ok(!powerbi.includes("СУММА суммирует"));
  assert.ok(powerbi.includes("DIVIDE([Sales] - [Previous Month Sales], [Previous Month Sales])"));
  assert.ok(powerbi.includes("DATEADD"));
  assert.ok(powerbi.includes("SUM суммирует значения, COUNT подсчитывает их, а AVERAGE вычисляет среднее"));
});


test("Lesson introductions, scenario stories, glossary definitions, and flashcards are Russian", () => {
  const sql = read("sql/index.html");
  const excel = read("excel/index.html");
  const python = read("python/index.html");
  const powerbi = read("powerbi/index.html");
  const tableau = read("tableau/index.html");

  for (const phrase of [
    "Your counts showed 60 duplicate emails",
    "A stakeholder asks for \"our revenue this quarter.\"",
    "Someone asks what's driving revenue."
  ]) assert.ok(!sql.includes(phrase), "SQL lesson copy remains English: " + phrase);
  assert.ok(sql.includes("GROUP BY группирует строки по email"));
  assert.ok(sql.includes("SUM() с ORDER BY суммирует строки"));

  for (const phrase of [
    "INDEX + MATCH is the classic power-lookup pair",
    "A chart turns numbers into a visual argument",
    "Return only rows that match a condition.",
    "=COUNTBLANK(range) — counts empty cells."
  ]) assert.ok(!excel.includes(phrase), "Excel lesson copy remains English: " + phrase);
  assert.ok(excel.includes("INDEX + MATCH — классическая пара функций"));
  assert.ok(excel.includes("=FILTER(data, condition)"));

  for (const phrase of [
    "A list is like a numbered grocery list",
    "A function is like a coffee machine",
    "You know your DataFrame's shape and types.",
    "The split-apply-combine pattern."
  ]) assert.ok(!python.includes(phrase), "Python lesson copy remains English: " + phrase);
  assert.ok(python.includes("df[df['Region'] == 'West']"));
  assert.ok(python.includes("Шаблон «разделить — применить — объединить»"));

  for (const phrase of [
    "Loading data is like unpacking groceries",
    "A cluttered report is a road sign with twenty messages",
    "A monthly bar shows each month alone",
    "Return a subset of a table where a condition is true."
  ]) assert.ok(!powerbi.includes(phrase), "Power BI lesson copy remains English: " + phrase);
  assert.ok(powerbi.includes("DAX для этого есть TOTALYTD"));

  for (const phrase of [
    "Tableau color-codes your fields",
    "Sorting is the cheapest way to make a chart readable.",
    "Your charts are sharp and you know which type fits which question."
  ]) assert.ok(!tableau.includes(phrase), "Tableau lesson copy remains English: " + phrase);
  assert.ok(tableau.includes("СИНИМ"));
  assert.ok(tableau.includes("Story (историю)"));
});


test("SQL lesson code fragments are protected without freezing Russian explanations", () => {
  const corrupted = "SELECT b.имя, СУММА(o.сумма) FROM customers c ПРИСОЕДИНЯЙТЕСЬ к заказам o ВКЛ o.customer_id = c.id GROUP BY b.имя;";
  for (const snippet of [
    corrupted,
    "SELECT name, email",
    "JOIN orders o ON o.customer_id = c.id",
    "GROUP BY region",
    "COUNT(*) AS total_rows",
    "WHERE status IS NULL",
    "ПРИСОЕДИНЯЙТЕСЬ к заказам o ВКЛ o.customer_id = c.id"
  ]) assert.equal(isTechnicalSnippet(snippet), true, "Expected a technical snippet to be protected: " + snippet);

  for (const prose of [
    "JOIN может повторить клиента, а GROUP BY складывает эти копии обратно в одну.",
    "Объединение таблиц может увеличить количество строк.",
    "Объясните, почему GROUP BY нужен после WHERE."
  ]) assert.equal(isTechnicalSnippet(prose), false, "Russian teaching copy must remain translatable: " + prose);
});

test("technical markup attributes and classes opt out of machine translation", () => {
  for (const tag of [
    '<div class="ral-sql">',
    '<div class="ral-code" translate="no">',
    '<code data-technical="sql">',
    '<span class="notranslate">'
  ]) assert.equal(shouldSkipTechnicalElement(tag), true, "Expected protected markup: " + tag);

  assert.equal(shouldSkipTechnicalElement('<p class="lesson-copy">'), false);
});

test("SQL query renderer marks code as non-translatable and repairs common translated SQL tokens", () => {
  const sql = read("sql/index.html");
  const translator = read("tools/static-russian-translation.mjs");
  assert.match(sql, /function normalizeSqlSnippet\(value\)/);
  assert.match(sql, /class="ral-sql" translate="no" data-technical="sql"/);
  assert.match(sql, /class="ral-code" translate="no" data-technical="sql"/);
  assert.match(sql, /class="ral-note-chunk" translate="no" data-technical="sql"/);
  assert.match(sql, /normalizeSqlSnippet\(String\(ral\.sql \|\| ''\)\)/);
  assert.match(translator, /TECHNICAL_KEYS/);
  assert.match(translator, /isTechnicalSnippet\(value\)/);

  const definition = sql.match(/function normalizeSqlSnippet\(value\)\{[\s\S]*?\n\}\n\nfunction ralBlockHTML\(ral\)\{/);
  assert.ok(definition, "Could not locate the query normalizer definition");
  const normalize = vm.runInNewContext(definition[0].replace(/\n\nfunction ralBlockHTML\(ral\)\{$/, "") + "\nnormalizeSqlSnippet");
  const corrupted = "SELECT b.имя, СУММА(o.сумма) FROM customers c ПРИСОЕДИНЯЙТЕСЬ к заказам o ВКЛ o.customer_id = c.id GROUP BY b.имя;";
  assert.equal(
    normalize(corrupted),
    "SELECT c.name, SUM(o.amount) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.name;"
  );
  assert.equal(
    normalize("JOIN может повторить клиента, а GROUP BY складывает эти копии обратно в одну."),
    "JOIN может повторить клиента, а GROUP BY складывает эти копии обратно в одну."
  );
});
