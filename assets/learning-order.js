(function () {
  "use strict";

  var STEPS = [
    ['foundations',1,'Основы аналитики данных'],
    ['business-analysis',2,'Основы бизнес-анализа'],
    ['data-quality',3,'Качество данных'],
    ['excel',4,'Excel'],
    ['sql',5,'SQL'],
    ['chart-literacy',6,'Грамотность графиков'],
    ['postgresql',7,'PostgreSQL'],
    ['python',8,'Python и pandas'],
    ['stats',9,'Статистика'],
    ['forecasting',10,'Прогнозирование'],
    ['powerbi',11,'Power BI'],
    ['tableau',12,'Tableau'],
    ['decision-making',13,'Логика и решения'],
    ['portfolio-projects',14,'Проекты для портфолио'],
    ['projects',15,'Проектная мастерская'],
    ['simulator',16,'Симулятор аналитика'],
    ['interview',17,'Подготовка к собеседованию'],
    ['final',18,'Итоговый экзамен']
  ];

  var DETAILS = {
    foundations: {
      description: 'Разберись, как устроена работа аналитика: таблицы, метрики, качество данных и бизнес-вопросы.',
      icon: 'graduation-cap', color: 'var(--accent)'
    },
    'business-analysis': {
      description: 'Научись описывать проблемы и процессы, собирать требования и формулировать критерии приёмки.',
      icon: 'clipboard-list', color: 'var(--phase-2)'
    },
    'data-quality': {
      description: 'Находи пропуски, дубликаты и ошибки формата до того, как они испортят расчёты.',
      icon: 'shield-check', color: 'var(--good)'
    },
    excel: {
      description: 'Освой формулы, поиск, очистку таблиц и сводные отчёты.',
      icon: 'table', color: 'var(--good)'
    },
    sql: {
      description: 'Научись получать нужные данные, фильтровать строки и объединять таблицы.',
      icon: 'database', color: 'var(--accent)'
    },
    'chart-literacy': {
      description: 'Подбирай подходящие графики и делай выводы, которые не вводят в заблуждение.',
      icon: 'chart-no-axes-combined', color: 'var(--phase-2)'
    },
    postgresql: {
      description: 'Закрепи SQL на практике и познакомься с возможностями PostgreSQL.',
      icon: 'database-zap', color: 'var(--accent)'
    },
    python: {
      description: 'Автоматизируй обработку данных и научись работать с таблицами через pandas.',
      icon: 'code-2', color: 'var(--warm)'
    },
    stats: {
      description: 'Разберись с распределениями, проверкой гипотез, A/B-тестами и статистическими выводами.',
      icon: 'sigma', color: 'var(--accent)'
    },
    forecasting: {
      description: 'Научись замечать тренды и сезонность, строить прогнозы и оценивать их точность.',
      icon: 'trending-up', color: 'var(--phase-2)'
    },
    powerbi: {
      description: 'Свяжи данные, освой DAX и собери понятный интерактивный отчёт.',
      icon: 'chart-no-axes-column-increasing', color: 'var(--good)'
    },
    tableau: {
      description: 'Закрепи визуализацию данных и научись собирать аналитические дашборды.',
      icon: 'chart-pie', color: 'var(--phase-2)'
    },
    'decision-making': {
      description: 'Тренируй логику, проверку гипотез и выбор обоснованных действий.',
      icon: 'brain', color: 'var(--warm)'
    },
    'portfolio-projects': {
      description: 'Выполни кейсы по продажам, поддержке и маркетингу и оформи результаты.',
      icon: 'folder-kanban', color: 'var(--warm)'
    },
    projects: {
      description: 'Собери самостоятельный проект: от бизнес-вопроса до результата для портфолио.',
      icon: 'blocks', color: 'var(--accent)'
    },
    simulator: {
      description: 'Попробуй типовые задачи младшего аналитика в условиях, близких к рабочим.',
      icon: 'briefcase-business', color: 'var(--phase-2)'
    },
    interview: {
      description: 'Научись ясно объяснять ход решения и отвечать на вопросы работодателя.',
      icon: 'messages-square', color: 'var(--warm)'
    },
    final: {
      description: 'Проверь основные знания и пойми, какие навыки стоит повторить перед откликами.',
      icon: 'flag', color: 'var(--accent)'
    }
  };

  var TRACKING = {
    foundations: { key: 'apk-foundations-progress-v1', total: 8, unit: 'уроков' },
    'business-analysis': { key: 'apk-business-analysis-progress-v1', total: 9, unit: 'уроков' },
    'data-quality': { kind: 'quality', total: 5, unit: 'проверок' },
    excel: { key: 'epk', field: 'lessonsDone', total: 51, unit: 'уроков' },
    sql: { key: 'sqlkit-v1', field: 'doneLessons', total: 48, unit: 'уроков' },
    'chart-literacy': { key: 'clk-v1', field: 'done', total: 13, unit: 'уроков' },
    postgresql: { key: 'apk-postgresql-progress-v1', field: 'doneLessons', total: 30, unit: 'уроков' },
    python: { key: 'ppk', field: 'lessonsDone', total: 42, unit: 'уроков' },
    stats: { key: 'spk', field: 'done', total: 16, unit: 'уроков' },
    forecasting: { key: 'fmk-v1', field: 'done', total: 13, unit: 'уроков' },
    powerbi: { key: 'pbikt-v1', field: 'doneLessons', total: 39, unit: 'уроков' },
    tableau: { key: 'tpk', field: 'done', total: 32, unit: 'уроков' },
    'decision-making': { key: 'apk-decision-thinking-progress-v1', total: 6, unit: 'этапов' },
    'portfolio-projects': { kind: 'portfolio', total: 3, unit: 'кейсов' },
    projects: { kind: 'project-studio', total: 1, unit: 'проекта' },
    simulator: { key: 'sim2', field: 'reviews', total: 10, unit: 'задач' },
    interview: { key: 'ipk', field: 'lessonsComplete', total: 16, unit: 'уроков' },
    final: { key: 'apk-final', field: 'answers', total: 28, unit: 'вопросов', completeField: 'submitted' }
  };

  function safeJson(value) {
    if (!value) return null;
    try { return JSON.parse(value); } catch (error) { return null; }
  }

  function readStorage(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  }

  function countValues(value) {
    if (Array.isArray(value)) {
      return new Set(value.map(function (item) { return String(item); })).size;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.max(0, Math.floor(value));
    }
    if (!value || typeof value !== 'object') return 0;

    var collections = ['doneLessons', 'lessonsDone', 'lessonsComplete', 'completed', 'answers', 'done'];
    for (var i = 0; i < collections.length; i += 1) {
      var nested = value[collections[i]];
      if (Array.isArray(nested)) return countValues(nested);
      if (nested && typeof nested === 'object' && nested !== value) {
        return countValues(nested);
      }
    }

    return Object.keys(value).filter(function (key) {
      return value[key] === true && (/^\d+$/.test(key) || /^lesson\d+$/i.test(key));
    }).length;
  }

  function countTruthyKeys(value) {
    if (!value || typeof value !== 'object') return 0;
    return Object.keys(value).filter(function (key) { return !!value[key]; }).length;
  }

  function readProgress(id) {
    var config = TRACKING[id];
    if (!config) return { done: 0, total: 0, unit: '' };

    if (config.kind === 'quality') {
      var passed = safeJson(readStorage('apk-quality-passed-v1'));
      var score = readStorage('apk-quality-score');
      var scoreMatch = /^(\d+)\s*\/\s*5$/.exec(score || '');
      return {
        done: Array.isArray(passed) ? countValues(passed) : (scoreMatch ? Number(scoreMatch[1]) : 0),
        total: config.total, unit: config.unit, complete: score === '5/5'
      };
    }

    if (config.kind === 'portfolio') {
      var projects = ['sales', 'support', 'marketing'];
      var completed = projects.filter(function (project) {
        var checks = safeJson(readStorage('apk-portfolio-' + project + '-checks'));
        return Array.isArray(checks) && new Set(checks.filter(function (value) {
          return Number.isInteger(value) && value >= 0 && value < 6;
        })).size >= 6;
      }).length;
      return { done: completed, total: config.total, unit: config.unit };
    }

    if (config.kind === 'project-studio') {
      var db = safeJson(readStorage('apk-projects-v1')) || {};
      var completedProjects = Array.isArray(db.projects) ? db.projects.filter(function (project) {
        var checklist = project && project.present && project.present.checklist;
        return project && project.phase === 'present' && Array.isArray(checklist) &&
          checklist.length > 0 && checklist.every(function (item) { return item && item.done; });
      }).length : 0;
      return { done: Math.min(completedProjects, config.total), total: config.total, unit: config.unit };
    }

    var state = safeJson(readStorage(config.key)) || {};
    if (config.completeField && state[config.completeField]) {
      return { done: config.total, total: config.total, unit: config.unit, complete: true };
    }
    var source = config.field ? state[config.field] : state;
    var done = id === 'simulator' ? countTruthyKeys(source) : countValues(source);
    return { done: Math.min(done, config.total), total: config.total, unit: config.unit };
  }

  function addStyle() {
    if (document.getElementById('apkLearningOrderStyle')) return;
    var style = document.createElement('style');
    style.id = 'apkLearningOrderStyle';
    style.textContent = [
      '.skill-item.apk-ordered{position:relative;padding-right:44px!important;}',
      '.apk-learning-step{position:absolute;right:9px;top:9px;display:inline-grid;place-items:center;min-width:25px;height:25px;padding:0 4px;border:1px solid var(--accent-soft-bd);border-radius:8px;background:var(--accent-soft);color:var(--accent-d);font:800 11px/1 var(--font-sans);box-shadow:0 2px 8px rgba(0,0,0,.08);}',
      '.apk-learning-sequence-note{margin:8px 0 12px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--tint);color:var(--dim);font:12px/1.55 var(--font-sans);}',
      '.apk-learning-sequence-note strong{color:var(--ink);}',
      '.apk-learning-sequence-note span{color:var(--accent);font-weight:800;}',
      '.apk-home-roadmap{margin:0 0 26px;padding:22px 22px 18px;border:1px solid var(--line);border-radius:16px;background:var(--panel);box-shadow:var(--shadow);scroll-margin-top:90px;}',
      '.apk-roadmap-head{display:flex;align-items:flex-end;justify-content:space-between;gap:22px;margin-bottom:12px;}',
      '.apk-roadmap-heading{min-width:0;}',
      '.apk-roadmap-eyebrow{display:block;margin-bottom:5px;color:var(--accent);font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;}',
      '.apk-roadmap-title{font:600 clamp(20px,3vw,26px)/1.2 var(--font-display);letter-spacing:var(--tracking-tight);color:var(--ink);}',
      '.apk-roadmap-intro{max-width:66ch;margin-top:7px;color:var(--dim);font-size:13px;line-height:1.6;}',
      '.apk-roadmap-summary{flex:0 0 190px;padding:12px 14px;border:1px solid var(--line);border-radius:11px;background:var(--bg);}',
      '.apk-roadmap-summary strong{display:block;color:var(--ink);font:700 17px/1.3 var(--font-display);}',
      '.apk-roadmap-summary small{display:block;margin-top:2px;color:var(--dim);font-size:11px;}',
      '.apk-roadmap-summary-track{height:6px;margin-top:9px;overflow:hidden;border-radius:99px;background:var(--track);}',
      '.apk-roadmap-summary-fill{height:100%;width:0;border-radius:inherit;background:var(--good);transition:width .25s ease;}',
      '.apk-roadmap-list{position:relative;display:flex;flex-direction:column;gap:16px;margin:20px 0 0;padding:4px 0 8px;list-style:none;}',
      '.apk-roadmap-list:before{content:"";position:absolute;top:0;bottom:0;left:50%;width:2px;transform:translateX(-50%);background:var(--line);}',
      '.apk-roadmap-item{position:relative;width:calc(50% - 36px);}',
      '.apk-roadmap-item:nth-child(odd){margin-right:auto;}',
      '.apk-roadmap-item:nth-child(even){margin-left:auto;}',
      '.apk-roadmap-node{position:absolute;z-index:1;top:25px;right:-50px;display:grid;place-items:center;width:32px;height:32px;border:4px solid var(--panel);border-radius:50%;background:var(--step-color,var(--accent));color:#fff;font:800 10px/1 var(--font-sans);box-shadow:0 0 0 1px var(--line);}',
      '.apk-roadmap-item:nth-child(even) .apk-roadmap-node{right:auto;left:-50px;}',
      '.apk-roadmap-card{display:block;min-height:148px;padding:15px 16px 13px;border:1px solid var(--line);border-top:4px solid var(--step-color,var(--accent));border-radius:12px;background:var(--panel);color:inherit;text-decoration:none;box-shadow:var(--shadow);transition:transform .16s,border-color .16s,box-shadow .16s;}',
      '.apk-roadmap-card:hover{transform:translateY(-2px);border-color:var(--step-color,var(--accent));box-shadow:0 8px 24px rgba(20,30,50,.11);}',
      '.apk-roadmap-card:focus-visible{outline:3px solid var(--step-color,var(--accent));outline-offset:3px;}',
      '.apk-roadmap-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;}',
      '.apk-roadmap-kicker{color:var(--dim);font-size:9px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;}',
      '.apk-roadmap-status{flex:0 0 auto;padding:4px 8px;border:1px solid var(--line);border-radius:99px;background:var(--bg);color:var(--dim);font-size:10px;font-weight:700;}',
      '.apk-roadmap-item[data-state="current"] .apk-roadmap-status{border-color:var(--accent-soft-bd);background:var(--accent-soft);color:var(--accent-d);}',
      '.apk-roadmap-item[data-state="in-progress"] .apk-roadmap-status{border-color:var(--warm-soft-bd);background:var(--warm-soft);color:var(--warm);}',
      '.apk-roadmap-item[data-state="complete"] .apk-roadmap-status{border-color:var(--good-bg);background:var(--good-bg);color:var(--good);}',
      '.apk-roadmap-card-main{display:flex;align-items:center;gap:10px;}',
      '.apk-roadmap-icon{display:grid;place-items:center;flex:0 0 36px;width:36px;height:36px;border-radius:10px;background:var(--tint);color:var(--step-color,var(--accent));}',
      '.apk-roadmap-icon .lucide{width:18px;height:18px;}',
      '.apk-roadmap-card h3{min-width:0;color:var(--ink);font:600 16px/1.25 var(--font-display);letter-spacing:var(--tracking-tight);}',
      '.apk-roadmap-arrow{margin-left:auto;color:var(--dim);font-size:18px;}',
      '.apk-roadmap-description{min-height:38px;margin:9px 0 10px;color:var(--dim);font-size:12px;line-height:1.55;}',
      '.apk-roadmap-progress-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:5px;color:var(--dim);font-size:10px;}',
      '.apk-roadmap-progress-head strong{color:var(--ink);font-weight:700;}',
      '.apk-roadmap-track{height:5px;overflow:hidden;border-radius:99px;background:var(--track);}',
      '.apk-roadmap-track span{display:block;height:100%;width:0;border-radius:inherit;background:var(--step-color,var(--accent));transition:width .25s ease;}',
      '.apk-roadmap-footnote{margin:7px 0 0;color:var(--dim);font-size:11px;line-height:1.5;}',
      '@media(max-width:760px){.apk-home-roadmap{padding:18px 14px 15px}.apk-roadmap-head{align-items:stretch;flex-direction:column;gap:12px}.apk-roadmap-summary{flex-basis:auto}.apk-roadmap-list{gap:12px;margin-top:16px;padding-left:34px}.apk-roadmap-list:before{left:14px}.apk-roadmap-item,.apk-roadmap-item:nth-child(odd),.apk-roadmap-item:nth-child(even){width:100%;margin:0}.apk-roadmap-node,.apk-roadmap-item:nth-child(even) .apk-roadmap-node{top:22px;right:auto;left:-34px;width:28px;height:28px;border-width:3px}.apk-roadmap-card{min-height:0;padding:13px 13px 12px}.apk-roadmap-description{min-height:0}.apk-roadmap-card h3{font-size:15px}}',
      '@media(prefers-reduced-motion:reduce){.apk-roadmap-card,.apk-roadmap-summary-fill,.apk-roadmap-track span{transition:none;}}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function itemKey(anchor) {
    var key = String(anchor.getAttribute('data-kit') || '').trim();
    if (TRACKING[key]) return key;
    var href = String(anchor.getAttribute('href') || '').replace(/[#?].*$/, '').replace(/\/+$/, '');
    key = href.split('/').pop();
    return TRACKING[key] ? key : '';
  }

  function applyNumberBadges() {
    Array.prototype.forEach.call(document.querySelectorAll('.skill-item'), function (anchor) {
      var key = itemKey(anchor);
      var step = STEPS.find(function (row) { return row[0] === key; });
      if (!step) return;
      anchor.classList.add('apk-ordered');
      anchor.setAttribute('data-learning-step', String(step[1]));
      anchor.setAttribute('title', 'Рекомендуемый порядок: шаг ' + String(step[1]).padStart(2, '0') + ' — ' + step[2]);
      if (anchor.querySelector('.apk-learning-step')) return;
      var badge = document.createElement('span');
      badge.className = 'apk-learning-step';
      badge.setAttribute('aria-label', 'Шаг ' + step[1] + ' из ' + STEPS.length);
      badge.textContent = String(step[1]).padStart(2, '0');
      anchor.appendChild(badge);
    });

    var firstGroup = document.querySelector('.mega-group');
    if (firstGroup && !document.getElementById('apkLearningSequenceNote')) {
      var note = document.createElement('div');
      note.id = 'apkLearningSequenceNote';
      note.className = 'apk-learning-sequence-note';
      note.innerHTML = '<strong>Рекомендуемый маршрут — 18 шагов.</strong><br>Иди по номерам: сначала основы и качество данных, затем инструменты, аналитика и итоговый проект. <span>Дополнительные сертификаты можно проходить отдельно.</span>';
      firstGroup.parentNode.insertBefore(note, firstGroup);
    }
  }

  function statusFor(progress, index, currentIndex) {
    if (progress.done >= progress.total && progress.total > 0) return 'complete';
    if (progress.done > 0) return 'in-progress';
    return index === currentIndex ? 'current' : 'upcoming';
  }

  function statusLabel(state) {
    return ({
      complete: 'Пройдено',
      'in-progress': 'В процессе',
      current: 'Следующий шаг',
      upcoming: 'Дальше по порядку'
    })[state];
  }

  function renderRoadmap() {
    var map = document.getElementById('apkHomeLearningMap');
    if (!map) return;
    var list = map.querySelector('.apk-roadmap-list');
    var summaryTitle = map.querySelector('[data-roadmap-summary]');
    var summaryFill = map.querySelector('.apk-roadmap-summary-fill');
    var summaryTrack = map.querySelector('[role="progressbar"]');
    if (!list || !summaryTitle || !summaryFill || !summaryTrack) return;

    var progress = STEPS.map(function (step) { return readProgress(step[0]); });
    var currentIndex = progress.findIndex(function (item) { return item.done < item.total; });
    var completed = progress.filter(function (item) { return item.done >= item.total && item.total > 0; }).length;
    var started = progress.filter(function (item) { return item.done > 0; }).length;
    var fraction = progress.reduce(function (sum, item) {
      return sum + (item.total > 0 ? Math.min(item.done / item.total, 1) : 0);
    }, 0) / STEPS.length;
    var percent = Math.round(fraction * 100);

    summaryTitle.textContent = completed === STEPS.length
      ? 'Маршрут пройден'
      : completed + ' из ' + STEPS.length + ' этапов завершено';
    map.querySelector('[data-roadmap-started]').textContent =
      started + ' этапов начато · общий прогресс ' + percent + '%';
    summaryFill.style.width = percent + '%';
    summaryTrack.setAttribute('aria-valuenow', String(percent));

    list.innerHTML = STEPS.map(function (step, index) {
      var id = step[0];
      var details = DETAILS[id];
      var config = TRACKING[id];
      var item = progress[index];
      var state = statusFor(item, index, currentIndex);
      var number = String(step[1]).padStart(2, '0');
      var amount = Math.min(item.done, item.total);
      var percentDone = item.total ? Math.round(amount / item.total * 100) : 0;
      var progressText = amount + ' из ' + item.total + ' ' + item.unit;
      var stateLabelText = statusLabel(state);
      var currentAttribute = state === 'current' ? ' aria-current="step"' : '';
      var hue = details.color;
      var href = id + '/';
      return '<li class="apk-roadmap-item" data-state="' + state + '" style="--step-color:' + hue + '">' +
        '<span class="apk-roadmap-node" aria-hidden="true">' + number + '</span>' +
        '<a class="apk-roadmap-card" href="' + href + '" data-kit="' + id + '"' + currentAttribute +
          ' aria-label="Этап ' + step[1] + ': ' + step[2] + '. ' + stateLabelText + '. Открыть раздел.">' +
          '<div class="apk-roadmap-card-top"><span class="apk-roadmap-kicker">Этап ' + number + ' · ' +
            (index === 0 ? 'Старт' : 'Продолжение') + '</span><span class="apk-roadmap-status">' + stateLabelText + '</span></div>' +
          '<div class="apk-roadmap-card-main"><span class="apk-roadmap-icon" aria-hidden="true"><i data-lucide="' + details.icon + '"></i></span>' +
            '<h3>' + step[2] + '</h3><span class="apk-roadmap-arrow" aria-hidden="true">→</span></div>' +
          '<p class="apk-roadmap-description">' + details.description + '</p>' +
          '<div class="apk-roadmap-progress-head"><span>' + (state === 'complete' ? 'Этап завершён' : 'Прогресс этапа') +
            '</span><strong>' + progressText + '</strong></div>' +
          '<div class="apk-roadmap-track" aria-hidden="true"><span style="width:' + percentDone + '%"></span></div>' +
        '</a></li>';
    }).join('');

    Array.prototype.forEach.call(list.querySelectorAll('.apk-roadmap-card'), function (anchor) {
      anchor.addEventListener('click', function () {
        try { localStorage.setItem('apk-last-kit', anchor.getAttribute('data-kit')); } catch (error) {}
      });
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function createRoadmap() {
    if (document.getElementById('apkHomeLearningMap')) return;
    var main = document.querySelector('main');
    if (!main) return;

    var map = document.createElement('section');
    map.id = 'apkHomeLearningMap';
    map.className = 'apk-home-roadmap';
    map.setAttribute('aria-labelledby', 'apkRoadmapTitle');
    map.innerHTML =
      '<div class="apk-roadmap-head">' +
        '<div class="apk-roadmap-heading">' +
          '<span class="apk-roadmap-eyebrow">Твой маршрут · от новичка до первого проекта</span>' +
          '<h2 class="apk-roadmap-title" id="apkRoadmapTitle">Карта обучения: что проходить и в каком порядке</h2>' +
          '<p class="apk-roadmap-intro">Иди по этапам сверху вниз: сначала база и качество данных, затем инструменты, аналитика и практика. Открывай карточку, чтобы перейти к настоящему курсу.</p>' +
        '</div>' +
        '<div class="apk-roadmap-summary">' +
          '<strong data-roadmap-summary>0 из 18 этапов завершено</strong>' +
          '<small data-roadmap-started>0 этапов начато · общий прогресс 0%</small>' +
          '<div class="apk-roadmap-summary-track" role="progressbar" aria-label="Общий прогресс учебного маршрута" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="apk-roadmap-summary-fill"></div></div>' +
        '</div>' +
      '</div>' +
      '<ol class="apk-roadmap-list" aria-label="Последовательность из 18 учебных этапов"></ol>' +
      '<p class="apk-roadmap-footnote">Карточки не блокируют друг друга: можно открыть любой модуль. Прогресс считывается из сохранений курсов в этом браузере и обновляется при возвращении на главную страницу.</p>';

    var kits = main.querySelector('.kits');
    if (kits && kits.parentNode) kits.parentNode.insertBefore(map, kits);
    else main.appendChild(map);
    renderRoadmap();
  }

  function apply() {
    addStyle();
    applyNumberBadges();
    createRoadmap();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }

  window.addEventListener('storage', renderRoadmap);
  window.addEventListener('pageshow', renderRoadmap);
  window.addEventListener('focus', renderRoadmap);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) renderRoadmap();
  });
})();