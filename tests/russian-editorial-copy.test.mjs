import test from "node:test";
import assert from "node:assert/strict";
import { applyEditorialCorrections } from "../tools/russian-editorial-copy.mjs";

test("repairs common mistranslations of product and database names", () => {
  assert.equal(applyEditorialCorrections("Мощность БИ ПЛ-300"), "Power BI PL-300");
  assert.equal(applyEditorialCorrections("ПостгреSQL"), "PostgreSQL");
  assert.equal(applyEditorialCorrections("Массивы, ANY и пожалуйста"), "Массивы, ANY и ALL");
  assert.equal(
    applyEditorialCorrections("УПСЕРТ: ВСТАВЬТЕ... О КОНФЛИКТЕ"),
    "INSERT ... ON CONFLICT: вставка с обработкой конфликта"
  );
});

test("uses clear Russian terms in learner-facing copy", () => {
  assert.equal(applyEditorialCorrections("Зерно стола"), "Уровень детализации таблицы");
  assert.equal(
    applyEditorialCorrections("Построитель планов таблиц"),
    "План занятий по Tableau"
  );
  assert.equal(
    applyEditorialCorrections("Все необходимые отзывные сведения собраны в одном месте — сначала отвечайте по памяти, переворачивайте, если не можете."),
    "Все карточки для повторения собраны здесь. Сначала попробуйте ответить по памяти, затем откройте карточку и проверьте себя."
  );
  assert.equal(
    applyEditorialCorrections("Панды pct_change и когда"),
    "pandas: pct_change и cumsum — процентное изменение и накопительная сумма"
  );
});

test("editorial corrections are stable when localization is rebuilt", () => {
  const copy = "Мощность БИ · УПСЕРТ: ВСТАВЬТЕ... О КОНФЛИКТЕ · Массивы, ANY и пожалуйста";
  const once = applyEditorialCorrections(copy);
  assert.equal(applyEditorialCorrections(once), once);
});
