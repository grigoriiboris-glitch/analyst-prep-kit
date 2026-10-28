#!/usr/bin/env node
/**
 * One-time/build-time static Russian localization.
 *
 * The published site contains the translated text itself. No language selector,
 * browser translation API, or external translator is needed when a learner opens
 * a page. Google Translate's free endpoint is used only by this build script.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "parse5";
import * as acorn from "acorn";
import markupGuard from "./static-russian-markup-guard.cjs";
const { containsHtmlMarkup, shouldPreserveHtmlAttributeFragment } = markupGuard;

const ROOT = process.cwd();
const CACHE_PATH = path.join(ROOT, "tools", "static-ru-cache.json");
const OMIT_DIRS = new Set([".git", ".github", "node_modules", "tools", "tests"]);
// DataCraft is authored in Russian and uses canvas renderers with CSS/font literals in JS.
// Translating those literals corrupts alpha values, filters, fonts, and inline scripts.
// Keep the game page, course scripts, Mermaid renderer, and PostgreSQL lesson page out of static translation.
const OMIT_FILES = new Set(["assets/ru-localization.js", "assets/ru-localization-boot.js", "assets/sql-mermaid.js", "datacraft/curriculum-map.js", "datacraft/index.html", "datacraft/quiet-valley.js", "datacraft/lesson-catalog.js", "postgresql/index.html"]);
const SKIP_TAGS = new Set(["script", "style", "pre", "code", "kbd", "samp", "svg", "canvas", "iframe"]);
const SKIP_CLASSES = new Set(["code-block", "code-sample", "code-snippet", "code-example", "formula-code", "ral-code", "ral-note-chunk", "terminal-editor"]);
const HUMAN_KEYS = new Set([
  "title", "subtitle", "description", "desc", "intro", "summary", "question",
  "explanation", "hint", "feedback", "prompt", "text", "content", "body", "lesson",
  "tip", "note", "callout", "objective", "goal", "instruction", "instructions",
  "label", "buttonlabel", "ctalabel", "emptyMessage", "successMessage", "errorMessage",
  "correctFeedback", "incorrectFeedback", "takeaway", "definition", "whyItMatters",
  "commonMistake", "realWorldExample", "scenario", "task", "steps", "options",
  "choices", "answers", "supportingText", "heading", "eyebrow", "detail", "caption",
  "alt", "placeholder", "arialabel", "message", "buttonText", "help", "helpText",
  "descriptionText", "instructionText", "success", "error", "warning", "recommendation",
  "resultText", "empty", "emptyState", "statusText", "questionText", "answerText",
  "correctAnswerText", "incorrectAnswerText", "ans", "why", "how", "when", "what", "purpose",
  "nodes", "items", "headers", "rows", "parts", "formula", "lessons",
  "examples", "rules", "metrics", "sections", "cards", "bullets", "keyTerms",
  "checklist", "criteria", "activities", "stages", "outcomes", "requirements",
  "signals", "categories", "tasks", "left", "right", "terms", "definitions",
  "businessQuestion", "businessContext", "deliverables", "metricDescription", "feedbackText",
  "headline", "name", "articleBody", "articleSection", "alternativeHeadline", "abstract",
  "keywords", "disambiguatingDescription", "byline", "publisher", "author"
].map(x => x.toLowerCase()));
const VISIBLE_PROPERTIES = new Set([
  "textContent", "innerText", "innerHTML", "outerHTML", "placeholder", "title",
  "alt", "ariaLabel", "value"
]);
const VISIBLE_CALLS = new Set([
  "alert", "confirm", "prompt", "showToast", "showAuthError", "showAuthSuccess",
  "showFeedback", "showMessage", "showNotice", "notify", "toast", "announce",
  "setMessage", "setFeedback", "showResult", "showHint", "setStatus"
]);
const PRESERVED_TERMS = new Set([
  "SQL", "DAX", "Excel", "Power BI", "Power Query", "Power Pivot", "Python",
  "Tableau", "Git", "GitHub", "GitLab", "CSV", "JSON", "API", "HTML", "CSS",
  "JavaScript", "TypeScript", "Node.js", "SQLite", "PostgreSQL", "MySQL",
  "DuckDB", "Pandas", "NumPy", "Matplotlib", "KPI", "KPI", "ROI", "ROAS",
  "CPA", "CTR", "A/B", "ARIMA", "BPMN", "UML", "URL", "HTTP", "HTTPS",
  "ID", "UUID", "JSONL", "DOM", "SVG", "PDF", "PowerPoint", "GitHub Pages",
  "Grain", "DataCraft", "Analyst Prep Kit", "AnalystPrepKit",
  ".yxdb", "Exception", "Exceptions", "ValueError", "TypeError", "KeyError",
  "IndexError", "AssertionError", "FileNotFoundError", "SQLException"
]);
const PRESERVED_TERMS_NORMALIZED = new Set([...PRESERVED_TERMS].map(term => term.toLowerCase()));
const CODE_START = /^\s*(?:SELECT\b[\s\S]*\bFROM\b|INSERT\s+INTO\b|UPDATE\s+\w+\s+SET\b|DELETE\s+FROM\b|CREATE\s+(?:TABLE|VIEW|INDEX)\b|WITH\s+\w+\s+AS\s*\(|function\s*[\w$]*\s*\(|(?:const|let|var)\s+[\w$]+\s*=|return\s+[\w$.(\[{]|if\s*\([^)]*\)\s*\{|for\s*\([^)]*\)\s*\{|import\s+.+\s+from\s+|export\s+(?:default|const|function)\b)/i;
const cache = new Map();
const inflight = new Map();
const translationQueue = [];
let queueTimer = null;
let activeBatches = 0;
const MAX_BATCH_ITEMS = 20;
const MAX_BATCH_CHARS = 3500;
const MAX_PARALLEL_BATCHES = 4;
const failures = [];
let apiCalls = 0;
let translatedStrings = 0;
let unchangedStrings = 0;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const normalize = s => String(s ?? "").replace(/\s+/g, " ").trim().toLowerCase();
const MANUAL_TRANSLATIONS = new Map([
  ["Sign In", "Войти"], ["Sign in", "Войти"], ["Log in", "Войти"],
  ["Sign Up", "Зарегистрироваться"], ["Log out", "Выйти"], ["Log Out", "Выйти"],
  ["Welcome", "Добро пожаловать"], ["Orient", "Разобраться"],
  ["Next lesson", "Следующий урок"],
  ["Previous lesson", "Предыдущий урок"], ["Example", "Пример"],
  ["Try", "Попробовать"], ["Try again", "Попробовать ещё раз"],
  ["Build", "Собрать"], ["Check", "Проверить"], ["Close", "Закрыть"],
  ["Continue", "Продолжить"], ["Not quite", "Не совсем"],
  ["Feedback", "Обратная связь"], ["Clear", "Очистить"],
  ["Fill", "Заполнение"], ["Bug", "Ошибка"], ["Order", "Порядок"],
  ["Recall", "Вспомнить"], ["Lab", "Практика"], ["Done", "Готово"],
  ["Loading", "Загрузка"], ["Loading...", "Загрузка…"], ["Loading…", "Загрузка…"],
  ["Start Learning", "Начать обучение"], ["Get Started", "Начать"],
  ["Learn more", "Подробнее"], ["Your progress", "Ваш прогресс"],
  ["Try again later", "Попробуйте позже"], ["Reset progress", "Сбросить прогресс"],
  ["Continue with Google", "Продолжить с Google"], ["Create Account", "Создать аккаунт"],
  ["Home", "Главная"], ["Lessons", "Уроки"], ["Guides", "Руководства"],
  ["Practice", "Практика"], ["Workspace", "Рабочая область"], ["Cards", "Карточки"],
  ["Glossary", "Глоссарий"], ["Line", "Линия"], ["Scatter", "Точечная"],
  ["Save", "Сохранить"], ["Export", "Экспортировать"], ["Download", "Скачать"],
  ["Back", "Назад"], ["Next", "Далее"], ["Skip", "Пропустить"], ["Hint", "Подсказка"],
  ["Show answer", "Показать ответ"], ["Check answer", "Проверить ответ"],
  ["Reset", "Сбросить"], ["Cancel", "Отмена"], ["Retry", "Повторить"],
  ["Finish", "Завершить"], ["Search", "Поиск"], ["Search...", "Поиск…"],
  ["Search…", "Поиск…"], ["Settings", "Настройки"], ["Start", "Начать"],
  ["View all", "Посмотреть все"], ["Show more", "Показать ещё"],
  ["Show less", "Свернуть"], ["Copy", "Копировать"], ["Copied", "Скопировано"],
  ["Tracks", "Треки"], ["Track", "Трек"], ["Platinum", "Платина"],
  ["Bookmark", "Закладка"], ["Bookmarks", "Закладки"],
  ["Submit", "Отправить"], ["Apply", "Применить"], ["Open", "Открыть"],
  ["Open lesson", "Открыть урок"], ["Choose", "Выбрать"], ["Select", "Выбрать"],
  ["All courses", "Все курсы"], ["All lessons", "Все уроки"],
  ["No results", "Ничего не найдено"], ["No data", "Нет данных"],
  ["Try another", "Попробуйте другой вариант"], ["Start over", "Начать заново"]
].map(([source, translation]) => [normalize(source), translation]));

const preserveWhitespace = (source, translated) => {
  const left = (source.match(/^\s*/) || [""])[0];
  const right = (source.match(/\s*$/) || [""])[0];
  return left + translated + right;
};

function isTechnicalOnly(text) {
  const value = text.trim();
  if (!value) return true;
  // Keyboard shortcuts are notation, not English interface copy. Treat even a
  // partial shortcut such as "Shift+" as technical so a free translator is not
  // queried for it (which also prevents avoidable HTTP 429 build failures).
  if (/^(?:(?:shift|ctrl|control|alt|option|cmd|command|meta|super)\s*\+\s*)+(?:[a-z0-9]|f(?:[1-9]|1[0-2]))?$/i.test(value)) return true;
  if (/^(?:&nbsp;|&amp;|&lt;|&gt;|&quot;|&apos;|&#(?:\d+|x[0-9a-f]+);)+$/i.test(value.replace(/\s+/g, ""))) return true;
  if (PRESERVED_TERMS_NORMALIZED.has(value.toLowerCase())) return true;
  if (/^(?:[A-Z][A-Z0-9_+#.-]*)(?:\s+[A-Z][A-Z0-9_+#.-]*)*$/.test(value)) return true;
  if (/^(?:[A-Z][A-Z0-9_+#.-]*)(?:\s*(?:\/|&|\+|,)\s*[A-Z][A-Z0-9_+#.-]*)*$/.test(value)) return true;
  if (/^(?:https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/i.test(value)) return true;
  if (/^(?:[\d\s.,:%$€£¥+\-–—/()]+)$/.test(value)) return true;
  return false;
}
function isCodeLike(text) {
  const value = text.trim();
  if (!value) return false;
  if (CODE_START.test(value)) return true;
  // Formulas and snippets are syntax, not UI prose. Preserve function names,
  // cell references, pandas calls, decorators, and generated expressions.
  if (/^(?:=|@)\s*[A-Za-z_]/.test(value)) return true;
  if (/^(?:df|pd|np|plt|sns)\s*(?:\.|\[|=)/i.test(value)) return true;
  if (/^(?:[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\([^;{}]*\)$/.test(value)) return true;
  if (/^[A-Za-z_$][\w$]*(?:\[[^\]]+\])+\s*(?:[=<>!]=?|[+*/-])/.test(value)) return true;
  if (value.length > 35 && /(?:=>|[{};])/.test(value) && /(?:\b(?:const|let|var|function|return|SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY)\b)/i.test(value)) return true;
  if (/^(?:#[\w-]+|\.[a-z][\w-]*(?:\s*[>+~]\s*\.?[a-z][\w-]*)*|[a-z][\w-]*\s*[>+~]\s*[.#]?[a-z][\w-]*)$/i.test(value) && !/\s{2,}/.test(value)) return true;
  return false;
}
function candidate(text, context = null, htmlText = false) {
  const value = String(text ?? "").trim();
  if (!value || !/[A-Za-z]/.test(value)) return false;
  // Never submit incomplete keyboard shortcut fragments such as "Shift+" to
  // the translator. They are notation, not interface text, and can trigger 429s.
  if (/^(?:(?:shift|ctrl|control|alt|option|cmd|command|meta|super)\s*\+\s*)+(?:[a-z0-9]|f(?:[1-9]|1[0-2]))?$/i.test(value)) return false;
  if (isTechnicalOnly(value)) return false;
  if (/^(?:javascript:|data:|mailto:|tel:|https?:\/\/)/i.test(value)) return false;
  if (/^[\w-]+\/[\w./-]+$/.test(value)) return false;
  // Protect executable expressions before the short-label rule. This also
  // applies when a string sits in a human-readable property (formula, answer,
  // textContent); context must never override code protection.
  if (isCodeLike(value)) return false;
  // Plain HTML text is user-facing, even when it is a short label such as
  // "Home", "Example" or "Lessons". Code blocks are excluded by the HTML walker.
  if (htmlText) return value.length >= 2;
  if (value.length < 2) return false;
  if (context) return true;
  return /\s/.test(value) && value.length > 8;
}

function scheduleTranslationQueue() {
  if (queueTimer !== null) return;
  queueTimer = setTimeout(() => {
    queueTimer = null;
    pumpTranslationQueue();
  }, 12);
}
function takeTranslationBatch() {
  const batch = [];
  let chars = 0;
  while (translationQueue.length && batch.length < MAX_BATCH_ITEMS) {
    const next = translationQueue[0];
    const sourceLength = next.src.length;
    if (batch.length && (chars + sourceLength > MAX_BATCH_CHARS || sourceLength > 600)) break;
    if (!batch.length && sourceLength > 600) {
      batch.push(translationQueue.shift());
      break;
    }
    batch.push(translationQueue.shift());
    chars += sourceLength;
    if (chars >= MAX_BATCH_CHARS) break;
  }
  return batch;
}
function pumpTranslationQueue() {
  while (activeBatches < MAX_PARALLEL_BATCHES && translationQueue.length) {
    const batch = takeTranslationBatch();
    if (!batch.length) break;
    activeBatches++;
    translateBatch(batch).finally(() => {
      activeBatches--;
      if (translationQueue.length) pumpTranslationQueue();
    });
  }
}
function decodeBatchResponse(payload, expected) {
  if (!Array.isArray(payload) || payload.length !== expected) return null;
  const values = payload.map(item => Array.isArray(item) && typeof item[0] === "string" ? item[0] : null);
  return values.every(value => value !== null && value.trim()) ? values : null;
}
async function translateOne(item, recordFailure = true) {
  let lastError = "Ответ переводчика не распознан";
  for (let attempt = 0; attempt < 7; attempt++) {
    try {
      const url = new URL("https://translate.googleapis.com/translate_a/single");
      url.searchParams.set("client", "gtx");
      url.searchParams.set("sl", "auto");
      url.searchParams.set("tl", "ru");
      url.searchParams.set("dt", "t");
      url.searchParams.set("q", item.src);
      const response = await fetch(url, {
        headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) {
        const error = new Error("HTTP " + response.status);
        error.status = response.status;
        error.retryAfter = response.headers.get("retry-after");
        throw error;
      }
      const payload = await response.json();
      const translated = Array.isArray(payload) && Array.isArray(payload[0])
        ? payload[0].map(part => Array.isArray(part) && typeof part[0] === "string" ? part[0] : "").join("")
        : "";
      if (!translated.trim()) throw new Error("Переводчик вернул пустой текст");
      apiCalls++;
      return translated;
    } catch (error) {
      lastError = String(error);
      if (attempt < 6) {
        const retryAfterMs = Number(error.retryAfter) * 1000;
        const backoffMs = error.status === 429 ? Math.min(30000, 2500 * (2 ** attempt)) : Math.min(12000, 500 * (2 ** attempt));
        await sleep(Math.max(retryAfterMs || 0, backoffMs) + Math.floor(Math.random() * 350));
      }
    }
  }
  if (recordFailure) failures.push({ text: item.src.slice(0, 120), error: lastError });
  return null;
}
async function translateBatch(batch) {
  let values = null;
  if (batch.length > 1) {
    let lastError = "Пакетный ответ не распознан";
    let lastBatchStatus = 0;
    for (let attempt = 0; attempt < 7; attempt++) {
      try {
        // This Google endpoint accepts repeated q parameters and returns one result
        // per q. It is substantially faster than one request for each short label.
        const url = new URL("https://translate.googleapis.com/translate_a/t");
        url.searchParams.set("client", "dict-chrome-ex");
        url.searchParams.set("sl", "auto");
        url.searchParams.set("tl", "ru");
        for (const item of batch) url.searchParams.append("q", item.src);
        const response = await fetch(url, {
          headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(15000)
        });
        if (!response.ok) {
          const error = new Error("HTTP " + response.status);
          error.status = response.status;
          error.retryAfter = response.headers.get("retry-after");
          throw error;
        }
        const payload = await response.json();
        values = decodeBatchResponse(payload, batch.length);
        if (!values) throw new Error("Неожиданный формат пакетного ответа");
        apiCalls++;
        break;
      } catch (error) {
        lastError = String(error);
        lastBatchStatus = error.status || 0;
        if (attempt < 6) {
          const retryAfterMs = Number(error.retryAfter) * 1000;
          const backoffMs = error.status === 429 ? Math.min(30000, 2500 * (2 ** attempt)) : Math.min(12000, 500 * (2 ** attempt));
          await sleep(Math.max(retryAfterMs || 0, backoffMs) + Math.floor(Math.random() * 350));
        }
      }
    }
    if (!values && lastBatchStatus === 429) {
      // A single-string request would worsen the rate limit. Save these strings
      // in the translation cache workflow and retry them on a later build.
      console.warn("Переводчик ограничил частоту запросов; сохраняем строки для повторного запуска.");
      for (const item of batch) {
        failures.push({ text: item.src.slice(0, 120), error: lastError });
        unchangedStrings++;
        item.resolve(item.src);
        inflight.delete(item.key);
      }
      return;
    }
    if (!values) console.warn("Пакетный перевод недоступен; используем одиночные запросы:", lastError);
  } else {
    const value = await translateOne(batch[0]);
    values = value ? [value] : null;
  }

  if (!values) {
    await Promise.all(batch.map(async item => {
      const value = await translateOne(item);
      if (value && value.trim()) {
        const result = preserveWhitespace(item.src, value);
        cache.set(item.key, result);
        translatedStrings++;
        item.resolve(result);
      } else {
        unchangedStrings++;
        item.resolve(item.src);
      }
      inflight.delete(item.key);
    }));
    return;
  }

  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    const value = values[i];
    const result = preserveWhitespace(item.src, value);
    cache.set(item.key, result);
    translatedStrings++;
    item.resolve(result);
    inflight.delete(item.key);
  }
}
function translateRaw(text) {
  const src = String(text);
  const key = normalize(src);
  if (!key) return Promise.resolve(src);
  // Guard the last boundary as well: mixed-language line processing can call
  // translateRaw directly and must not submit keyboard shortcuts or code tokens.
  if (isTechnicalOnly(src) || isCodeLike(src)) return Promise.resolve(src);
  if (MANUAL_TRANSLATIONS.has(key)) {
    const translation = MANUAL_TRANSLATIONS.get(key);
    cache.set(key, translation);
    return Promise.resolve(translation);
  }
  if (cache.has(key)) return Promise.resolve(cache.get(key));
  if (inflight.has(key)) return inflight.get(key);
  const job = new Promise(resolve => translationQueue.push({ src, key, resolve }));
  inflight.set(key, job);
  scheduleTranslationQueue();
  return job;
}

async function translateText(text) {
  const source = String(text);
  if (!/[A-Za-z]/.test(source)) return source;
  if (source.length <= 600) return translateRaw(source);
  const chunks = [];
  let remainder = source;
  while (remainder.length > 600) {
    let cut = remainder.lastIndexOf(" ", 600);
    if (cut < 300) cut = remainder.lastIndexOf(". ", 600);
    if (cut < 300) cut = 600;
    chunks.push(remainder.slice(0, cut + (remainder[cut] === " " ? 1 : 0)));
    remainder = remainder.slice(cut + (remainder[cut] === " " ? 1 : 0));
  }
  if (remainder) chunks.push(remainder);
  const parts = await Promise.all(chunks.map(chunk => translateRaw(chunk)));
  return parts.join("");
}

async function translateMixedPlain(source) {
  const pattern = /[A-Za-z][A-Za-z0-9+#._/-]*(?:[ \t]+[A-Za-z][A-Za-z0-9+#._/-]*)*/g;
  const matches = [...source.matchAll(pattern)];
  if (!matches.length) return source;
  const pieces = [];
  let cursor = 0;
  for (const match of matches) {
    pieces.push(source.slice(cursor, match.index));
    const phrase = match[0];
    const trimmed = phrase.trim();
    if (PRESERVED_TERMS_NORMALIZED.has(trimmed.toLowerCase()) ||
        /^(?:[A-Z][A-Z0-9_+#.-]*)(?:\s+[A-Z][A-Z0-9_+#.-]*)*$/.test(trimmed)) {
      pieces.push(phrase);
    } else {
      pieces.push(await translateText(phrase));
    }
    cursor = match.index + phrase.length;
  }
  pieces.push(source.slice(cursor));
  return pieces.join("");
}

async function translateMixedLine(source) {
  if (!/[А-Яа-яЁё]/.test(source) || !/[A-Za-z]/.test(source)) return source;
  if (isCodeLike(source.trim())) return source;

  const patterns = [
    /\x60[^\x60\r\n]+\x60/g,
    /\b(?:df|pd|np|plt|sns)\s*=\s*(?:df|pd|np|plt|sns)(?:(?:\.[A-Za-z_]\w*)|(?:\[[^\]\r\n]+\])|(?:\([^()\r\n]*(?:\([^()\r\n]*\)[^()\r\n]*)?\)))+/g,
    /\b(?:df|pd|np|plt|sns)(?:(?:\.[A-Za-z_]\w*)|(?:\[[^\]\r\n]+\])|(?:\([^()\r\n]*(?:\([^()\r\n]*\)[^()\r\n]*)?\)))+(?:\s*(?:==|!=|>=|<=|=|>|<)\s*(?:'[^'\r\n]*'|"[^"\r\n]*"|[A-Za-z0-9_.]+))?/g,
    /\bdf\[[^\r\n]{1,180}\]/g,
    /@[A-Za-z_]\w*(?:\([^)\r\n]*\))?/g,
    /(?:=\s*)?(?:SUM|SUMIFS|VLOOKUP|XLOOKUP|IFERROR|COUNTIF|COUNTIFS|LEFT|RIGHT|TRIM|PROPER|MATCH|INDEX|YEAR|MONTH|DAY|COUNT|COUNTA|AVERAGE|MAX|MIN)\s*\([^()\r\n]*\)/gi,
    /\b[A-Z]{1,3}\d+(?::[A-Z]{1,3}\d+)?\b/g,
    /\bSELECT\b[^\r\n]*\bFROM\b[^\r\n]*/gi
  ];
  const spans = [];
  for (const regex of patterns) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(source))) {
      spans.push({ start: match.index, end: match.index + match[0].length });
      if (match[0].length === 0) regex.lastIndex++;
    }
  }
  if (!spans.length) return translateMixedPlain(source);
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (last && span.start <= last.end) last.end = Math.max(last.end, span.end);
    else merged.push({ ...span });
  }
  const output = [];
  let cursor = 0;
  for (const span of merged) {
    if (span.start > cursor) output.push(await translateMixedPlain(source.slice(cursor, span.start)));
    output.push(source.slice(Math.max(cursor, span.start), span.end));
    cursor = span.end;
  }
  if (cursor < source.length) output.push(await translateMixedPlain(source.slice(cursor)));
  return output.join("");
}

async function translateMixedSegments(value) {
  const source = String(value);
  if (!/[А-Яа-яЁё]/.test(source) || !/[A-Za-z]/.test(source)) return translateText(source);
  const chunks = source.split(/(\r?\n)/);
  const output = [];
  for (const chunk of chunks) {
    if (/^\r?\n$/.test(chunk)) output.push(chunk);
    else output.push(await translateMixedLine(chunk));
  }
  return output.join("");
}

async function translateMarkup(value) {
  const pieces = String(value).split(/(<\/?[A-Za-z][^>]*>)/g);
  const result = [];
  const skipped = [];
  for (const piece of pieces) {
    if (!piece) continue;
    const tagMatch = piece.match(/^<\s*(\/)?\s*([A-Za-z][A-Za-z0-9:-]*)\b[^>]*>$/);
    if (tagMatch) {
      const tag = tagMatch[2].toLowerCase();
      const closing = Boolean(tagMatch[1]);
      if (closing) {
        const ix = skipped.lastIndexOf(tag);
        if (ix >= 0) skipped.splice(ix, 1);
      } else if (!/\/\s*>$/.test(piece) && SKIP_TAGS.has(tag)) {
        skipped.push(tag);
      }
      result.push(piece);
    } else if (skipped.length) {
      result.push(piece);
    } else {
      result.push(await translateVisibleString(piece, null, true));
    }
  }
  return result.join("");
}

async function translateVisibleString(value, context = null, htmlText = false) {
  const source = String(value);
  // A string may contain only the start of an HTML tag because the rest is concatenated
  // in another JavaScript string. Never translate tag names or class/id attributes.
  const trimmedSource = source.trim();
  if (/^<\/?[A-Za-z][^>]*$/.test(trimmedSource) && !trimmedSource.endsWith(">")) return value;
  // HTML fragments are parsed first so that only their visible text is translated.
  if (/<\/?[A-Za-z][^>]*>/.test(source)) return translateMarkup(source);
  const manualKey = normalize(source);
  if (MANUAL_TRANSLATIONS.has(manualKey)) {
    return preserveWhitespace(source, MANUAL_TRANSLATIONS.get(manualKey));
  }
  if (!candidate(source, context, htmlText)) return value;
  if (/[А-Яа-яЁё]/.test(source) && /[A-Za-z]/.test(source)) return translateMixedSegments(source);
  return translateText(source);
}

async function translateHtmlTemplateFragment(fragment, state) {
  const source = String(fragment);
  const output = [];
  let textBuffer = "";
  state.skipTags ||= [];
  state.skipClassTags ||= [];
  state.tagBuffer ||= "";
  async function flushText() {
    if (!textBuffer) return;
    if (state.skipTags.length || state.skipClassTags.length) output.push(textBuffer);
    else output.push(await translateVisibleString(textBuffer, null, true));
    textBuffer = "";
  }
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (state.inTag) {
      output.push(ch);
      state.tagBuffer += ch;
      if (ch === ">") {
        const match = state.tagBuffer.match(/^<\s*(\/)?\s*([A-Za-z][A-Za-z0-9:-]*)\b[^>]*>$/);
        if (match) {
          const tag = match[2].toLowerCase();
          const classMatch = state.tagBuffer.match(/\bclass\s*=\s*(["'])(.*?)\1/i);
          const classes = classMatch ? classMatch[2].toLowerCase().split(/\s+/) : [];
          if (match[1]) {
            const tagIndex = state.skipTags.lastIndexOf(tag);
            if (tagIndex >= 0) state.skipTags.splice(tagIndex, 1);
            const classIndex = state.skipClassTags.lastIndexOf(tag);
            if (classIndex >= 0) state.skipClassTags.splice(classIndex, 1);
          } else if (!/\/\s*>$/.test(state.tagBuffer)) {
            if (SKIP_TAGS.has(tag)) state.skipTags.push(tag);
            if (classes.some(name => SKIP_CLASSES.has(name))) state.skipClassTags.push(tag);
          }
        }
        state.inTag = false;
        state.tagBuffer = "";
      }
      continue;
    }
    const startsTag = ch === "<" && i + 1 < source.length && /[A-Za-z/!?]/.test(source[i + 1]);
    if (startsTag) {
      await flushText();
      state.inTag = true;
      state.tagBuffer = ch;
      output.push(ch);
      continue;
    }
    textBuffer += ch;
  }
  await flushText();
  return output.join("");
}
function escapeTemplateQuasi(value) {
  const slash = String.fromCharCode(92);
  return String(value)
    .replace(/\\/g, () => slash + slash)
    .replace(new RegExp(String.fromCharCode(96), "g"), match => slash + match)
    .replace(/\$\{/g, match => slash + match);
}
function escapeHtmlText(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(value, quote) {
  let text = String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  if (quote === '"') text = text.replace(/"/g, "&quot;");
  else if (quote === "'") text = text.replace(/'/g, "&#39;");
  return text;
}

function collectFiles(dir, out = []) {
  return fs.readdir(dir, { withFileTypes: true }).then(async entries => {
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const relative = path.relative(ROOT, full).split(path.sep).join("/");
      if (entry.isDirectory()) {
        if (!OMIT_DIRS.has(entry.name)) await collectFiles(full, out);
      } else if (/\.(?:html?|js|json)$/i.test(entry.name) && !OMIT_FILES.has(relative) && !relative.startsWith("tools/")) {
        out.push(relative);
      }
    }
    return out;
  });
}

function keyName(node) {
  if (!node) return "";
  if (node.type === "Identifier") return node.name;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  return "";
}
function memberName(node) {
  if (!node || node.type !== "MemberExpression") return "";
  if (!node.computed && node.property && node.property.type === "Identifier") return node.property.name;
  if (node.computed && node.property && node.property.type === "Literal") return String(node.property.value);
  return "";
}
function directVisibleLiteral(node, parent) {
  if (!parent) return false;
  if (parent.type === "AssignmentExpression" && parent.right === node && VISIBLE_PROPERTIES.has(memberName(parent.left))) return true;
  if (parent.type === "CallExpression" && parent.arguments.includes(node)) {
    const name = parent.callee?.type === "Identifier" ? parent.callee.name : memberName(parent.callee);
    if (VISIBLE_CALLS.has(name) && parent.arguments[0] === node) return true;
    if (name === "setAttribute" && parent.arguments[1] === node && parent.arguments[0]?.type === "Literal" && /^(?:title|alt|placeholder|aria-label|aria-description)$/i.test(parent.arguments[0].value)) return true;
    if (name === "setAttribute" && parent.arguments[0] === node && parent.arguments[1]?.type === "Literal" && /^(?:title|alt|placeholder|aria-label|aria-description)$/i.test(parent.arguments[0].value)) return true;
  }
  return false;
}

async function translateJavaScript(source, filename) {
  let ast;
  try {
    ast = acorn.parse(source, { ecmaVersion: "latest", sourceType: "module", allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true });
  } catch (moduleError) {
    try { ast = acorn.parse(source, { ecmaVersion: "latest", sourceType: "script", allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true }); }
    catch (scriptError) {
      console.warn("Пропущен JS-файл, который не удалось разобрать:", filename, String(scriptError).slice(0, 120));
      return source;
    }
  }
  const replacements = [];
  async function visit(node, parent = null, context = null, insideHtmlConcatenation = false) {
    if (!node || typeof node !== "object") return;
    if (node.type === "AssignmentExpression" && VISIBLE_PROPERTIES.has(memberName(node.left))) {
      await visit(node.left, node, null);
      await visit(node.right, node, "label");
      return;
    }
    if (node.type === "BinaryExpression" && node.operator === "+") {
      // A concatenated HTML fragment can split one tag across multiple string
      // literals. Carry that knowledge through the entire + tree so attribute
      // fragments such as '" height="' are never sent to the translator.
      const htmlConcat = insideHtmlConcatenation || containsHtmlMarkup(node);
      await Promise.all([
        visit(node.left, node, context, htmlConcat),
        visit(node.right, node, context, htmlConcat)
      ]);
      return;
    }
    if (node.type === "Literal" && typeof node.value === "string") {
      if (shouldPreserveHtmlAttributeFragment(node.value, insideHtmlConcatenation)) return;
      const isHuman = (context && HUMAN_KEYS.has(context.toLowerCase())) || directVisibleLiteral(node, parent);
      const hasManualTranslation = Boolean(context) && MANUAL_TRANSLATIONS.has(normalize(node.value));
      const hasHtmlFragment = /<\/?[A-Za-z][^>]*>/.test(node.value);
      const isSentence = candidate(node.value, null, false);
      if (isHuman || isSentence || hasManualTranslation || hasHtmlFragment) {
        const original = node.value;
        const translated = await translateVisibleString(original, isHuman || hasManualTranslation ? (context || "visible") : null, isHuman);
        if (translated !== original) replacements.push({ start: node.start, end: node.end, value: JSON.stringify(translated) });
      }
      return;
    }
    if (node.type === "TemplateLiteral") {
      const isHuman = (context && HUMAN_KEYS.has(context.toLowerCase())) || directVisibleLiteral(node, parent);
      const hasHtmlTag = node.quasis.some(quasi => /<\/?[A-Za-z]/.test(quasi.value.raw));
      if (hasHtmlTag) {
        const tagState = { inTag: false, tagBuffer: "", skipTags: [], skipClassTags: [] };
        for (const quasi of node.quasis) {
          const original = quasi.value.cooked ?? quasi.value.raw;
          const translated = await translateHtmlTemplateFragment(original, tagState);
          if (translated !== original) replacements.push({ start: quasi.start, end: quasi.end, value: escapeTemplateQuasi(translated) });
        }
      } else {
        for (const quasi of node.quasis) {
          const original = quasi.value.cooked ?? quasi.value.raw;
          const hasManualTranslation = Boolean(context) && MANUAL_TRANSLATIONS.has(normalize(original));
          const isSentence = candidate(original, null, false);
          if (!isHuman && !hasManualTranslation && !isSentence) continue;
          const translated = await translateVisibleString(original, isHuman || hasManualTranslation ? (context || "visible") : null);
          if (translated !== original) replacements.push({ start: quasi.start, end: quasi.end, value: escapeTemplateQuasi(translated) });
        }
      }
      if (node.expressions.length) await Promise.all(node.expressions.map(expression => visit(expression, node, null)));
      return;
    }
    if (node.type === "VariableDeclarator") {
      const name = keyName(node.id);
      const isVisibleUiConstant = /^(?:STAGE_LABELS|STEP_DOT_LABEL|STAGE_ASK|STAGE_NAMES|STAGE_TITLES|STAGE_ACTIONS|STAGE_BUTTONS|STAGE_COPY|STAGE_PROMPTS|BUTTON_LABELS|BUTTON_TEXTS|NAV_LABELS|TAB_LABELS|STATUS_LABELS|MENU_LABELS|ACTION_LABELS|TOAST_MESSAGES|UI_MESSAGES|UI_LABELS|LABELS|BUTTONS|DRILL_LABELS|STEP_LABELS)$/i.test(name);
      await visit(node.init, node, isVisibleUiConstant ? "label" : null);
      return;
    }
    if (node.type === "ObjectExpression") {
      await Promise.all(node.properties.map(property => visit(property, node, context)));
      return;
    }
    if (node.type === "Property" || node.type === "PropertyDefinition") {
      if (node.computed) await visit(node.key, node, null);
      const name = keyName(node.key);
      const nextContext = HUMAN_KEYS.has(name.toLowerCase()) ? name : context;
      await visit(node.value, node, nextContext);
      return;
    }
    if (node.type === "MethodDefinition") {
      await visit(node.key, node, null);
      await visit(node.value, node, null);
      return;
    }
    if (node.type === "ArrayExpression") {
      await Promise.all(node.elements.map(element => visit(element, node, context)));
      return;
    }
    const children = [];
    for (const [key, value] of Object.entries(node)) {
      if (key === "start" || key === "end" || key === "loc" || key === "range" || key === "comments" || key === "tokens") continue;
      if (Array.isArray(value)) {
        for (const child of value) if (child && typeof child.type === "string") children.push(visit(child, node, null));
      } else if (value && typeof value.type === "string") {
        children.push(visit(value, node, null));
      }
    }
    await Promise.all(children);
  }
  await visit(ast);
  if (!replacements.length) return source;
  replacements.sort((a, b) => b.start - a.start);
  let result = source;
  let lastStart = Infinity;
  for (const replacement of replacements) {
    if (replacement.end > lastStart) continue;
    result = result.slice(0, replacement.start) + replacement.value + result.slice(replacement.end);
    lastStart = replacement.start;
  }
  return result;
}

function htmlEntitiesToText(value) {
  return String(value)
    .replace(/&nbsp;/gi, "\u00a0").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
}

async function processHtml(file, original) {
  // The browser must never be offered a language toggle or a live translation script.
  // Remove versioned and unversioned runtime localization scripts, then enforce
  // Russian at the source tag itself (parse5 can omit the root's source location on BOM files).
  let source = original.replace(/<script\b(?=[^>]*\bsrc\s*=\s*["'][^"']*ru-localization(?:-boot)?\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script\s*>/gi, "");
  source = source
    .replace(/<класс\s+div\s*=\s*\\?["']викторина-обратная связь\\?["']/gi, '<div class="quiz-feedback"')
    .replace(/<класс\s+div\s*=/gi, '<div class=')
    .replace(/<\/класс\s*>/gi, '</div>');

  const homeBrandToken = "APKBRANDGRAIN";
  if (file === "index.html") {
    source = source
      .replace(/<title>\s*(?:зерно|Grain)\s*—\s*тренажёр аналитика данных<\/title>/i,
        '<title>APKBRANDGRAIN — тренажёр аналитика данных</title>')
      .replace(/<strong>\s*(?:зерно|Grain)\s*—\s*подготовительный комплект для аналитика<\/strong>/i,
        '<strong>APKBRANDGRAIN — подготовительный комплект для аналитика</strong>')
      .replace(/(?:зерно|Grain)\s*—\s*это бесплатный набор практических приложений/gi,
        'APKBRANDGRAIN — это бесплатный набор практических приложений')
      .replace(/\bGrain\b/g, homeBrandToken);
  }

  source = source.replace(/<html\b[^>]*>/i, opening => {
    let root = opening;
    if (/\blang\s*=\s*(["'])[^"']*\1/i.test(root)) root = root.replace(/\blang\s*=\s*(["'])[^"']*\1/i, 'lang="ru"');
    else root = root.replace(/^<html\b/i, '<html lang="ru"');
    if (!/\bdata-static-ru\s*=/i.test(root)) root = root.replace(/>$/, ' data-static-ru="true">');
    return root;
  });
  const document = parse(source, { sourceCodeLocationInfo: true });
  const replacements = [];

  async function walk(node, inSkipped = false) {
    const tag = (node.tagName || "").toLowerCase();
    const classes = (node.attrs || []).find(attr => attr.name.toLowerCase() === "class")?.value.toLowerCase().split(/\s+/) || [];
    const skipHere = inSkipped || SKIP_TAGS.has(tag) || classes.some(name => SKIP_CLASSES.has(name));
    if (tag === "html" && node.sourceCodeLocation?.startTag) {
      // Use only the opening tag. The element's full location spans the entire
      // document, which would overlap every text replacement and could truncate a page.
      const loc = node.sourceCodeLocation.startTag;
      const raw = source.slice(loc.startOffset, loc.endOffset);
      let opening = raw;
      if (/\blang\s*=\s*(["'])[^"']*\1/i.test(opening)) opening = opening.replace(/\blang\s*=\s*(["'])[^"']*\1/i, 'lang="ru"');
      else opening = opening.replace(/^<html\b/i, '<html lang="ru"');
      if (!/\bdata-static-ru\s*=/i.test(opening)) opening = opening.replace(/>$/, ' data-static-ru="true">');
      if (opening !== raw) replacements.push({ start: loc.startOffset, end: loc.endOffset, value: opening });
    }

    if (tag === "script" && node.sourceCodeLocation && node.sourceCodeLocation.startTag && node.sourceCodeLocation.endTag && !node.attrs?.some(a => a.name === "src")) {
      const start = node.sourceCodeLocation.startTag.endOffset;
      const end = node.sourceCodeLocation.endTag.startOffset;
      if (end >= start) {
        const js = source.slice(start, end);
        const scriptType = (node.attrs?.find(attr => attr.name.toLowerCase() === "type")?.value || "").toLowerCase();
        const translatedJs = scriptType === "application/ld+json"
          ? await processJson(file + " (JSON-LD)", js)
          : await translateJavaScript(js, file + " (inline script)");
        if (translatedJs !== js) replacements.push({ start, end, value: translatedJs });
      }
      return;
    }

    if (!skipHere && node.attrs && node.sourceCodeLocation?.attrs) {
      const attrByName = new Map(node.attrs.map(a => [a.name, a.value]));
      for (const [name, rawLoc] of Object.entries(node.sourceCodeLocation.attrs)) {
        const normalizedName = name.toLowerCase();
        const metaText = tag === "meta" && normalizedName === "content" &&
          /^(?:description|og:title|og:description|twitter:title|twitter:description)$/i.test(attrByName.get("name") || attrByName.get("property") || "");
        const visibleAttr = new Set(["title", "alt", "placeholder", "aria-label", "aria-description", "data-tooltip", "data-title", "aria-valuetext"]).has(normalizedName);
        const inputButton = tag === "input" && normalizedName === "value" && /^(?:button|submit|reset)$/i.test(attrByName.get("type") || "");
        if (!(visibleAttr || metaText || inputButton)) continue;
        const current = attrByName.get(normalizedName);
        if (!current || !candidate(current, "attribute")) continue;
        const translated = await translateVisibleString(current, "attribute");
        if (translated === current) continue;
        const rawAttr = source.slice(rawLoc.startOffset, rawLoc.endOffset);
        const match = rawAttr.match(/^(\s*[^=]+\s*=\s*)(["'])([\s\S]*?)\2\s*$/);
        if (!match) continue;
        const quote = match[2];
        const replacement = match[1] + quote + escapeAttr(translated, quote) + quote;
        replacements.push({ start: rawLoc.startOffset, end: rawLoc.endOffset, value: replacement });
      }
    }

    if (!skipHere && node.nodeName === "#text" && node.sourceCodeLocation) {
      const raw = source.slice(node.sourceCodeLocation.startOffset, node.sourceCodeLocation.endOffset);
      const decoded = node.value || htmlEntitiesToText(raw);
      if (candidate(decoded, null, true)) {
        const translated = await translateVisibleString(decoded, null, true);
        if (translated !== decoded) {
          const preserved = preserveWhitespace(decoded, translated);
          replacements.push({
            start: node.sourceCodeLocation.startOffset,
            end: node.sourceCodeLocation.endOffset,
            value: escapeHtmlText(preserved)
          });
        }
      }
    }
    if (node.childNodes) await Promise.all(node.childNodes.map(child => walk(child, skipHere)));
    if (node.content) await walk(node.content, skipHere);
  }
  await walk(document);
  if (!replacements.length) {
    return file === "index.html" ? source.replaceAll(homeBrandToken, "Grain") : source;
  }
  replacements.sort((a, b) => b.start - a.start);
  let result = source;
  let lastStart = Infinity;
  for (const replacement of replacements) {
    if (replacement.end > lastStart) continue;
    result = result.slice(0, replacement.start) + replacement.value + result.slice(replacement.end);
    lastStart = replacement.start;
  }
  return file === "index.html" ? result.replaceAll(homeBrandToken, "Grain") : result;
}

async function processJson(file, original) {
  let data;
  try { data = JSON.parse(original); } catch { return original; }
  async function visit(value, context = null) {
    if (typeof value === "string") {
      if (context && HUMAN_KEYS.has(context.toLowerCase())) return translateVisibleString(value, context);
      return value;
    }
    if (Array.isArray(value)) return Promise.all(value.map(item => visit(item, context)));
    if (value && typeof value === "object") {
      const pairs = await Promise.all(Object.entries(value).map(async ([key, child]) => [
        key, await visit(child, HUMAN_KEYS.has(key.toLowerCase()) ? key : null)
      ]));
      return Object.fromEntries(pairs);
    }
    return value;
  }
  const translated = await visit(data);
  return JSON.stringify(translated, null, 2) + "\n";
}

async function seedFromLegacyDictionary() {
  try {
    const old = await fs.readFile(path.join(ROOT, "assets/ru-localization.js"), "utf8");
    const match = old.match(/var d\s*=\s*\{([\s\S]*?)\n\s*\};/);
    if (!match) return;
    try {
      const dictionary = Function('"use strict"; return ({' + match[1] + "\n});")();
      for (const [key, value] of Object.entries(dictionary)) {
        if (typeof value === "string") cache.set(normalize(key), value);
      }
    } catch (error) {
      console.warn("Не удалось импортировать прежний словарь русификации:", String(error));
    }
  } catch {}
}

async function main() {
  await seedFromLegacyDictionary();
  try {
    const existing = JSON.parse(await fs.readFile(CACHE_PATH, "utf8"));
    for (const [key, value] of Object.entries(existing)) if (typeof value === "string") cache.set(key, value);
  } catch {}

  const files = await collectFiles(ROOT);
  let changedFiles = 0;
  let finishedFiles = 0;
  const failedAtStart = failures.length;
  let cursor = 0;
  async function fileWorker() {
    while (true) {
      const index = cursor++;
      if (index >= files.length) return;
      const file = files[index];
      const full = path.join(ROOT, file);
      let original;
      try { original = await fs.readFile(full, "utf8"); } catch { continue; }
      let translated = original;
      if (/\.html?$/i.test(file)) translated = await processHtml(file, original);
      else if (/\.js$/i.test(file)) translated = await translateJavaScript(original, file);
      else if (/\.json$/i.test(file) && /(?:search-index|guidebook-data)/i.test(file)) translated = await processJson(file, original);
      if (translated !== original) {
        await fs.writeFile(full, translated, "utf8");
        changedFiles++;
      }
      finishedFiles++;
      if (finishedFiles % 10 === 0 || finishedFiles === files.length) {
        console.log("Обработано файлов: " + finishedFiles + "/" + files.length);
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, () => fileWorker()));

  await fs.writeFile(CACHE_PATH, JSON.stringify(Object.fromEntries([...cache.entries()].sort((a,b)=>a[0].localeCompare(b[0]))), null, 2) + "\n", "utf8");
  // Remove the old live translator assets after their dictionary has been imported.
  for (const file of ["assets/ru-localization.js", "assets/ru-localization-boot.js"]) {
    try { await fs.rm(path.join(ROOT, file)); } catch {}
  }

  console.log(JSON.stringify({
    filesScanned: files.length,
    filesChanged: changedFiles,
    cachedTranslations: cache.size,
    newlyTranslatedStrings: translatedStrings,
    apiCalls,
    failures: failures.length - failedAtStart,
    sampleFailures: failures.slice(0, 10)
  }, null, 2));
  if (failures.length) {
    console.error("Не все фразы удалось перевести; остановка публикации, чтобы не выдавать частичную локализацию за готовую.");
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
