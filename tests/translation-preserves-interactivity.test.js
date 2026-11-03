const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const editedModules = [
  "business-analysis/index.html","chart-literacy/index.html","data-quality/index.html",
  "decision-making/index.html","excel/index.html","forecasting/index.html","interview/index.html",
  "portfolio-projects/index.html","postgresql/index.html","powerbi/index.html","python/index.html",
  "sql/index.html","sql2/index.html","stats/index.html","tableau/index.html"
];

test("редакторские материалы не добавляются поверх интерфейса интерактивных курсов", () => {
  for (const file of editedModules) {
    const html = read(file);
    assert.doesNotMatch(html, /edited-source-data|edited-source-library|edited-lesson-content[.]js|data-edited-live/,
      file + ": обнаружен посторонний текстовый слой поверх уроков");
  }
  assert.equal(fs.existsSync(path.join(root, "assets/edited-lesson-content.js")), false,
    "Старый runtime-рендерер текстовых дублей не должен присутствовать в проекте");
});

test("основные интерактивные контейнеры и обработчики курсов сохранены", () => {
  const checks = [
    ["excel/index.html", ['id="view-lesson"', 'id="lessonContent"', "function openLesson(", "function renderLesson("]],
    ["powerbi/index.html", ["function navigate(", "function renderLesson(", "function v2QuizAnswer(", "v2pbi-quiz-"]],
    ["sql/index.html", ["function navigate(", "function renderLesson(", "function answerQuiz(", 'id="sql-editor"']],
    ["sql2/index.html", ['id="lessonPane"', 'id="sqlEditor"', "function renderBlocksUI(", "function runSQL("]],
    ["postgresql/index.html", ['id="lessonView"', 'id="lessonNav"', 'src="course-data.js"', 'src="app.js"']],
    ["python/index.html", ['id="view-lesson"', 'id="lessonContent"', "function openLesson(", "function renderLesson("]],
    ["chart-literacy/index.html", ['id="view-lesson"', "function checkQuiz(", "function checkParsons("]],
    ["interview/index.html", ['id="view-lessons"', 'id="lessonSidebar"', "function loadLesson(", "function renderPractice("]],
    ["tableau/index.html", ['id="view-lessons"', 'id="calcEditor"', "function openLesson(", "function drawLessonChart("]],
    ["stats/index.html", ['id="view-lessons"', "function openLesson(", "function renderDrill(", "lessonStatViz"]]
  ];
  for (const [file, markers] of checks) {
    const html = read(file);
    for (const marker of markers) {
      assert.ok(html.includes(marker), file + ": отсутствует штатный интерактивный элемент " + marker);
    }
  }
});
