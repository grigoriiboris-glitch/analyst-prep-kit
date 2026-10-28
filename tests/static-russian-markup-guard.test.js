const test = require("node:test");
const assert = require("node:assert/strict");
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
