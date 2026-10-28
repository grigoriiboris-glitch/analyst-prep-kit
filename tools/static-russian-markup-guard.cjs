"use strict";

function isHtmlAttributeFragment(value) {
  const fragment = String(value == null ? "" : value).trim();
  // A split HTML tag may be assembled through string concatenation:
  //   '<canvas width="' + MAP_W + '" height="' + MAP_H + '" role="img">'
  // Translation must not treat fragments like '" height="' as visible prose.
  return /^["']?\s*[A-Za-z_:][A-Za-z0-9:._-]*\s*=\s*["']?$/.test(fragment);
}

function containsHtmlMarkup(node) {
  if (!node || typeof node !== "object") return false;
  if (node.type === "Literal" && typeof node.value === "string") {
    return /<\/?[A-Za-z]/.test(node.value);
  }
  if (node.type === "TemplateLiteral") {
    return (node.quasis || []).some((quasi) => /<\/?[A-Za-z]/.test(String((quasi.value && (quasi.value.cooked || quasi.value.raw)) || "")));
  }
  if (node.type === "BinaryExpression" && node.operator === "+") {
    return containsHtmlMarkup(node.left) || containsHtmlMarkup(node.right);
  }
  return false;
}

function shouldPreserveHtmlAttributeFragment(value, insideHtmlConcatenation) {
  return Boolean(insideHtmlConcatenation) && isHtmlAttributeFragment(value);
}

module.exports = {
  isHtmlAttributeFragment,
  containsHtmlMarkup,
  shouldPreserveHtmlAttributeFragment
};
