/* Русификатор Analyst Prep Kit. Незнакомые видимые тексты переводятся онлайн и кешируются.
   Поля ввода и редакторы исключены. Если ответ показан как обычный текст страницы, он может переводиться. */
(function () {
  "use strict";
  if (window.__apkRuLoaded) return;
  window.__apkRuLoaded = true;
  var langKey="apk-language-v2", cacheKey="apk-ru-cache-v2", legacyCacheKey="apk-ru-cache-v1", lang="ru";
  var records=new WeakMap(), tracked=new Set(), pending=new WeakSet(), observer, toggle, muting=false, cache={}, inFlight=Object.create(null), activeRequests=0, requestWaiters=[];
  try { cache=JSON.parse(localStorage.getItem(cacheKey)||localStorage.getItem(legacyCacheKey)||"{}"); } catch (_) { cache={}; }
  async function acquireRequest(){if(activeRequests>=6)await new Promise(function(resolve){requestWaiters.push(resolve);});activeRequests++;}
  function releaseRequest(){activeRequests=Math.max(0,activeRequests-1);var next=requestWaiters.shift();if(next)next();}
  if(!cache||typeof cache!=="object"||Array.isArray(cache))cache={};
  var d={
    "break into data analytics. one skill at a time.":"Освой аналитику данных. По одному навыку за раз.",
    "grain — analyst prep kit · free sql, excel, python, tableau, interview":"Grain — тренажёр аналитика данных",
    "sql queries and joins · free interview practice in browser":"SQL: запросы и объединение таблиц — тренажёр",
    "excel formulas and charts · free data analysis practice":"Excel: формулы и диаграммы — практика анализа данных",
    "python data analysis · free practice exercises in browser":"Анализ данных на Python — практические задания",
    "tableau dashboards · free certification practice":"Дашборды Tableau — подготовка и практика",
    "chart literacy · free data visualization practice":"Работа с диаграммами — визуализация данных",
    "forecasting & trend modeling · free practice for analysts":"Прогнозирование и моделирование трендов",
    "statistics for data · free interactive practice":"Статистика для анализа данных — интерактивная практика",
    "power bi dashboards · free practice, no install":"Дашборды Power BI — практика без установки",
    "data analyst interview prep · timed q&a practice":"Подготовка к собеседованию аналитика данных",
    "final exam kit · analyst prep kit":"Итоговый экзамен — тренажёр аналитика",
    "project studio · analyst prep kit":"Мастерская проектов — тренажёр аналитика",
    "lessons":"Уроки","learn":"Изучение","learning":"Обучение","practice":"Практика","review":"Повторение",
    "your review list":"Список для повторения","next up":"Далее","other kits":"Другие разделы","your path":"Твой учебный маршрут",
    "learn by playing":"Учись в игровом формате","learn by writing queries":"Учись, составляя запросы",
    "sql lab":"Практикум SQL","python terminal":"Терминал Python","dax lab":"Практикум DAX",
    "read-aloud demo":"Пример разбора вслух","quick check":"Быстрая проверка","worked example":"Разобранный пример",
    "try it":"Попробуй","build it":"Сделай сам","done":"Готово","watch out":"Обрати внимание",
    "continue learning":"Продолжить обучение","all lessons complete!":"Все уроки пройдены!","start here":"Начни здесь",
    "your first formula":"Твоя первая формула","in this kit":"В этом разделе","pivot lab":"Практикум сводных таблиц",
    "excel analyst sprint":"Экспресс-практика Excel для аналитика","field list":"Список полей","rows":"Строки",
    "columns":"Столбцы","values":"Значения","flashcards":"Карточки","glossary":"Словарь терминов",
    "know your workspace":"Знакомство с рабочей областью","stats prep kit":"Тренажёр по статистике",
    "distribution lab":"Практикум по распределениям","the final exam":"Итоговый экзамен","project studio":"Мастерская проектов",
    "interview prep kit":"Подготовка к собеседованию","the playbook":"План подготовки","the questions":"Вопросы",
    "hard moments":"Сложные ситуации","answer builder":"Конструктор ответов","select a question":"Выбери вопрос",
    "your star answer":"Твой ответ по STAR","live preview":"Предварительный просмотр","settings":"Настройки",
    "what interviewers are really evaluating":"Что на самом деле оценивают интервьюеры",
    "the anatomy of a data analyst interview":"Из чего состоит собеседование аналитика данных",
    "associate data analyst simulator":"Симулятор работы младшего аналитика данных","claude api key":"Ключ API Claude",
    "related guides":"Полезные руководства","same four numbers, two ways":"Одни и те же четыре числа — два способа показать",
    "which is bigger: 27% or 24%?":"Что больше: 27% или 24%?","same data, two baselines":"Одни данные — две точки отсчёта",
    "revenue by region (sorted)":"Выручка по регионам (по порядку)","monthly revenue trend":"Динамика выручки по месяцам",
    "ad spend vs. revenue":"Расходы на рекламу и выручка","raw counts vs. rate":"Абсолютные значения и доли",
    "question → chart":"Вопрос → диаграмма","label vs. insight title":"Обычный заголовок и заголовок с выводом",
    "a forecast is history + projection + a range":"Прогноз — история, продолжение тренда и диапазон неопределённости",
    "one series = trend + seasonality + noise":"Ряд данных = тренд + сезонность + случайные колебания",
    "raw (jumpy) vs. smoothed (signal)":"Исходные колебания и сглаженный сигнал",
    "3-period moving average":"Скользящее среднее за 3 периода","high α vs. low α":"Высокое и низкое значение α",
    "linear trend (r² ≈ 0.9)":"Линейный тренд (R² ≈ 0,9)","seasonal indices (avg = 1.0)":"Сезонные индексы (среднее = 1,0)",
    "sales vs. a driver (ad spend)":"Продажи и влияющий фактор (расходы на рекламу)",
    "trend + seasonality, projected":"Прогноз с учётом тренда и сезонности","a·r·i·m·a, decoded":"ARIMA простыми словами",
    "train / test split":"Разделение на обучающую и тестовую выборки",
    "the fan chart widens with the horizon":"Чем дальше прогноз, тем шире диапазон неопределённости",
    "overfit vs. sensible":"Переобученная и разумная модель","start learning charts":"Начать изучение диаграмм",
    "start learning forecasting":"Начать изучение прогнозирования","pick up where you left off":"Продолжить с того места, где остановился",
    "variables & data types":"Переменные и типы данных","quick references":"Краткие справочники","mixed review":"Повторение всех тем",
    "start":"Начать","continue":"Продолжить","back":"Назад","next":"Далее","previous":"Назад","close":"Закрыть",
    "cancel":"Отмена","save":"Сохранить","reset":"Сбросить","restart":"Начать заново","submit":"Отправить",
    "check answer":"Проверить ответ","show answer":"Показать ответ","hint":"Подсказка","show hint":"Показать подсказку",
    "explanation":"Объяснение","example":"Пример","question":"Вопрос","your answer":"Твой ответ",
    "correct":"Верно","incorrect":"Неверно","try again":"Попробуй ещё раз","progress":"Прогресс",
    "completed":"Завершено","score":"Результат","results":"Результаты","search":"Поиск","search lessons":"Поиск по урокам",
    "filter":"Фильтр","all":"Все","clear":"Очистить","clear all":"Очистить всё","copy":"Копировать","copied":"Скопировано",
    "download":"Скачать","export":"Экспорт","import":"Импорт","loading…":"Загрузка…","loading...":"Загрузка…",
    "no results":"Нет результатов","no lessons found":"Уроки не найдены","your progress":"Твой прогресс",
    "study guide":"Учебное руководство","practice questions":"Практические вопросы","data analyst":"Аналитик данных",
    "data analytics":"Аналитика данных","statistics":"Статистика","forecasting":"Прогнозирование",
    "chart literacy":"Работа с диаграммами","portfolio":"Портфолио","projects":"Проекты","hide answer":"Скрыть ответ",
    "show solution":"Показать решение","solution":"Решение","definition":"Определение","key takeaway":"Главный вывод",
    "why it matters":"Зачем это нужно","common mistake":"Распространённая ошибка","real-world example":"Пример из реальной работы",
    "business question":"Бизнес-вопрос","business context":"Контекст бизнеса","dataset":"Набор данных","data":"Данные",
    "insight":"Вывод","insights":"Выводы","recommendation":"Рекомендация","dashboard":"Информационная панель",
    "report":"Отчёт","chart":"Диаграмма","table":"Таблица","formula":"Формула","query":"Запрос","queries":"Запросы",
    "join":"Объединение таблиц (JOIN)","aggregation":"Агрегация","window functions":"Оконные функции",
    "data cleaning":"Очистка данных","pivot table":"Сводная таблица","pivot tables":"Сводные таблицы",
    "data visualization":"Визуализация данных","trend":"Тренд","seasonality":"Сезонность","distribution":"Распределение",
    "regression":"Регрессия","sample size":"Размер выборки","p-value":"p-значение","confidence interval":"Доверительный интервал",
    "hypothesis":"Гипотеза","hypothesis test":"Проверка гипотезы","a/b testing":"A/B-тестирование",
    "average":"Среднее значение","median":"Медиана","mean":"Среднее","mode":"Мода","standard deviation":"Стандартное отклонение",
    "correlation":"Корреляция","causation":"Причинно-следственная связь","outlier":"Выброс","outliers":"Выбросы",
    "null values":"Пустые значения","missing values":"Пропущенные значения","data types":"Типы данных",
    "date":"Дата","text":"Текст","number":"Число","numbers":"Числа","row":"Строка","cell":"Ячейка","cells":"Ячейки",
    "column":"Столбец","filtering":"Фильтрация","sorting":"Сортировка","grouping":"Группировка",
    "customer":"Клиент","customers":"Клиенты","revenue":"Выручка","sales":"Продажи","profit":"Прибыль","cost":"Затраты",
    "orders":"Заказы","products":"Товары","region":"Регион","month":"Месяц","year":"Год","date range":"Диапазон дат",
    "time series":"Временной ряд","moving average":"Скользящее среднее","forecast":"Прогноз","accuracy":"Точность",
    "uncertainty":"Неопределённость","training data":"Обучающие данные","test data":"Тестовые данные","overfitting":"Переобучение",
    "linear regression":"Линейная регрессия","interview question":"Вопрос на собеседовании",
    "tell me about yourself":"Расскажи о себе","situation":"Ситуация","task":"Задача","action":"Действие","result":"Результат",
    "strengths":"Сильные стороны","weaknesses":"Зоны роста","confidence":"Уверенность",
    "explain your reasoning":"Объясни ход рассуждений","select an answer":"Выбери ответ","choose one":"Выбери один вариант",
    "choose all that apply":"Выбери все подходящие варианты","true":"Верно","false":"Неверно","yes":"Да","no":"Нет",
    "optional":"Необязательно","required":"Обязательно","beginner":"Начальный уровень","intermediate":"Средний уровень",
    "advanced":"Продвинутый уровень","easy":"Легко","medium":"Средне","hard":"Сложно","minutes":"минут","minute":"минута",
    "week":"неделя","weeks":"недель"
  };
  function norm(s){return String(s||"").replace(/\s+/g," ").trim().toLowerCase();}
  function skip(n){
    if(!n||!n.parentElement||!n.nodeValue||!n.nodeValue.trim())return true;
    if(n.parentElement.closest("script,style,code,pre,kbd,samp,textarea,input,select,option,svg,canvas,noscript,iframe,[contenteditable='true'],.apk-language-toggle,[data-no-translate]"))return true;
    var s=n.nodeValue.trim();
    return !s||/^(https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,})/i.test(s)||/^[A-Z0-9_ .:;()[\]{}=<>+\-/%$#'"|\\]+$/.test(s)||/^[\d\s.,:%$€£¥+\-–—/()]+$/.test(s);
  }
  function visible(el){
    if(!el||!el.isConnected||el.closest("[hidden],[aria-hidden='true']"))return false;
    try{var s=getComputedStyle(el);if(s.display==="none"||s.visibility==="hidden"||(s.opacity==="0"&&!document.documentElement.classList.contains("apk-ru-pending")))return false;}catch(_){}
    return !!(el.getClientRects&&el.getClientRects().length);
  }
  function preserve(src,out){return(src.match(/^\s*/)||[""])[0]+out+(src.match(/\s*$/)||[""])[0];}
  function saveCache(){try{var k=Object.keys(cache);if(k.length>1600)k.slice(0,k.length-1200).forEach(function(x){delete cache[x];});localStorage.setItem(cacheKey,JSON.stringify(cache));}catch(_){}}
  async function online(text) {
    if (Object.prototype.hasOwnProperty.call(cache,text)) return cache[text];
    if (!navigator.onLine || !text || text.length > 850) return null;
    if (inFlight[text]) return inFlight[text];
    var job=(async function(){
      await acquireRequest();
      try {
        if (Object.prototype.hasOwnProperty.call(cache,text)) return cache[text];
        var translated=null;
        try {
          var url="https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q="+encodeURIComponent(text);
          var options={mode:"cors",credentials:"omit"};
          if(typeof AbortSignal!=="undefined"&&AbortSignal.timeout)options.signal=AbortSignal.timeout(6000);
          var response=await fetch(url,options);
          if(response.ok){
            var payload=await response.json();
            if(Array.isArray(payload)&&Array.isArray(payload[0])){
              var value=payload[0].map(function(part){return Array.isArray(part)&&typeof part[0]==="string"?part[0]:"";}).join("");
              if(value.trim()&&value!==text)translated=value;
            }
          }
        }catch(_){}
        if(!translated&&text.length<=450){
          try{
            var fallbackUrl="https://api.mymemory.translated.net/get?q="+encodeURIComponent(text)+"&langpair=en%7Cru";
            var fallbackOptions={mode:"cors",credentials:"omit"};
            if(typeof AbortSignal!=="undefined"&&AbortSignal.timeout)fallbackOptions.signal=AbortSignal.timeout(6000);
            var fallbackResponse=await fetch(fallbackUrl,fallbackOptions);
            if(fallbackResponse.ok){
              var fallbackJson=await fallbackResponse.json();
              var fallbackText=fallbackJson&&fallbackJson.responseData&&fallbackJson.responseData.translatedText;
              if(fallbackJson&&fallbackJson.responseStatus===200&&fallbackText&&fallbackText!==text&&!/MYMEMORY WARNING|PLEASE SELECT TWO DISTINCT LANGUAGES/i.test(fallbackText))translated=fallbackText;
            }
          }catch(_){}
        }
        if(translated){
          cache[text]=translated;
          try{
            var keys=Object.keys(cache);
            if(keys.length>1600)keys.slice(0,keys.length-1200).forEach(function(key){delete cache[key];});
            localStorage.setItem(cacheKey,JSON.stringify(cache));
          }catch(_){}
        }
        return translated;
      }finally{releaseRequest();}
    })();
    inFlight[text]=job;
    job.then(function(){delete inFlight[text];},function(){delete inFlight[text];});
    return job;
  }
  async function translateNode(n){
    if(lang!=="ru"||!n||!n.isConnected||pending.has(n))return;
    var current=n.nodeValue,old=records.get(n);if(old&&old.applied===current)return;
    var source=current;tracked.add(n);
    if(skip(n)){records.set(n,{source:source,applied:current});return;}
    var text=source.trim(),known=d[norm(text)];
    if(known){var ko=preserve(source,known);muting=true;n.nodeValue=ko;records.set(n,{source:source,applied:ko});muting=false;return;}
    if(!/\s/.test(text)||/[А-Яа-яЁё]/.test(text)){records.set(n,{source:source,applied:current});return;}
    pending.add(n);var translated=await online(text);pending.delete(n);
    if(lang!=="ru"||!n.isConnected||n.nodeValue!==source)return;
    if(translated&&translated!==text){var out=preserve(source,translated);muting=true;n.nodeValue=out;records.set(n,{source:source,applied:out});muting=false;}
    else records.set(n,{source:source,applied:n.nodeValue});
  }
  function scan(root){
    if(lang!=="ru"||!root)return Promise.resolve();
    var base=root.nodeType===9?root.body:root;if(!base)return Promise.resolve();
    if(base.nodeType===3)return visible(base.parentElement)?translateNode(base):Promise.resolve();
    var w;try{w=document.createTreeWalker(base,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return skip(n)||!visible(n.parentElement)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});}catch(_){return Promise.resolve();}
    var list=[],n;while((n=w.nextNode()))list.push(n);
    return Promise.all(list.map(function(x){return translateNode(x);}));
  }
  function restore(){muting=true;tracked.forEach(function(n){var r=records.get(n);if(n.isConnected&&r)n.nodeValue=r.source;});muting=false;records=new WeakMap();tracked=new Set();}
  function updateToggle(){if(toggle){toggle.textContent=lang==="ru"?"🇷🇺 Русский · EN":"EN · Русский";toggle.title="Переключить язык. Автоперевод видимого текста требует интернета.";}}
  async function setLang(value){
    var before=lang;lang=value==="en"?"en":"ru";try{localStorage.setItem(langKey,lang);}catch(_){}
    document.documentElement.lang=lang;
    if(lang==="en"){
      restore();document.documentElement.classList.remove("apk-ru-pending");
      if(window.__apkOrigTitle)document.title=window.__apkOrigTitle;
    }else{
      if(!window.__apkOrigTitle)window.__apkOrigTitle=document.title;
      var sourceTitle=window.__apkOrigTitle;
      var knownTitle=d[norm(sourceTitle)];
      document.title=knownTitle||sourceTitle;
      var titleJob=(!knownTitle&&!/[А-Яа-яЁё]/.test(sourceTitle)&&/[A-Za-z]/.test(sourceTitle))?online(sourceTitle):Promise.resolve(null);
      if(before!=="ru"){records=new WeakMap();tracked=new Set();}
      await scan(document.body);
      try{
        var translatedTitle=await titleJob;
        if(lang==="ru"&&translatedTitle)document.title=translatedTitle;
      }catch(_){}
      document.documentElement.classList.remove("apk-ru-pending");
    }
    updateToggle();
  }
  async function start(){
    try{lang=localStorage.getItem(langKey)||"ru";}catch(_){lang="ru";}lang=lang==="en"?"en":"ru";
    if(!window.__apkOrigTitle)window.__apkOrigTitle=document.title;
    toggle=document.createElement("button");toggle.type="button";toggle.className="apk-language-toggle";toggle.setAttribute("data-no-translate","true");
    toggle.style.cssText="position:fixed;right:16px;top:12px;z-index:2147483647;padding:9px 13px;border:1px solid rgba(127,127,127,.4);border-radius:999px;background:#14201d;color:#fff;font:600 13px/1.2 system-ui,sans-serif;box-shadow:0 3px 14px #0003;cursor:pointer";
    toggle.addEventListener("click",function(){setLang(lang==="ru"?"en":"ru");});document.body.appendChild(toggle);
    if(lang==="ru")document.documentElement.classList.add("apk-ru-pending");
    observer=new MutationObserver(function(rs){if(muting||lang!=="ru")return;rs.forEach(function(r){if(r.type==="characterData"){var x=records.get(r.target);if(!x||x.applied!==r.target.nodeValue)translateNode(r.target);}else if(r.type==="childList")r.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n);else if(n.nodeType===3&&visible(n.parentElement))translateNode(n);});else if(r.type==="attributes")scan(r.target);});});
    observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["class","style","hidden"]});
    await setLang(lang);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();