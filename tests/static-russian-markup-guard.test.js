const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  isHtmlAttributeFragment,
  containsHtmlMarkup,
  shouldPreserveHtmlAttributeFragment
} = require("../tools/static-russian-markup-guard.cjs");

function add(left, right) {
  return { type: "BinaryExpression", operator: "+", left, right };
}
function literal(value) {
  return { type: "Literal", value };
}
function identifier(name) {
  return { type: "Identifier", name };
}

test("recognizes attribute-name fragments produced by concatenated HTML", () => {
  for (const fragment of [
    '" height="',
    '" tabindex="',
    '" role="',
    '" aria-label="',
    '" data-course-id="',
    '" class="'
  ]) assert.equal(isHtmlAttributeFragment(fragment), true, "Expected attribute fragment: " + fragment);

  for (const prose of [
    "Открой следующий урок",
    "Показать объяснение",
    " height of the map",
    '<button type="button">'
  ]) assert.equal(isHtmlAttributeFragment(prose), false, "Prose or complete tags are not attribute fragments: " + prose);
});

test("identifies attribute fragments inside a JavaScript HTML concatenation", () => {
  // Mirrors the map canvas construction:
  // '<canvas width="' + MAP_W + '" height="' + MAP_H + '" tabindex="0">'
  const htmlExpression = add(
    add(
      add(
        add(literal('<div class="map"><canvas id="world" width="'), identifier("MAP_W")),
        literal('" height="')
      ),
      identifier("MAP_H")
    ),
    literal('" tabindex="0" role="img" aria-label="Interactive map"></canvas></div>')
  );

  assert.equal(containsHtmlMarkup(htmlExpression), true);
  assert.equal(shouldPreserveHtmlAttributeFragment('" height="', containsHtmlMarkup(htmlExpression)), true);
  assert.equal(shouldPreserveHtmlAttributeFragment('" tabindex="', containsHtmlMarkup(htmlExpression)), true);
  assert.equal(shouldPreserveHtmlAttributeFragment('" aria-label="', containsHtmlMarkup(htmlExpression)), true);
  assert.equal(shouldPreserveHtmlAttributeFragment("Показать карту", containsHtmlMarkup(htmlExpression)), false);
  assert.equal(shouldPreserveHtmlAttributeFragment('" height="', false), false);
});

test("the static Russian build keeps authored game and visualization sources out of translation", () => {
  const source = fs.readFileSync(path.join(__dirname, "../tools/static-russian-translation.mjs"), "utf8");
  for (const file of [
    "assets/sql-mermaid.js",
    "datacraft/curriculum-map.js",
    "datacraft/index.html",
    "datacraft/quiet-valley.js",
    "datacraft/lesson-catalog.js"
  ]) {
    assert.ok(source.includes('"'+file+'"'), "Native DataCraft source must remain excluded from machine translation: "+file);
  }
});

test("DataCraft renderer keeps valid CSS values and animated interaction hooks", () => {
  const map = fs.readFileSync(path.join(__dirname, "../datacraft/curriculum-map.js"), "utf8");
  const quiet = fs.readFileSync(path.join(__dirname, "../datacraft/quiet-valley.js"), "utf8");
  const page = fs.readFileSync(path.join(__dirname, "../datacraft/index.html"), "utf8");

  assert.doesNotMatch(map, /rgba\([^)]*,\s*0,\d+\)/, "RGBA alpha decimals must use a period, not a comma");
  assert.doesNotMatch(map, /пикселей|сепия\(|насыщенность\(|яркость\(|предпочитает уменьшенное движение/i);
  assert.match(map, /window\.requestAnimationFrame\(animateWorldLoop\)/, "The animated map loop must remain active");
  assert.match(map, /function drawRoadNPCs\(t\)/, "Walking characters must be rendered");
  assert.match(map, /canvas\.addEventListener\('click'/, "Map click interactions must remain attached");
  assert.match(map, /canvas\.addEventListener\('mousemove'/, "Map hover interactions must remain attached");
  assert.doesNotMatch(quiet, /пикселей|предпочитает уменьшенное движение/i);
  assert.doesNotMatch(page, /ctx\.font[^;\n]*(?:пикселей|жирный шрифт)/i);
});
