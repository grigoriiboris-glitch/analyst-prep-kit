const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const headingPattern = /^### Материал урока приложения №(\d+) — (.+)$/gm;

function extractArray(source, file) {
  const marker = /(?:const\s+LESSONS\s*=|LESSONS\s*:)/.exec(source);
  assert.ok(marker, file + ": не найдена декларация массива уроков");
  const open = source.indexOf("[", marker.index + marker[0].length - 1);
  assert.ok(open >= 0, file + ": не найдена открывающая скобка массива");

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = open; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === "'" || char === '"' || char.charCodeAt(0) === 96) {
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(open, index + 1);
    }
  }

  assert.fail(file + ": массив уроков не закрыт");
}

function extractObjects(arrayLiteral, file) {
  const objects = [];
  let square = 0;
  let curly = 0;
  let objectStart = -1;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < arrayLiteral.length; index += 1) {
    const char = arrayLiteral[index];
    const next = arrayLiteral[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === "'" || char === '"' || char.charCodeAt(0) === 96) {
      quote = char;
      continue;
    }
    if (char === "[") {
      square += 1;
      continue;
    }
    if (char === "]") {
      square -= 1;
      continue;
    }
    if (char === "{" && square === 1 && curly === 0) objectStart = index;
    if (char === "{") curly += 1;
    if (char === "}") {
      curly -= 1;
      if (curly === 0 && objectStart >= 0) {
        objects.push(arrayLiteral.slice(objectStart, index + 1));
        objectStart = -1;
      }
    }
  }

  assert.ok(objects.length > 0, file + ": не найдены объекты уроков в массиве");
  return objects;
}

function objectTitle(object, file) {
  const match = object.match(/\btitle\s*:\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/);
  assert.ok(match, file + ": у объекта урока нет текстового поля title");
  if (match[1][0] === '"') return JSON.parse(match[1]);
  return match[1].slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, "\\");
}

function lessonHeadings(markdown, file) {
  const matches = [...markdown.matchAll(headingPattern)];
  assert.ok(matches.length > 0, file + ": в архиве нет заголовков синхронизированных уроков");
  matches.forEach((match, index) => {
    assert.equal(match[1], String(index + 1), file + ": нарушен порядок материалов уроков");
  });
  return matches;
}

function htmlText(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHtmlLessons(source, config) {
  const opening = new RegExp("<" + config.tag + "\\b([^>]*)>", "gi");
  const blocks = [];
  let match;

  while ((match = opening.exec(source))) {
    const attrs = match[1];
    const selected = config.selector === "decision"
      ? /\bid=["']lesson\d+["']/i.test(attrs)
      : /\bclass=["'][^"']*\blesson\b[^"']*["']/i.test(attrs);
    if (!selected) continue;

    const start = match.index;
    const token = new RegExp("<\\/?"+ config.tag + "\\b[^>]*>", "gi");
    token.lastIndex = opening.lastIndex;
    let depth = 1;
    let item;
    let end = -1;
    while ((item = token.exec(source))) {
      if (/^<\//.test(item[0])) depth -= 1;
      else if (!/\/>$/.test(item[0])) depth += 1;
      if (depth === 0) {
        end = token.lastIndex;
        break;
      }
    }
    assert.ok(end > start, config.page + ": не закрыт HTML-блок урока");

    const raw = source.slice(start, end);
    const titleAttr = attrs.match(/\bdata-title=["']([^"']+)["']/i);
    let title = titleAttr ? htmlText(titleAttr[1]) : "";
    if (!title) {
      const heading = raw.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i);
      title = heading ? htmlText(heading[1]) : "";
    }
    assert.ok(title, config.page + ": у HTML-урока нет заголовка");
    blocks.push({ title, raw });
    opening.lastIndex = end;
  }
  return blocks;
}

const arrayModules = [
  { name: "Диаграммы", page: "chart-literacy/index.html", archive: "learns/chart-literacy.md", count: 13 },
  { name: "Собеседование", page: "interview/index.html", archive: "learns/interview.md", count: 16 },
  { name: "Python", page: "python/index.html", archive: "learns/python.md", count: 42 },
  { name: "SQL", page: "sql/index.html", archive: "learns/sql.md", count: 48 },
  { name: "SQL2", page: "sql2/index.html", archive: "learns/sql2.md", count: 24 }
];

const htmlModules = [
  { name: "Основы аналитики", page: "foundations/index.html", archive: "learns/foundations.md", count: 8, tag: "article" },
  { name: "Бизнес-анализ", page: "business-analysis/index.html", archive: "learns/business-analysis.md", count: 9, tag: "article" },
  { name: "Логика и принятие решений", page: "decision-making/index.html", archive: "learns/decision-making.md", count: 6, tag: "section", selector: "decision" }
];

test("все динамические курсы синхронизированы с полными объектами уроков приложения", () => {
  for (const module of arrayModules) {
    const source = fs.readFileSync(path.join(root, module.page), "utf8");
    const archive = fs.readFileSync(path.join(root, module.archive), "utf8");
    const objects = extractObjects(extractArray(source, module.page), module.page);
    const headings = lessonHeadings(archive, module.archive);

    assert.equal(objects.length, module.count, module.name + ": изменилось число уроков в приложении");
    assert.equal(headings.length, objects.length, module.name + ": число заголовков архива не совпадает с программой");

    objects.forEach((object, index) => {
      assert.equal(headings[index][2], objectTitle(object, module.page), module.name + ": заголовок урока №" + (index + 1) + " отличается от приложения");
      const start = headings[index].index;
      const end = index + 1 < headings.length ? headings[index + 1].index : archive.length;
      const archivedLesson = archive.slice(start, end);
      assert.ok(archivedLesson.includes(object), module.name + ": полный объект урока №" + (index + 1) + " потерян или изменён");
    });
  }
});

test("все статические курсы содержат в learns полные HTML-уроки из приложения", () => {
  for (const module of htmlModules) {
    const source = fs.readFileSync(path.join(root, module.page), "utf8");
    const archive = fs.readFileSync(path.join(root, module.archive), "utf8");
    const lessons = extractHtmlLessons(source, module);
    const headings = lessonHeadings(archive, module.archive);

    assert.equal(lessons.length, module.count, module.name + ": изменилось число HTML-уроков в приложении");
    assert.equal(headings.length, lessons.length, module.name + ": число архивных уроков отличается от программы");

    lessons.forEach((lesson, index) => {
      assert.equal(headings[index][2], lesson.title, module.name + ": изменён заголовок урока №" + (index + 1));
      const start = headings[index].index;
      const end = index + 1 < headings.length ? headings[index + 1].index : archive.length;
      assert.ok(archive.slice(start, end).includes(lesson.raw), module.name + ": HTML-урок №" + (index + 1) + " сохранён не полностью");
    });
  }
});

test("практикум качества данных и проекты портфолио сохранены в архиве learns", () => {
  const qualityArchive = fs.readFileSync(path.join(root, "learns/data-quality.md"), "utf8");
  const qualityHeadings = lessonHeadings(qualityArchive, "learns/data-quality.md");
  assert.equal(qualityHeadings.length, 1, "Качество данных: должен быть один полный практикум");
  for (const marker of ["Паспорт набора данных", "Точные дубликаты", "Контрольная сумма"]) {
    assert.ok(qualityArchive.includes(marker), "Качество данных: в архиве отсутствует " + marker);
  }

  const projectsArchive = fs.readFileSync(path.join(root, "learns/portfolio-projects.md"), "utf8");
  const projectHeadings = lessonHeadings(projectsArchive, "learns/portfolio-projects.md");
  const expected = [
    "Анализ продаж интернет-магазина",
    "Анализ работы службы поддержки",
    "Анализ эффективности рекламы"
  ];
  assert.deepEqual(projectHeadings.map(item => item[2]), expected, "Портфолио: изменён состав или порядок проектов");
  for (let index = 0; index < projectHeadings.length; index += 1) {
    const start = projectHeadings[index].index;
    const end = index + 1 < projectHeadings.length ? projectHeadings[index + 1].index : projectsArchive.length;
    assert.ok(projectsArchive.slice(start, end).trim().length > 500,
      "Портфолио: потеряно содержание проекта №" + (index + 1));
  }
});

test("в README перечислены все 16 модулей с полным архивом", () => {
  const readme = fs.readFileSync(path.join(root, "learns/README.md"), "utf8");
  const expected = [
    "foundations.md", "business-analysis.md", "chart-literacy.md", "data-quality.md",
    "decision-making.md", "excel.md", "forecasting.md", "interview.md",
    "portfolio-projects.md", "postgresql.md", "powerbi.md", "python.md",
    "sql.md", "sql2.md", "statistics.md", "tableau.md"
  ];
  expected.forEach(file => assert.ok(readme.includes("./" + file), "README: не указан " + file));
  assert.match(readme, /351 учебная единица/i);
});

test("все 15 редакторских материалов сохранены как исходники, а не runtime-уроки", () => {
  const source = JSON.parse(fs.readFileSync(path.join(root, "learns/edited-lesson-source.json"), "utf8"));
  const expected = [
    "business-analysis", "chart-literacy", "data-quality", "decision-making",
    "excel", "forecasting", "interview", "portfolio-projects", "postgresql",
    "powerbi", "python", "sql", "sql2", "statistics", "tableau"
  ];
  assert.deepEqual(Object.keys(source.modules).sort(), expected.sort());
  for (const module of expected) {
    assert.ok(source.modules[module].trim().length > 100, module + ": исходный редакторский материал пуст");
  }
  const pages = [
    "business-analysis/index.html", "chart-literacy/index.html", "data-quality/index.html",
    "decision-making/index.html", "excel/index.html", "forecasting/index.html", "interview/index.html",
    "portfolio-projects/index.html", "postgresql/index.html", "powerbi/index.html", "python/index.html",
    "sql/index.html", "sql2/index.html", "stats/index.html", "tableau/index.html"
  ];
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    assert.doesNotMatch(html, /edited-source-data|edited-source-library|edited-lesson-content[.]js|data-edited-live/,
      page + ": исходник редакторского перевода не должен отображаться отдельным текстовым слоем");
  }
  assert.equal(fs.existsSync(path.join(root, "assets/edited-lesson-content.js")), false);
});
