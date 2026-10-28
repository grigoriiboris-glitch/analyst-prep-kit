/* DataCraft curriculum map: animated 2D bitmap world with dynamic building sprites, living environmentFX, and road couriers. */
(function () {
  "используйте строгий";

  var MAP_W = 1320, MAP_H = 700, NODE_W = 136, NODE_H = 112;
  var SPRITE_CELL = 256;
  // Recommended skill sequence: prerequisites first, then the tools and portfolio route.
  var RECOMMENDED_ORDER = {
    foundations:1,'business-analysis':2,quality:3,excel:4,sql:5,charts:6,postgresql:7,
    python:8,stats:9,forecasting:10,powerbi:11,tableau:12,decision:13,portfolio:14,
    'project-studio':15,simulator:16,interview:17,final:18
  };
  function recommendedStep(course) { return RECOMMENDED_ORDER[course && course.id] || 0; }
  function formattedStep(course) { var n = recommendedStep(course); return n ? String(n).padStart(2, '0') : ''; }

  var STORE = {
    wallet: 'datacraft-wallet-v1',
    foundations: 'apk-foundations-progress-v1',
    quality: 'apk-quality-score',
    sql: 'sqlkit-v1',
    postgresql: 'apk-postgresql-progress-v1',
    excel: 'epk',
    python: 'ppk',
    charts: 'clk-v1',
    stats: 'spk',
    forecasting: 'fmk-v1',
    powerbi: 'pbikt-v1',
    tableau: 'tpk',
    decision: 'apk-decision-thinking-progress-v1',
    businessAnalysis: 'apk-business-analysis-progress-v1',
    portfolio: 'apk-portfolio-',
    simulator: 'sim2',
    interview: 'ipk',
    final: 'apk-final'
  };

  /* Coordinates (wx, wy) match the 15 foundation pads on datacraft-map-bg.jpg / .png */
  var COURSES = [
    {id:'foundations',spriteIdx:0,wx:185,wy:595,r:56,biome:'Лагерь у леса',cost:5,title:'Основы аналитики данных',short:'Школа исследователя',icon:'🏕️',path:'../foundations/',tracker:'foundations',total:8,unit:'уроков',stage:0,x:117,y:539,desc:'Базовая грамотность: строки и столбцы, типы данных, ключи, метрики, качество и постановка бизнес-вопроса.',requires:[]},
    {id:'quality',spriteIdx:1,wx:555,wy:555,r:58,biome:'Фермерские угодья',cost:8,title:'Качество данных',short:'Мельница очистки',icon:'🧪',path:'../data-quality/',tracker:'quality',total:5,unit:'категорий',stage:1,x:487,y:499,desc:'Научись обнаруживать пропуски, дубликаты, ошибки форматов и подозрительные значения, не удаляя данные без проверки.',requires:['foundations']},
    {id:'sql',spriteIdx:2,wx:885,wy:135,r:64,biome:'Горный хребет',cost:40,title:'SQL',short:'Шахта и кузница SQL',icon:'⚙️',path:'../sql/',tracker:'sql',total:48,unit:'уроков',stage:2,x:817,y:79,desc:'От SELECT и фильтрации к JOIN, агрегациям, CTE, оконным функциям и проверке качества результата.',requires:['foundations','quality']},
    {id:'postgresql',spriteIdx:2,wx:1035,wy:455,r:56,biome:'Северное нагорье',cost:22,title:'PostgreSQL',short:'Лаборатория PostgreSQL',icon:'🐘',path:'../postgresql/',tracker:'postgresql',total:30,unit:'уроков',stage:3,x:967,y:399,desc:'PostgreSQL с нуля: типы, JOIN, CTE, оконные функции, JSONB, индексы, планы выполнения и итоговый аналитический кейс.',requires:['sql']},
    {id:'excel',spriteIdx:3,wx:725,wy:595,r:60,biome:'Фермерские угодья',cost:40,title:'Excel',short:'Поля таблиц Excel',icon:'📗',path:'../excel/',tracker:'excel',total:51,unit:'уроков',stage:2,x:657,y:539,desc:'Формулы, поиск, очистка, сводные таблицы, проверка вычислений и аналитические отчёты.',requires:['foundations','quality']},
    {id:'charts',spriteIdx:4,wx:435,wy:215,r:54,biome:'Предгорье',cost:12,title:'Грамотность графиков',short:'Башня визуализации',icon:'📈',path:'../chart-literacy/',tracker:'charts',total:13,unit:'уроков',stage:2,x:367,y:159,desc:'Выбор подходящего графика, правильное чтение визуализаций и поиск вводящих в заблуждение представлений.',requires:['foundations','quality']},
    {id:'python',spriteIdx:5,wx:495,wy:318,r:58,biome:'Мастерские',cost:30,title:"Питон и панды",short:'Кузница Python',icon:'🐍',path:'../python/',tracker:'python',total:42,unit:'уроков',stage:3,x:427,y:269,desc:'Код для повторяемой обработки данных: базовый Python, pandas, преобразования, объединение и проверка результатов.',requires:['sql','excel']},
    {id:'stats',spriteIdx:6,wx:485,wy:455,r:58,biome:'Фермерские угодья',cost:20,title:'Статистика',short:'Ферма статистики',icon:'🔭',path:'../stats/',tracker:'stats',total:16,unit:'уроков',stage:3,x:407,y:399,desc:"Распределения, выборки, интервалы, А/Б-тесты, п-значения и осторожная интерпретация доказательств.",requires:['sql','excel']},
    {id:'forecasting',spriteIdx:7,wx:615,wy:250,r:54,biome:'Ремесленная долина',cost:18,title:'Прогнозирование',short:'Башня прогнозов',icon:'🌦️',path:'../forecasting/',tracker:'forecasting',total:13,unit:'уроков',stage:3,x:537,y:189,desc:'Тренд, сезонность, простые прогнозы, проверка точности и объяснение неопределённости.',requires:['stats','charts']},
    {id:'powerbi',spriteIdx:8,wx:865,wy:320,r:56,biome:'Речной порт',cost:25,title:'Power BI',short:'Центр Power BI',icon:'📊',path:'../powerbi/',tracker:'powerbi',total:39,unit:'уроков',stage:3,x:797,y:279,desc:'Модель данных, связи, меры DAX, визуализация и интерактивные отчёты для бизнес-пользователей.',requires:['sql','excel','charts']},
    {id:'tableau',spriteIdx:9,wx:815,wy:395,r:54,biome:'Ремесленная долина',cost:25,title:'Tableau',short:'Студия дашбордов',icon:'🟦',path:'../tableau/',tracker:'tableau',total:32,unit:'уроков',stage:3,x:737,y:369,desc:'Работа с измерениями и мерами, визуальные исследования, фильтры, наборы, иерархии и дашборды.',requires:['sql','excel','charts']},
    {id:'decision',spriteIdx:10,wx:690,wy:315,r:56,biome:'Центральная площадь',cost:18,title:'Логика и решения',short:'Площадь гипотез',icon:'🧠',path:'../decision-making/',tracker:'decision',total:6,unit:'уроков',stage:4,x:617,y:269,desc:'Постановка задачи, поиск причин, альтернативные гипотезы, оценка рисков и выбор следующего действия.',requires:['quality','stats','charts']},
    {id:'portfolio',spriteIdx:11,wx:205,wy:155,r:72,biome:'Западный утёс',cost:30,title:'Проекты для портфолио',short:'Замок Портфолио',icon:'🧰',path:'../portfolio-projects/',tracker:'portfolio',total:3,unit:'кейса',stage:4,x:137,y:109,desc:'Три практических кейса: продажи, служба поддержки и маркетинг. Каждый должен включать проверку данных, метрики и обоснованный вывод.',requires:['quality','sql','excel','decision'],anyOf:['powerbi','tableau']},
    {id:'simulator',spriteIdx:12,wx:765,wy:245,r:54,biome:'Речная застава',cost:20,title:'Симулятор аналитика',short:'Штаб симулятора',icon:'🧑‍💻',path:'../simulator/',tracker:'simulator',total:10,unit:'задач на проверке',stage:4,x:687,y:179,desc:'Сценарии из работы младшего аналитика: понять запрос, проверить данные, подготовить решение и получить обратную связь.',requires:['portfolio']},
    {id:'interview',spriteIdx:13,wx:1185,wy:285,r:60,biome:'Восточные скалы',cost:20,title:'Подготовка к собеседованию',short:'Арена интервью',icon:'🎤',path:'../interview/',tracker:'interview',total:16,unit:'уроков',stage:4,x:1107,y:239,desc:'Объяснение решений, поведенческие вопросы, работа с неоднозначностью и коммуникация с нетехнической аудиторией.',requires:['sql','excel','decision','portfolio']},
    {id:'final',spriteIdx:14,wx:1195,wy:125,r:70,biome:'Пик Цитадели',cost:40,title:'Итоговый экзамен',short:'Цитадель аналитика',icon:'🏰',path:'../final/',tracker:'final',total:1,unit:'экзамен',stage:4,x:1117,y:79,desc:'Финальная проверка знаний по Excel, SQL, Python, Tableau, статистике, Power BI и собеседованиям. До неё должны быть завершены все основные ветки.',requires:['foundations','quality','sql','excel','python','charts','stats','forecasting','powerbi','tableau','decision','portfolio','simulator','interview']}
  ];

  var SPECIALIZATIONS = [
    {id:'project-studio',title:'Проектная мастерская',icon:'🗂️',path:'../projects/',tracker:'projectStudio',catalogId:'projectStudio',total:4,unit:'этапов',cost:18,requires:['portfolio'],desc:'Спланируй собственный проект: сформулируй бизнес-вопрос, критерии, этапы анализа и презентацию.'},
    {id:'business-analysis',cost:12,title:'Основы бизнес-анализа',icon:'🧭',path:'../business-analysis/',tracker:'businessAnalysis',total:9,unit:'уроков',requires:['foundations'],desc:"Постановка бизнес-проблемы, сбор требований, Истории пользователей, BPMN, критерии приёмки и итоговый кейс."},
    {id:'excel-cert',cost:12,title:"Сертификат Эксель МО-210",icon:'📗',path:'../excel-cert/',storage:'apk-excelcert',requires:['excel'],desc:"Отдельная подготовка к сертификационному экзамену Эксель."},
    {id:'excel-expert',walletId:'excel-expert-cert',cost:15,catalogId:'excel-expert-cert',title:"Эксперт Эксель МО-211",icon:'🏅',path:'../excel-expert-cert/',storage:'apk-excelexpertcert',requires:['excel-cert'],desc:'Продвинутый уровень Excel после базовой сертификационной ветки.'},
    {id:'powerbi-cert',cost:15,title:"Мощность БИ ПЛ-300",icon:'📊',path:'../powerbi-cert/',storage:'apk-pbicert',requires:['powerbi'],desc:"Дополнительная подготовка к сертификации Мощность БИ."},
    {id:'tableau-cert',cost:15,title:'Настольная версия Tableau',icon:'🟦',path:'../tableau-cert/',storage:'apk-tabcert',requires:['tableau'],desc:"Дополнительная подготовка к сертификации Таблица."},
    {id:'alteryx-cert',cost:12,title:"Основы Альтерикс",icon:'🔄',path:'../alteryx-cert/',storage:'apk-alteryxcert',requires:['excel','quality'],desc:'Автоматизация подготовки и преобразования данных.'},
    {id:'azure-data-cert',cost:12,title:"Основы данных Лазурный ДП-900",icon:'☁️',path:'../azure-data-cert/',storage:'apk-dp900cert',requires:['foundations','sql'],desc:"Базовые понятия данных и облачных сервисов Лазурный."},
    {id:'databricks-cert',cost:15,title:"Архитектура озера данных и хранилища в Блоки данных",icon:'🧱',path:'../databricks-cert/',storage:'apk-dbxcert',requires:['sql','python'],desc:'Дополнительный маршрут по архитектуре озера данных и хранилища, а также аналитической платформе.'},
    {id:'ga4-cert',cost:12,title:"Гугл Аналитика 4",icon:'📣',path:'../ga4-cert/',storage:'apk-ga4cert',requires:['stats','charts'],desc:'Веб-аналитика, события, конверсии и интерпретация поведения пользователей.'},
    {id:'docusign',walletId:'docusign-cert',cost:12,catalogId:'docusign-cert',title:"Администратор электронной подписи Документация",icon:'✍️',path:'../docusign-cert/',storage:'apk-dscert',requires:['foundations'],desc:'Отдельный профессиональный маршрут по администрированию электронной подписи.'},
    {id:'docusign-clm',walletId:'docusign-clm-cert',cost:14,catalogId:'docusign-clm-cert',title:"Администратор управления договорами Документация (CLM)",icon:'📄',path:'../docusign-clm-cert/',storage:'apk-dsclmcert',requires:['docusign'],desc:'Управление жизненным циклом договоров.'},
    {id:'docusign-clm-workflow',walletId:'docusign-clm-workflow-cert',cost:15,catalogId:'docusign-clm-workflow-cert',title:"Рабочие процессы управления договорами Документация (CLM)",icon:'🔗',path:'../docusign-clm-workflow-cert/',storage:'apk-dsclmwfcert',requires:['docusign-clm'],desc:'Продвинутая специализация по рабочим процессам управления жизненным циклом договоров (CLM).'},
    {id:'docusign-clm-implementation',walletId:'docusign-clm-implementation-cert',cost:15,catalogId:'docusign-clm-implementation-cert',title:"Внедрение управления договорами Документация (CLM)",icon:'🛠️',path:'../docusign-clm-implementation-cert/',storage:'apk-dsclmimplcert',requires:['docusign-clm'],desc:'Внедрение и настройка процессов управления жизненным циклом договоров (CLM).'},
    {id:'docusign-org',walletId:'docusign-org-cert',cost:14,catalogId:'docusign-org-cert',title:"Управление организацией в Документация",icon:'🏢',path:'../docusign-org-cert/',storage:'apk-dsorgcert',requires:['docusign'],desc:"Отдельная специализация по управлению организацией Документ."}
  ];

  var BY_ID = {}, ALL = [], selectedId = 'foundations', hoveredId = null, currentFilter = 'all';
  var animEnabled = !(window.matchMedia && window.matchMedia("(предпочитает уменьшенное движение: уменьшить)").matches);
  var graph = [
    ['foundations','quality'],['quality','sql'],['sql','postgresql'],['quality','excel'],['quality','charts'],
    ['sql','python'],['excel','python'],['sql','stats'],['excel','stats'],
    ['charts','forecasting'],['stats','forecasting'],
    ['sql','powerbi'],['excel','powerbi'],['charts','powerbi'],
    ['sql','tableau'],['excel','tableau'],['charts','tableau'],
    ['quality','decision'],['stats','decision'],['charts','decision'],
    ['quality','portfolio'],['sql','portfolio'],['excel','portfolio'],['powerbi','portfolio'],['tableau','portfolio'],['decision','portfolio'],
    ['portfolio','simulator'],['portfolio','interview'],['decision','interview'],['interview','final']
  ];

  /* Fog fades only when a region's real prerequisite state becomes available. */
  var FOG_REGIONS = [
    {id:'sql-ridge',courseId:'sql',x:878,y:126,rx:184,ry:139,phase:0.3},
    {id:'citadel-peak',courseId:'final',x:1192,y:118,rx:157,ry:122,phase:2.1}
  ];

  /* NPCs move along roads that are actually open from a built course to a built/unlocked course. */
  var ROAD_NPCS = [
    {id:'merchant',name:'Торговец данными',icon:'🧙',offset:0,phase:0.12,speed:0.014},
    {id:'alchemist',name:'Странствующий алхимик',icon:'🧪',offset:1,phase:0.56,speed:-0.011},
    {id:'sql-master',name:'Старый мастер SQL',icon:'🧓',offset:2,phase:0.82,speed:0.009}
  ];

  var NPC_QUESTS = [
    {question:'После JOIN сумма продаж неожиданно выросла почти вдвое. Что проверить первым?',answers:['Сразу удалить половину строк','Проверить, не размножились ли строки заказа при связи один-ко-многим','Поменять цвет графика'],correct:1,explanation:'JOIN может размножить строки. Сначала проверь ключи связи и количество строк до и после соединения.',reward:3},
    {question:'В отчёте продажи упали на 12%. Какой первый шаг аналитика?',answers:['Сразу назвать виноватый канал','Проверить полноту данных, сравнимость периодов и разрезы','Скрыть отрицательную динамику'],correct:1,explanation:'Сначала убедись, что данные полны, периоды сопоставимы, а изменение не объясняется одним сегментом.',reward:4},
    {question:'В таблице клиентов подозрительно много повторов. Как надёжнее их проверить?',answers:['Удалить все похожие имена','Сверить бизнес-ключ и выяснить, что считается одной записью','Оставить только первую строку без проверки'],correct:1,explanation:'Дубликат определяется бизнес-правилом и ключом, а не только похожим текстом.',reward:2},
    {question:'На графике конверсия выросла с 4% до 8%. Что важно уточнить?',answers:['Изменилось ли число наблюдений и одинаковы ли определения/периоды метрики','Какой шрифт у заголовка','Можно ли убрать подписи оси'],correct:0,explanation:'Проверь числитель, знаменатель, объём данных и сравнимость периодов прежде, чем делать вывод.',reward:3},
    {question:'Запрос выполняется медленно. Что стоит проверить до переписывания всей системы?',answers:['Размер данных, фильтры, план запроса и индексы','Только название таблицы','Сразу удалить JOIN'],correct:0,explanation:'Начни с измерений: плана выполнения, объёма данных, фильтров и доступных индексов.',reward:4}
  ];

  var SEEN_WALLET_TX_KEY = 'datacraft-map-seen-wallet-transactions-v1';
  var NPC_COOLDOWN_KEY = 'datacraft-road-npc-cooldowns-v1';
  var hoveredNpcId = null;
  var cachedNpcRoads = null;
  var activeNpcQuest = null;
  var npcQuestTimer = null;
  var walletRefreshScheduled = false;

  COURSES.forEach(function(c){BY_ID[c.id]=c;ALL.push(c);});
  SPECIALIZATIONS.forEach(function(c){if(!c.tracker){c.tracker='cert';c.total=1;c.unit='экзамен';}BY_ID[c.id]=c;ALL.push(c);});

  var root = document.createElement('section');
  root.id = 'curriculumPanel';
  root.innerHTML =
    '<div class="curriculum-shell">' +
      '<header class="curriculum-head">' +
        "<div><h2 class=\"curriculum-title\">🗺️ Живая карта мира ДатаКрафт: строй здания из спрайтов за знания</h2>" +
        '<p class="curriculum-lead">На базовом битмапе подготовлены строительные площадки, реки, водопад и дороги. Каждое здание дорисовывается из спрайт-листа поверх карты и оживает по мере прохождения: крутятся лопасти мельницы, идёт дым из кузницы, а по открытым дорогам курсируют караваны с данными.</p></div>' +
        '<div class="curriculum-top-actions">' +
          '<span class="curriculum-coins" id="curriculumCoins">🪙 — монет</span>' +
          '<div class="curriculum-filter-group" role="group" aria-label="Фильтр зданий на карте">' +
            '<button type="button" class="curriculum-action filter-btn active" data-filter="all">Все (15)</button>' +
            '<button type="button" class="curriculum-action filter-btn" data-filter="available">Доступные</button>' +
            '<button type="button" class="curriculum-action filter-btn" data-filter="ready">К постройке 🔨</button>' +
          '</div>' +
          '<button type="button" class="curriculum-action" id="curriculumToggleAnim" title="Переключить анимацию мира">✨ Живой мир: ВКЛ</button>' +
          '<button type="button" class="curriculum-action" id="curriculumRefresh">↻ Обновить</button>' +
          '<button type="button" class="curriculum-action primary" id="curriculumNext">▶ Следующий курс</button>' +
        '</div>' +
      '</header>' +
      '<div class="curriculum-map-scroll"><canvas id="curriculumWorld" width="' + MAP_W + '" height="' + MAP_H + '" tabindex="0" role="img" aria-label="Интерактивная живая 2D-карта мира DataCraft со спрайтами зданий поверх битмапа."></canvas></div>' +
      '<div class="curriculum-legend">' +
        '<span><b class="curriculum-symbol" style="color:#7ed68a">✓</b>Построено (живой спрайт + караваны)</span>' +
        '<span><b class="curriculum-symbol" style="color:#f4d47d">🔨</b>Курс пройден — ждёт постройки за 🪙</span>' +
        '<span><b class="curriculum-symbol" style="color:#9ad1f5">🏗️</b>Изучается (стройплощадка + чертёж)</span>' +
        '<span><b class="curriculum-symbol" style="color:#9aa99d">🔒</b>Пустой фундамент (нужны предыдущие здания)</span>' +
      '</div>' +
      '<div class="curriculum-lower">' +
        '<section class="curriculum-detail" id="curriculumDetail" aria-live="polite"></section>' +
        '<section class="curriculum-list-wrap"><div class="curriculum-list-head"><h3>Все основные учебные здания</h3><span>15 объектов · динамическая отрисовка и анимация</span></div><div class="curriculum-course-list" id="curriculumCourseList"></div></section>' +
      '</div>' +
      '<details class="curriculum-section"><summary>Дополнительные учебные модули, специализации и сертификаты <span>14 веток · необязательны для основного выпуска</span></summary><div class="curriculum-specializations" id="curriculumSpecializations"></div></details>' +
      '<div class="curriculum-library"><p><strong>📚 Полевая библиотека и сервисные точки.</strong> Справочники, Ресурсная экспедиция (внизу) и Торговый контракт помогают зарабатывать монеты 🪙 на возведение построенных в учёбе зданий.</p><a href="../guides/">Открыть все справочники →</a></div>' +
    '</div>';

  var layout = document.querySelector('.layout');
  if (layout && layout.parentNode) layout.parentNode.insertBefore(root, layout);
  else document.body.insertBefore(root, document.body.firstChild);

  var canvas = document.getElementById('curriculumWorld');
  var ctx = canvas.getContext('2d');
  var detail = document.getElementById('curriculumDetail');
  var courseList = document.getElementById('curriculumCourseList');
  var specializationList = document.getElementById('curriculumSpecializations');
  var stageLabels = ['1 · ОСНОВЫ','2 · КАЧЕСТВО','3 · ИНСТРУМЕНТЫ','4 · АНАЛИЗ','5 · КАРЬЕРА'];

  /* Load Bitmap Background (automatically tries datacraft-map-bg.jpg, falls back to .png) */
  var bgImg = new Image();
  var bgLoaded = false;
  var bgWaterPixels = null;
  bgImg.onload = function () {
    bgLoaded = true;
    /* Cache the bitmap's water colours once. A sparkle is drawn only when its
       destination is actually over blue water in the source artwork. */
    try {
      var waterCanvas = document.createElement('canvas');
      waterCanvas.width = MAP_W;
      waterCanvas.height = MAP_H;
      var waterCtx = waterCanvas.getContext('2d', {willReadFrequently:true});
      waterCtx.drawImage(bgImg, 0, 0, MAP_W, MAP_H);
      bgWaterPixels = waterCtx.getImageData(0, 0, MAP_W, MAP_H).data;
    } catch (e) {
      /* Same-origin images normally allow sampling. The corrected path is a safe fallback. */
      bgWaterPixels = null;
    }
  };
  bgImg.onerror = function () {
    if (bgImg.src.indexOf('datacraft-map-bg.jpg') !== -1) {
      bgImg.src = 'datacraft-map-bg.png';
    }
  };
  bgImg.src = 'datacraft-map-bg.jpg';

  var spriteImg = new Image();
  var spriteLoaded = false;
  spriteImg.onload = function () { spriteLoaded = true; };
  spriteImg.src = 'datacraft-sprites.png';

  /* =========================================================================
     AMBIENT & GAMEPLAY ANIMATION ENGINE (60 FPS Canvas Particle & FX System)
     ========================================================================= */
  var animState = {
    time: 0,
    lastTs: 0,
    smokePuffs: [],
    buildBursts: [],
    birds: [
      {x: 120, y: 90, vx: 22, vy: 3, phase: 0},
      {x: 145, y: 102, vx: 22, vy: 3, phase: 1.4},
      {x: 680, y: 65, vx: -18, vy: 2, phase: 2.7}
    ],
    clouds: [
      {x: 220, y: 140, rx: 140, ry: 45, speed: 6},
      {x: 780, y: 310, rx: 175, ry: 55, speed: 4.5},
      {x: 1120, y: 520, rx: 130, ry: 42, speed: 5.2}
    ],
    riverSparkles: [],
    waterfallDrops: [],
    floatingTexts: [],
    fogOpacity: {},
    buildPopScale: {} /* courseId -> current spring scale after construction */
  };

  /* Pre-seed river sparkles along the river curve from waterfall (550, 95) to sea (1150, 620) */
  var RIVER_WAYPOINTS = [
    /* Hand-traced centerline of the river in datacraft-map-bg.jpg (1320x700).
       Keep points over the blue channel rather than drawing a straight diagonal across the banks. */
    {x: 550, y: 14}, {x: 554, y: 52}, {x: 557, y: 80}, {x: 548, y: 103},
    {x: 562, y: 123}, {x: 592, y: 142}, {x: 626, y: 158}, {x: 657, y: 174},
    {x: 688, y: 195}, {x: 725, y: 214}, {x: 765, y: 226}, {x: 795, y: 233},
    {x: 818, y: 252}, {x: 835, y: 281}, {x: 855, y: 310}, {x: 882, y: 331},
    {x: 910, y: 351}, {x: 936, y: 374}, {x: 957, y: 398}, {x: 974, y: 426},
    {x: 988, y: 456}, {x: 1004, y: 486}, {x: 1025, y: 520}, {x: 1050, y: 548},
    {x: 1082, y: 571}, {x: 1117, y: 594}, {x: 1150, y: 616}, {x: 1182, y: 636},
    {x: 1210, y: 651}
  ];
  for (var ri = 0; ri < 28; ri++) {
    animState.riverSparkles.push({
      progress: (ri / 28) + Math.random() * 0.03,
      offset: (Math.random() - 0.5) * 18,
      size: 1.5 + Math.random() * 2
    });
  }
  for (var wi = 0; wi < 18; wi++) {
    animState.waterfallDrops.push({
      x: 545 + Math.random() * 34,
      y: Math.random() * 92,
      vy: 42 + Math.random() * 28,
      r: 1.5 + Math.random() * 2
    });
  }

  function spawnSmoke(x, y, color, vy, maxLife, size) {
    if (animState.smokePuffs.length > 90) return;
    animState.smokePuffs.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y,
      vx: (Math.random() - 0.3) * 8,
      vy: vy || -18,
      life: 0,
      maxLife: maxLife || (1.6 + Math.random() * 0.8),
      size: size || (3 + Math.random() * 3),
      color: color || "РГБА(235, 240, 245,"
    });
  }

  function triggerBuildCelebration(wx, wy) {
    for (var i = 0; i < 32; i++) {
      var angle = (Math.PI * 2 * i) / 32 + (Math.random() - 0.5) * 0.2;
      var speed = 45 + Math.random() * 85;
      animState.buildBursts.push({
        x: wx,
        y: wy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 25,
        life: 0,
        maxLife: 0.85 + Math.random() * 0.45,
        color: i % 2 === 0 ? '#ffe484' : '#7ed68a',
        size: 3 + Math.random() * 3.5
      });
    }
  }

  function pointAlongPolyline(pts, t) {
    var totalSegs = pts.length - 1;
    var scaled = Math.max(0, Math.min(0.9999, t)) * totalSegs;
    var idx = Math.floor(scaled);
    var frac = scaled - idx;
    var a = pts[idx], b = pts[idx + 1];
    return {x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac};
  }

  function isRiverWaterPixel(x, y) {
    /* The bitmap is 1320x700, matching the map's internal canvas coordinates. */
    if (!bgWaterPixels) return true; // corrected centerline fallback if pixel sampling is unavailable
    var cx = Math.round(x), cy = Math.round(y);
    for (var oy = -2; oy <= 2; oy++) {
      for (var ox = -2; ox <= 2; ox++) {
        var px = cx + ox, py = cy + oy;
        if (px < 0 || py < 0 || px >= MAP_W || py >= MAP_H) continue;
        var i = (py * MAP_W + px) * 4;
        var red = bgWaterPixels[i], green = bgWaterPixels[i + 1], blue = bgWaterPixels[i + 2];
        /* River pixels are blue/cyan; grassy banks are green/yellow. */
        if (blue > 90 && blue > red + 15 && blue > green + 3) return true;
      }
    }
    return false;
  }

  function updateAnimations(dt) {
    animState.time += dt;

    /* 1. Waterfall cascade & foam mist */
    animState.waterfallDrops.forEach(function(d) {
      d.y += d.vy * dt;
      if (d.y > 94) {
        d.y = 4 + Math.random() * 10;
        d.x = 545 + Math.random() * 34;
      }
    });

    /* 2. River current sparkles */
    animState.riverSparkles.forEach(function(s) {
      s.progress += dt * 0.065;
      if (s.progress >= 1) s.progress -= 1;
    });

    /* 3. Drifting cloud shadows */
    animState.clouds.forEach(function(c) {
      c.x += c.speed * dt;
      if (c.x - c.rx > MAP_W + 60) c.x = -c.rx - 40;
    });

    /* 4. Flying birds */
    animState.birds.forEach(function(b) {
      b.x += b.vx * dt;
      b.y += Math.sin(animState.time * 2 + b.phase) * 4 * dt;
      if (b.x > MAP_W + 40) b.x = -30;
      if (b.x < -40) b.x = MAP_W + 30;
    });

    /* 5. Emit ambient campfire sparks & forge/chimney smoke */
    if (Math.random() < dt * 14) {
      /* Left forest campfires (always burning on the bitmap at (190,425) and (450,122)) */
      spawnSmoke(190, 418, "ргба(255, 195, 85,", -24, 1.1, 2.2);
      spawnSmoke(450, 118, "РГБА(255, 205, 95,", -22, 1.0, 2.0);
      /* Starter camp fire if foundations is unlocked */
      spawnSmoke(180, 585, "ргба(255, 180, 75,", -22, 1.1, 2.2);
    }
    if (Math.random() < dt * 9) {
      /* Smithy chimney smoke (active on map near Python node + extra dense when Python is built) */
      var pyBuilt = isBuilt('python');
      spawnSmoke(484, 276, pyBuilt ? "РГБА(220, 230, 240," : "РГБА(200, 205, 210,", pyBuilt ? -22 : -15, pyBuilt ? 2.1 : 1.5, pyBuilt ? 4.2 : 2.8);
      if (isBuilt('sql')) {
        spawnSmoke(895, 108, "РГБА(135, 215, 255,", -20, 1.6, 3.4);
      }
    }

    /* Update smoke particles */
    for (var i = animState.smokePuffs.length - 1; i >= 0; i--) {
      var p = animState.smokePuffs[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.size += dt * 2.2;
      if (p.life >= p.maxLife) animState.smokePuffs.splice(i, 1);
    }

    /* Update construction celebration burst particles */
    for (var j = animState.buildBursts.length - 1; j >= 0; j--) {
      var b = animState.buildBursts[j];
      b.life += dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vy += 110 * dt; /* gravity */
      if (b.life >= b.maxLife) animState.buildBursts.splice(j, 1);
    }

    /* Update pop-in building scale spring */
    Object.keys(animState.buildPopScale).forEach(function(id) {
      var val = animState.buildPopScale[id];
      if (val < 1) {
        animState.buildPopScale[id] = Math.min(1, val + dt * 2.8);
      }
    });

    /* 6. Ease fog away after requirements unlock and advance floating rewards. */
    FOG_REGIONS.forEach(function(region) {
      var course = BY_ID[region.courseId];
      var target = course && getStatus(course).unlocked ? 0 : 1;
      if (animState.fogOpacity[region.id] === undefined) animState.fogOpacity[region.id] = target;
      var current = animState.fogOpacity[region.id];
      animState.fogOpacity[region.id] = current + (target - current) * Math.min(1, dt * 1.45);
      if (Math.abs(animState.fogOpacity[region.id] - target) < 0.008) animState.fogOpacity[region.id] = target;
    });

    for (var fi = animState.floatingTexts.length - 1; fi >= 0; fi--) {
      var float = animState.floatingTexts[fi];
      float.life += dt;
      float.x += float.vx * dt;
      float.y += float.vy * dt;
      float.vy -= 5 * dt;
      if (float.life >= float.maxLife) animState.floatingTexts.splice(fi, 1);
    }
  }

  /* =========================================================================
     CORE STORAGE & LESSON PROGRESS LOGIC
     ========================================================================= */
  function readJSON(key) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
  function countTrueMap(obj, filter) {
    if (!obj || typeof obj !== 'object') return 0;
    return Object.keys(obj).filter(function(k){return (!filter || filter(k)) && obj[k] === true;}).length;
  }
  function countTrueLessonKeys(obj) {
    return countTrueMap(obj, function(k){return /^lesson\d+$/.test(k);});
  }
  function uniqueArrayCount(value) {
    return Array.isArray(value) ? new Set(value).size : 0;
  }
  function courseCatalog(course) {
    var all = window.DataCraftLessonCatalog || {};
    var key = course.catalogId || course.tracker || course.id;
    if (course.id === 'portfolio') return all.portfolio || [];
    if (course.id === 'project-studio') return all.projectStudio || [];
    return all[key] || all[course.id] || [];
  }
  function readScore(key) {
    try { return localStorage.getItem(key) || ''; } catch(e) { return ''; }
  }
  function getProgress(course) {
    var s, count = 0, total = courseCatalog(course).length || course.total || 1, label = course.unit || 'уроков', complete = false;
    switch(course.tracker) {
      case 'foundations':
        s = readJSON(STORE.foundations) || {};
        count = countTrueMap(s, function(k){return /^\d+$/.test(k);});
        break;
      case 'quality': {
        var passed = readJSON('apk-quality-passed-v1');
        var raw = readScore(STORE.quality);
        var match = /^(\d+)\s*\/\s*(\d+)$/.exec(raw);
        count = Array.isArray(passed) ? new Set(passed).size : (match ? Math.min(5, Number(match[1])) : 0);
        total = 5; label = 'практических задач';
        complete = raw === '5/5' || count >= 5;
        break;
      }
      case 'sql':
        s = readJSON(STORE.sql) || {}; count = uniqueArrayCount(s.doneLessons); break;
      case 'postgresql':
        s = readJSON(STORE.postgresql) || {}; count = uniqueArrayCount(s.doneLessons); total = 30; label = 'уроков'; break;
      case 'excel':
        s = readJSON(STORE.excel) || {}; count = uniqueArrayCount(s.lessonsDone); break;
      case 'python':
        s = readJSON(STORE.python) || {}; count = uniqueArrayCount(s.lessonsDone); break;
      case 'powerbi':
        s = readJSON(STORE.powerbi) || {}; count = uniqueArrayCount(s.doneLessons); break;
      case 'charts':
      case 'stats':
      case 'forecasting':
      case 'tableau':
        s = readJSON(STORE[course.tracker]) || {}; count = countTrueLessonKeys(s.done || {}); break;
      case 'businessAnalysis':
        s = readJSON(STORE.businessAnalysis) || {};
        count = countTrueMap(s, function(k){return /^\d+$/.test(k);});
        total = 9; label = 'уроков';
        break;
      case 'decision':
        s = readJSON(STORE.decision) || [];
        count = Array.isArray(s) ? new Set(s.filter(function(id){return /^[1-6]$/.test(String(id));}).map(String)).size : 0;
        break;
      case 'portfolio': {
        var cases = ['sales','support','marketing'];
        count = cases.filter(function(id){
          var checks = readJSON(STORE.portfolio + id + '-checks');
          return Array.isArray(checks) && new Set(checks.filter(function(n){return Number.isInteger(n) && n >= 0 && n < 6;})).size >= 6;
        }).length;
        total = 3; label = 'кейса'; break;
      }
      case 'simulator':
        s = readJSON(STORE.simulator) || {};
        count = s.reviews && typeof s.reviews === 'object' ? Object.keys(s.reviews).filter(function(k){return !!s.reviews[k];}).length : 0;
        total = 10; label = 'проверенных задач'; break;
      case 'interview':
        s = readJSON(STORE.interview) || {};
        count = countTrueMap(s.lessonsComplete);
        total = courseCatalog(course).length || 16; label = 'уроков'; break;
      case 'final':
        s = readJSON(STORE.final) || {};
        count = s.submittedSections && typeof s.submittedSections === 'object' ? countTrueMap(s.submittedSections) : 0;
        total = courseCatalog(course).length || 7; label = 'разделов экзамена';
        complete = !!s.submitted;
        break;
      case 'projectStudio': {
        s = readJSON('apk-projects-v1') || {};
        var projects = Array.isArray(s.projects) ? s.projects : [];
        count = 0;
        projects.forEach(function(p){
          if (!p) return;
          var order = ['scope','plan','build','present'], idx = order.indexOf(p.phase);
          var done = Math.max(0, idx);
          var cl = p.present && Array.isArray(p.present.checklist) ? p.present.checklist : [];
          if (p.phase === 'present' && cl.length && cl.every(function(item){return item && item.done;})) done = 4;
          count = Math.max(count, done);
        });
        total = 4; label = 'этапов';
        complete = count >= 4; break;
      }
      case 'cert': {
        s = readJSON(course.storage) || {};
        count = s.submitted ? 2 : (s.openSections && Object.keys(s.openSections).length ? 1 : 0);
        total = 2; label = 'этапа подготовки';
        complete = !!s.submitted; break;
      }
      default: count = 0;
    }
    total = Math.max(1, Number(total) || 1);
    count = Math.max(0, Math.min(total, Number(count) || 0));
    if (course.tracker !== 'quality' && course.tracker !== 'final' && course.tracker !== 'projectStudio' && course.tracker !== 'cert') complete = count >= total;
    if (course.tracker === 'portfolio') complete = count >= 3;
    if (course.tracker === 'simulator') complete = count >= 10;
    return {done: count, total: total, label: label, complete: complete, percent: Math.round(count / total * 100)};
  }

  function walletState() {
    if (window.DataCraftEconomy) return window.DataCraftEconomy.sync();
    return {balance: 0, totalEarned: 0, totalSpent: 0, buildings: {}};
  }

  function localDayStamp(date) {
    var d = date || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function spawnFloatingAt(x, y, text, color) {
    if (!animEnabled) { showToastIfAvailable(text); return; }
    animState.floatingTexts.push({
      x:x, y:y, text:String(text), color:color || '#ffe484',
      vx:(Math.random() - 0.5) * 10, vy:-34, life:0, maxLife:1.65
    });
    if (animState.floatingTexts.length > 24) animState.floatingTexts.shift();
  }

  function spawnFloatingText(courseId, text, color) {
    var course = BY_ID[courseId] || BY_ID[({projectStudio:'project-studio','excel-cert':'excel','excel-expert-cert':'excel','powerbi-cert':'powerbi','tableau-cert':'tableau','ga4-cert':'charts','azure-data-cert':'sql','databricks-cert':'python','alteryx-cert':'quality','docusign-cert':'foundations','docusign-clm-cert':'foundations','docusign-clm-workflow-cert':'foundations','docusign-clm-implementation-cert':'foundations','docusign-org-cert':'foundations'})[courseId]] || BY_ID[selectedId] || COURSES[0];
    if (!course || typeof course.wx !== 'number') return;
    spawnFloatingAt(course.wx + (Math.random() - 0.5) * 22, course.wy - (course.r || 56) * 0.86, text, color);
  }

  function courseIdForWalletTransaction(tx) {
    var parts = String(tx && tx.id || '').split(':');
    var id = parts[0];
    if (id === 'course-bonus' || id === 'building') id = parts[1] || '';
    else if (id === 'cert') id = parts[1] || '';
    if (id === 'projectStudio') id = 'project-studio';
    if (id === 'npc') return null;
    return id;
  }

  function scanWalletTransactions(wallet) {
    var txs = wallet && Array.isArray(wallet.transactions) ? wallet.transactions : [];
    var currentIds = txs.map(function(tx){ return String(tx.id || ''); }).filter(Boolean);
    var saved = readJSON(SEEN_WALLET_TX_KEY);
    if (!Array.isArray(saved)) {
      try { localStorage.setItem(SEEN_WALLET_TX_KEY, JSON.stringify(currentIds)); } catch(e) {}
      return;
    }
    var seen = Object.create(null);
    saved.forEach(function(id){ seen[String(id)] = true; });
    var fresh = txs.slice().reverse().filter(function(tx){ return tx && tx.id && !seen[String(tx.id)]; });
    if (fresh.length > 8) fresh = fresh.slice(0, 8);
    fresh.forEach(function(tx) {
      var delta = Number(tx.delta) || 0;
      var courseId = courseIdForWalletTransaction(tx);
      if (!delta || !courseId || !BY_ID[courseId]) return;
      var amount = Math.abs(delta);
      spawnFloatingText(courseId, (delta > 0 ? '+' : '−') + amount + ' 🪙', delta > 0 ? '#ffe484' : '#ffaaa0');
    });
    try { localStorage.setItem(SEEN_WALLET_TX_KEY, JSON.stringify(currentIds.slice(-120))); } catch(e) {}
  }

  function isBuilt(id) {
    var w = walletState();
    return !!(w.buildings && w.buildings[id]);
  }
  function getDependencies(course) {
    var requires = course.requires || [], anyOf = course.anyOf || [];
    var missing = requires.filter(function(id){return !isBuilt(id);});
    var anyComplete = !anyOf.length || anyOf.some(function(id){return isBuilt(id);});
    return {requires: requires, anyOf: anyOf, missing: missing, anyComplete: anyComplete, unlocked: missing.length === 0 && anyComplete};
  }
  function getStatus(course) {
    var progress = getProgress(course), deps = getDependencies(course), built = isBuilt(course.id);
    var unlocked = built || deps.unlocked;
    var ready = progress.complete;
    var state = built ? 'done' : (!unlocked ? 'locked' : (ready ? 'ready' : 'available'));
    return {progress: progress, dependencies: deps, done: built, built: built, courseComplete: ready, unlocked: unlocked, state: state, cost: course.cost || 0, balance: walletState().balance || 0};
  }
  function courseName(id) { return BY_ID[id] ? BY_ID[id].short || BY_ID[id].title : id; }
  function safeText(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function formatProgress(p) { return p.done + ' / ' + p.total + ' ' + p.label; }
  function statusText(st) {
    if (st.built) return 'Здание построено и ожило на карте — доступ дальше открыт';
    if (st.courseComplete) return 'Курс пройден — можно построить здание за монеты';
    if (st.unlocked) return 'Стройплощадка открыта — проходи уроки для возведения';
    return 'Пустой участок: сначала построй предыдущие здания';
  }

  function isLessonComplete(course, lesson, parentId) {
    var s, arr;
    switch(course.tracker) {
      case 'foundations':
        s = readJSON(STORE.foundations) || {}; return s[String(lesson.id)] === true;
      case 'quality': {
        arr = readJSON('apk-quality-passed-v1');
        if (Array.isArray(arr)) return arr.indexOf(String(lesson.id)) !== -1;
        return readScore(STORE.quality) === '5/5';
      }
      case 'sql':
        s = readJSON(STORE.sql) || {}; return Array.isArray(s.doneLessons) && s.doneLessons.map(String).indexOf(String(lesson.id)) !== -1;
      case 'postgresql':
        s = readJSON(STORE.postgresql) || {}; return Array.isArray(s.doneLessons) && s.doneLessons.map(String).indexOf(String(lesson.id)) !== -1;
      case 'excel':
        s = readJSON(STORE.excel) || {}; return Array.isArray(s.lessonsDone) && s.lessonsDone.map(String).indexOf(String(lesson.id)) !== -1;
      case 'python':
        s = readJSON(STORE.python) || {}; return Array.isArray(s.lessonsDone) && s.lessonsDone.map(String).indexOf(String(lesson.id)) !== -1;
      case 'powerbi':
        s = readJSON(STORE.powerbi) || {}; return Array.isArray(s.doneLessons) && s.doneLessons.map(String).indexOf(String(lesson.id)) !== -1;
      case 'charts':
      case 'stats':
      case 'forecasting':
      case 'tableau':
        s = readJSON(STORE[course.tracker]) || {}; return !!(s.done && s.done['lesson' + lesson.id]);
      case 'decision':
        s = readJSON(STORE.decision) || []; return Array.isArray(s) && s.map(String).indexOf(String(lesson.id)) !== -1;
      case 'portfolio':
        arr = readJSON(STORE.portfolio + parentId + '-checks') || [];
        return Array.isArray(arr) && arr.map(String).indexOf(String(lesson.id)) !== -1;
      case 'simulator':
        s = readJSON(STORE.simulator) || {}; return !!(s.reviews && s.reviews[lesson.id]);
      case 'interview':
        s = readJSON(STORE.interview) || {}; return !!(s.lessonsComplete && s.lessonsComplete[String(lesson.id)]);
      case 'final':
        s = readJSON(STORE.final) || {}; return !!(s.submittedSections && s.submittedSections[lesson.id]);
      case 'projectStudio': {
        s = readJSON('apk-projects-v1') || {};
        var projects = Array.isArray(s.projects) ? s.projects : [];
        var phaseOrder = ['scope','plan','build','present'], target = phaseOrder.indexOf(String(lesson.id));
        return projects.some(function(p){
          if (!p) return false;
          var current = phaseOrder.indexOf(p.phase);
          if (target < current) return true;
          if (lesson.id === 'present' && p.phase === 'present') {
            var cl = p.present && Array.isArray(p.present.checklist) ? p.present.checklist : [];
            return cl.length > 0 && cl.every(function(item){return item && item.done;});
          }
          return false;
        });
      }
      case 'cert':
        s = readJSON(course.storage) || {};
        if (lesson.id === 'guide') return !!(s.openSections && Object.keys(s.openSections).length);
        if (lesson.id === 'exam-submit') return !!s.submitted;
        return false;
      default:
        return false;
    }
  }

  function lessonRewardClaimId(course, lesson, parentId) {
    switch(course.tracker) {
      case 'foundations': return 'foundations:lesson:' + lesson.id;
      case 'quality': return 'quality:category:' + lesson.id;
      case 'sql': return 'sql:lesson:' + lesson.id;
      case 'postgresql': return 'postgresql:lesson:' + lesson.id;
      case 'excel': return 'excel:lesson:' + lesson.id;
      case 'python': return 'python:lesson:' + lesson.id;
      case 'powerbi': return 'powerbi:lesson:' + lesson.id;
      case 'charts':
      case 'stats':
      case 'forecasting':
      case 'tableau': return course.tracker + ':lesson' + lesson.id;
      case 'decision': return 'decision:lesson:' + lesson.id;
      case 'portfolio': return 'portfolio:' + parentId + ':criterion:' + lesson.id;
      case 'simulator': return 'simulator:review:' + lesson.id;
      case 'interview': return 'interview:lesson:' + lesson.id;
      case 'final': return lesson.id === 'exam-submit' ? 'final:submitted' : 'final:section:' + lesson.id;
      case 'cert': return lesson.id === 'exam-submit' ? 'cert:' + (course.walletId || course.id) + ':submitted' : null;
      default: return null;
    }
  }

  function lessonListHTML(course) {
    var catalog = courseCatalog(course);
    if (!catalog.length) return '<div class="curriculum-empty">Для этого раздела ещё нет списка уроков.</div>';
    var html = '', lastUnit = null;
    function row(item, parentId, depth) {
      var done = isLessonComplete(course, item, parentId);
      var claimId = lessonRewardClaimId(course, item, parentId);
      var walletNow = walletState(), rewardAlreadyClaimed = !!(claimId && walletNow.claimed && walletNow.claimed[claimId]);
      var amount = course.tracker === 'foundations' ? 2 : (course.tracker === 'decision' || course.tracker === 'charts' || course.tracker === 'stats' || course.tracker === 'forecasting' ? 2 : 1);
      if (course.tracker === 'quality' || course.tracker === 'portfolio') amount = 1;
      if (course.tracker === 'simulator' || course.tracker === 'final') amount = 2;
      if (course.tracker === 'projectStudio' || course.tracker === 'cert') amount = 0;
      return '<div class="curriculum-lesson-row' + (done ? ' passed' : '') + (depth ? ' nested' : '') + '"><span class="curriculum-lesson-check">' + (done ? '✓' : '○') + '</span><span class="curriculum-lesson-copy"><span class="curriculum-lesson-title">' + safeText(item.title) + '</span>' + (item.goal ? '<span class="curriculum-lesson-goal">' + safeText(item.goal) + '</span>' : '') + '</span><span class="curriculum-lesson-actions"><span class="curriculum-lesson-reward">' + (done ? 'Зачтено' : (rewardAlreadyClaimed ? 'Монеты получены' : (amount ? '+' + amount + ' 🪙' : 'Этап'))) + '</span><button type="button" class="curriculum-copy-context" title="Скопировать контекст этого урока для ИИ-агента" aria-label="Скопировать контекст урока ' + safeText(item.title) + '" data-course-title="' + safeText(course.title) + '" data-course-path="' + safeText(course.path || '') + '" data-course-id="' + safeText(course.id) + '" data-lesson-title="' + safeText(item.title) + '" data-lesson-id="' + safeText(item.id) + '" data-lesson-unit="' + safeText(item.unit || '') + '" data-lesson-goal="' + safeText(item.goal || '') + '" data-lesson-done="' + (done ? 'true' : 'false') + '" data-parent-id="' + safeText(parentId || '') + '">⧉ Скопировать контекст</button></span></div>';
    }
    if (course.tracker === 'portfolio') {
      catalog.forEach(function(project){
        var items = project.items || [];
        var done = items.filter(function(it){return isLessonComplete(course, it, project.id);}).length;
        html += '<div class="curriculum-unit-heading"><span>' + safeText(project.title) + '</span><small>' + done + '/' + items.length + ' критериев</small></div>';
        items.forEach(function(it){ html += row(it, project.id, 1); });
      });
    } else {
      catalog.forEach(function(item){
        var unit = String(item.unit || '');
        if (unit && unit !== lastUnit) {
          html += '<div class="curriculum-unit-heading"><span>' + safeText(unit) + '</span></div>';
          lastUnit = unit;
        }
        html += row(item, null, 0);
      });
    }
    var wallet = walletState();
    return '<details class="curriculum-lessons" open><summary>📚 Уроки и испытания <span>' + safeText(formatProgress(getProgress(course))) + '</span></summary><div class="curriculum-lesson-list">' + html + '</div><div class="curriculum-lesson-footer">Награды выдаются один раз за каждое впервые завершённое задание. Баланс кошелька: <strong>🪙 ' + wallet.balance + '</strong>.</div></details>';
  }

  function addPathButton(parent, label, path, primary, disabled) {
    var button = document.createElement('button');
    button.type = 'button'; button.className = 'curriculum-action' + (primary ? ' primary' : '');
    button.textContent = label; button.disabled = !!disabled;
    button.addEventListener('click', function(){ if (!path) return; window.open(path, '_blank', 'noopener'); });
    parent.appendChild(button); return button;
  }
  function addActionButton(parent, label, action, primary, disabled) {
    var button = document.createElement('button');
    button.type = 'button'; button.className = 'curriculum-action' + (primary ? ' primary' : '');
    button.textContent = label; button.disabled = !!disabled;
    button.addEventListener('click', action);
    parent.appendChild(button); return button;
  }

  function buildCourse(course) {
    if (!window.DataCraftEconomy) { showToastIfAvailable('Экономика игры не загрузилась. Обнови страницу.'); return; }
    var st = getStatus(course);
    if (st.built) { showToastIfAvailable('Здание уже построено на карте.'); return; }
    if (!st.unlocked) { showToastIfAvailable('Сначала построй предыдущие здания.'); return; }
    if (!st.courseComplete) { showToastIfAvailable('Сначала заверши все уроки этого здания.'); return; }
    var wallet = window.DataCraftEconomy.sync(), cost = course.cost || 0;
    if ((wallet.balance || 0) < cost) { showToastIfAvailable('Не хватает ' + (cost - wallet.balance) + ' 🪙. Заработай монеты в уроках или экспедиции.'); return; }
    var result = window.DataCraftEconomy.build(course.id, cost);
    if (result && result.ok) {
      animState.buildPopScale[course.id] = 0.05;
      if (course.wx && course.wy) triggerBuildCelebration(course.wx, course.wy);
      showToastIfAvailable('🎉 Построено: ' + course.short + '! Здание ожило на карте.');
      renderAll();
    } else {
      showToastIfAvailable('Не хватает монет для строительства.');
    }
  }

  function findNextCourse(course, seen) {
    seen = seen || {};
    if (!course || seen[course.id]) return null;
    seen[course.id] = true;
    var st = getStatus(course);
    if (st.done) return null;
    if (st.unlocked) return course;
    var dep = getDependencies(course);
    var missing = dep.missing.slice();
    if (!dep.anyComplete && dep.anyOf.length) {
      dep.anyOf.forEach(function(id){ if (missing.indexOf(id) < 0) missing.push(id); });
    }
    for (var i = 0; i < missing.length; i++) {
      var nested = findNextCourse(BY_ID[missing[i]], seen);
      if (nested) return nested;
    }
    return null;
  }

  function nextAvailable() {
    for (var i = 0; i < COURSES.length; i++) {
      var st = getStatus(COURSES[i]);
      if (st.unlocked && !st.done) return COURSES[i];
    }
    for (var j = 0; j < SPECIALIZATIONS.length; j++) {
      var ss = getStatus(SPECIALIZATIONS[j]);
      if (ss.unlocked && !ss.done) return SPECIALIZATIONS[j];
    }
    return COURSES[0];
  }

  function renderDetail() {
    var course = BY_ID[selectedId] || COURSES[0], st = getStatus(course), p = st.progress, deps = st.dependencies;
    var wallet = walletState(), stageLabel = course.stage !== undefined ? stageLabels[course.stage] + (course.biome ? ' · ' + course.biome.toUpperCase() : '') : 'ДОПОЛНИТЕЛЬНАЯ СПЕЦИАЛИЗАЦИЯ';
    var req = '';
    if (deps.requires.length) {
      req += '<li><span class="req-mark">Требуется</span><span>Построить предыдущие здания на карте:</span></li>';
      deps.requires.forEach(function(id){
        var c = BY_ID[id], cp = getProgress(c), built = isBuilt(id);
        req += "<li><span class=\"req-mark\" " + (built ? '' : 'missing') + '">' + (built ? '✓' : '○') + '</span><span>' + safeText(courseName(id)) + ' — ' + safeText(formatProgress(cp)) + (built ? ' · построено' : (cp.complete ? ' · курс пройден, построй за ' + (c.cost || 0) + ' 🪙' : ' · осталось ' + Math.max(0, cp.total - cp.done) + ' ур. и постройка за ' + (c.cost || 0) + ' 🪙')) + '</span></li>';
      });
    } else {
      req += '<li><span class="req-mark">✓</span><span>Стартовая площадка: предварительные постройки не нужны.</span></li>';
    }
    if (deps.anyOf.length) {
      var anyDone = deps.anyOf.some(function(id){return isBuilt(id);});
      req += "<li><span class=\"req-mark\" " + (anyDone ? '' : 'missing') + '">' + (anyDone ? '✓' : '○') + '</span><span>Дополнительно: построй один из вариантов — ' + deps.anyOf.map(function(id){return safeText(courseName(id));}).join(' или ') + '.</span></li>';
    }
    var action = document.createElement('div'); action.className = 'curriculum-detail-actions';
    if (st.built) {
      addPathButton(action, 'Открыть / повторить уроки →', course.path, true);
      addActionButton(action, '✓ Здание возведено на карте', function(){}, false, true);
    } else if (!st.unlocked) {
      var next = findNextCourse(course);
      if (next) addPathButton(action, 'Сначала: ' + (next.short || next.title), next.path, true);
      addActionButton(action, '🔒 Участок закрыт', function(){}, false, true);
    } else if (st.courseComplete) {
      addActionButton(action, '🔨 Построить здание за ' + (course.cost || 0) + ' 🪙', function(){ buildCourse(course); }, true, wallet.balance < (course.cost || 0));
      addPathButton(action, 'Повторить уроки', course.path, false);
    } else {
      addPathButton(action, 'Изучать уроки →', course.path, true);
      addActionButton(action, 'Постройка после курса: ' + (course.cost || 0) + ' 🪙', function(){}, false, true);
    }
    var currencyNote = '<div class="curriculum-wallet-line"><span>🪙 В кошельке: <strong>' + wallet.balance + '</strong></span><span>Цена постройки: <strong>' + (st.built ? 'оплачено' : (course.cost || 0) + ' 🪙') + '</strong></span><span>Всего заработано: ' + wallet.totalEarned + ' 🪙</span></div>';
    detail.innerHTML =
      '<div class="curriculum-detail-eyebrow">' + safeText(stageLabel) + '</div>' +
'<h3>' + safeText(course.icon || '🏗️') + ' ' + (recommendedStep(course) ? '<span class="curriculum-order-badge" style="display:inline-block;margin:0 7px 0 2px;padding:3px 8px;border:1px solid #59846a;border-radius:999px;background:#244331;color:#c7f6d8;font-size:11px;vertical-align:middle">ШАГ ' + formattedStep(course) + '</span>' : '') + safeText(course.title) + '</h3>' +
      '<span class="curriculum-status ' + st.state + '">' + (st.built ? '✓ ' : st.courseComplete ? '🔨 ' : st.unlocked ? '🏗️ ' : '🔒 ') + safeText(statusText(st)) + '</span>' +
      '<p>' + safeText(course.desc || 'Дополнительный учебный маршрут.') + '</p>' +
      '<div class="curriculum-progress"><i style="width:' + p.percent + '%"></i></div>' +
      '<p class="curriculum-progress-text">' + safeText(formatProgress(p)) + ' · ' + p.percent + '%</p>' +
      currencyNote +
      '<ul class="curriculum-requirements">' + req + '</ul>' +
      lessonListHTML(course);
    detail.appendChild(action);
  }

  function renderCourseList() {
    courseList.innerHTML = '';
    COURSES.forEach(function(c) {
      var st = getStatus(c), p = st.progress;
      var b = document.createElement('button'); b.type = 'button';
      b.className = 'curriculum-course-card' + (selectedId === c.id ? ' selected' : '');
      b.setAttribute('aria-pressed', selectedId === c.id ? 'true' : 'false');
      var label = st.built ? '✓ ПОСТРОЕНО' : (!st.unlocked ? '🔒 ПУСТОЙ УЧАСТОК' : (st.courseComplete ? '🔨 ГОТОВО К СТРОЙКЕ' : '🏗️ СТРОИТСЯ'));
b.innerHTML = '<span class="cc-icon">' + safeText(c.icon) + '</span><span class="cc-copy"><span class="cc-title">' + (recommendedStep(c) ? '<b style="display:inline-block;margin-right:5px;color:#9be7b5;font-weight:900">' + formattedStep(c) + '.</b>' : '') + safeText(c.short) + ' <small style="color:#9ab39f;font-weight:600">(' + safeText(c.title) + ')</small></span><span class="cc-meta"><span>' + safeText(formatProgress(p)) + '</span><span class="cc-state">' + label + '</span></span><span class="cc-bar"><i style="width:' + p.percent + '%"></i></span><span class="cc-cost">' + (st.built ? 'Спрайт здания возведён на карте' : 'Постройка здания: ' + (c.cost || 0) + ' 🪙') + '</span></span>';
      b.addEventListener('click', function(){ selectCourse(c.id, false); });
      courseList.appendChild(b);
    });
  }

  function renderSpecializations() {
    specializationList.innerHTML = '';
    SPECIALIZATIONS.forEach(function(c) {
      var st = getStatus(c), p = st.progress;
      var card = document.createElement('div'); card.className = 'curriculum-special-card' + (st.built ? ' done' : '');
      var top = document.createElement('div'); top.className = 'curriculum-special-top';
      var icon = document.createElement('span'); icon.className = 'curriculum-special-icon'; icon.textContent = c.icon;
      var text = document.createElement('div'); text.style.minWidth = '0';
var h = document.createElement('h4'); h.textContent = (recommendedStep(c) ? formattedStep(c) + '. ' : '') + c.title;
      var desc = document.createElement('p'); desc.textContent = formatProgress(p) + ' · ' + (st.built ? 'построено' : (!st.unlocked ? 'закрыто' : 'постройка ' + (c.cost || 0) + ' 🪙'));
      text.append(h, desc); top.append(icon, text); card.append(top);
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'curriculum-action' + (st.unlocked ? ' primary' : '');
      btn.textContent = st.built ? 'Открыть / повторить' : (!st.unlocked ? 'Посмотреть требования' : (st.courseComplete ? 'Построить за ' + (c.cost || 0) + ' 🪙' : 'Подробнее о курсе'));
      btn.addEventListener('click', function(){ selectCourse(c.id, true); });
      card.appendChild(btn); specializationList.appendChild(card);
    });
  }

  function drawStatusBadgeFromSheet(subIdx, dx, dy, size) {
    if (!spriteLoaded) return;
    var baseOx = 3 * SPRITE_CELL, baseOy = 3 * SPRITE_CELL;
    var sx = baseOx + (subIdx % 2) * 128;
    var sy = baseOy + Math.floor(subIdx / 2) * 128;
    ctx.drawImage(spriteImg, sx, sy, 128, 128, dx - size / 2, dy - size / 2, size, size);
  }

  /* Draw custom living animations per built building (rotating windmill sails, observatory beam, castle flags, etc.) */
  function drawBuildingSpecificFX(c, st, t) {
    var wx = c.wx, wy = c.wy;
    if (c.id === 'quality' && st.built) {
      /* Rotating Windmill Sails over the Quality Mill */
      ctx.save();
      ctx.translate(wx - 4, wy - 14);
      ctx.rotate(t * 1.15);
      ctx.strokeStyle = '#3b2816';
      ctx.fillStyle = "rgba(246, 232, 198, 0,88)";
      ctx.lineWidth = 2;
      for (var arm = 0; arm < 4; arm++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -34);
        ctx.stroke();
        ctx.fillRect(1, -32, 8, 20);
        ctx.strokeRect(1, -32, 8, 20);
      }
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#d9a74a';
      ctx.fill();
      ctx.restore();
    } else if (c.id === 'python' && st.built) {
      /* Pulsing orange forge hearth glow */
      var glow = 0.35 + 0.25 * Math.sin(t * 5.2);
      ctx.save();
      ctx.fillStyle = "РГБА(255, 140, 40, " + glow + ')';
      ctx.beginPath();
      ctx.arc(wx + 2, wy + 8, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (c.id === 'sql' && st.built) {
      /* Shimmering blue SQL ore crystals & minecart motion */
      var cartShift = Math.sin(t * 2.1) * 10;
      ctx.save();
      ctx.fillStyle = "РГБА(110, 215, 255, " + (0.45 + 0.35 * Math.sin(t * 4)) + ')';
      ctx.beginPath();
      ctx.arc(wx - 12 + cartShift, wy + 12, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (c.id === 'forecasting' && st.built) {
      /* Weather/Time-series forecasting radar wave */
      var waveR = (t * 22) % 42;
      var waveAlpha = Math.max(0, 0.65 * (1 - waveR / 42));
      ctx.save();
      ctx.strokeStyle = "РГБА(165, 230, 255, " + waveAlpha + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wx, wy - 20, waveR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if ((c.id === 'portfolio' || c.id === 'final') && st.built) {
      /* Waving royal banner flag atop Castle / Citadel */
      ctx.save();
      var flagX = wx - 8, flagY = wy - 56;
      var wave = Math.sin(t * 5 + wx) * 3.5;
      ctx.strokeStyle = '#332211';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(flagX, flagY + 16);
      ctx.lineTo(flagX, flagY - 4);
      ctx.stroke();
      ctx.fillStyle = c.id === 'final' ? '#ffd55a' : '#ff5e4d';
      ctx.beginPath();
      ctx.moveTo(flagX, flagY - 4);
      ctx.quadraticCurveTo(flagX + 9, flagY - 4 + wave, flagX + 18, flagY + 1 - wave * 0.5);
      ctx.lineTo(flagX, flagY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function activeNpcRoads() {
    if (cachedNpcRoads) return cachedNpcRoads;
    cachedNpcRoads = graph.filter(function(edge) {
      var from = BY_ID[edge[0]], to = BY_ID[edge[1]];
      if (!from || !to) return false;
      var fs = getStatus(from), ts = getStatus(to);
      return fs.built && (ts.built || ts.unlocked);
    });
    /* The travellers are ambient characters, not a reward gated behind building
       courses. Before the first course is built there are no "open" roads in the
       progression graph, so let them walk along the map's existing road network. */
    if (!cachedNpcRoads.length) cachedNpcRoads = graph.slice();
    return cachedNpcRoads;
  }

  function npcPosition(npc) {
    var roads = activeNpcRoads();
    if (!roads.length) return null;
    var edge = roads[(npc.offset || 0) % roads.length];
    var from = BY_ID[edge[0]], to = BY_ID[edge[1]];
    var u = (animState.time * npc.speed + npc.phase) % 1;
    if (u < 0) u += 1;
    var mx = (from.wx + to.wx) / 2, my = (from.wy + to.wy) / 2 - 18;
    return {
      x:(1-u)*(1-u)*from.wx + 2*(1-u)*u*mx + u*u*to.wx,
      y:(1-u)*(1-u)*from.wy + 2*(1-u)*u*my + u*u*to.wy
    };
  }

  function findNpcAtPoint(point) {
    for (var i = ROAD_NPCS.length - 1; i >= 0; i--) {
      var pos = npcPosition(ROAD_NPCS[i]);
      if (pos && Math.hypot(point.x - pos.x, point.y - pos.y) <= 23) return ROAD_NPCS[i];
    }
    return null;
  }

  function drawRoadNPCs(t) {
    ROAD_NPCS.forEach(function(npc) {
      var pos = npcPosition(npc);
      if (!pos) return;
      var pulse = animEnabled ? 1 + 0.12 * Math.sin(t * 4 + npc.offset) : 1;
      ctx.save();
      ctx.shadowColor = '#ffe59a';
      ctx.shadowBlur = animEnabled ? 11 : 3;
      ctx.fillStyle = "rgba(25, 42, 30, 0,94)";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 15 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = hoveredNpcId === npc.id ? '#fff0aa' : '#c5e6a3';
      ctx.lineWidth = hoveredNpcId === npc.id ? 2.6 : 1.5;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = "21пикселей «Эмодзи цвета яблока», «Сегоэ UI Эмодзи», без засечек";
      ctx.fillStyle = '#ffffff';
      ctx.fillText(npc.icon, pos.x, pos.y + 1);
      if (hoveredNpcId === npc.id) {
        var label = npc.name + ' · квест';
        ctx.font = "700 11пикселей системный интерфейс, без засечек";
        var labelW = ctx.measureText(label).width + 16;
        ctx.fillStyle = "rgba(16, 29, 21, 0,94)";
        roundRect(ctx, pos.x - labelW / 2, pos.y - 33, labelW, 19, 7);
        ctx.fill();
        ctx.fillStyle = '#fff0aa';
        ctx.fillText(label, pos.x, pos.y - 23);
      }
      ctx.restore();
    });
  }

  function drawFogOfWar(t) {
    FOG_REGIONS.forEach(function(region) {
      var course = BY_ID[region.courseId];
      var locked = !course || !getStatus(course).unlocked;
      var opacity = animState.fogOpacity[region.id];
      if (opacity === undefined) {
        opacity = locked ? 1 : 0;
        animState.fogOpacity[region.id] = opacity;
      }
      if (!animEnabled) {
        opacity = locked ? 1 : 0;
        animState.fogOpacity[region.id] = opacity;
      }
      if (opacity <= 0.01) return;

      var driftX = animEnabled ? Math.sin(t * 0.33 + region.phase) * 12 : 0;
      var driftY = animEnabled ? Math.cos(t * 0.27 + region.phase) * 5 : 0;
      ctx.save();
      ctx.globalAlpha = Math.min(1, opacity);
      var mist = ctx.createRadialGradient(region.x + driftX, region.y + driftY, 10, region.x + driftX, region.y + driftY, region.rx);
      mist.addColorStop(0, "rgba(222, 234, 226, 0,64)");
      mist.addColorStop(0.52, "rgba(190, 207, 197, 0,40)");
      mist.addColorStop(1, 'rgba(177, 197, 187, 0)');
      ctx.fillStyle = mist;
      ctx.beginPath();
      ctx.ellipse(region.x + driftX, region.y + driftY, region.rx, region.ry, -0.08, 0, Math.PI * 2);
      ctx.fill();
      for (var puff = 0; puff < 7; puff++) {
        var angle = puff * 0.91 + region.phase;
        var wobble = animEnabled ? Math.sin(t * 0.48 + puff + region.phase) * 8 : 0;
        var px = region.x + Math.cos(angle) * region.rx * 0.58 + driftX + wobble;
        var py = region.y + Math.sin(angle) * region.ry * 0.58 + driftY;
        var prx = region.rx * (0.18 + (puff % 3) * 0.035);
        var pry = region.ry * (0.19 + (puff % 2) * 0.04);
        var cloud = ctx.createRadialGradient(px, py, 2, px, py, prx);
        cloud.addColorStop(0, "rgba(235, 242, 237, 0,48)");
        cloud.addColorStop(1, 'rgba(214, 226, 218, 0)');
        ctx.fillStyle = cloud;
        ctx.beginPath();
        ctx.ellipse(px, py, prx, pry, angle * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (locked && opacity > 0.62) {
        ctx.font = "800 10пикселей системный интерфейс, без засечек";
        ctx.textAlign = 'center';
        ctx.fillStyle = "rgba(239, 248, 241, 0,82)";
        ctx.fillText('НЕИЗВЕДАННАЯ ОБЛАСТЬ', region.x, region.y + region.ry * 0.72);
      }
      ctx.restore();
    });
  }

  function drawFloatingTexts() {
    if (!animState.floatingTexts.length) return;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "900 17пикселей системный интерфейс, «Эмодзи цвета яблока», «Сегоэ UI Эмодзи», без засечек";
    ctx.lineWidth = 3.4;
    ctx.lineJoin = 'round';
    animState.floatingTexts.forEach(function(item) {
      var alpha = Math.max(0, 1 - item.life / item.maxLife);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(16, 27, 20, 0,94)";
      ctx.strokeText(item.text, item.x, item.y);
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, item.x, item.y);
    });
    ctx.restore();
  }

  function setNpcCooldown(npcId, durationMs) {
    var cooldowns = readJSON(NPC_COOLDOWN_KEY) || {};
    cooldowns[npcId] = Date.now() + durationMs;
    try { localStorage.setItem(NPC_COOLDOWN_KEY, JSON.stringify(cooldowns)); } catch(e) {}
  }

  function closeNpcQuest() {
    if (npcQuestTimer) { window.clearInterval(npcQuestTimer); npcQuestTimer = null; }
    if (activeNpcQuest && !activeNpcQuest.resolved) setNpcCooldown(activeNpcQuest.npc.id, 60 * 1000);
    var modal = document.getElementById('roadNpcQuestModal');
    if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
    activeNpcQuest = null;
  }

  function openNpcQuest(npc) {
    var cooldowns = readJSON(NPC_COOLDOWN_KEY) || {};
    var remaining = Number(cooldowns[npc.id] || 0) - Date.now();
    if (remaining > 0) {
      showToastIfAvailable(npc.name + ' отдыхает ещё ' + Math.ceil(remaining / 60000) + ' мин.');
      return;
    }

    var modal = document.getElementById('roadNpcQuestModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'roadNpcQuestModal';
      modal.className = 'road-npc-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'roadNpcQuestTitle');
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = '<div class="road-npc-dialog"><header class="road-npc-head"><div><div class="road-npc-kicker">СЛУЧАЙНАЯ ВСТРЕЧА</div><h2 id="roadNpcQuestTitle"></h2></div><button type="button" class="road-npc-close" aria-label="Закрыть задание">×</button></header><div class="road-npc-body"><div class="road-npc-timer" id="roadNpcTimer">⏱ 60 сек.</div><p id="roadNpcQuestion" class="road-npc-question"></p><div id="roadNpcAnswers" class="road-npc-answers"></div><div id="roadNpcFeedback" class="road-npc-feedback" role="status" aria-live="polite"></div><div class="road-npc-footer"><span>Правильный ответ принесёт монеты.</span><button type="button" class="curriculum-action primary" id="roadNpcDone">Закрыть</button></div></div></div>';
      document.body.appendChild(modal);
      modal.querySelector('.road-npc-close').addEventListener('click', closeNpcQuest);
      modal.querySelector('#roadNpcDone').addEventListener('click', closeNpcQuest);
      modal.addEventListener('click', function(e){ if (e.target === modal) closeNpcQuest(); });
    }

    var question = NPC_QUESTS[Math.floor(Math.random() * NPC_QUESTS.length)];
    var pos = npcPosition(npc) || {x:(BY_ID[selectedId] || COURSES[0]).wx,y:(BY_ID[selectedId] || COURSES[0]).wy};
    activeNpcQuest = {npc:npc,question:question,x:pos.x,y:pos.y,deadline:Date.now()+60000,resolved:false};
    modal.querySelector('#roadNpcQuestTitle').textContent = npc.icon + ' ' + npc.name;
    modal.querySelector('#roadNpcQuestion').textContent = question.question;
    modal.querySelector('#roadNpcFeedback').textContent = '';
    modal.querySelector('#roadNpcFeedback').className = 'road-npc-feedback';
    modal.querySelector('#roadNpcTimer').textContent = '⏱ 60 сек.';
    var answerBox = modal.querySelector('#roadNpcAnswers');
    answerBox.innerHTML = '';
    question.answers.forEach(function(answer, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'road-npc-answer';
      button.textContent = answer;
      button.addEventListener('click', function() {
        if (!activeNpcQuest || activeNpcQuest.resolved) return;
        var state = activeNpcQuest;
        state.resolved = true;
        if (npcQuestTimer) { window.clearInterval(npcQuestTimer); npcQuestTimer = null; }
        var feedback = modal.querySelector('#roadNpcFeedback');
        Array.prototype.forEach.call(answerBox.querySelectorAll('button'), function(b){ b.disabled = true; });
        if (index === state.question.correct) {
          setNpcCooldown(state.npc.id, 10 * 60 * 1000);
          var rewardId = 'npc:' + state.npc.id + ':' + localDayStamp();
          var paid = window.DataCraftEconomy && window.DataCraftEconomy.earn(rewardId, state.question.reward, 'Мини-квест: ' + state.npc.name);
          if (paid) {
            feedback.textContent = 'Верно! ' + state.question.explanation + ' Награда: +' + state.question.reward + ' 🪙.';
            feedback.classList.add('success');
            spawnFloatingAt(state.x, state.y - 18, '+' + state.question.reward + ' 🪙', '#ffe484');
          } else {
            feedback.textContent = 'Верно! Дневная награда за эту встречу уже получена. ' + state.question.explanation;
            feedback.classList.add('success');
          }
        } else {
          setNpcCooldown(state.npc.id, 2 * 60 * 1000);
          feedback.textContent = 'Не совсем. ' + state.question.explanation;
          feedback.classList.add('error');
        }
        modal.querySelector('#roadNpcTimer').textContent = '✓ Испытание завершено';
      });
      answerBox.appendChild(button);
    });
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    var firstAnswer = answerBox.querySelector('button');
    if (firstAnswer) firstAnswer.focus();

    npcQuestTimer = window.setInterval(function() {
      if (!activeNpcQuest || activeNpcQuest.resolved) return;
      var seconds = Math.max(0, Math.ceil((activeNpcQuest.deadline - Date.now()) / 1000));
      modal.querySelector('#roadNpcTimer').textContent = '⏱ ' + seconds + ' сек.';
      if (seconds <= 0) {
        activeNpcQuest.resolved = true;
        setNpcCooldown(activeNpcQuest.npc.id, 2 * 60 * 1000);
        Array.prototype.forEach.call(answerBox.querySelectorAll('button'), function(b){ b.disabled = true; });
        var feedback = modal.querySelector('#roadNpcFeedback');
        feedback.textContent = 'Время вышло. ' + activeNpcQuest.question.explanation;
        feedback.classList.add('error');
        modal.querySelector('#roadNpcTimer').textContent = '⌛ Время вышло';
        if (npcQuestTimer) { window.clearInterval(npcQuestTimer); npcQuestTimer = null; }
      }
    }, 250);
  }

  /* Draw ambient map animations (waterfall, river current, harbor boats bobbing, campfires, clouds, birds) */
  function drawAmbientWorldFX(t) {
    ctx.save();

    /* A. Waterfall cascading droplets & mist at (560, 0..95) */
    ctx.fillStyle = "rgba(230, 248, 255, 0,78)";
    animState.waterfallDrops.forEach(function(d) {
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.r * 0.8, d.r * 2.2, 0.12, 0, Math.PI * 2);
      ctx.fill();
    });
    /* Waterfall base foam pulse */
    for (var fi = 0; fi < 4; fi++) {
      var fx = 540 + fi * 11 + Math.sin(t * 3 + fi) * 2;
      var fr = 6 + Math.sin(t * 4.5 + fi * 1.3) * 2.2;
      ctx.fillStyle = "rgba(245, 252, 255, 0,55)";
      ctx.beginPath();
      ctx.arc(fx, 89, fr, 0, Math.PI * 2);
      ctx.fill();
    }

    /* B. Flowing river sparkles */
    animState.riverSparkles.forEach(function(s) {
      var pt = pointAlongPolyline(RIVER_WAYPOINTS, s.progress);
      var sx = pt.x + s.offset, sy = pt.y + s.offset * 0.4;
      /* Never let a highlight drift onto grass, road, a building pad, or a bank. */
      if (!isRiverWaterPixel(sx, sy)) return;
      var shimmer = 0.25 + 0.55 * Math.abs(Math.sin(t * 3.5 + s.progress * 15));
      ctx.fillStyle = "РГБА(225, 248, 255, " + shimmer.toFixed(2) + ')';
      ctx.beginPath();
      ctx.ellipse(sx, sy, s.size * 1.6, s.size * 0.7, -0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    /* C. Sea harbor wave ripples & boat bobbing highlights (bottom-right) */
    var boatCoords = [{x: 1125, y: 642}, {x: 1098, y: 582}, {x: 1228, y: 588}, {x: 995, y: 468}];
    boatCoords.forEach(function(b, idx) {
      var bob = Math.sin(t * 2.4 + idx * 1.5) * 4;
      ctx.strokeStyle = "РГБА(220, 245, 255, " + (0.35 + 0.2 * Math.sin(t * 2.4 + idx)) + ')';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y + 4, 18 + bob * 0.8, 7 + Math.abs(bob) * 0.3, -0.25, 0, Math.PI * 2);
      ctx.stroke();
    });

    /* D. Flickering campfires on the map (left forest camp at (190,425) & waterfall camp at (450,122)) */
    var fires = [{x: 190, y: 425}, {x: 450, y: 122}];
    fires.forEach(function(f, idx) {
      var flick = 1 + 0.22 * Math.sin(t * 9 + idx * 2.1);
      var grad = ctx.createRadialGradient(f.x, f.y, 2, f.x, f.y, 26 * flick);
      grad.addColorStop(0, "rgba(255, 230, 110, 0,65)");
      grad.addColorStop(0.5, "rgba(255, 140, 40, 0,28)");
      grad.addColorStop(1, 'rgba(255, 90, 20, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 26 * flick, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawSkyAndParticles(t) {
    ctx.save();

    /* 1. Smoke & Spark Particles */
    animState.smokePuffs.forEach(function(p) {
      var alpha = Math.max(0, (1 - p.life / p.maxLife) * 0.55);
      ctx.fillStyle = p.color + alpha.toFixed(2) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    /* 2. Construction Celebration Burst Particles */
    animState.buildBursts.forEach(function(b) {
      var alpha = Math.max(0, 1 - b.life / b.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    /* 3. Flying Birds (V-shaped wings flapping) */
    ctx.strokeStyle = "rgba(35, 45, 38, 0,65)";
    ctx.lineWidth = 1.8;
    animState.birds.forEach(function(b) {
      var flap = Math.sin(t * 7.5 + b.phase) * 4.5;
      ctx.beginPath();
      ctx.moveTo(b.x - 6, b.y - flap);
      ctx.quadraticCurveTo(b.x - 2, b.y - 2, b.x, b.y);
      ctx.quadraticCurveTo(b.x + 2, b.y - 2, b.x + 6, b.y - flap);
      ctx.stroke();
    });

    /* 4. Soft drifting cloud shadows across terrain */
    animState.clouds.forEach(function(c) {
      var grad = ctx.createRadialGradient(c.x, c.y, c.rx * 0.1, c.x, c.y, c.rx);
      grad.addColorStop(0, "rgba(12, 24, 18, 0,10)");
      grad.addColorStop(1, 'rgba(12, 24, 18, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawMap() {
    if (!ctx) return;
    var t = animState.time;
    ctx.clearRect(0, 0, MAP_W, MAP_H);

    /* 1. Draw the bitmap 2D landscape background */
    if (bgLoaded) {
      ctx.drawImage(bgImg, 0, 0, MAP_W, MAP_H);
    } else {
      ctx.fillStyle = '#264427';
      ctx.fillRect(0, 0, MAP_W, MAP_H);
    }

    /* 2. Draw ambient water, waterfall, boat waves & campfire flicker on the bitmap */
    if (animEnabled) {
      drawAmbientWorldFX(t);
    }

    /* 3. Draw interactive dependency roads & animated data couriers between building pads */
    graph.forEach(function(edge, edgeIdx) {
      var from = BY_ID[edge[0]], to = BY_ID[edge[1]];
      if (!from || !to) return;
      var fs = getStatus(from), ts = getStatus(to);
      ctx.save();
      ctx.beginPath();
      var mx = (from.wx + to.wx) / 2;
      var my = (from.wy + to.wy) / 2 - 18;
      ctx.moveTo(from.wx, from.wy);
      ctx.quadraticCurveTo(mx, my, to.wx, to.wy);

      if (fs.built && ts.built) {
        ctx.strokeStyle = "rgba(134, 238, 142, 0,85)";
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        ctx.stroke();

        /* Animated glowing data courier traveling along completed road */
        if (animEnabled) {
          var u = ((t * 0.28) + (edgeIdx * 0.17)) % 1;
          var cx = (1 - u) * (1 - u) * from.wx + 2 * (1 - u) * u * mx + u * u * to.wx;
          var cy = (1 - u) * (1 - u) * from.wy + 2 * (1 - u) * u * my + u * u * to.wy;
          ctx.fillStyle = '#fff59d';
          ctx.shadowColor = '#7ed68a';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(cx, cy, 4.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (fs.built && ts.unlocked) {
        ctx.strokeStyle = "rgba(255, 222, 112, 0,88)";
        ctx.lineWidth = 3.5;
        ctx.setLineDash([9, 6]);
        if (animEnabled) ctx.lineDashOffset = -t * 24;
        ctx.stroke();
      } else {
        ctx.strokeStyle = "rgba(42, 54, 44, 0,42)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 7]);
        ctx.stroke();
      }
      ctx.restore();
    });

    /* 4. Shroud inaccessible regions, then render the course sites on top so their locks remain discoverable. */
    drawFogOfWar(t);

    /* 5. Dynamically draw each building from datacraft-sprites.png onto its empty terrain pad */
    COURSES.forEach(function(c) {
      var st = getStatus(c), p = st.progress;
      var isSelected = selectedId === c.id, isHovered = hoveredId === c.id;
      var matchesFilter =
        currentFilter === 'all' ||
        (currentFilter === 'available' && st.unlocked && !st.built) ||
        (currentFilter === 'ready' && st.unlocked && st.courseComplete && !st.built);

      ctx.save();
      if (!matchesFilter) ctx.globalAlpha = 0.25;

      var wx = c.wx, wy = c.wy, rad = c.r || 56;
      var popScale = animState.buildPopScale[c.id] !== undefined ? animState.buildPopScale[c.id] : 1;
      /* Elastic overshoot curve for newly constructed building */
      var scaleMult = popScale < 1 ? (0.3 + 0.7 * Math.sin(popScale * Math.PI * 0.65) * 1.08) : 1;
      if (isHovered && animEnabled) scaleMult *= 1.04;

      var drawSize = rad * 2.15 * scaleMult;
      var sx = (c.spriteIdx % 4) * SPRITE_CELL;
      var sy = Math.floor(c.spriteIdx / 4) * SPRITE_CELL;

      /* Pulsing Selection / Ready / Hover aura under building */
      if (isSelected || isHovered || (st.unlocked && st.courseComplete && !st.built)) {
        var pulse = animEnabled ? (1 + 0.06 * Math.sin(t * 4.2)) : 1;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(wx, wy + 6, rad * 0.92 * pulse, rad * 0.54 * pulse, 0, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "rgba(168, 230, 161, 0,36)" : (st.courseComplete && !st.built ? "rgba(245, 211, 126, 0,42)" : "rgba(255, 255, 255, 0,24)");
        ctx.fill();
        ctx.lineWidth = isSelected ? 3.5 : 2.5;
        ctx.strokeStyle = isSelected ? '#a8e6a1' : (st.courseComplete && !st.built ? '#f5d37e' : '#ffffff');
        ctx.stroke();
        ctx.restore();
      }

      if (spriteLoaded) {
        var bobBadge = animEnabled ? Math.sin(t * 3.8 + c.spriteIdx) * 3.5 : 0;
        if (st.built) {
          /* Full constructed building from sprite sheet */
          ctx.drawImage(spriteImg, sx, sy, SPRITE_CELL, SPRITE_CELL, wx - drawSize / 2, wy - drawSize * 0.58, drawSize, drawSize);
          if (animEnabled) drawBuildingSpecificFX(c, st, t);
          drawStatusBadgeFromSheet(1, wx + rad * 0.62, wy - rad * 0.55 + bobBadge * 0.4, 28);
        } else if (st.unlocked && st.courseComplete) {
          /* Course finished -> ready to pay & construct */
          ctx.save();
          ctx.filter = "сепия(35%) насыщенность(155%) яркость(1,08)";
          ctx.globalAlpha = matchesFilter ? 0.94 : 0.25;
          ctx.drawImage(spriteImg, sx, sy, SPRITE_CELL, SPRITE_CELL, wx - drawSize / 2, wy - drawSize * 0.58, drawSize, drawSize);
          ctx.restore();
          drawStatusBadgeFromSheet(3, wx + rad * 0.62, wy - rad * 0.55 + bobBadge, 34);
        } else if (st.unlocked) {
          /* In progress -> wooden construction plot stakes + translucent building blueprint */
          drawStatusBadgeFromSheet(0, wx, wy + 2, rad * 1.45);
          ctx.save();
          var breath = animEnabled ? (0.05 * Math.sin(t * 2.6 + c.spriteIdx)) : 0;
          ctx.globalAlpha = (0.38 + (p.percent / 100) * 0.45 + breath) * (matchesFilter ? 1 : 0.3);
          ctx.filter = "насыщенность(65%) контрастность(95%)";
          ctx.drawImage(spriteImg, sx, sy, SPRITE_CELL, SPRITE_CELL, wx - drawSize / 2, wy - drawSize * 0.58, drawSize, drawSize);
          ctx.restore();
        } else {
          /* Locked -> empty foundation plot on bitmap + subtle construction stakes + Padlock badge */
          ctx.save();
          ctx.globalAlpha = matchesFilter ? 0.55 : 0.2;
          drawStatusBadgeFromSheet(0, wx, wy + 4, rad * 1.25);
          ctx.restore();
          drawStatusBadgeFromSheet(2, wx, wy - 4, 30);
        }
      }

      /* 5. Compact nameplate & progress bar banner below each site */
      var plateW = 128, plateH = 36;
      var px = wx - plateW / 2, py = wy + rad * 0.36;
      var borderCol = st.built ? '#7ed68a' : (st.unlocked && st.courseComplete ? '#f5d37e' : (st.unlocked ? '#8ecae6' : '#5c6e60'));
      var bgCol = st.built ? "rgba(20, 48, 29, 0,92)" : (st.unlocked && st.courseComplete ? "rgba(58, 45, 18, 0,94)" : (st.unlocked ? "rgba(22, 39, 34, 0,92)" : "rgba(20, 28, 23, 0,86)"));

      ctx.fillStyle = bgCol;
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = isSelected ? 2.5 : 1.4;
      roundRect(ctx, px, py, plateW, plateH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#eff8ec';
      ctx.font = "800 10пикселей системный интерфейс, -Яблоко-система, без засечек";
      ctx.fillText(c.short, wx, py + 13);

      /* Mini progress bar inside nameplate */
      var barW = plateW - 16, barX = px + 8, barY = py + 18;
      ctx.fillStyle = "rgba(10, 18, 13, 0,85)";
      roundRect(ctx, barX, barY, barW, 5, 2.5);
      ctx.fill();
      if (p.percent > 0 || st.built) {
        var fillPct = st.built ? 100 : p.percent;
        ctx.fillStyle = borderCol;
        roundRect(ctx, barX, barY, barW * fillPct / 100, 5, 2.5);
        ctx.fill();
      }

      /* Bottom status / coin cost line */
      ctx.font = "700 9пикселей системный интерфейс, -Яблоко-система, без засечек";
      ctx.fillStyle = st.built ? '#a8eeae' : (st.unlocked && st.courseComplete ? '#ffe39c' : '#b8cbb9');
      var metaLabel = st.built ? '✓ Построено' : (st.unlocked && st.courseComplete ? '🔨 Строить: ' + c.cost + ' 🪙' : p.done + '/' + p.total + ' · ' + c.cost + ' 🪙');
      ctx.fillText(metaLabel, wx, py + 31);

      ctx.restore();
    });

    /* 6. Foreground atmospheric layer: smoke puffs, celebration bursts, birds & cloud shadows */
    if (animEnabled) {
      drawSkyAndParticles(t);
    }

    /* Keep walking NPCs in the foreground: building sprites, their labels, and fog
       previously painted over them, making the characters invisible on the map. */
    drawRoadNPCs(t);
    drawFloatingTexts();
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }

  function selectCourse(id, shouldScroll) {
    if (!BY_ID[id]) return;
    selectedId = id;
    renderAll();
    if (shouldScroll && detail) detail.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  }

  function renderAll() {
    cachedNpcRoads = null;
    if (window.DataCraftEconomy) window.DataCraftEconomy.sync();
    var w = walletState(), coinLabel = document.getElementById('curriculumCoins');
    scanWalletTransactions(w);
    if (coinLabel) coinLabel.textContent = '🪙 ' + (w.balance || 0) + ' монет';
    drawMap();
    renderCourseList();
    renderSpecializations();
    renderDetail();
  }

  function pointFromEvent(e) {
    var rect = canvas.getBoundingClientRect();
    return {x: (e.clientX - rect.left) * MAP_W / rect.width, y: (e.clientY - rect.top) * MAP_H / rect.height};
  }

  function findCourseAtPoint(p) {
    for (var i = COURSES.length - 1; i >= 0; i--) {
      var c = COURSES[i];
      var dist = Math.hypot(p.x - c.wx, p.y - c.wy);
      var inPlate = p.x >= c.wx - 66 && p.x <= c.wx + 66 && p.y >= c.wy + c.r * 0.3 && p.y <= c.wy + c.r * 0.36 + 40;
      if (dist <= (c.r || 56) * 0.95 || inPlate) return c;
    }
    return null;
  }

  canvas.addEventListener('click', function(e) {
    var point = pointFromEvent(e);
    var npc = findNpcAtPoint(point);
    if (npc) { openNpcQuest(npc); return; }
    var hit = findCourseAtPoint(point);
    if (hit) selectCourse(hit.id, false);
  });

  canvas.addEventListener('mousemove', function(e) {
    var point = pointFromEvent(e);
    var npc = findNpcAtPoint(point);
    var hit = npc ? null : findCourseAtPoint(point);
    var newNpcHover = npc ? npc.id : null;
    var newHover = hit ? hit.id : null;
    if (newNpcHover !== hoveredNpcId || newHover !== hoveredId) {
      hoveredNpcId = newNpcHover;
      hoveredId = newHover;
      canvas.style.cursor = (hoveredNpcId || hoveredId) ? 'pointer' : 'grab';
      if (!animEnabled) drawMap();
    }
  });

  canvas.addEventListener('mouseleave', function() {
    if (hoveredId !== null || hoveredNpcId !== null) {
      hoveredId = null;
      hoveredNpcId = null;
      if (!animEnabled) drawMap();
    }
  });

  canvas.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCourse(selectedId, true); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault(); var i = COURSES.findIndex(function(c){return c.id === selectedId;}); selectCourse(COURSES[(i + 1) % COURSES.length].id, false);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault(); var j = COURSES.findIndex(function(c){return c.id === selectedId;}); selectCourse(COURSES[(j - 1 + COURSES.length) % COURSES.length].id, false);
    }
  });

  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      currentFilter = btn.getAttribute('data-filter') || 'all';
      document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.toggle('active', b === btn); });
      if (!animEnabled) drawMap();
    });
  });

  var toggleAnimBtn = document.getElementById('curriculumToggleAnim');
  if (toggleAnimBtn) {
    toggleAnimBtn.textContent = animEnabled ? '✨ Живой мир: ВКЛ' : '✨ Живой мир: ВЫКЛ';
    toggleAnimBtn.addEventListener('click', function() {
      animEnabled = !animEnabled;
      toggleAnimBtn.textContent = animEnabled ? '✨ Живой мир: ВКЛ' : '✨ Живой мир: ВЫКЛ';
      drawMap();
    });
  }

  document.getElementById('curriculumRefresh').addEventListener('click', function(){ renderAll(); });
  document.getElementById('curriculumNext').addEventListener('click', function(){
    var next = nextAvailable(); selectCourse(next.id, true); showToastIfAvailable('Следующий доступный этап: ' + next.title);
  });
  window.addEventListener('focus', renderAll);
  window.addEventListener('pageshow', renderAll);
  /* Wallet sync may emit one event per reward; coalesce them to avoid recursive renderAll() calls. */
  window.addEventListener('datacraft:wallet-updated', function() {
    if (walletRefreshScheduled) return;
    walletRefreshScheduled = true;
    window.setTimeout(function() {
      walletRefreshScheduled = false;
      renderAll();
    }, 0);
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('roadNpcQuestModal') && document.getElementById('roadNpcQuestModal').classList.contains('open')) closeNpcQuest();
  });
  window.addEventListener('storage', function(e){
    if (!e.key || e.key.indexOf('apk-') === 0 || ['sqlkit-v1','epk','ppk','pbikt-v1','spk','tpk','clk-v1','fmk-v1','sim2','ipk','datacraft-wallet-v1'].indexOf(e.key) >= 0) renderAll();
  });
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) renderAll(); });

  function showToastIfAvailable(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message; toast.classList.add('show');
    window.setTimeout(function(){ toast.classList.remove('show'); }, 2600);
  }


  function buildLessonAgentContext(button) {
    var courseTitle = button.getAttribute('data-course-title') || 'Курс не указан';
    var courseId = button.getAttribute('data-course-id') || '';
    var lessonTitle = button.getAttribute('data-lesson-title') || 'Урок не указан';
    var unit = button.getAttribute('data-lesson-unit') || '';
    var goal = button.getAttribute('data-lesson-goal') || '';
    var lessonId = button.getAttribute('data-lesson-id') || '';
    var parentId = button.getAttribute('data-parent-id') || '';
    var done = button.getAttribute('data-lesson-done') === 'true';
    var path = button.getAttribute('data-course-path') || '';
    var materialUrl = window.location.href;
    try { if (path) materialUrl = new URL(path, window.location.href).href; } catch (e) {}
    var lines = [
      'КОНТЕКСТ ДЛЯ ИИ-АГЕНТА',
      "Проект: Подготовительный комплект для аналитика — ДатаКрафт.",
      'Курс: ' + courseTitle,
      courseId ? 'Идентификатор курса: ' + courseId : '',
      unit ? 'Раздел: ' + unit : '',
      'Урок: ' + lessonTitle,
      lessonId ? 'Идентификатор урока: ' + lessonId : '',
      parentId ? 'Родительский кейс/раздел: ' + parentId : '',
      goal ? 'Цель урока: ' + goal : '',
      'Статус: ' + (done ? 'отмечен как пройденный в учебном плане' : 'ещё не отмечен как пройденный'),
      'Страница учебного материала: ' + materialUrl,
      '',
      'Задача для агента:',
      'Помоги мне изучить именно этот урок на русском языке. Сначала кратко объясни основные понятия, затем предложи пошаговый разбор и практическое задание из реальной работы аналитика. Не решай всё за меня: задавай уточняющие вопросы, проверяй мои ответы и указывай на ошибки. Учитывай предыдущие знания, если я их опишу.',
      'Если ты не можешь открыть страницу учебного материала, не утверждай, что прочитал её: попроси меня вставить нужный фрагмент. Сохраняй названия команд, функций и синтаксис без перевода.'
    ];
    return lines.filter(function(line){ return line !== ''; }).join('\n');
  }

  function copyTextWithFallback(text, onSuccess, onFailure) {
    function fallback() {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      area.style.pointerEvents = 'none';
      document.body.appendChild(area);
      area.focus();
      area.select();
      var copied = false;
      try { copied = document.execCommand('copy'); } catch (e) {}
      area.remove();
      if (copied) { onSuccess(); return; }
      onFailure();
      window.prompt('Автоматическое копирование недоступно. Скопируй контекст из этого поля:', text);
    }
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(onSuccess).catch(fallback);
    } else {
      fallback();
    }
  }

  document.addEventListener('click', function(e) {
    var button = e.target && e.target.closest ? e.target.closest('.curriculum-copy-context') : null;
    if (!button) return;
    e.preventDefault();
    var text = buildLessonAgentContext(button);
    var originalLabel = button.textContent;
    button.disabled = true;
    copyTextWithFallback(text, function() {
      button.textContent = '✓ Скопировано';
      button.classList.add('copied');
      showToastIfAvailable('Контекст урока скопирован. Вставь его в окно ИИ-агента.');
      window.setTimeout(function() {
        button.textContent = originalLabel;
        button.classList.remove('copied');
        button.disabled = false;
      }, 1800);
    }, function() {
      button.disabled = false;
      button.textContent = originalLabel;
    });
  });

  /* Main 60 FPS Animation Loop for the Curriculum World Canvas */
  function animateWorldLoop(ts) {
    if (!animState.lastTs) animState.lastTs = ts;
    var dt = Math.min(0.05, (ts - animState.lastTs) / 1000);
    animState.lastTs = ts;
    if (animEnabled && !document.hidden) {
      updateAnimations(dt);
      drawMap();
    }
    window.requestAnimationFrame(animateWorldLoop);
  }

  renderAll();
  window.requestAnimationFrame(animateWorldLoop);
})();
