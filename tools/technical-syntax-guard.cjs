"use strict";

// Shared guard for technical expressions embedded in otherwise Russian lessons.
// It intentionally recognises partial SQL clauses too: Parsons exercises often
// store SELECT, FROM, WHERE, JOIN, and GROUP BY on separate lines.
const SQL_FRAGMENT_START = /^\s*(?:--\s|SELECT\b|FROM\b|WHERE\b|JOIN\b|(?:INNER|LEFT|RIGHT|FULL(?:\s+OUTER)?)\s+JOIN\b|CROSS\s+JOIN\b|ON\b|GROUP\s+BY\b|ORDER\s+BY\b|HAVING\b|LIMIT\b|OFFSET\b|UNION(?:\s+ALL)?\b|CASE\b|WHEN\b|THEN\b|ELSE\b|END\b|WITH\b|INSERT\s+INTO\b|UPDATE\b|DELETE\s+FROM\b|CREATE\s+(?:TABLE|VIEW|INDEX)\b|(?:COUNT|SUM|AVG|MIN|MAX|COALESCE|DATE_FORMAT|ROW_NUMBER|RANK|DENSE_RANK)\s*\()/i;
const TRANSLATED_SQL_START = /^\s*(?:ВЫБРАТЬ\b|ВКЛ\b|ГДЕ\b|ИЗ\b|ОТ\b|ПРИСОЕДИНЯЙТЕСЬ\b|(?:ВНУТРЕННЕЕ|ЛЕВОЕ|ПРАВОЕ|ПОЛНОЕ\s+ВНЕШНЕЕ)\s+СОЕДИНЕНИЕ\b|ГРУППА\s+ПО\b|ПОРЯДОК\s+ПО\b|ИМЕЯ\b|СУММА\s*\(|СЧЁТ\s*\(|СЧЕТ\s*\()/i;
const SKIP_TAGS = new Set(["script", "style", "pre", "code", "kbd", "samp", "svg", "canvas", "iframe"]);
const SKIP_CLASSES = new Set([
  "code-block", "code-sample", "code-snippet", "code-example", "formula-code",
  "ral-code", "ral-sql", "ral-note-chunk", "terminal-editor", "sql-code",
  "sql-query", "technical-code", "code-broken", "code-fixed", "fill-partial", "notranslate"
]);

function isTechnicalSnippet(value) {
  const text = String(value == null ? "" : value).trim();
  if (!text) return false;
  if (SQL_FRAGMENT_START.test(text) || TRANSLATED_SQL_START.test(text)) return true;
  // Expressions and statements can be isolated from the rest of a query.
  if (/^(?:=|@)\s*[A-Za-z_]/.test(text)) return true;
  if (/^(?:df|pd|np|plt|sns)\s*(?:\.|\[|=)/i.test(text)) return true;
  if (/^(?:[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\([^;{}]*\)(?:\s*(?:AS\s+)?[A-Za-z_$][\w$]*)?$/i.test(text)) return true;
  if (/^[A-Z]{1,3}\d+(?::[A-Z]{1,3}\d+)?$/i.test(text)) return true;
  return false;
}

function shouldSkipTechnicalElement(markup) {
  const source = String(markup == null ? "" : markup);
  const match = source.match(/^<\s*([a-z][a-z0-9:-]*)\b([^>]*)>/i);
  if (!match) return false;
  const tag = match[1].toLowerCase();
  if (SKIP_TAGS.has(tag)) return true;
  const attrs = match[2] || "";
  if (/\btranslate\s*=\s*(['"])no\1/i.test(attrs)) return true;
  if (/\bdata-(?:technical|no-translate)(?:\s*=|\s|\/|$)/i.test(attrs)) return true;
  const classMatch = attrs.match(/\bclass\s*=\s*(['"])(.*?)\1/i);
  const classes = classMatch ? classMatch[2].toLowerCase().split(/\s+/) : [];
  return classes.some(name => SKIP_CLASSES.has(name));
}

module.exports = { isTechnicalSnippet, shouldSkipTechnicalElement };
