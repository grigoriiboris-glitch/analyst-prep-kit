const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const modules = [
  { name: "Excel", page: "excel/index.html", archive: "learns/excel.md", count: 51 },
  { name: "Power BI", page: "powerbi/index.html", archive: "learns/powerbi.md", count: 39 },
  { name: "Tableau", page: "tableau/index.html", archive: "learns/tableau.md", count: 32 },
  { name: "Статистика", page: "stats/index.html", archive: "learns/statistics.md", count: 16 },
  { name: "Прогнозирование", page: "forecasting/index.html", archive: "learns/forecasting.md", count: 13 },
  { name: "PostgreSQL", page: "postgresql/course-data.js", archive: "learns/postgresql.md", count: 30, json: true }
];

function extractArray(source, file) {
  const marker = source.match(/LESSONS\\s*:/);
  assert.ok(marker, file + ": не найден массив LESSONS");
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
      if (char === "\\n") lineComment = false;
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
      if (char === "\\\\") {
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
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(open, index + 1);
    }
  }

  assert.fail(file + ": массив LESSONS не закрыт");
}

function readLessons(module) {
  const source = fs.readFileSync(path.join(root, module.page), "utf8");
  if (module.json) {
    const marker = "window.PostgreSQLLessons = ";
    assert.ok(source.startsWith(marker), "PostgreSQL должен экспортировать window.PostgreSQLLessons");
    return JSON.parse(source.slice(marker.length).trim().replace(/;\\s*$/, ""));
  }
  const literal = extractArray(source, module.page);
  return vm.runInNewContext("(" + literal + ")", {}, { timeout: 1000 });
}

test("архив learns содержит каждый урок из приложения без пропусков и переименований", () => {
  for (const module of modules) {
    const lessons = readLessons(module);
    const markdown = fs.readFileSync(path.join(root, module.archive), "utf8");
    const headings = [...markdown.matchAll(/^### Материал урока приложения №(\\d+) — (.+)$/gm)];

    assert.equal(lessons.length, module.count, module.name + ": изменилось число уроков приложения");
    assert.equal(headings.length, lessons.length, module.name + ": не все уроки попали в архив");

    lessons.forEach((lesson, index) => {
      const expectedNumber = String(index + 1);
      assert.equal(headings[index][1], expectedNumber, module.name + ": пропущен или переставлен урок №" + expectedNumber);
      assert.equal(headings[index][2], lesson.title, module.name + ": заголовок урока №" + expectedNumber + " отличается от приложения");
      const start = headings[index].index;
      const end = index + 1 < headings.length ? headings[index + 1].index : markdown.length;
      assert.ok(markdown.slice(start, end).trim().length > 100, module.name + ": урок №" + expectedNumber + " остался без учебного содержания");
    });
  }
});

test("счётчик SQL на главной странице совпадает с фактической программой курса", () => {
  const lessons = readLessons({ name: "SQL", page: "sql/index.html" });
  const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const marker = '<a class="skill-item" href="sql/" data-kit="sql">';
  const start = home.indexOf(marker);
  assert.ok(start >= 0, "Не найдена карточка SQL на главной странице");
  const end = home.indexOf("</a>", start);
  assert.ok(end > start, "Карточка SQL не закрыта");
  const card = home.slice(start, end);
  assert.match(card, new RegExp(lessons.length + " урок"));
});
