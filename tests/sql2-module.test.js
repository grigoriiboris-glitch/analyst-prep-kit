'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('SQL 2 is a standalone Russian-first course with 24 authored tasks', () => {
  const html = read('sql2/index.html');
  assert.match(html, /<html lang="ru"[^>]*data-static-ru="true"/);
  assert.match(html, /<title>SQL 2 — практикум аналитика данных<\/title>/);
  assert.equal((html.match(/\{id:\d+,unit:"[^"]+",title:"/g) || []).length, 24);
  assert.equal((html.match(/prompt:"[^"]+"/g) || []).length, 24);
  assert.equal((html.match(/solution:"[\s\S]*?",explain:"/g) || []).length, 24);

  const prompts = [...html.matchAll(/prompt:"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(prompts.length, 24);
  for (const prompt of prompts) {
    assert.match(prompt, /[А-Яа-яЁё]/, 'Task prompts must be written in Russian: ' + prompt);
  }

  const solutions = [...html.matchAll(/solution:"([\s\S]*?)",explain:"/g)].map((match) => match[1]);
  assert.equal(solutions.length, 24);
  for (const source of solutions) {
    assert.match(source, /^(SELECT|WITH)\b/i, 'Each answer must be an executable SQL query');
    assert.doesNotMatch(source, /\b(?:ВЫБРАТЬ|ГДЕ|ИЗ|СОЕДИНИТЬ|СГРУППИРОВАТЬ|ИМЕЯ)\b/i,
      'SQL keywords must stay in English');
  }
});

test('SQL 2 covers the required SQL topics and executes against the SQLite sandbox', () => {
  const html = read('sql2/index.html');
  for (const token of [
    'WHERE', 'IS NULL', 'DISTINCT', 'LIKE', 'BETWEEN', 'CASE', 'COALESCE',
    'COUNT(*)', 'GROUP BY', 'HAVING', 'INNER JOIN', 'LEFT JOIN',
    'STRFTIME(', 'WITH region_revenue AS', 'ROW_NUMBER()', 'LAG(',
    'SUM(total_amount) OVER', 'payments', 'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW',
    '(SELECT COUNT(*) FROM orders)'
  ]) assert.ok(html.includes(token), 'SQL 2 is missing topic or query feature: ' + token);

  assert.ok(html.includes('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js'));
  assert.ok(html.includes('sqlDb.exec(SEED_SQL)'), 'The lesson schema and seed data must execute as a batch');
  assert.ok(html.includes('function queryOnly(sql)'), 'Student queries must pass the read-only SQL guard');
  assert.ok(html.includes('function sameResults(actual, expected)'), 'Queries must be evaluated by their result table');
  assert.ok(html.includes('Ctrl + Enter'), 'The editor should expose the run shortcut');
  assert.ok(html.includes('function copyTaskContext()'), 'Learners should be able to copy lesson context for an AI helper');

  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const inline = scripts.filter(([, attributes, source]) => source.trim() && !/\bsrc\s*=/i.test(attributes));
  assert.ok(inline.length > 0, 'The SQL 2 application script must be present');
  for (const [, , source] of inline) {
    assert.doesNotThrow(() => new Function(source), 'SQL 2 inline JavaScript must parse');
  }
});

test('SQL 2 uses separate progress, cloud sync, and once-only DataCraft rewards', () => {
  const html = read('sql2/index.html');
  const progress = read('assets/progress-state.js');
  const economy = read('assets/datacraft-economy.js');
  const homepage = read('index.html');
  const translator = read('tools/static-russian-translation.mjs');

  assert.ok(html.includes('const STORAGE_KEY = "sql2kit-v1"'));
  assert.ok(html.includes('sql2-last-visit'));
  assert.ok(html.includes('window.DataCraftEconomy.earn("sql2:lesson:"'));
  assert.ok(progress.includes("sql2: { id: 'sql2-v1'"));
  assert.ok(economy.includes("sql2: {key:'sql2kit-v1',prop:'doneLessons',rate:1,total:24,bonus:5}"));
  assert.ok(homepage.includes('href="sql2/" data-kit="sql2"'));
  assert.ok(homepage.includes("localStorage.getItem('sql2kit-v1')"));
  assert.ok(translator.includes('"sql2/index.html"'), 'Build-time translation must not modify SQL identifiers or executable query examples');
});

test('SQL 2 query execution blocks data-changing commands and multiple statements', () => {
  const html = read('sql2/index.html');
  assert.ok(html.includes('if (!/^(SELECT|WITH)\\b/i.test(cleaned))'));
  assert.ok(html.includes('INSERT|UPDATE|DELETE|REPLACE|CREATE|ALTER|DROP|TRUNCATE|PRAGMA|ATTACH|DETACH'));
  assert.ok(html.includes('if (/;\\s*\\S/.test(cleaned))'));
});


test('Every SQL 2 lesson follows the beginner-friendly lesson structure', () => {
  const html = read('sql2/index.html');
  const match = html.match(/const LESSONS = (\[[\s\S]*?\n    \]);/);
  assert.ok(match, 'The SQL 2 lesson list must be present');
  const lessons = new Function('return ' + match[1])();
  assert.equal(lessons.length, 24);
  assert.match(lessons.find((lesson) => lesson.id === 11).expected, /Delivered — 10/);
  assert.match(lessons.find((lesson) => lesson.id === 12).expected, /Delivered — 10/);

  const requiredTextFields = [
    'whatNew', 'prompt', 'hint', 'expected', 'explain',
    'commonMistake', 'checkQuestion'
  ];
  for (const lesson of lessons) {
    for (const field of requiredTextFields) {
      assert.equal(typeof lesson[field], 'string', 'Lesson ' + lesson.id + ' is missing ' + field);
      assert.ok(lesson[field].trim().length > 0, 'Lesson ' + lesson.id + ' has an empty ' + field);
    }
    assert.match(lesson.starter, /^(SELECT|WITH)\b/i, 'Lesson ' + lesson.id + ' starter must be SQL');
    assert.match(lesson.solution, /^(SELECT|WITH)\b/i, 'Lesson ' + lesson.id + ' solution must be SQL');
    assert.match(lesson.starter, /;\s*$/, 'Lesson ' + lesson.id + ' starter must end with a semicolon');
    assert.match(lesson.solution, /;\s*$/, 'Lesson ' + lesson.id + ' solution must end with a semicolon');
    assert.doesNotMatch(lesson.hint, /\b(?:SELECT|WITH)\b[\s\S]*;/i,
      'Lesson ' + lesson.id + ' hint must not contain a complete SQL solution');
    assert.doesNotMatch(lesson.solution, /\b(select|from|where|order by|group by|having|limit|with|join|on)\b/,
      'Lesson ' + lesson.id + ' SQL keywords should be uppercase');
  }

  const lessonBlock = match[1];
  assert.doesNotMatch(lessonBlock, /Важно:\s*объясняй решение по-русски|инструкц(?:ия|ии) для ИИ/i,
    'Learner-facing lesson content must not contain AI service instructions');
  assert.ok(html.includes('<strong>Что нового</strong>'));
  assert.ok(html.includes('<strong>Ожидаемый результат</strong>'));
  assert.ok(html.includes('<strong>Типичная ошибка новичка</strong>'));
  assert.ok(html.includes('<strong>Проверь себя</strong>'));
  assert.ok(html.includes('<strong>Разбор решения</strong>'));
});
