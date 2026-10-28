// Unit 1 lesson content for the round, held here rather than borrowed at runtime.
//
// WHY IT IS COPIED. The round used to open `/sql/#lesson-1` in a new tab. That pushed the
// learner out of a five-step round and into a 4,441px kit page with its own progress, its
// own nav and its own idea of where they were. Mike's call, 2026-08-01: keep them in the
// app. The kit's Unit 1 progress and this round's progress are now independent, which is
// the point — finishing a round must not mark kit lessons done, and vice versa.
//
// SOURCE OF TRUTH FOR THE TEACHING: `sql/index.html`, the LESSONS array, entries
// id 1, 2, 104 and 3. Copied 2026-08-01. If the kit's Unit 1 wording changes, this file is
// the second place to change. The drift is real and it is deliberate; the alternative was
// sending a first-timer into the full kit to find their way back.
//
// What is copied: story, intro, the read-aloud walkthrough, notes, the result-shape
// picture, the ordering note, the close and the unlock. What is NOT copied: each lesson's
// quiz, Parsons problem and build question. The round has its own mini quiz in ladder.js,
// drawn from these same lessons, and a second copy of the drills would be three ways to
// answer the same four questions.

const LESSON_TEXT = [
  {
    id: 1,
    title: 'SELECT & FROM',
    sub: "Извлечение столбцов из таблицы",
    story: "You know the mental model: databases are tables, rows have a grain, keys connect tables, queries return tables. Now write your first actual question. SELECT names the columns you want; FROM names the table to get them from. That's the whole skeleton. Every query you'll ever write starts with these two words.",
    intro: "Запрос SELECT похож на заказ в гастрономе: вы называете то, что хотите (столбцы), и из какого прилавка это получить (таблица). Каждый SQL-запрос начинается с <code>SELECT</code> выбирать столбцы и <code>FROM</code> назвать таблицу. Думайте об этом так: «Дай мне <em>эти столбцы</em> from <em>этот стол</em>».",
    ral: {
      sql: 'SELECT name, email\nFROM customers;',
      say: "Дайте мне столбцы имени и электронной почты из таблицы клиентов.",
      lines: [
        ['SELECT', "отображать — запустите запрос, перечислив столбцы, которые вы хотите вернуть."],
        ["имя, электронная почта", "два отображаемых столбца, разделенные запятой"],
        ['FROM', "вытащить из — называет таблицу для чтения"],
        ['customers', "таблица, содержащая одну строку на каждого клиента"],
        [';', "заканчивает заявление"]
      ]
    },
    notes: "Use <code>ВЫБИРАТЬ *</code> захватить каждый столбец — удобно для исследования, но в реальных запросах столбцам следует указывать явное имя.",
    viz: {
      columns: ['name', 'email'],
      rows: [['Maya Chen', 'maya@co.com'], ["Джордан Ли", 'jordan@co.com'], ["Сэм Ривера", 'sam@co.com'], ["Алекс Ким", 'alex@co.com']],
      caption: "Два столбца, по одной строке на каждого клиента — именно те столбцы, которые вы указали в SELECT."
    },
    compare: "Порядок фиксирован: SELECT всегда впереди, FROM всегда следует. Даже если вы сначала думаете о таблице, запрос называет столбцы перед источником.",
    close: "Вы можете извлечь любой столбец из любой таблицы. Каждый запрос, который вы когда-либо напишете, начинается именно с этого.",
    unlock: "Явное именование столбцов вместо SELECT * — это производственная привычка: она делает запросы самодокументируемыми и невосприимчивыми к взлому, когда кто-то позже добавит столбец в таблицу."
  },
  {
    id: 2,
    title: 'WHERE',
    sub: "Фильтровать строки по условию",
    story: "You can pull columns from a table. Your manager's first real question isn't 'show me everything' — it's 'show me just the West region.' WHERE is the filter: it checks a condition row by row and only returns the rows where it's true. SELECT tells SQL what to show; WHERE tells it which rows.",
    intro: "WHERE — это как список гостей у двери — попадают только те строки, имя которых в нем указано (условие истинно). <code>WHERE</code> фильтрует, какие строки возвращаются. Возвращаются только строки, в которых условие имеет значение TRUE.",
    ral: {
      sql: "SELECT name\nFROM customers\nWHERE status = 'active';",
      say: "Назовите мне имена клиентов, у которых статус «активный».",
      lines: [
        ["ВЫБЕРИТЕ имя", "отобразить столбец имени"],
        ["ОТ клиентов", "взять со стола клиентов"],
        ["ГДЕ статус = «активный»", "сохранять только строки, в которых столбец статуса равен тексту «активный»"],
        ["= 'активный'", "одинарные кавычки заключают текстовые значения; SQL использует = для равенства, а не =="]
      ]
    },
    notes: "Общие операторы: <code>=</code> <code>!=</code> <code>></code> <code><</code> <code>BETWEEN</code> <code>LIKE</code> <code>IN</code>. Комбинировать с <code>AND</code> / <code>OR</code>.",
    viz: {
      columns: ['name'],
      rows: [['Maya Chen'], ["Джордан Ли"], ["Алекс Ким"]],
      caption: "Только строки со статусом = «активный» выдерживают фильтр WHERE — Сэм (неактивный) и Тейлор (ожидающий) исключаются."
    },
    compare: "WHERE идет после FROM, а не перед ним. Порядок предложений всегда следующий: SELECT → FROM → WHERE → ORDER BY. Замена местами WHERE и FROM является синтаксической ошибкой.",
    close: "Вы можете фильтровать именно те строки, которые вам нужны. ГДЕ — это единственное наиболее часто используемое предложение в реальной работе аналитика.",
    unlock: "WHERE выполняет короткое замыкание, как только строка не соответствует условию — база данных немедленно прекращает оценку этой строки. Установка наиболее избирательного условия на первое место может ускорить запросы к большим таблицам — небольшая привычка, имеющая значение в масштабе."
  },
  {
    id: 104,
    title: "Запрос возвращает таблицу; NULL = Неизвестно",
    sub: "Форма вывода каждого SQL-запроса и особый случай отсутствия данных.",
    story: "Ключи соединяют таблицы. Еще одна идея перед запросом: SQL всегда возвращает набор результатов в виде таблицы — даже одно число заключено в таблицу 1×1. А пустые ячейки в базе данных не являются пустыми — они имеют значение NULL, что означает «неизвестно». NULL — это не ноль и не пустая строка. У него есть свои собственные правила сравнения, и игнорирование их приводит к неверным итоговым результатам.",
    intro: "Каждый SQL-запрос возвращает таблицу — строки и столбцы, даже если это одна строка или один столбец. Это контракт. А когда значение отсутствует или неизвестно, базы данных сохраняют NULL — специальный сигнал, означающий «мы не знаем». NULL НЕ равен нулю. NULL НЕ является пустой строкой. NULL не равен NULL. Сравнения с NULL требуют <code>НУЛЕВЫЙ</code> / <code>НЕ НУЛЬ</code>, нет <code>= НУЛЬ</code>.",
    ral: {
      sql: 'SELECT name, revenue\nFROM orders\nWHERE region IS NULL;',
      say: "Показывать мне каждый заказ, в котором регион неизвестен (NULL).",
      lines: [
        ["ВЫБЕРИТЕ название, доход", "отображать столбцы имени и дохода"],
        ["ОТ заказов", "взять из таблицы заказов"],
        ["ГДЕ регион НУЛЕВОЙ", 'keep only rows where region is unknown — IS NULL is the only test that works; = NULL never matches, because NULL equals nothing'],
        ['NULL', "означает «неизвестно» — не ноль, не пусто; НОЛЬ + что-нибудь = НОЛЬ"],
        ["COUNT(*) против COUNT(столбец)", "COUNT(*) подсчитывает каждую строку; COUNT(столбец) пропускает NULL — пробел — это количество пропущенных значений."]
      ]
    },
    notes: 'COUNT(*) and COUNT(column) return different numbers when a column has NULLs. COUNT(*) counts every row; COUNT(revenue) skips rows where revenue is NULL. If your totals seem low, check for NULLs with SELECT COUNT(*) vs SELECT COUNT(revenue) — a difference tells you how many NULL rows there are.',
    viz: {
      columns: ['order_id', 'region', 'revenue', "COUNT(*) видит эту строку?", "COUNT(доход) видит это?"],
      rows: [['1001', 'West', '150', "да ✓", "да ✓"], ['1002', 'NULL', '200', "да ✓", "да ✓"], ['1003', 'East', 'NULL', "да ✓", "нет — NULL пропущен"]],
      caption: "COUNT(*) подсчитывает все 3 строки. COUNT(доход) учитывает только 2 (пропускает NULL). COUNT(регион) учитывает только 2 (пропускает NULL-строку 1002). Эти различия незаметно меняют ваши итоги, если вы их не ожидаете."
    },
    compare: "IS NULL — единственный правильный тест на пропущенные значения. Распространенной ошибкой является запись = NULL, но NULL означает «неизвестно», поэтому NULL = NULL оценивается как неизвестное (ложь), а не как истина. IS NULL обходит это.",
    close: "Вы знаете, что возвращает SQL и как ведет себя NULL — это предотвращает целый класс молчаливых неправильных ответов.",
    unlock: "Распространение NULL — самый тихий источник неправильных итогов в SQL. Как только вы узнаете, что NULL + Что-либо = NULL и что COUNT(столбец) пропускает NULL, вы обнаружите ошибки вычислений, которые вводят в заблуждение большинство младших аналитиков."
  },
  {
    id: 3,
    title: "СОРТИРОВАТЬ ПО И ОГРАНИЧИТЬ",
    sub: "Сортируйте и ограничивайте результаты",
    story: "Вы можете фильтровать строки. Вашему менеджеру нужны в первую очередь заказы с наибольшим доходом, а не тот порядок, в котором они хранятся в базе данных. ORDER BY сортирует результат — ASC от меньшего к большему, DESC от большего к меньшему. LIMIT ограничивает количество возвращаемых строк. Два небольших предложения, которые делают вывод запроса читабельным.",
    intro: "ORDER BY и LIMIT похожи на таблицу лидеров: отсортируйте всех по баллам, а затем отобразите только несколько лучших. <code>ЗАКАЗАТЬ ПО</code> сортирует результаты. <code>LIMIT</code> ограничивает количество возвращаемых строк — важно для больших таблиц.",
    ral: {
      sql: 'SELECT name, order_date\nFROM orders\nORDER BY order_date DESC\nLIMIT 5;',
      say: "Дайте мне имя и дату заказа из заказов, отсортированных по самым последним, и только первые 5 результатов.",
      lines: [
        ["ВЫБЕРИТЕ имя, дату_заказа", "отображать столбцы имени и даты заказа"],
        ["ОТ заказов", "взять из таблицы заказов"],
        ["СОРТИРОВАТЬ ПО order_date DESC", "сортировка по дате заказа — DESC = по убыванию, сначала самые новые"],
        ['LIMIT 5', 'return only the first 5 rows after sorting']
      ]
    },
    notes: "<code>ASC</code> (по возрастанию, A→Z, 0→9) — значение по умолчанию. <code>DESC</code> меняет его. Всегда используйте LIMIT при исследовании больших данных.",
    viz: {
      columns: ['name', 'order_date'],
      rows: [['Maya Chen', '2026-05-30'], ["Алекс Ким", '2026-05-28'], ["Джордан Ли", '2026-05-21'], ["Сэм Ривера", '2026-05-14'], ['Maya Chen', '2026-05-02']],
      caption: "Отсортировано по порядку_даты: сначала самые новые, затем LIMIT ограничивает их 5-ю верхними строками."
    },
    compare: "LIMIT должен идти после ORDER BY, а не перед ним. Сначала происходит сортировка, затем применяется ограничение. Их замена местами приведет к ограничению перед сортировкой — вы получите случайные 3 отсортированные строки, а не 3 самые последние.",
    close: "Вы можете сортировать результаты и ограничивать их до полезного размера. ORDER BY + LIMIT стоит за каждой таблицей лидеров, отчетом N лучших и запросом «покажи мне последние».",
    unlock: "Значения NULL сортируются до конца в формате ASC и до начала в формате DESC в большинстве баз данных. Если ваши первые 10 результатов выглядят неправильными, проверьте, не появляются ли NULL перед реальными значениями."
  }
];
