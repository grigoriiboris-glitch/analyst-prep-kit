"use strict";

// Shared guard for technical expressions embedded in otherwise Russian lessons.
// It intentionally recognises partial SQL clauses too: Parsons exercises often
// store SELECT, FROM, WHERE, JOIN, and GROUP BY on separate lines.
const SQL_FRAGMENT_START = /^\s*(?:--\s|SELECT\s+(?:\*|[A-Za-z_"][\w$."\\[\]]*(?:\s*(?:,|FROM\b|AS\b|$))|COUNT\s*\(|SUM\s*\(|AVG\s*\(|MIN\s*\(|MAX\s*\(|COALESCE\s*\()|FROM\s+[A-Za-z_"][\w$."\\[\]]*(?:\s*(?:;|$))|WHERE\s+[A-Za-z_"][\w$."\\[\]]*\s*(?:=|<>|!=|>=|<=|>|<|\bIS\b|\bIN\b|\bLIKE\b|\bBETWEEN\b)|JOIN\s+[A-Za-z_][\w$]*(?:\s+(?:AS\s+)?[A-Za-z_][\w$]*)?(?:\s+\bON\b|;|$)|(?:(?:INNER|LEFT|RIGHT|FULL(?:\s+OUTER)?)\s+JOIN)\s+[A-Za-z_][\w$]*|CROSS\s+JOIN\s+[A-Za-z_][\w$]*|ON\s+[A-Za-z_][\w$]*(?:\.[A-Za-z_][\w$]*)?\s*(?:=|<>|!=|>=|<=|>|<)|GROUP\s+BY\s+[A-Za-z_][\w$]*(?:\s*(?:,|;|$))|ORDER\s+BY\s+[A-Za-z_][\w$]*(?:\s*(?:ASC|DESC|,|;|$))|HAVING\s+[A-Za-z_][\w$]*\s*(?:=|<>|!=|>=|<=|>|<)|LIMIT\s+\d+|OFFSET\s+\d+|UNION(?:\s+ALL)?\b|CASE\b|WHEN\s+[A-Za-z_][\w$]*\s*(?:=|<>|!=|>=|<=|>|<)|THEN\b|ELSE\b|END\b|WITH\s+[A-Za-z_][\w$]*\s+AS\s*\(|INSERT\s+INTO\s+[A-Za-z_][\w$]*|UPDATE\s+[A-Za-z_][\w$]*\s+SET\b|DELETE\s+FROM\s+[A-Za-z_][\w$]*|CREATE\s+(?:TABLE|VIEW|INDEX)\b|(?:COUNT|SUM|AVG|MIN|MAX|COALESCE|DATE_FORMAT|ROW_NUMBER|RANK|DENSE_RANK)\s*\()/i;
const TRANSLATED_SQL_START = /^\s*(?:ВЫБРАТЬ\s+(?:\*|[A-Za-z_А-Яа-яЁё][\w$А-Яа-яЁё."]*)|ВКЛ\s+[A-Za-z_][\w$.]*|ГДЕ\s+[A-Za-z_][\w$.]*|(?:ИЗ|ОТ)\s+[A-Za-z_][\w$.]*|ПРИСОЕДИНЯЙТЕСЬ\s+к\s+(?:заказам|клиентам)(?:\s|$)|JOINСЬ\s+к\s+(?:заказам|клиентам)(?:\s|$)|(?:ВНУТРЕННЕЕ|ЛЕВОЕ|ПРАВОЕ|ПОЛНОЕ\s+ВНЕШНЕЕ)\s+СОЕДИНЕНИЕ\s+[А-Яа-яЁёA-Za-z_]|ГРУППА\s+ПО\s+[A-Za-z_А-Яа-яЁё][\w$А-Яа-яЁё.]*|ПОРЯДОК\s+ПО\s+[A-Za-z_А-Яа-яЁё][\w$А-Яа-яЁё.]*|ИМЕЯ\s+[A-Za-z_][\w$.]*\s*(?:=|>|<)|СУММА\s*\(|СЧЁТ\s*\(|СЧЕТ\s*\(|ПРАГМА\s+)/i;
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
