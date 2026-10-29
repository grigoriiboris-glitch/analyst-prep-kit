(function () {
  "используйте строгий";
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
  var byId = Object.create(null);
  STEPS.forEach(function (row) { byId[row[0]] = row; });

  function addStyle() {
    if (document.getElementById('apkLearningOrderStyle')) return;
    var style = document.createElement('style');
    style.id = 'apkLearningOrderStyle';
    style.textContent = [
      '.skill-item.apk-ordered{position:relative;padding-right:44px!important;}',
      ".apk-шаг обучения{позиция: абсолютная; справа: 9 пикселей; сверху: 9 пикселей; дисплей: встроенная сетка; место-элементы: центр; минимальная ширина: 25 пикселей; высота: 25 пикселей; отступ: 0 4 пикселя; граница: 1 пиксель сплошной РГБА(141,216,177,.56);граница-радиус:8пикселей;фон:линейный градиент(145град,#284б37,#1д3426);цвет:#c7f6d8;шрифт:850 11пикселей/1 системный интерфейс,-Яблоко-система,\"Следуйте пользовательскому интерфейсу\",без засечек;коробка-тень:0 2пикселей 8пикселей RGBA(0,0,0,.16);}",
      '.apk-learning-sequence-note{margin:8px 0 12px;padding:10px 12px;border:1px solid var(--color-border,var(--line,#E4E7EA));border-radius:10px;background:var(--color-surface-raised,var(--surf2,#F5F7F8));color:var(--color-text-muted,var(--muted,#71717A));font:12px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;}',
      '.apk-learning-sequence-note strong{color:var(--color-text,var(--ink,#18181B));}',
      '.apk-learning-sequence-note span{color:var(--color-primary,var(--accent,#0E7490));font-weight:800;}'
    ].join('');
    (document.head || document.documentElement).appendChild(style);
  }

  function itemKey(anchor) {
    var key = String(anchor.getAttribute('data-kit') || '').trim();
    if (byId[key]) return key;
    var href = String(anchor.getAttribute('href') || '').replace(/[#?].*$/, '').replace(/\/+$/, '');
    key = href.split('/').pop();
    if (byId[key]) return key;
    return '';
  }

  function apply() {
    addStyle();
    Array.prototype.forEach.call(document.querySelectorAll('.skill-item'), function (anchor) {
      var key = itemKey(anchor), step = byId[key];
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();
})();