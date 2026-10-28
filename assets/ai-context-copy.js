(function () {
  "используйте строгий";
  if (window.__apkAiContextCopyLoaded) return;
  window.__apkAiContextCopyLoaded = true;

  var BUTTON_CLASS = 'apk-ai-context-button';
  var BAR_CLASS = 'apk-ai-context-bar';
  var OBSERVER_DELAY = 140;
  var MAX_CONTEXT_CHARS = 14000;
  var timer = 0;

  function addStyle() {
    if (document.getElementById('apkAiContextCopyStyle')) return;
    var style = document.createElement('style');
    style.id = 'apkAiContextCopyStyle';
    style.textContent = [
      '.apk-ai-context-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:12px 0;padding:10px 12px;border:1px solid rgba(102,190,139,.42);border-radius:11px;background:linear-gradient(120deg,rgba(36,67,48,.92),rgba(26,43,33,.92));color:var(--ink,#edf5f0);}',
      ".apk-ai-контекстная кнопка{отображать:встроенный гибкий;выравнивание элементов:центр;оправдание-содержание:центр;зазор:8пикселей;минимальная высота:36пикселей;прокладка:8пикселей 12пикселей;граница:1пикселей сплошной #5ba979;граница-радиус:9пикселей;фон:#28523а;цвет:#effff3;шрифт:700 12px/1.3 системный интерфейс,-Apple-система,\"Следуйте пользовательскому интерфейсу\", без засечек;курсор:указатель;переход:фон .15с,цвет границы .15с,преобразование .15с;}",
      '.apk-ai-context-button:hover{background:#326847;border-color:#91e4b1;}',
      ".apk-ai-context-button:focus-visible{outline:2px Solid #a8f0c0;outline-offset:3px;}",
      '.apk-ai-context-button:active{transform:translateY(1px);}',
      '.apk-ai-context-status{font:12px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--muted,#b8cbbd);}',
      '.apk-ai-context-status[data-kind="success"]{color:#9be7b5;}',
      '.apk-ai-context-status[data-kind="error"]{color:#ffb0b0;}',
      '.apk-ai-context-note{font:12px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--muted,#b8cbbd);}',
      '@media(max-width:520px){.apk-ai-context-bar{align-items:flex-start}.apk-ai-context-button{width:100%}.apk-ai-context-note{width:100%}}'
    ].join('');
    (document.head || document.documentElement).appendChild(style);
  }

  function visibleLessonRoot(root) {
    if (!root || root.nodeType !== 1) return false;
    if (root.closest("навигация, в сторону, заголовок, нижний колонтитул, .урок-навигация, .боковая панель, .список уроков, .список-курсов-курсов")) return false;
    if (root.matches('[hidden],[aria-hidden="true"]')) return false;
    var heading = root.querySelector('h1,h2,h3,.lesson-title,[data-lesson-title]');
    if (!heading) return false;
    var signals = root.querySelector('.quiz-wrap,#quiz-wrap,.quiz,.lesson-story,.lesson-eyebrow,.lesson-progress,.lesson-progress-text,.lesson-task,.lesson-content,.lesson-body,.ral-block,.sql-mermaid-panel,.pg-workbench,.lesson-result,.answer-panel,.practice,.task-card,[data-lesson-task],.study-section,.study-body,.section-overview,.a-section,.question,.tab-panel.active,.assignment-body,.task-screen');
    return !!signals || root.matches('article.lesson,[data-lesson-root],.study-section,.question');
  }

  function staticLessonRoots() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('article.lesson,section.lesson,.lesson.active,.lesson-card.active,[data-lesson-root],article[data-lesson],section[data-lesson],.study-section,.question'));
    var unique = [];
    roots.forEach(function (root) {
      if (!visibleLessonRoot(root)) return;
      if (unique.some(function (found) { return found === root || found.contains(root); })) return;
      unique = unique.filter(function (found) { return !root.contains(found); });
      unique.push(root);
    });
    return unique;
  }

  function dynamicLessonRoots() {
    var selectors = [
      '#lessonView','#lessonContent','#lesson-content','#lessonBody','#lesson-body',
      '#lessonPanel','#lesson-panel','.lesson-view','.lesson-detail','.lesson-page',
      '[data-current-lesson]','#main','#app'
    ];
    var candidates = [];
    selectors.forEach(function (selector) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (root) {
        if (candidates.indexOf(root) === -1) candidates.push(root);
      });
    });
    // Only use a page-level main container when its current render looks like a lesson,
    // not a module landing page or a list of lesson cards.
    return candidates.filter(function (root) {
      if (!visibleLessonRoot(root)) return false;
      if (root.matches('#main')) {
        if (!root.querySelector('.quiz-wrap,#quiz-wrap,.lesson-story,.lesson-eyebrow,.lesson-progress,.ral-block,.answer-panel')) return false;
        if (root.querySelector('.lesson-card,.lesson-list-item,.pmap-node')) return false;
      }
      return true;
    }).filter(function (root) {
      return !candidates.some(function (other) { return other !== root && other.contains(root) && visibleLessonRoot(other); });
    });
  }

  function isVisible(element) {
    if (!element || element.closest('[hidden],[aria-hidden="true"]')) return false;
    var style;
    try { style = window.getComputedStyle(element); } catch (_) { style = null; }
    if (style && (style.display === 'none' || style.visibility === 'hidden')) return false;
    return true;
  }

  function lessonTitle(root) {
    var attr = root.getAttribute('data-lesson-title') || root.getAttribute('data-title');
    if (attr) return attr.trim();
    var heading = root.querySelector('h1,.lesson-title,[data-lesson-title],h2,h3');
    return heading ? String(heading.textContent || '').replace(/\s+/g, ' ').trim() : 'Текущий урок';
  }

  function courseTitle() {
    var explicit = document.querySelector('[data-course-title]');
    if (explicit) return String(explicit.getAttribute('data-course-title') || explicit.textContent || '').trim();
    var title = String(document.title || '').split(/\s+[—|–-]\s+/)[0].trim();
    if (title) return title;
    return location.pathname.split('/').filter(Boolean).slice(-1)[0] || 'Учебный модуль';
  }

  function cloneLessonText(root) {
    var clone = root.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll(
      'script,style,button,input,select,option,textarea,nav,header,footer,aside,' +
      '.apk-ai-context-bar,.lesson-nav,.sidebar,.lesson-progress,.progressbar,' +
      ".уроки-действия,.Действия,.навигация,.панель инструментов,.артиллерия,.модальный,.тост,.кнопка обратной связи"
    ), function (node) { if (node.parentNode) node.parentNode.removeChild(node); });

    // Keep important block boundaries so copied context remains readable.
    Array.prototype.forEach.call(clone.querySelectorAll('h1,h2,h3,h4,p,li,pre,blockquote,tr,.callout,.lesson-story,.lesson-eyebrow'), function (node) {
      if (node.tagName === 'TR') node.appendChild(document.createTextNode('\n'));
      else node.appendChild(document.createTextNode('\n'));
    });
    var text = String(clone.innerText || clone.textContent || '');
    return text.replace(/\u00a0/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  function editorContext(root) {
    var parts = [];
    Array.prototype.forEach.call(root.querySelectorAll('textarea'), function (editor) {
      var value = String(editor.value || '').trim();
      if (!value || !isVisible(editor)) return;
      var label = editor.getAttribute('aria-label') || editor.getAttribute('name') || editor.id || 'редактор';
      if (/password|token|secret|api.?key/i.test(label)) return;
      parts.push('Текущий текст из редактора (' + label + '):\n' + value);
    });
    Array.prototype.forEach.call(root.querySelectorAll('.CodeMirror-code,.monaco-editor .view-lines,.cm-content,[contenteditable="true"]'), function (editor) {
      if (!isVisible(editor)) return;
      var value = String(editor.innerText || editor.textContent || '').trim();
      if (value && value.length < 20000) parts.push('Текущий код из редактора:\n' + value);
    });
    return parts;
  }

  function buildContext(root) {
    var title = lessonTitle(root);
    var content = cloneLessonText(root);
    var editors = editorContext(root);
    var instructions = [
      "Ты — учебный ИИ-помощник по курсу платформа для подготовки аналитиков.",
      'Помоги ученику разобраться в уроке простым языком и на примерах.',
      'Сначала объясни принцип и ход рассуждения; не выдавай готовое решение без пояснения.',
      'Если ученик прислал ошибку или свой запрос, объясни причину, предложи исправление и способ проверить результат.',
      'Не утверждай, что запускал код или проверял данные, если это не подтверждено контекстом.'
    ].join('\n');
    var sections = [
      instructions,
      'Курс: ' + courseTitle(),
      'Урок: ' + title,
      'Страница: ' + location.href.split('#')[0],
      'КОНТЕКСТ УРОКА:',
      content || 'На странице не удалось извлечь объяснение урока. Ориентируйся на название курса и урока.'
    ];
    if (editors.length) sections.push('АКТУАЛЬНЫЙ КОД / ОТВЕТ УЧЕНИКА:\n' + editors.join('\n\n'));
    var output = sections.join('\n\n').trim();
    if (output.length > MAX_CONTEXT_CHARS) output = output.slice(0, MAX_CONTEXT_CHARS) + '\n\n[Контекст ограничен по длине. При необходимости открой урок и скопируй отдельный фрагмент кода.]';
    return output;
  }

  async function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function' && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'readonly');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    textarea.remove();
    if (!ok) throw new Error('Браузер не разрешил копирование. Разреши доступ к буферу обмена или скопируй текст вручную.');
  }

  function curriculumContext(button) {
    var data = button && button.dataset ? button.dataset : {};
    var courseId = String(data.courseId || '');
    var lessonId = String(data.lessonId || '');
    var courseName = String(data.courseTitle || 'Учебный модуль');
    var lessonName = String(data.lessonTitle || 'Текущее задание');
    var unit = String(data.lessonUnit || '');
    var goal = String(data.lessonGoal || '');
    var done = data.lessonDone === 'true';
    var coursePath = String(data.coursePath || '');
    var extra = '';
    var catalogs = window.DataCraftLessonCatalog || {};
    var catalog = catalogs[courseId] || [];
    if (courseId === 'quality') catalog = catalog.length ? catalog : (catalogs['data-quality'] || []);
    if (courseId === 'charts') catalog = catalog.length ? catalog : (catalogs['chart-literacy'] || []);
    if (courseId === 'portfolio') catalog = catalog.length ? catalog : (catalogs['portfolio-projects'] || []);
    var entry = Array.isArray(catalog) ? catalog.find(function (item) {
      return String(item.id) === lessonId && (!data.parentId || !item.id || String(item.id) === lessonId);
    }) : null;
    if (entry) {
      if (!goal && entry.goal) goal = String(entry.goal);
      var pieces = [];
      if (entry.explanation || entry.explain) pieces.push(String(entry.explanation || entry.explain));
      if (entry.task || entry.assignment) pieces.push('Задание: ' + String(entry.task || entry.assignment));
      if (entry.example || entry.exampleSql || entry.code) pieces.push('Пример:\n' + String(entry.example || entry.exampleSql || entry.code));
      if (pieces.length) extra = pieces.join('\n\n');
    }
    var instructions = [
      "Ты — учебный ИИ-помощник платформа для подготовки аналитиков.",
      'Объясняй тему простым языком, пошагово и на небольших примерах.',
      'Если ученик просит проверить решение, сначала разберись в его подходе, затем объясни ошибку и предложи способ проверить исправление.',
      'Не придумывай отсутствующие требования и не утверждай, что выполнял код или запрос, если это не подтверждено.',
      'Если данных контекста недостаточно, задай один конкретный уточняющий вопрос.'
    ].join('\n');
    var sections = [
      instructions,
      'Курс: ' + courseName,
      'Урок / задание: ' + lessonName,
      lessonId ? 'Идентификатор: ' + lessonId : '',
      unit ? 'Раздел: ' + unit : '',
      goal ? 'Цель обучения: ' + goal : '',
      'Статус: ' + (done ? 'отмечено как выполненное' : 'ещё не отмечено как выполненное'),
      coursePath ? 'Путь к курсу: ' + coursePath : '',
      'КОНТЕКСТ:',
      extra || 'Карта обучения содержит название урока и доступные метаданные; если для полного объяснения нужен текст самого урока, попроси ученика открыть курс и скопировать контекст с его страницы.'
    ];
    return sections.filter(Boolean).join('\n\n').slice(0, MAX_CONTEXT_CHARS);
  }

  function bindCurriculumCopyButtons() {
    if (document.documentElement.dataset.apkCurriculumContextBound === 'true') return;
    document.documentElement.dataset.apkCurriculumContextBound = 'true';
    document.addEventListener('click', async function (event) {
      var button = event.target && event.target.closest ? event.target.closest('.curriculum-copy-context') : null;
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      if (button.disabled) return;
      var oldText = button.textContent;
      button.disabled = true;
      button.textContent = 'Готовим контекст…';
      try {
        await copyText(curriculumContext(button));
        button.textContent = 'Контекст скопирован ✓';
        button.setAttribute('aria-live', 'polite');
        button.title = "Вставь контекст в ЧатGPT или другого ИИ-помощника";
      } catch (error) {
        button.textContent = 'Не удалось скопировать';
        button.title = error && error.message ? error.message : 'Проверь разрешение буфера обмена';
      }
      window.setTimeout(function () {
        button.disabled = false;
        button.textContent = oldText;
      }, 1800);
    });
  }

  function attachButton(root) {
    if (!root || Array.prototype.some.call(root.children, function (child) { return child.classList && child.classList.contains(BAR_CLASS); })) return;
    if (!visibleLessonRoot(root)) return;
    root.setAttribute('data-apk-ai-context-root', 'true');

    var bar = document.createElement('div');
    bar.className = BAR_CLASS;
    bar.setAttribute('role', 'group');
    bar.setAttribute("aria-метка", 'Контекст урока для ИИ');
    var button = document.createElement('button');
    button.type = 'button';
    button.className = BUTTON_CLASS;
    button.innerHTML = '<span aria-hidden="true">⧉</span><span>Скопировать контекст для ИИ</span>';
    var status = document.createElement('span');
    status.className = 'apk-ai-context-status';
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'Название урока, объяснение, задание и текущий код';
    bar.appendChild(button);
    bar.appendChild(status);

    button.addEventListener('click', async function () {
      var label = button.querySelectorAll('span')[1];
      button.disabled = true;
      if (label) label.textContent = 'Готовим контекст…';
      status.dataset.kind = '';
      try {
        await copyText(buildContext(root));
        if (label) label.textContent = 'Контекст скопирован ✓';
        status.textContent = "Вставь его в ЧатGPT или другого ИИ-помощника.";
        status.dataset.kind = 'success';
      } catch (error) {
        if (label) label.textContent = 'Не удалось скопировать';
        status.textContent = error && error.message ? error.message : 'Не удалось скопировать контекст.';
        status.dataset.kind = 'error';
      } finally {
        window.setTimeout(function () {
          button.disabled = false;
          if (label) label.textContent = 'Скопировать контекст для ИИ';
        }, 1800);
      }
    });

    var anchor = root.querySelector('.lesson-header,.lesson-top,.lesson-eyebrow,.lesson-progress,h1,h2,.lesson-title');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    else root.insertBefore(bar, root.firstChild);
  }

  function scan() {
    addStyle();
    var roots = staticLessonRoots();
    if (!roots.length) roots = dynamicLessonRoots();
    roots.forEach(attachButton);
  }

  function scheduleScan() {
    window.clearTimeout(timer);
    timer = window.setTimeout(scan, OBSERVER_DELAY);
  }

  function start() {
    bindCurriculumCopyButtons();
    scan();
    if (window.MutationObserver && document.body) {
      var observer = new MutationObserver(function (records) {
        var relevant = records.some(function (record) {
          return Array.prototype.some.call(record.addedNodes || [], function (node) {
            return node.nodeType === 1 && !node.closest('.' + BAR_CLASS) && !node.matches('.' + BAR_CLASS);
          });
        });
        if (relevant) scheduleScan();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    window.addEventListener('hashchange', scheduleScan);
    window.addEventListener('popstate', scheduleScan);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();