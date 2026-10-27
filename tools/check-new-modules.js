const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = process.cwd();
const htmlFiles = [
  "index.html",
  "foundations/index.html",
  "data-quality/index.html",
  "portfolio-projects/index.html",
  "decision-making/index.html"
];
const requiredRoutes = [
  "foundations/",
  "data-quality/",
  "portfolio-projects/",
  "decision-making/"
];

for (const file of htmlFiles) {
  const fullPath = path.join(root, file);
  assert.ok(fs.existsSync(fullPath), "Missing HTML page: " + file);
  const html = fs.readFileSync(fullPath, "utf8");
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  let parsed = 0;

  for (const [, attributes, source] of scripts) {
    if (!source.trim()) continue;
    if (/\bsrc\s*=/i.test(attributes)) continue;
    const typeMatch = attributes.match(/\btype\s*=\s*["']([^"']+)["']/i);
    if (typeMatch && !/(?:text|application)\/(?:javascript|ecmascript)|module/i.test(typeMatch[1])) continue;
    try {
      new Function(source);
      parsed++;
    } catch (error) {
      throw new Error("JavaScript syntax error in " + file + ": " + error.message);
    }
  }
  console.log("OK: " + file + " (" + parsed + " inline scripts)");
}

for (const route of requiredRoutes) {
  assert.ok(fs.existsSync(path.join(root, route, "index.html")), "Missing route: " + route);
  const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.ok(homepage.includes('href="' + route + '"'), "Homepage link missing: " + route);
}
console.log("OK: all new routes exist and are linked from the homepage");

const foundations = fs.readFileSync(path.join(root, "foundations/index.html"), "utf8");
assert.equal((foundations.match(/class="lesson(?:\s|")/g) || []).length, 8, "Foundations must contain exactly 8 lessons");
assert.ok(foundations.includes("localStorage"), "Foundations progress should persist locally");

const quality = fs.readFileSync(path.join(root, "data-quality/index.html"), "utf8");
for (const feature of ["downloadRaw", "downloadClean", "downloadExceptions", "checkBtn"]) {
  assert.ok(quality.includes('id="' + feature + '"'), "Data-quality feature missing: " + feature);
}

const projects = fs.readFileSync(path.join(root, "portfolio-projects/index.html"), "utf8");
for (const key of ["sales:", "support:", "marketing:"]) {
  assert.ok(projects.includes(key), "Portfolio case missing: " + key);
}
assert.ok(projects.includes("downloadCsv") && projects.includes("downloadReadme"), "Portfolio exports missing");

const decisions = fs.readFileSync(path.join(root, "decision-making/index.html"), "utf8");
assert.equal((decisions.match(/class="lesson(?:\\s|")/g) || []).length, 6, "Decision-making course must contain exactly 6 lessons");
for (const feature of ["progressBar", "downloadChecklist", "reviewCase", "saveCase", "caseAnswer"]) {
  assert.ok(decisions.includes('id="' + feature + '"'), "Decision-making feature missing: " + feature);
}
for (let i = 1; i <= 6; i++) {
  assert.ok(decisions.includes('data-quiz="q' + i + '"'), "Decision-making quiz missing: q" + i);
}
assert.ok(decisions.includes("localStorage"), "Decision-making progress should persist locally");
assert.ok(fs.existsSync(path.join(root, "decision-making/CHECKLIST_RU.md")), "Decision-making checklist file missing");
const decisionChecklist = fs.readFileSync(path.join(root, "decision-making/CHECKLIST_RU.md"), "utf8");
assert.ok(decisionChecklist.includes("Универсальная цепочка"), "Decision-making checklist is incomplete");

const localization = fs.readFileSync(path.join(root, "assets/ru-localization.js"), "utf8");
new Function(localization);
assert.ok(localization.includes("translate.googleapis.com"), "Online fallback translation endpoint missing");
assert.ok(fs.readFileSync(path.join(root, "README.md"), "utf8").includes("RUN_RU.md"), "README must link to setup guide");
assert.ok(fs.readFileSync(path.join(root, "RUN_RU.md"), "utf8").includes("Ubuntu Linux"), "Setup guide must cover Ubuntu");
console.log("OK: course content, exports, localization, and Windows/Ubuntu instructions");