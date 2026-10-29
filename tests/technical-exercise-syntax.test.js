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

test("SQL fill-in answers and walkthrough snippets keep English syntax", () => {
  const sql = read("sql/index.html");
  const fillsMatch = sql.match(/FILLS:\s*\[([\s\S]*?)\n\],/);
  assert.ok(fillsMatch, "SQL fill-in exercises must be present");
  const fills = fillsMatch[1];

  assert.match(fills, /partial:"SELECT name, ___\\nFROM customers;", ans:"email", choices:\["email","address","phone","id"\]/);
  assert.doesNotMatch(fills, /ans:"[^"]*[А-Яа-яЁё]/, "SQL answer fragments must not be translated");
  assert.doesNotMatch(fills, /partial:"[^"]*[А-Яа-яЁё]/, "SQL code snippets must keep English syntax");
  assert.doesNotMatch(fills, /choices:\[[^\]]*"[А-Яа-яЁё]/, "SQL syntax answer choices must not be translated");

  for (const fragment of [
    "SELECT имя",
    "ГДЕ регион",
    "ОТ устаревших_клиентов",
    "СУММ (CASE",
    "ROUND(общий_долг",
    "ПРАГМА table_info",
    "ИМЕЯ COUNT(*)",
    "TRIM(имя) Имя AS",
    "UPPER(состояние) состояние AS",
    "GROUP BY СЧЕТУ(*)",
    "ПОРЯДОК ПО СЧЕТУ(*)",
    "ИЗ фактических данных a ОБЪЕДИНИТЬ бюджет b"
  ]) {
    assert.ok(!sql.includes(fragment), "SQL lesson still contains translated syntax: " + fragment);
  }
  assert.match(sql, /PRAGMA table_info\(/);
  assert.match(sql, /SELECT DATE_FORMAT\(order_date,'%Y-%m'\) AS month, SUM\(revenue\) AS month_revenue/);
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
  assert.match(stats, /q1=df\[.*revenue.*\.quantile\(0\.25\)/);
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
  assert.ok(powerbi.includes("DIVIDE([Total Revenue] - [Total Cost], [Total Revenue])"));
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
  assert.ok(sql.includes("GROUP BY группирует строки по адресу электронной почты"));
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

test("Semicolons mark the entire lesson string as non-translatable", () => {
  for (const value of [
    "Select the active customers; then sort them by name.",
    "SELECT name FROM customers; -- return the customer names",
    "ГДЕ регион = «Запад»; следующий фрагмент"
  ]) {
    assert.equal(isTechnicalSnippet(value), true, "A semicolon must protect the whole string: " + value);
  }

  assert.equal(
    isTechnicalSnippet("Select the active customers and sort them by name."),
    false,
    "Ordinary text without a semicolon should still be eligible for Russian localization"
  );
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
  assert.equal(normalize("ГДЕ регион НУЛЬ;"), "WHERE region IS NULL;");
  assert.match(sql, /const safeLines = lines\.map\(line => normalizeSqlSnippet\(line\)\)/);
  assert.match(sql, /class="pars-txt" translate="no" data-technical="sql"/);
});

test("SQL snippets match the upstream English source and code tags stay untranslated", () => {
  const sql = read("sql/index.html");

  // These are executable fragments or deliberate syntax distractors from the
  // original SQL lessons. They must not be localized with the surrounding copy.
  for (const snippet of [
    "SELECT region, revenue",
    "WHERE region = 'West'",
    "SELECT name, email",
    "GET * FROM products;",
    "FROM products SELECT *;",
    "SHOW products;",
    "SELECT name, customers;",
    "WHERE amount > 100",
    "GROUP BY status",
    "CASE WHEN status='active' THEN 'Yes'",
    "JOIN customers c",
    "ON o.customer_id = c.id",
    "RIGHT JOIN orders o ON c.id = o.customer_id",
    "COUNT(DISTINCT CASE WHEN step IN ('signup','activate','pay') THEN user_id END) AS signed_up,",
    "SUM(CASE WHEN line = 'Revenue' THEN amount ELSE 0 END) AS revenue",
    "ROUND(SUM(cash_flow / POWER(1 + 0.10, year)), 0) AS npv"
  ]) {
    assert.ok(sql.includes(snippet), "SQL source fragment was changed: " + snippet);
  }

  for (const corrupted of [
    "SELECT регион, доход",
    "ГДЕ регион = «Запад»",
    "SELECT имя, адрес электронной почты",
    "СУММ (CASE, WHEN строка = «Доход»"
  ]) {
    assert.ok(!sql.includes(corrupted), "Localized SQL code remains in source: " + corrupted);
  }

  const codeBodies = [...sql.matchAll(/<code\b[^>]*>([\s\S]*?)<\/code>/gi)];
  assert.ok(codeBodies.length > 0, "Expected SQL lessons to contain code elements");
  for (const [, body] of codeBodies) {
    const visible = body.replace(/<[^>]*>/g, "");
    assert.doesNotMatch(visible, /[А-Яа-яЁё]/, "Text inside a <code> tag must remain English");
  }

  assert.equal(shouldSkipTechnicalElement("<code>"), true, "A bare code tag must opt out of translation");
});

test("Legacy dark-green UI palette is removed from shared and learning components", () => {
  const contextCopy = read("assets/ai-context-copy.js");
  const learningOrder = read("assets/learning-order.js");
  const datacraft = read("datacraft/index.html");
  const curriculumMap = read("datacraft/curriculum-map.css");
  const decisionMaking = read("decision-making/index.html");
  const foundations = read("foundations/index.html");
  const projects = read("portfolio-projects/index.html");
  const postgresql = read("postgresql/index.html");
  const postgresqlApp = read("postgresql/app.js");

  const oldGreenGradient = [
    "linear-gradient(120deg",
    "rgba(36,67,48,.92)",
    "rgba(26,43,33,.92))"
  ].join(",");
  assert.ok(
    !contextCopy.includes(oldGreenGradient),
    "AI context toolbar must not use the old forest-green gradient"
  );
  for (const legacyColor of [
    "rgba(102,190,139,.42)",
    "#326847",
    "#91e4b1"
  ]) {
    assert.ok(!contextCopy.includes(legacyColor), "AI context toolbar still contains legacy green: " + legacyColor);
  }

  for (const legacyColor of ["#34443a", "#17211b", "#9be7b5"]) {
    assert.ok(!learningOrder.includes(legacyColor), "Learning-order note still uses legacy green: " + legacyColor);
  }

  assert.ok(datacraft.includes('href="grain-theme.css"'), "DataCraft must use the shared Zinc and Sky UI skin");
  assert.ok(!datacraft.includes("linear-gradient(160deg,rgba(31,51,43"), "DataCraft panels must not use the legacy dark-green gradient");
  assert.ok(!curriculumMap.includes("linear-gradient(145deg,rgba(29,49,39"), "Curriculum shell must not use the legacy dark-green gradient");
  assert.ok(!curriculumMap.includes("linear-gradient(150deg,#20372a,#14251c"), "NPC dialog must not use the legacy dark-green gradient");

  for (const [name, source] of [
    ["decision-making", decisionMaking],
    ["foundations", foundations],
    ["portfolio projects", projects],
    ["PostgreSQL", postgresql]
  ]) {
    assert.doesNotMatch(source, /#203c30|#20372c|#17211d|#22362b|#18211d|#101714|#19231f|#35453c/i,
      name + " still contains the legacy dark-green theme");
  }
  assert.match(postgresqlApp, /primaryColor:'#18181B',primaryTextColor:'#F5F7FA',primaryBorderColor:'#38BDF8'/,
    "PostgreSQL diagrams must use the neutral/cyan theme");
  for (const page of ["sql", "excel", "python", "tableau"]) {
    const source = read(page + "/index.html");
    assert.ok(
      !source.includes("background:var(--surf,#152622)") &&
      !source.includes("background:var(--surf2,var(--surf,#1a302c))"),
      page + " sprint bar still has the dark-green fallback"
    );
  }
});




test("Python Parsons exercises keep executable English snippets", () => {
  const python = read("python/index.html");
  assert.ok(python.includes("lines:[\"import pandas as pd\",\"df = pd.read_csv('sales.csv')\",\"west = df[df['region'] == 'West']\",\"print(west.shape)\"]"));
  assert.ok(python.includes("lines:[\"import pandas as pd\",\"df = pd.read_csv('sales.csv')\",\"totals = df.groupby('region')['revenue'].sum()\",\"print(totals)\"]"));
  assert.ok(python.includes("df.groupby('region')['revenue'].sum()"));
  assert.ok(python.includes(".reset_index()"));
  assert.ok(!python.includes("импортировать pandas как ПД"));
  assert.ok(!python.includes("запад = df[df['регион']"));
  assert.ok(!python.includes("итоги = df.groupby('регион'"));
  assert.ok(!python.includes(".перезагрузить_index("));
});

test("Analyst simulator schema and SQL date examples keep English identifiers", () => {
  const simulator = read("simulator/index.html");
  assert.ok(simulator.includes("заказы → order_id, customer_id, product_id, order_date, amount, status"));
  assert.ok(simulator.includes("WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'"));
  assert.ok(simulator.includes("ROUND(SUM(o.amount)::numeric / NULLIF(COUNT(o.order_id),0), 2)"));
  assert.ok(!simulator.includes("Фильтр по дате: ГДЕ дата_заказа"));
  assert.ok(!simulator.includes("Подтверждает существование этих столбцов: идентификатор заказа"));
});

test("SQL answer choices and examples preserve English SQL syntax", () => {
  const sql = read("sql/index.html");
  assert.ok(sql.includes('opts:["WHERE amount > 100","WHERE amount = 100","FILTER amount > 100","WHERE amount GREATER 100"]'));
  assert.ok(sql.includes("a:\"WHERE amount > 100 AND state = 'TX'\""));
  assert.ok(!sql.includes('"Количество ФИЛЬТРОВ > 100"'));
  assert.ok(!sql.includes('"ГДЕ сумма БОЛЬШЕ 100"'));
});


test("The translation guard recognizes executable Python lines and SQL answer fragments", () => {
  for (const snippet of [
    "import pandas as pd",
    "from datetime import date",
    "def log_calls(func):",
    "west = df[df['region'] == 'West']",
    "totals = df.groupby('region')['revenue'].sum()",
    "WHERE amount GREATER 100",
    "FILTER amount > 100"
  ]) {
    assert.equal(isTechnicalSnippet(snippet), true, "Must remain untranslated: " + snippet);
  }
});
