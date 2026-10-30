const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { Script } = require("node:vm");

const html = fs.readFileSync(
  path.join(__dirname, "..", "excel", "index.html"),
  "utf8"
);

test("every inline Excel page script parses before lesson navigation runs", () => {
  const tags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  const inline = tags.filter(([, attributes, source]) =>
    !/\bsrc\s*=/.test(attributes) && source.trim()
  );

  assert.ok(inline.length > 0, "Excel page should contain its application scripts");

  inline.forEach(([, attributes, source], index) => {
    assert.doesNotThrow(
      () => new Script(source, { filename: "excel/index.html:inline-" + (index + 1) }),
      "Excel inline script " + (index + 1) + " must be valid JavaScript (attributes: " + attributes + ")"
    );
  });
});

test("Excel lesson navigation reaches the lesson renderer", () => {
  assert.match(html, /function openLesson\(id\)[\s\S]*?show\('lesson'\);[\s\S]*?renderLesson\(\);/);
  assert.match(html, /function renderLesson\(id\)[\s\S]*?lessonFrameHTML\(l,[\s\S]*?v2Body\(l, done\)/);
});
