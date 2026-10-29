const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

test("DataCraft UI styles do not reintroduce the legacy dark-green palette", () => {
  const quietValley = read("datacraft/quiet-valley.css");
  const curriculumMap = read("datacraft/curriculum-map.css");
  const page = read("datacraft/index.html");
  const inlineStyles = page.match(/<style>([\s\S]*?)<\/style>/i)?.[1];

  assert.ok(inlineStyles, "DataCraft page inline styles should be present");

  const styles = [quietValley, curriculumMap, inlineStyles].join("\n");
  assert.doesNotMatch(
    styles,
    /linear-gradient\s*\(\s*120deg\s*,\s*rgba\s*\(\s*36\s*,\s*67\s*,\s*48\s*,\s*\.92\s*\)\s*,\s*rgba\s*\(\s*26\s*,\s*43\s*,\s*33\s*,\s*\.92\s*\)\s*\)/i,
    "The former dark-green gradient must stay removed"
  );

  assert.doesNotMatch(
    quietValley,
    /#(?:17231d|17271f|1b3024|15261d|1a2e22|192b20|223b2a|203b2a|203e2a|244330|1a2b21)\b/i,
    "Quiet Valley surfaces should use the shared palette, not legacy dark-green hex colors"
  );
  assert.doesNotMatch(
    curriculumMap,
    /#(?:244330|1a2b21|355b43|13231b)\b/i,
    "Curriculum map surfaces should use the shared palette"
  );
  assert.doesNotMatch(
    inlineStyles,
    /rgba\s*\(\s*25\s*,\s*41\s*,\s*36\s*,\s*\.85\s*\)|#456d48|#4b6a50|#628668|#73936b|#668b69/i,
    "DataCraft page UI should not use the legacy green surface colors"
  );

  assert.match(quietValley, /var\(--color-surface\)/);
  assert.match(curriculumMap, /var\(--color-border\)/);
});
