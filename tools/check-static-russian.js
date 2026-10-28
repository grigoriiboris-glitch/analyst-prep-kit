const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = process.cwd();
const ignoredDirs = new Set([".git", ".github", "node_modules", "tools", "tests"]);
const pages = [];

function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) collect(path.join(dir, entry.name));
      continue;
    }
    if (!/\.html?$/i.test(entry.name)) continue;
    const file = path.join(dir, entry.name);
    const content = fs.readFileSync(file, "utf8");
    if (/<html\b/i.test(content)) pages.push({ file: path.relative(root, file), content });
  }
}

collect(root);
assert.ok(pages.length > 0, "No HTML pages with a document root were found.");

const failures = [];
for (const page of pages) {
  const rootTag = (page.content.match(/<html\b[^>]*>/i) || [])[0] || "";
  const lang = (rootTag.match(/\blang\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
  if (lang.toLowerCase() !== "ru") failures.push(page.file + ": <html lang> is not ru");
  if (!/\bdata-static-ru\s*=\s*["']true["']/i.test(rootTag)) {
    failures.push(page.file + ": static Russian marker is missing");
  }
  if (/<script\b[^>]*\bsrc\s*=\s*["'][^"']*ru-localization(?:-boot)?\.js(?:\?[^"']*)?["']/i.test(page.content)) {
    failures.push(page.file + ": references a removed runtime translator");
  }
  if (/\b(?:id|class)\s*=\s*["'][^"']*(?:language-toggle|language-switcher|language-selector|lang-toggle)[^"']*["']/i.test(page.content)) {
    failures.push(page.file + ": language selector UI remains");
  }
  if (/<класс\s+div\s*=/i.test(page.content)) {
    failures.push(page.file + ": translated text corrupted a rendered HTML tag");
  }
}

assert.deepEqual(failures, [], "Static Russian audit failed:\n" + failures.join("\n"));
console.log("OK: " + pages.length + " HTML pages use static Russian, have no language selector, and do not load runtime translators.");
