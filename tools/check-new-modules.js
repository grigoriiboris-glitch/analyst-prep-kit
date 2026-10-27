const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = process.cwd();
const htmlFiles = [
  "index.html",
  "foundations/index.html",
  "data-quality/index.html",
  "portfolio-projects/index.html",
  "decision-making/index.html",
  "datacraft/index.html"
];
const requiredRoutes = [
  "foundations/",
  "data-quality/",
  "portfolio-projects/",
  "decision-making/",
  "datacraft/"
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

const datacraft = fs.readFileSync(path.join(root, "datacraft/index.html"), "utf8");
for (const feature of [
  'id="world"', 'id="targetList"', 'id="inventory"', 'id="recipes"',
  'id="challengeModal"', 'id="startContract"', 'id="exportSave"', 'id="resetGame"',
  "function startNode(node)", "function craft(id)", "function claimReward()",
  "localStorage", "findPath(", "function drawWorld()", "QUESTIONS"
]) {
  assert.ok(datacraft.includes(feature), "DataCraft gameplay feature missing: " + feature);
}
for (const resource of ["wood", "stone", "data", "crystal", "reagent", "sql"]) {
  assert.ok(datacraft.includes(resource), "DataCraft resource missing: " + resource);
}
assert.ok(datacraft.includes("SQL-сканер") && datacraft.includes("Панель исследователя"),
  "DataCraft resource-crafting recipes missing");
assert.ok(datacraft.includes("datacraft-save.json"), "DataCraft save export missing");
assert.ok(datacraft.includes('href="curriculum-map.css"') &&
  datacraft.includes('src="curriculum-map.js"'),
  "DataCraft curriculum map assets are not attached");

const curriculum = fs.readFileSync(path.join(root, "datacraft/curriculum-map.js"), "utf8");
new Function(curriculum);
const curriculumCss = fs.readFileSync(path.join(root, "datacraft/curriculum-map.css"), "utf8");
assert.ok(curriculumCss.includes("#curriculumWorld") && curriculumCss.includes(".curriculum-course-card"),
  "Curriculum map styles missing");
const coreIds = [
  "foundations", "quality", "sql", "excel", "charts", "python", "stats",
  "forecasting", "powerbi", "tableau", "decision", "portfolio",
  "simulator", "interview", "final"
];
const optionalIds = [
  "project-studio", "excel-cert", "excel-expert", "powerbi-cert", "tableau-cert",
  "alteryx-cert", "azure-data-cert", "databricks-cert", "ga4-cert",
  "docusign", "docusign-clm", "docusign-clm-workflow",
  "docusign-clm-implementation", "docusign-org"
];
for (const id of coreIds.concat(optionalIds)) {
  assert.ok(curriculum.includes("id:'" + id + "'"), "DataCraft curriculum node missing: " + id);
}
for (const key of [
  "apk-foundations-progress-v1", "apk-quality-score", "sqlkit-v1", "epk", "ppk",
  "clk-v1", "spk", "fmk-v1", "pbikt-v1", "tpk",
  "apk-decision-thinking-progress-v1", "apk-portfolio-", "sim2", "ipk", "apk-final"
]) {
  assert.ok(curriculum.includes(key), "DataCraft learning progress reader missing: " + key);
}
for (const route of [
  "foundations", "data-quality", "sql", "excel", "chart-literacy", "python",
  "stats", "forecasting", "powerbi", "tableau", "decision-making",
  "portfolio-projects", "simulator", "interview", "final", "projects",
  "excel-cert", "excel-expert-cert", "powerbi-cert", "tableau-cert",
  "alteryx-cert", "azure-data-cert", "databricks-cert", "ga4-cert",
  "docusign-cert", "docusign-clm-cert", "docusign-clm-workflow-cert",
  "docusign-clm-implementation-cert", "docusign-org-cert"
]) {
  assert.ok(fs.existsSync(path.join(root, route, "index.html")),
    "Curriculum route is missing: " + route);
}
for (const dependency of [
  "requires:['foundations','quality']", "requires:['sql','excel']",
  "requires:['stats','charts']", "anyOf:['powerbi','tableau']",
  "requires:['foundations','quality','sql','excel','python','charts','stats','forecasting','powerbi','tableau','decision','portfolio','simulator','interview']"
]) {
  assert.ok(curriculum.includes(dependency), "Curriculum progression dependency missing: " + dependency);
}
console.log("OK: DataCraft 2D gameplay, all course routes, lesson-progress readers, and prerequisite graph");

for (const mechanic of [
  "RIVER_WAYPOINTS", "function isRiverWaterPixel(", "bgWaterPixels = waterCtx.getImageData(0, 0, MAP_W, MAP_H).data",
  "if (!isRiverWaterPixel(sx, sy)) return;",
  "FOG_REGIONS", "drawFogOfWar", "fogOpacity", "spawnFloatingText",
  "scanWalletTransactions", "ROAD_NPCS", "findNpcAtPoint", "openNpcQuest",
  "setNpcCooldown", "NPC_QUESTS", "60 сек."
]) {
  assert.ok(curriculum.includes(mechanic), "DataCraft exploration mechanic missing: " + mechanic);
}
for (const style of [".road-npc-overlay", ".road-npc-answer", ".road-npc-feedback.success"]) {
  assert.ok(curriculumCss.includes(style), "DataCraft NPC quest style missing: " + style);
}
assert.ok(fs.existsSync(path.join(root, "datacraft/FOG_NPC_FLOATING_QA.md")),
  "DataCraft fog/NPC/floating reward QA checklist missing");
console.log("OK: Fog of War, floating wallet rewards, and timed road NPC quests");

const quietValley = fs.readFileSync(path.join(root, "datacraft/quiet-valley.js"), "utf8");
new Function(quietValley);
const quietValleyCss = fs.readFileSync(path.join(root, "datacraft/quiet-valley.css"), "utf8");
const quietValleyPage = fs.readFileSync(path.join(root, "datacraft/index.html"), "utf8");
for (const feature of ["quietValleyCanvas","quietValleyShop","quietValleyInventory","quietValleyZones","quiet-valley.js","quiet-valley.css"]) {
  assert.ok(quietValleyPage.includes(feature), "Quiet Valley page integration missing: " + feature);
}
for (const feature of ["datacraft-quiet-valley-v1","quiet-valley:item:","quiet-valley:style:","quiet-valley:zone:","DataCraftEconomy.spend","function place(","function move(","function rotate(","function store(","state.unlocked","state.active","state.objects"]) {
  assert.ok(quietValley.includes(feature), "Quiet Valley feature missing: " + feature);
}
for (const id of ["roof-terracotta","wall-sage","oak-tree","flower-tulips","pond","wooden-bridge","bench","garden-lantern","cat","dog","rabbit","bird","garland","garden-gnome","fountain"]) {
  assert.ok(quietValley.includes("id:'" + id + "'"), "Quiet Valley catalogue item missing: " + id);
}
assert.ok(quietValley.includes("datacraft-wallet-v1"), "Quiet Valley must use the study coin wallet");
assert.ok(quietValley.includes("state.current='garden';selectedItem=null;selectedObject=null;mode='select';save();draw();render();"),
  "Buying or reapplying a house upgrade must return to the home view and render the result immediately");
assert.ok(quietValley.includes("active=up&&state.active[it.slot]===it.id") && quietValley.includes("Активен · применён"),
  "Quiet Valley catalogue must clearly mark the currently applied house style");
assert.ok(quietValley.includes("for(var tileY=124;tileY<160;tileY+=7)") &&
  quietValley.includes("for(var sidingY=171;sidingY<229;sidingY+=13)") &&
  quietValley.includes("rgba(255,208,83,.28)"),
  "House roof, wall, and window upgrades must have visible render effects");
assert.ok(quietValleyCss.includes("#quietValleyCanvas") && quietValleyCss.includes(".quiet-valley-shop"), "Quiet Valley canvas/shop styles missing");
console.log("OK: Quiet Valley builder, study-coin purchases, place/move/rotate/store controls, and separate save");

const lessonCatalog = fs.readFileSync(path.join(root, "datacraft/lesson-catalog.js"), "utf8");
new Function(lessonCatalog);
const catalogMatches = [
  ["foundations", 8], ["quality", 5], ["sql", 48], ["excel", 51],
  ["python", 42], ["powerbi", 39], ["stats", 16], ["tableau", 32],
  ["charts", 13], ["forecasting", 13], ["decision", 6], ["interview", 16],
  ["portfolio", 3], ["simulator", 10], ["final", 7], ["projectStudio", 4]
];
for (const [name, count] of catalogMatches) {
  const match = new RegExp('"' + name + '"\\s*:\\s*\\[').exec(lessonCatalog);
  assert.ok(match, "DataCraft lesson catalog missing: " + name);
  const nextArray = lessonCatalog.slice(match.index);
  const opening = nextArray.indexOf("[");
  let depth = 0, curly = 0, quote = null, escape = false, found = 0;
  for (let i = opening; i < nextArray.length; i++) {
    const ch = nextArray[i];
    if (quote) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === "[") { depth++; continue; }
    if (ch === "]") { depth--; if (depth === 0) break; continue; }
    if (ch === "{") {
      if (depth === 1 && curly === 0 && /"?id"?\s*:/.test(nextArray.slice(i, i + 80))) found++;
      curly++; continue;
    }
    if (ch === "}") { curly--; continue; }
  }
  assert.equal(found, count, "DataCraft lesson count mismatch for " + name);
}
console.log("OK: DataCraft catalog has the expected lesson counts for each core course");

const economy = fs.readFileSync(path.join(root, "assets/datacraft-economy.js"), "utf8");
new Function(economy);
for (const key of [
  "datacraft-wallet-v1", "sqlkit-v1", "epk", "ppk", "pbikt-v1",
  "spk", "tpk", "clk-v1", "fmk-v1", "apk-foundations-progress-v1",
  "apk-quality-passed-v1", "apk-portfolio-", "sim2", "ipk", "apk-final"
]) {
  assert.ok(economy.includes(key), "DataCraft wallet integration missing progress source: " + key);
}
for (const feature of ["function earn(", "function spend(", "function markBuilding(", "course-bonus:", "totalSpent", "totalEarned"]) {
  assert.ok(economy.includes(feature), "DataCraft coin economy feature missing: " + feature);
}
assert.ok(economy.includes("p.present.checklist.every"), "Project Studio should reward fully packaged projects only");
assert.ok(datacraft.includes("coinCost:4") && datacraft.includes("coinCost:5") && datacraft.includes("coinCost:7"),
  "Resource-crafting recipes must have coin costs");
assert.ok(datacraft.includes("Монетки · можно тратить") && datacraft.includes("addCoins('contract:sales-investigation'"),
  "DataCraft must display and award spendable coins");
console.log("OK: spendable coins, lesson rewards, crafting costs, and wallet integration");

const localization = fs.readFileSync(path.join(root, "assets/ru-localization.js"), "utf8");
new Function(localization);
assert.ok(localization.includes("translate.googleapis.com"), "Online fallback translation endpoint missing");
assert.ok(fs.readFileSync(path.join(root, "README.md"), "utf8").includes("RUN_RU.md"), "README must link to setup guide");
assert.ok(fs.readFileSync(path.join(root, "RUN_RU.md"), "utf8").includes("Ubuntu Linux"), "Setup guide must cover Ubuntu");
console.log("OK: course content, exports, localization, and Windows/Ubuntu instructions");