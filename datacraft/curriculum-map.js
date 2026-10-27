/* DataCraft curriculum map: buildings are earned by completing real courses. */
(function () {
  'use strict';

  var MAP_W = 1320, MAP_H = 700, NODE_W = 205, NODE_H = 88;
  var STORE = {
    wallet: 'datacraft-wallet-v1',
    foundations: 'apk-foundations-progress-v1',
    quality: 'apk-quality-score',
    sql: 'sqlkit-v1',
    excel: 'epk',
    python: 'ppk',
    charts: 'clk-v1',
    stats: 'spk',
    forecasting: 'fmk-v1',
    powerbi: 'pbikt-v1',
    tableau: 'tpk',
    decision: 'apk-decision-thinking-progress-v1',
    portfolio: 'apk-portfolio-',
    simulator: 'sim2',
    interview: 'ipk',
    final: 'apk-final'
  };

  var COURSES = [
    {id:'foundations',cost:5,title:'Основы аналитики данных',short:'Школа исследователя',icon:'🏕️',path:'../foundations/',tracker:'foundations',total:8,unit:'уроков',stage:0,x:28,y:310,desc:'Базовая грамотность: строки и столбцы, типы данных, ключи, метрики, качество и постановка бизнес-вопроса.',requires:[]},
    {id:'quality',cost:8,title:'Качество данных',short:'Лаборатория очистки',icon:'🧪',path:'../data-quality/',tracker:'quality',total:5,unit:'категорий',stage:1,x:280,y:310,desc:'Научись обнаруживать пропуски, дубликаты, ошибки форматов и подозрительные значения, не удаляя данные без проверки.',requires:['foundations']},
    {id:'sql',cost:40,title:'SQL',short:'Кузница SQL',icon:'⚙️',path:'../sql/',tracker:'sql',total:48,unit:'уроков',stage:2,x:532,y:80,desc:'От SELECT и фильтрации к JOIN, агрегациям, CTE, оконным функциям и проверке качества результата.',requires:['foundations','quality']},
    {id:'excel',cost:40,title:'Excel',short:'Мастерская таблиц',icon:'📗',path:'../excel/',tracker:'excel',total:51,unit:'уроков',stage:2,x:532,y:220,desc:'Формулы, поиск, очистка, сводные таблицы, проверка вычислений и аналитические отчёты.',requires:['foundations','quality']},
    {id:'charts',cost:12,title:'Грамотность графиков',short:'Башня визуализации',icon:'📈',path:'../chart-literacy/',tracker:'charts',total:13,unit:'уроков',stage:2,x:532,y:360,desc:'Выбор подходящего графика, правильное чтение визуализаций и поиск вводящих в заблуждение представлений.',requires:['foundations','quality']},
    {id:'python',cost:30,title:'Python и pandas',short:'Лес автоматизации',icon:'🐍',path:'../python/',tracker:'python',total:42,unit:'уроков',stage:3,x:782,y:60,desc:'Код для повторяемой обработки данных: базовый Python, pandas, преобразования, объединение и проверка результатов.',requires:['sql','excel']},
    {id:'stats',cost:20,title:'Статистика',short:'Обсерватория данных',icon:'🔭',path:'../stats/',tracker:'stats',total:16,unit:'уроков',stage:3,x:782,y:180,desc:'Распределения, выборки, интервалы, A/B-тесты, p-значения и осторожная интерпретация доказательств.',requires:['sql','excel']},
    {id:'forecasting',cost:18,title:'Прогнозирование',short:'Башня прогнозов',icon:'🌦️',path:'../forecasting/',tracker:'forecasting',total:13,unit:'уроков',stage:3,x:782,y:300,desc:'Тренд, сезонность, простые прогнозы, проверка точности и объяснение неопределённости.',requires:['stats','charts']},
    {id:'powerbi',cost:25,title:'Power BI',short:'Центр BI',icon:'📊',path:'../powerbi/',tracker:'powerbi',total:39,unit:'уроков',stage:3,x:782,y:420,desc:'Модель данных, связи, меры DAX, визуализация и интерактивные отчёты для бизнес-пользователей.',requires:['sql','excel','charts']},
    {id:'tableau',cost:25,title:'Tableau',short:'Студия дашбордов',icon:'🟦',path:'../tableau/',tracker:'tableau',total:32,unit:'уроков',stage:3,x:782,y:540,desc:'Работа с измерениями и мерами, визуальные исследования, фильтры, наборы, иерархии и дашборды.',requires:['sql','excel','charts']},
    {id:'decision',cost:18,title:'Логика и решения',short:'Зал гипотез',icon:'🧠',path:'../decision-making/',tracker:'decision',total:6,unit:'уроков',stage:4,x:1030,y:60,desc:'Постановка задачи, поиск причин, альтернативные гипотезы, оценка рисков и выбор следующего действия.',requires:['quality','stats','charts']},
    {id:'portfolio',cost:30,title:'Проекты для портфолио',short:'Гильдия проектов',icon:'🧰',path:'../portfolio-projects/',tracker:'portfolio',total:3,unit:'кейса',stage:4,x:1030,y:190,desc:'Три практических кейса: продажи, служба поддержки и маркетинг. Каждый должен включать проверку данных, метрики и обоснованный вывод.',requires:['quality','sql','excel','decision'],anyOf:['powerbi','tableau']},
    {id:'simulator',cost:20,title:'Симулятор аналитика',short:'Рабочее место',icon:'🧑‍💻',path:'../simulator/',tracker:'simulator',total:10,unit:'задач на проверке',stage:4,x:1030,y:320,desc:'Сценарии из работы младшего аналитика: понять запрос, проверить данные, подготовить решение и получить обратную связь.',requires:['portfolio']},
    {id:'interview',cost:20,title:'Подготовка к собеседованию',short:'Арена интервью',icon:'🎤',path:'../interview/',tracker:'interview',total:16,unit:'уроков',stage:4,x:1030,y:450,desc:'Объяснение решений, поведенческие вопросы, работа с неоднозначностью и коммуникация с нетехнической аудиторией.',requires:['sql','excel','decision','portfolio']},
    {id:'final',cost:40,title:'Итоговый экзамен',short:'Цитадель аналитика',icon:'🏰',path:'../final/',tracker:'final',total:1,unit:'экзамен',stage:4,x:1030,y:580,desc:'Финальная проверка знаний по Excel, SQL, Python, Tableau, статистике, Power BI и собеседованиям. До неё должны быть завершены все основные ветки.',requires:['foundations','quality','sql','excel','python','charts','stats','forecasting','powerbi','tableau','decision','portfolio','simulator','interview']}
  ];

  var SPECIALIZATIONS = [
    {id:'project-studio',title:'Проектная мастерская',icon:'🗂️',path:'../projects/',tracker:'projectStudio',catalogId:'projectStudio',total:4,unit:'этапов',cost:18,requires:['portfolio'],desc:'Спланируй собственный проект: сформулируй бизнес-вопрос, критерии, этапы анализа и презентацию.'},
    {id:'excel-cert',cost:12,title:'Сертификат Excel MO-210',icon:'📗',path:'../excel-cert/',storage:'apk-excelcert',requires:['excel'],desc:'Отдельная подготовка к сертификационному экзамену Excel.'},
    {id:'excel-expert',cost:15,catalogId:'excel-expert-cert',title:'Excel Expert MO-211',icon:'🏅',path:'../excel-expert-cert/',storage:'apk-excelexpertcert',requires:['excel-cert'],desc:'Продвинутый уровень Excel после базовой сертификационной ветки.'},
    {id:'powerbi-cert',cost:15,title:'Power BI PL-300',icon:'📊',path:'../powerbi-cert/',storage:'apk-pbicert',requires:['powerbi'],desc:'Дополнительная подготовка к сертификации Power BI.'},
    {id:'tableau-cert',cost:15,title:'Tableau Desktop',icon:'🟦',path:'../tableau-cert/',storage:'apk-tabcert',requires:['tableau'],desc:'Дополнительная подготовка к сертификации Tableau.'},
    {id:'alteryx-cert',cost:12,title:'Alteryx Foundation',icon:'🔄',path:'../alteryx-cert/',storage:'apk-alteryxcert',requires:['excel','quality'],desc:'Автоматизация подготовки и преобразования данных.'},
    {id:'azure-data-cert',cost:12,title:'Azure Data Fundamentals DP-900',icon:'☁️',path:'../azure-data-cert/',storage:'apk-dp900cert',requires:['foundations','sql'],desc:'Базовые понятия данных и облачных сервисов Azure.'},
    {id:'databricks-cert',cost:15,title:'Databricks Lakehouse',icon:'🧱',path:'../databricks-cert/',storage:'apk-dbxcert',requires:['sql','python'],desc:'Дополнительный маршрут по lakehouse и аналитической платформе.'},
    {id:'ga4-cert',cost:12,title:'Google Analytics 4',icon:'📣',path:'../ga4-cert/',storage:'apk-ga4cert',requires:['stats','charts'],desc:'Веб-аналитика, события, конверсии и интерпретация поведения пользователей.'},
    {id:'docusign',cost:12,catalogId:'docusign-cert',title:'DocuSign eSignature Admin',icon:'✍️',path:'../docusign-cert/',storage:'apk-dscert',requires:['foundations'],desc:'Отдельная профессиональная ветка администрирования eSignature.'},
    {id:'docusign-clm',cost:14,catalogId:'docusign-clm-cert',title:'DocuSign CLM Admin',icon:'📄',path:'../docusign-clm-cert/',storage:'apk-dsclmcert',requires:['docusign'],desc:'Управление жизненным циклом договоров.'},
    {id:'docusign-clm-workflow',cost:15,catalogId:'docusign-clm-workflow-cert',title:'DocuSign CLM Workflow',icon:'🔗',path:'../docusign-clm-workflow-cert/',storage:'apk-dsclmwfcert',requires:['docusign-clm'],desc:'Продвинутая специализация по рабочим процессам CLM.'},
    {id:'docusign-clm-implementation',cost:15,catalogId:'docusign-clm-implementation-cert',title:'DocuSign CLM Implementation',icon:'🛠️',path:'../docusign-clm-implementation-cert/',storage:'apk-dsclmimplcert',requires:['docusign-clm'],desc:'Внедрение и настройка процессов CLM.'},
    {id:'docusign-org',cost:14,catalogId:'docusign-org-cert',title:'DocuSign Organization Management',icon:'🏢',path:'../docusign-org-cert/',storage:'apk-dsorgcert',requires:['docusign'],desc:'Отдельная специализация по управлению организацией DocuSign.'}
  ];

  var BY_ID = {}, ALL = [], selectedId = 'foundations', graph = [
    ['foundations','quality'],['quality','sql'],['quality','excel'],['quality','charts'],
    ['sql','python'],['excel','python'],['sql','stats'],['excel','stats'],
    ['charts','forecasting'],['stats','forecasting'],
    ['sql','powerbi'],['excel','powerbi'],['charts','powerbi'],
    ['sql','tableau'],['excel','tableau'],['charts','tableau'],
    ['quality','decision'],['stats','decision'],['charts','decision'],
    ['quality','portfolio'],['sql','portfolio'],['excel','portfolio'],['powerbi','portfolio'],['tableau','portfolio'],['decision','portfolio'],
    ['portfolio','simulator'],['portfolio','interview'],['decision','interview'],['interview','final']
  ];
  COURSES.forEach(function(c){BY_ID[c.id]=c;ALL.push(c);});
  SPECIALIZATIONS.forEach(function(c){if(!c.tracker){c.tracker='cert';c.total=1;c.unit='экзамен';}BY_ID[c.id]=c;ALL.push(c);});

  var root = document.createElement('section');
  root.id = 'curriculumPanel';
  root.innerHTML =
    '<div class="curriculum-shell">' +
      '<header class="curriculum-head">' +
        '<div><h2 class="curriculum-title">🗺️ Карта развития: здания открываются за знания</h2>' +
        '<p class="curriculum-lead">Каждая постройка — это реальный учебный курс. Закрытые здания показывают обязательные предыдущие курсы, доступные ведут к урокам, а после прохождения всей программы здание становится построенным. Карта проверяет сохранённый прогресс уроков в браузере.</p></div>' +
        '<div class="curriculum-top-actions"><span class="curriculum-coins" id="curriculumCoins">🪙 — монет</span><button type="button" class="curriculum-action" id="curriculumRefresh">↻ Обновить прогресс</button><button type="button" class="curriculum-action" id="curriculumNext">▶ Следующий доступный курс</button></div>' +
      '</header>' +
      '<div class="curriculum-map-scroll"><canvas id="curriculumWorld" width="' + MAP_W + '" height="' + MAP_H + '" tabindex="0" role="img" aria-label="Карта учебного мира DataCraft. Нажми на здание, чтобы посмотреть требования и открыть курс."></canvas></div>' +
      '<div class="curriculum-legend"><span><b class="curriculum-symbol" style="color:#a7e39c">✓</b>Построено: курс пройден</span><span><b class="curriculum-symbol" style="color:#f4d47d">◆</b>Можно строить: доступен курс</span><span><b class="curriculum-symbol" style="color:#9aa99d">🔒</b>Закрыто: не хватает предыдущих уроков</span><span>Полоска внутри здания показывает прохождение курса</span></div>' +
      '<div class="curriculum-lower">' +
        '<section class="curriculum-detail" id="curriculumDetail" aria-live="polite"></section>' +
        '<section class="curriculum-list-wrap"><div class="curriculum-list-head"><h3>Все основные учебные здания</h3><span>15 курсов · от первого шага до выпускного экзамена</span></div><div class="curriculum-course-list" id="curriculumCourseList"></div></section>' +
      '</div>' +
      '<details class="curriculum-section"><summary>Дополнительные учебные модули, специализации и сертификаты <span>14 веток · необязательны для основного выпуска</span></summary><div class="curriculum-specializations" id="curriculumSpecializations"></div></details>' +
      '<div class="curriculum-library"><p><strong>📚 Полевая библиотека.</strong> Справочники помогают между заданиями, но не заменяют прохождение курса и не открывают здание сами по себе.</p><a href="../guides/">Открыть все справочники →</a></div>' +
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
  var nodeById = {};
  COURSES.forEach(function(c){nodeById[c.id]=c;});

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
    var all=window.DataCraftLessonCatalog||{};
    var key=course.catalogId||course.tracker||course.id;
    if(course.id==='portfolio')return all.portfolio||[];
    if(course.id==='project-studio')return all.projectStudio||[];
    return all[key]||all[course.id]||[];
  }
  function readScore(key) {
    try { return localStorage.getItem(key)||''; } catch(e) { return ''; }
  }
  function getProgress(course) {
    var s,count=0,total=courseCatalog(course).length||course.total||1,label=course.unit||'уроков',complete=false;
    switch(course.tracker) {
      case 'foundations':
        s=readJSON(STORE.foundations)||{};
        count=countTrueMap(s,function(k){return /^\d+$/.test(k);});
        break;
      case 'quality': {
        var passed=readJSON('apk-quality-passed-v1');
        var raw=readScore(STORE.quality);
        var match=/^(\d+)\s*\/\s*(\d+)$/.exec(raw);
        count=Array.isArray(passed)?new Set(passed).size:(match?Math.min(5,Number(match[1])):0);
        total=5;label='практических задач';
        complete=raw==='5/5';
        break;
      }
      case 'sql':
        s=readJSON(STORE.sql)||{};count=uniqueArrayCount(s.doneLessons);break;
      case 'excel':
        s=readJSON(STORE.excel)||{};count=uniqueArrayCount(s.lessonsDone);break;
      case 'python':
        s=readJSON(STORE.python)||{};count=uniqueArrayCount(s.lessonsDone);break;
      case 'powerbi':
        s=readJSON(STORE.powerbi)||{};count=uniqueArrayCount(s.doneLessons);break;
      case 'charts':
      case 'stats':
      case 'forecasting':
      case 'tableau':
        s=readJSON(STORE[course.tracker])||{};count=countTrueLessonKeys(s.done||{});break;
      case 'decision':
        s=readJSON(STORE.decision)||[];
        count=Array.isArray(s)?new Set(s.filter(function(id){return /^[1-6]$/.test(String(id));}).map(String)).size:0;
        break;
      case 'portfolio': {
        var cases=['sales','support','marketing'];
        count=cases.filter(function(id){
          var checks=readJSON(STORE.portfolio+id+'-checks');
          return Array.isArray(checks)&&new Set(checks.filter(function(n){return Number.isInteger(n)&&n>=0&&n<6;})).size>=6;
        }).length;
        total=3;label='кейса';break;
      }
      case 'simulator':
        s=readJSON(STORE.simulator)||{};
        count=s.reviews&&typeof s.reviews==='object'?Object.keys(s.reviews).filter(function(k){return !!s.reviews[k];}).length:0;
        total=10;label='проверенных задач';break;
      case 'interview':
        s=readJSON(STORE.interview)||{};
        count=countTrueMap(s.lessonsComplete);
        total=courseCatalog(course).length||16;label='уроков';break;
      case 'final':
        s=readJSON(STORE.final)||{};
        count=s.submittedSections&&typeof s.submittedSections==='object'?countTrueMap(s.submittedSections):0;
        total=courseCatalog(course).length||7;label='разделов экзамена';
        complete=!!s.submitted;
        break;
      case 'projectStudio': {
        s=readJSON('apk-projects-v1')||{};
        var projects=Array.isArray(s.projects)?s.projects:[];
        count=0;
        projects.forEach(function(p){
          if(!p)return;
          var order=['scope','plan','build','present'],idx=order.indexOf(p.phase);
          var done=Math.max(0,idx);
          var cl=p.present&&Array.isArray(p.present.checklist)?p.present.checklist:[];
          if(p.phase==='present'&&cl.length&&cl.every(function(item){return item&&item.done;}))done=4;
          count=Math.max(count,done);
        });
        total=4;label='этапов';
        complete=count>=4;break;
      }
      case 'cert': {
        s=readJSON(course.storage)||{};
        count=s.submitted?2:(s.openSections&&Object.keys(s.openSections).length?1:0);
        total=2;label='этапа подготовки';
        complete=!!s.submitted;break;
      }
      default: count=0;
    }
    total=Math.max(1,Number(total)||1);
    count=Math.max(0,Math.min(total,Number(count)||0));
    if(course.tracker!=='quality'&&course.tracker!=='final'&&course.tracker!=='projectStudio'&&course.tracker!=='cert')complete=count>=total;
    if(course.tracker==='portfolio')complete=count>=3;
    if(course.tracker==='simulator')complete=count>=10;
    return {done:count,total:total,label:label,complete:complete,percent:Math.round(count/total*100)};
  }
  function getDependencies(course) {
    var requires=course.requires||[],anyOf=course.anyOf||[];
    var missing=requires.filter(function(id){return !isBuilt(id);});
    var anyComplete=!anyOf.length||anyOf.some(function(id){return isBuilt(id);});
    return {requires:requires,anyOf:anyOf,missing:missing,anyComplete:anyComplete,unlocked:missing.length===0&&anyComplete};
  }
  function walletState() {
    if(window.DataCraftEconomy)return window.DataCraftEconomy.sync();
    return {balance:0,totalEarned:0,totalSpent:0,buildings:{}};
  }
  function isBuilt(id) {
    var w=walletState();
    return !!(w.buildings&&w.buildings[id]);
  }
  function getStatus(course) {
    var progress=getProgress(course),deps=getDependencies(course),built=isBuilt(course.id);
    var unlocked=built||deps.unlocked;
    var ready=progress.complete;
    var state=built?'done':(!unlocked?'locked':(ready?'ready':'available'));
    return {progress:progress,dependencies:deps,done:built,built:built,courseComplete:ready,unlocked:unlocked,state:state,cost:course.cost||0,balance:walletState().balance||0};
  }
  function courseName(id) { return BY_ID[id] ? BY_ID[id].short || BY_ID[id].title : id; }
  function safeText(s) { return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function formatProgress(p) { return p.done + ' / ' + p.total + ' ' + p.label; }
  function statusText(st, course) {
    if(st.built)return 'Здание построено — доступ к следующему этапу открыт';
    if(st.courseComplete)return 'Курс пройден — осталось оплатить строительство';
    if(st.unlocked)return 'Учебный маршрут доступен';
    return 'Закрыто: сначала построй предыдущие здания';
  }
  function getCourseState(course) {
    var w=readJSON(course.storage)||(course.tracker==='cert'?{}:{});
    return w||{};
  }
  function isLessonComplete(course,lesson,parentId) {
    var s,arr;
    switch(course.tracker) {
      case 'foundations':
        s=readJSON(STORE.foundations)||{};return s[String(lesson.id)]===true;
      case 'quality': {
        arr=readJSON('apk-quality-passed-v1');
        if(Array.isArray(arr))return arr.indexOf(String(lesson.id))!==-1;
        return readScore(STORE.quality)==='5/5';
      }
      case 'sql':
        s=readJSON(STORE.sql)||{};return Array.isArray(s.doneLessons)&&s.doneLessons.map(String).indexOf(String(lesson.id))!==-1;
      case 'excel':
        s=readJSON(STORE.excel)||{};return Array.isArray(s.lessonsDone)&&s.lessonsDone.map(String).indexOf(String(lesson.id))!==-1;
      case 'python':
        s=readJSON(STORE.python)||{};return Array.isArray(s.lessonsDone)&&s.lessonsDone.map(String).indexOf(String(lesson.id))!==-1;
      case 'powerbi':
        s=readJSON(STORE.powerbi)||{};return Array.isArray(s.doneLessons)&&s.doneLessons.map(String).indexOf(String(lesson.id))!==-1;
      case 'charts':
      case 'stats':
      case 'forecasting':
      case 'tableau':
        s=readJSON(STORE[course.tracker])||{};return !!(s.done&&s.done['lesson'+lesson.id]);
      case 'decision':
        s=readJSON(STORE.decision)||[];return Array.isArray(s)&&s.map(String).indexOf(String(lesson.id))!==-1;
      case 'portfolio':
        arr=readJSON(STORE.portfolio+parentId+'-checks')||[];
        return Array.isArray(arr)&&arr.map(String).indexOf(String(lesson.id))!==-1;
      case 'simulator':
        s=readJSON(STORE.simulator)||{};
        return !!(s.reviews&&s.reviews[lesson.id]);
      case 'interview':
        s=readJSON(STORE.interview)||{};
        return !!(s.lessonsComplete&&s.lessonsComplete[String(lesson.id)]);
      case 'final':
        s=readJSON(STORE.final)||{};
        return !!(s.submittedSections&&s.submittedSections[lesson.id]);
      case 'projectStudio': {
        s=readJSON('apk-projects-v1')||{};
        var projects=Array.isArray(s.projects)?s.projects:[];
        var phaseOrder=['scope','plan','build','present'],target=phaseOrder.indexOf(String(lesson.id));
        return projects.some(function(p){
          if(!p)return false;
          var current=phaseOrder.indexOf(p.phase);
          if(target<current)return true;
          if(lesson.id==='present'&&p.phase==='present'){
            var cl=p.present&&Array.isArray(p.present.checklist)?p.present.checklist:[];
            return cl.length>0&&cl.every(function(item){return item&&item.done;});
          }
          return false;
        });
      }
      case 'cert':
        s=readJSON(course.storage)||{};
        if(lesson.id==='guide')return !!(s.openSections&&Object.keys(s.openSections).length);
        if(lesson.id==='exam-submit')return !!s.submitted;
        return false;
      default:
        return false;
    }
  }
  function lessonListHTML(course) {
    var catalog=courseCatalog(course),tracker=course.tracker||course.id;
    if(!catalog.length)return '<div class="curriculum-empty">Для этого раздела ещё нет списка уроков.</div>';
    var html='',lastUnit=null,doneCount=0;
    function row(item,parentId,depth) {
      var done=isLessonComplete(course,item,parentId);
      if(done)doneCount++;
      var amount=course.tracker==='foundations'?2:(course.tracker==='decision'||course.tracker==='charts'||course.tracker==='stats'||course.tracker==='forecasting'?2:1);
      if(course.tracker==='quality')amount=1;
      if(course.tracker==='portfolio')amount=1;
      if(course.tracker==='simulator')amount=2;
      if(course.tracker==='final')amount=2;
      if(course.tracker==='projectStudio')amount=0;
      if(course.tracker==='cert')amount=0;
      return '<div class="curriculum-lesson-row'+(done?' passed':'')+(depth?' nested':'')+'"><span class="curriculum-lesson-check">'+(done?'✓':'○')+'</span><span class="curriculum-lesson-copy"><span class="curriculum-lesson-title">'+safeText(item.title)+'</span>'+(item.goal?'<span class="curriculum-lesson-goal">'+safeText(item.goal)+'</span>':'')+'</span><span class="curriculum-lesson-reward">'+(done?'Зачтено':(amount?'+'+amount+' 🪙':'Этап'))+'</span></div>';
    }
    if(course.tracker==='portfolio') {
      catalog.forEach(function(project){
        var items=project.items||[];
        var done=items.filter(function(it){return isLessonComplete(course,it,project.id);}).length;
        html+='<div class="curriculum-unit-heading"><span>'+safeText(project.title)+'</span><small>'+done+'/'+items.length+' критериев</small></div>';
        items.forEach(function(it){html+=row(it,project.id,1);});
      });
    } else {
      catalog.forEach(function(item){
        var unit=String(item.unit||'');
        if(unit&&unit!==lastUnit){
          html+='<div class="curriculum-unit-heading"><span>'+safeText(unit)+'</span></div>';
          lastUnit=unit;
        }
        html+=row(item,null,0);
      });
    }
    var legacyNote='';
    if(course.tracker==='quality'&&!Array.isArray(readJSON('apk-quality-passed-v1'))&&readScore(STORE.quality)&&readScore(STORE.quality)!=='5/5') {
      legacyNote='<p class="curriculum-legacy-note">Ранее сохранялся только общий результат ('+safeText(readScore(STORE.quality))+'); детали ответов ещё не сохранялись. Пройди практику повторно, чтобы видеть отметки по каждой категории.</p>';
    }
    var wallet=walletState();
    return '<details class="curriculum-lessons" open><summary>📚 Уроки и испытания <span>'+safeText(formatProgress(course.tracker==='portfolio'?getProgress(course):getProgress(course)))+'</span></summary><div class="curriculum-lesson-list">'+html+'</div><div class="curriculum-lesson-footer">Награды выдаются один раз за каждое впервые завершённое задание. Монеты за уже пройденные ранее уроки начисляются при первом обнаружении сохранённого результата. Баланс: <strong>🪙 '+wallet.balance+'</strong>.</div>'+legacyNote+'</details>';
  }
  function addPathButton(parent,label,path,primary,disabled) {
    var button=document.createElement('button');
    button.type='button';button.className='curriculum-action'+(primary?' primary':'');
    button.textContent=label;button.disabled=!!disabled;
    button.addEventListener('click',function(){if(!path)return;window.open(path,'_blank','noopener');});
    parent.appendChild(button);return button;
  }
  function addActionButton(parent,label,action,primary,disabled) {
    var button=document.createElement('button');
    button.type='button';button.className='curriculum-action'+(primary?' primary':'');
    button.textContent=label;button.disabled=!!disabled;
    button.addEventListener('click',action);parent.appendChild(button);return button;
  }
  function buildCourse(course) {
    if(!window.DataCraftEconomy){showToastIfAvailable('Экономика игры не загрузилась. Обнови страницу.');return;}
    var st=getStatus(course);
    if(st.built){showToastIfAvailable('Здание уже построено.');return;}
    if(!st.unlocked){showToastIfAvailable('Сначала построй предыдущие здания.');return;}
    if(!st.courseComplete){showToastIfAvailable('Сначала заверши все уроки этого здания.');return;}
    var wallet=window.DataCraftEconomy.sync(),cost=course.cost||0;
    if((wallet.balance||0)<cost){showToastIfAvailable('Не хватает '+(cost-wallet.balance)+' монет. Пройди доступные уроки и вернись.');return;}
    var result=window.DataCraftEconomy.build(course.id,cost);
    if(result&&result.ok){showToastIfAvailable('Построено: '+course.title+'! Следующая ветка открыта.');renderAll();}
    else showToastIfAvailable('Не хватает монет для строительства.');
  }
  function renderDetail() {
    var course=BY_ID[selectedId]||COURSES[0],st=getStatus(course),p=st.progress,deps=st.dependencies;
    var wallet=walletState(),stageLabel=course.stage!==undefined?stageLabels[course.stage]:'ДОПОЛНИТЕЛЬНАЯ СПЕЦИАЛИЗАЦИЯ';
    var req='';
    if(deps.requires.length){
      req+='<li><span class="req-mark">Требуется</span><span>Построить все предыдущие здания:</span></li>';
      deps.requires.forEach(function(id){
        var c=BY_ID[id],cp=getProgress(c),built=isBuilt(id);
        req+='<li><span class="req-mark '+(built?'':'missing')+'">'+(built?'✓':'○')+'</span><span>'+safeText(courseName(id))+' — '+safeText(formatProgress(cp))+(built?' · здание построено':(cp.complete?' · курс пройден, строй за '+(c.cost||0)+' 🪙':' · осталось '+Math.max(0,cp.total-cp.done)+' уроков и строительство за '+(c.cost||0)+' 🪙'))+'</span></li>';
      });
    }else req+='<li><span class="req-mark">✓</span><span>Стартовый учебный маршрут: предварительные здания не нужны.</span></li>';
    if(deps.anyOf.length){
      var anyDone=deps.anyOf.some(function(id){return isBuilt(id);});
      req+='<li><span class="req-mark '+(anyDone?'':'missing')+'">'+(anyDone?'✓':'○')+'</span><span>Дополнительно: построй один из вариантов — '+deps.anyOf.map(function(id){return safeText(courseName(id));}).join(' или ')+'.</span></li>';
    }
    var action=document.createElement('div');action.className='curriculum-detail-actions';
    if(st.built){
      addPathButton(action,'Открыть / повторить уроки →',course.path,true);
      addActionButton(action,'✓ Здание построено',function(){},false,true);
    }else if(!st.unlocked){
      var next=findNextCourse(course);
      if(next)addPathButton(action,'Сначала: '+(next.short||next.title),next.path,true);
      addActionButton(action,'🔒 Недоступно до выполнения требований',function(){},false,true);
    }else if(st.courseComplete){
      addActionButton(action,'🏗️ Построить за '+(course.cost||0)+' 🪙',function(){buildCourse(course);},true, wallet.balance<(course.cost||0));
      addPathButton(action,'Повторить уроки',course.path,false);
    }else{
      addPathButton(action,'Изучать уроки →',course.path,true);
      addActionButton(action,'Постройка после курса: '+(course.cost||0)+' 🪙',function(){},false,true);
    }
    var catalog=courseCatalog(course);
    var currencyNote='<div class="curriculum-wallet-line"><span>🪙 В кошельке: <strong>'+wallet.balance+'</strong></span><span>Стоимость постройки: <strong>'+(st.built?'оплачено':(course.cost||0)+' 🪙')+'</strong></span><span>Всего заработано: '+wallet.totalEarned+'</span></div>';
    detail.innerHTML=
      '<div class="curriculum-detail-eyebrow">'+safeText(stageLabel)+'</div>'+
      '<h3>'+safeText(course.icon||'🏗️')+' '+safeText(course.title)+'</h3>'+
      '<span class="curriculum-status '+st.state+'">'+(st.built?'✓ ':st.courseComplete?'◆ ':st.unlocked?'● ':'🔒 ')+safeText(statusText(st,course))+'</span>'+
      '<p>'+safeText(course.desc||'Дополнительный учебный маршрут.')+'</p>'+
      '<div class="curriculum-progress"><i style="width:'+p.percent+'%"></i></div>'+
      '<p class="curriculum-progress-text">'+safeText(formatProgress(p))+' · '+p.percent+'%</p>'+
      currencyNote+
      '<ul class="curriculum-requirements">'+req+'</ul>'+
      lessonListHTML(course);
    detail.appendChild(action);
    if(!catalog.length)detail.insertAdjacentHTML('beforeend','<p class="curriculum-empty">Каталог уроков для этого модуля пока не подключён.</p>');
  }
  function renderCourseList() {
    courseList.innerHTML='';
    COURSES.forEach(function(c) {
      var st=getStatus(c),p=st.progress;
      var b=document.createElement('button');b.type='button';
      b.className='curriculum-course-card'+(selectedId===c.id?' selected':'');
      b.setAttribute('aria-pressed',selectedId===c.id?'true':'false');
      var label=st.built?'✓ ПОСТРОЕНО':(!st.unlocked?'🔒 ЗАКРЫТО':(st.courseComplete?'ГОТОВО К СТРОЙКЕ':'ДОСТУПНО'));
      b.innerHTML='<span class="cc-icon">'+safeText(c.icon)+'</span><span class="cc-copy"><span class="cc-title">'+safeText(c.title)+'</span><span class="cc-meta"><span>'+safeText(formatProgress(p))+'</span><span class="cc-state">'+label+'</span></span><span class="cc-bar"><i style="width:'+p.percent+'%"></i></span><span class="cc-cost">'+(st.built?'Стоимость оплачена':(c.cost||0)+' 🪙 на постройку')+'</span></span>';
      b.addEventListener('click',function(){selectCourse(c.id,false);});courseList.appendChild(b);
    });
  }
  function renderSpecializations() {
    specializationList.innerHTML='';
    SPECIALIZATIONS.forEach(function(c) {
      var st=getStatus(c),p=st.progress;
      var card=document.createElement('div');card.className='curriculum-special-card'+(st.built?' done':'');
      var top=document.createElement('div');top.className='curriculum-special-top';
      var icon=document.createElement('span');icon.className='curriculum-special-icon';icon.textContent=c.icon;
      var text=document.createElement('div');text.style.minWidth='0';
      var h=document.createElement('h4');h.textContent=c.title;
      var desc=document.createElement('p');desc.textContent=formatProgress(p)+' · '+(st.built?'построено':(!st.unlocked?'закрыто':'постройка '+(c.cost||0)+' 🪙'));
      text.append(h,desc);top.append(icon,text);card.append(top);
      var btn=document.createElement('button');btn.type='button';btn.className='curriculum-action'+(st.unlocked?' primary':'');
      btn.textContent=st.built?'Открыть / повторить':(!st.unlocked?'Посмотреть требования':(st.courseComplete?'Построить за '+(c.cost||0)+' 🪙':'Подробнее о курсе'));
      btn.addEventListener('click',function(){selectCourse(c.id,true);});card.appendChild(btn);specializationList.appendChild(card);
    });
  }
  function selectCourse(id, shouldScroll) {
    if (!BY_ID[id]) return;
    selectedId = id;
    renderAll();
    if (shouldScroll && detail) detail.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function addPathButton(parent, label, path, primary) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'curriculum-action' + (primary ? ' primary' : '');
    button.textContent = label;
    button.addEventListener('click',function(){
      if (!path) return;
      window.open(path,'_blank','noopener');
    });
    parent.appendChild(button);
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
    for (var i=0;i<missing.length;i++) {
      var nested = findNextCourse(BY_ID[missing[i]],seen);
      if (nested) return nested;
    }
    return null;
  }
  function nextAvailable() {
    for (var i=0;i<COURSES.length;i++) {
      var st=getStatus(COURSES[i]);
      if (st.unlocked&&!st.done) return COURSES[i];
    }
    for (var j=0;j<SPECIALIZATIONS.length;j++) {
      var ss=getStatus(SPECIALIZATIONS[j]);
      if (ss.unlocked&&!ss.done) return SPECIALIZATIONS[j];
    }
    return COURSES[0];
  }
  function renderDetail() {
    var course = BY_ID[selectedId] || COURSES[0];
    var st = getStatus(course), p = st.progress, deps = st.dependencies;
    var stageLabel = course.stage !== undefined ? stageLabels[course.stage] : 'ДОПОЛНИТЕЛЬНАЯ СПЕЦИАЛИЗАЦИЯ';
    var req = '';
    if (deps.requires.length) {
      req += '<li><span class="req-mark">Требуется</span><span>Пройди все пункты:</span></li>';
      deps.requires.forEach(function(id) {
        var c=BY_ID[id], cp=getProgress(c), done=cp.complete;
        req += '<li><span class="req-mark ' + (done?'':'missing') + '">' + (done?'✓':'○') + '</span><span>' + safeText(courseName(id)) + ' — ' + safeText(formatProgress(cp)) + (done?' · готово':' · не завершено') + '</span></li>';
      });
    } else {
      req += '<li><span class="req-mark">✓</span><span>Это стартовая область: предварительные курсы не нужны.</span></li>';
    }
    if (deps.anyOf.length) {
      var anyDone=deps.anyOf.some(function(id){return getProgress(BY_ID[id]).complete;});
      req += '<li><span class="req-mark ' + (anyDone?'':'missing') + '">' + (anyDone?'✓':'○') + '</span><span>Дополнительно: заверши любой один курс — ' + deps.anyOf.map(function(id){return safeText(courseName(id));}).join(' или ') + '.</span></li>';
    }
    var action = document.createElement('div');
    action.className = 'curriculum-detail-actions';
    if (st.unlocked) {
      addPathButton(action,st.done?(course.tracker==='cert'?'Открыть попытку экзамена':'Повторить / открыть уроки'):'Открыть уроки →',course.path,true);
    } else {
      var next=findNextCourse(course);
      if (next) addPathButton(action,'Начать: ' + (next.short||next.title),next.path,true);
      addPathButton(action,'Открыть курс и посмотреть требования',course.path,false);
    }
    detail.innerHTML =
      '<div class="curriculum-detail-eyebrow">' + safeText(stageLabel) + '</div>' +
      '<h3>' + safeText(course.icon || '🏗️') + ' ' + safeText(course.title) + '</h3>' +
      '<span class="curriculum-status ' + st.state + '">' + (st.done?'✓ ':st.unlocked?'◆ ':'🔒 ') + safeText(statusText(st,course)) + '</span>' +
      '<p>' + safeText(course.desc || 'Дополнительный учебный маршрут.') + '</p>' +
      '<div class="curriculum-progress"><i style="width:' + p.percent + '%"></i></div>' +
      '<p class="curriculum-progress-text">' + safeText(formatProgress(p)) + ' · ' + p.percent + '%</p>' +
      '<p><strong>Что нужно для постройки:</strong> завершить программу здания. Отметки об уроках берутся из самого учебного модуля.</p>' +
      '<ul class="curriculum-requirements">' + req + '</ul>';
    detail.appendChild(action);
  }
  function renderCourseList() {
    courseList.innerHTML='';
    COURSES.forEach(function(c) {
      var st=getStatus(c), p=st.progress;
      var b=document.createElement('button');
      b.type='button';b.className='curriculum-course-card'+(selectedId===c.id?' selected':'');
      b.setAttribute('aria-pressed',selectedId===c.id?'true':'false');
      b.innerHTML='<span class="cc-icon">'+safeText(c.icon)+'</span><span class="cc-copy"><span class="cc-title">'+safeText(c.title)+'</span><span class="cc-meta"><span>'+safeText(formatProgress(p))+'</span><span class="cc-state">'+(st.done?'✓ ГОТОВО':st.unlocked?'ДОСТУПНО':'🔒')+'</span></span><span class="cc-bar"><i style="width:'+p.percent+'%"></i></span></span>';
      b.addEventListener('click',function(){selectCourse(c.id,false);});
      courseList.appendChild(b);
    });
  }
  function renderSpecializations() {
    specializationList.innerHTML='';
    SPECIALIZATIONS.forEach(function(c) {
      var st=getStatus(c),p=st.progress;
      var card=document.createElement('div');card.className='curriculum-special-card'+(st.done?' done':'');
      var top=document.createElement('div');top.className='curriculum-special-top';
      var icon=document.createElement('span');icon.className='curriculum-special-icon';icon.textContent=c.icon;
      var text=document.createElement('div');text.style.minWidth='0';
      var h=document.createElement('h4');h.textContent=c.title;
      var desc=document.createElement('p');desc.textContent=formatProgress(p)+' · '+(st.done?'попытка экзамена завершена':st.unlocked?'доступно':'требуется предыдущий курс');
      text.append(h,desc);top.append(icon,text);card.append(top);
      var btn=document.createElement('button');btn.type='button';btn.className='curriculum-action'+(st.unlocked?' primary':'');
      btn.textContent=st.done?'Повторить':st.unlocked?'Открыть специализацию':'Посмотреть требования';
      btn.addEventListener('click',function(){selectCourse(c.id,true);});
      card.appendChild(btn);specializationList.appendChild(card);
    });
  }
  function drawMap() {
    if (!ctx) return;
    ctx.clearRect(0,0,MAP_W,MAP_H);
    ctx.fillStyle='#13231b';ctx.fillRect(0,0,MAP_W,MAP_H);
    var bandW=250;
    var colors=['#1b3324','#1a3026','#1b2f2d','#1b2b30','#292a2a'];
    for(var i=0;i<5;i++){
      ctx.fillStyle=colors[i];ctx.fillRect(i*252,0,250,MAP_H);
      ctx.strokeStyle='rgba(177,214,169,.09)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(i*252,0);ctx.lineTo(i*252,MAP_H);ctx.stroke();
      ctx.fillStyle='#9bb69e';ctx.font='800 11px system-ui';ctx.textAlign='left';ctx.fillText(stageLabels[i],i*252+14,24);
      ctx.fillStyle='rgba(205,231,194,.07)';
      for(var j=0;j<3;j++){ctx.beginPath();ctx.arc(i*252+27+j*75,MAP_H-25-((i+j)%2)*11,10+j*2,0,Math.PI*2);ctx.fill();}
    }
    ctx.strokeStyle='rgba(184,218,165,.20)';ctx.lineWidth=2;ctx.setLineDash([5,7]);
    graph.forEach(function(edge){
      var from=BY_ID[edge[0]],to=BY_ID[edge[1]];
      if(!from||!to)return;
      var fs=getStatus(from),ts=getStatus(to);
      ctx.strokeStyle=ts.done?'#5baf73':(ts.unlocked?'#d1b463':'#607365');
      ctx.globalAlpha=ts.done?.75:.56;
      var sx,sy,ex,ey;
      if(to.x>from.x){
        sx=from.x+NODE_W;sy=from.y+NODE_H/2;ex=to.x;ey=to.y+NODE_H/2;
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.bezierCurveTo(sx+26,sy,ex-26,ey,ex,ey);ctx.stroke();
      }else{
        sx=from.x+NODE_W;sy=from.y+NODE_H/2;ex=to.x+NODE_W;ey=to.y+NODE_H/2;
        var mx=Math.max(sx,ex)+14;
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.bezierCurveTo(mx,sy,mx,ey,ex,ey);ctx.stroke();
      }
      ctx.globalAlpha=1;
    });
    ctx.setLineDash([]);
    COURSES.forEach(function(c){
      var st=getStatus(c),p=st.progress,selected=selectedId===c.id;
      var border=st.built?'#7ed68a':(st.unlocked&&st.courseComplete?'#f0cd70':(st.unlocked?'#c5b267':'#64776a'));
      var fill=st.built?'#1b432b':(st.unlocked&&st.courseComplete?'#4a3d20':(st.unlocked?'#303326':'#202e26'));
      ctx.fillStyle='rgba(0,0,0,.22)';roundRect(ctx,c.x+3,c.y+5,NODE_W,NODE_H,12);ctx.fill();
      ctx.fillStyle=fill;ctx.strokeStyle=border;ctx.lineWidth=selected?3:1.5;
      roundRect(ctx,c.x,c.y,NODE_W,NODE_H,12);ctx.fill();ctx.stroke();ctx.lineWidth=1;
      ctx.fillStyle=border;ctx.beginPath();ctx.arc(c.x+18,c.y+18,4,0,Math.PI*2);ctx.fill();
      ctx.textAlign='left';ctx.fillStyle='#eaf4e7';ctx.font='800 11px system-ui';
      wrapText(ctx,c.short,c.x+12,c.y+34,NODE_W-24,14,2);
      ctx.fillStyle=st.done?'#a8eeae':(st.unlocked?'#f4d987':'#a7b4a7');
      ctx.font='700 9px system-ui';
      ctx.fillText(st.done?(c.id==='final'?'✓ ЭКЗАМЕН ЗАВЕРШЁН':'✓ ПОСТРОЕНО'):(st.unlocked?'◆ МОЖНО СТРОИТЬ':'🔒 ЗАКРЫТО'),c.x+12,c.y+62);
      ctx.fillStyle='#0e1b13';roundRect(ctx,c.x+12,c.y+70,NODE_W-24,5,3);ctx.fill();
      if(p.percent>0){ctx.fillStyle=st.built?'#83d990':(st.unlocked&&st.courseComplete?'#e5c56e':(st.unlocked?'#c4bd72':'#7b9280'));roundRect(ctx,c.x+12,c.y+70,(NODE_W-24)*p.percent/100,5,3);ctx.fill();}
      ctx.fillStyle='#b6c8b7';ctx.font='9px system-ui';ctx.fillText(p.done+'/'+p.total+' '+p.label,c.x+12,c.y+84);
    });
    ctx.fillStyle='#9fb8a2';ctx.font='11px system-ui';ctx.textAlign='right';ctx.fillText('Выпуск: все основные ветки →',MAP_W-15,MAP_H-12);
  }
  function roundRect(c,x,y,w,h,r) {
    c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();
  }
  function wrapText(c,text,x,y,maxWidth,lineHeight,maxLines) {
    var words=String(text).split(/\s+/),line='',lines=[];
    words.forEach(function(word){
      var candidate=line?line+' '+word:word;
      if(c.measureText(candidate).width>maxWidth&&line){lines.push(line);line=word;}else line=candidate;
    });
    if(line)lines.push(line);
    if(lines.length>maxLines){lines=lines.slice(0,maxLines);while(c.measureText(lines[maxLines-1]+'…').width>maxWidth&&lines[maxLines-1].length>4)lines[maxLines-1]=lines[maxLines-1].slice(0,-1);lines[maxLines-1]+='…';}
    lines.forEach(function(v,i){c.fillText(v,x,y+i*lineHeight);});
  }
  function renderAll() {
    if(window.DataCraftEconomy)window.DataCraftEconomy.sync();
    var w=walletState(),coinLabel=document.getElementById('curriculumCoins');
    if(coinLabel)coinLabel.textContent='🪙 '+(w.balance||0)+' монет';
    drawMap();renderCourseList();renderSpecializations();renderDetail();
  }
  function pointFromEvent(e) {
    var rect=canvas.getBoundingClientRect();
    return {x:(e.clientX-rect.left)*MAP_W/rect.width,y:(e.clientY-rect.top)*MAP_H/rect.height};
  }
  function selectAtPoint(p) {
    for(var i=COURSES.length-1;i>=0;i--) {
      var c=COURSES[i];
      if(p.x>=c.x&&p.x<=c.x+NODE_W&&p.y>=c.y&&p.y<=c.y+NODE_H){selectCourse(c.id,false);return;}
    }
  }
  canvas.addEventListener('click',function(e){selectAtPoint(pointFromEvent(e));});
  canvas.addEventListener('keydown',function(e){
    if(e.key==='Enter'||e.key===' '){e.preventDefault();selectCourse(selectedId,true);}
    if(e.key==='ArrowRight'||e.key==='ArrowDown'){
      e.preventDefault();var i=COURSES.findIndex(function(c){return c.id===selectedId;});selectCourse(COURSES[(i+1)%COURSES.length].id,false);
    }
    if(e.key==='ArrowLeft'||e.key==='ArrowUp'){
      e.preventDefault();var j=COURSES.findIndex(function(c){return c.id===selectedId;});selectCourse(COURSES[(j-1+COURSES.length)%COURSES.length].id,false);
    }
  });
  document.getElementById('curriculumRefresh').addEventListener('click',function(){renderAll();});
  document.getElementById('curriculumNext').addEventListener('click',function(){
    var next=nextAvailable();selectCourse(next.id,true);showToastIfAvailable('Следующий доступный этап: '+next.title);
  });
  window.addEventListener('focus',renderAll);
  window.addEventListener('pageshow',renderAll);
  window.addEventListener('storage',function(e){if(!e.key||e.key.indexOf('apk-')===0||['sqlkit-v1','epk','ppk','pbikt-v1','spk','tpk','clk-v1','fmk-v1','sim2','ipk'].indexOf(e.key)>=0)renderAll();});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)renderAll();});

  function showToastIfAvailable(message) {
    var toast=document.getElementById('toast');
    if(!toast)return;
    toast.textContent=message;toast.classList.add('show');
    window.setTimeout(function(){toast.classList.remove('show');},2600);
  }
  renderAll();
})();
