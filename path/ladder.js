// Unit 1 typing ladder for the rotation trial.
// Six rungs, and nothing past LIMIT: every clause here is taught in Unit 1 of the SQL kit
// (SELECT & FROM, WHERE, ORDER BY & LIMIT, and "a query returns a table").
//
// Every query below was run against the baked drill database (drill/data.js, exported from
// music_gems.db) and the row counts are what SQLite actually returned.

const LAP = {
  unit: "Модуль 1: Первые запросы",
  lesson: "ВЫБРАТЬ, ГДЕ, ЗАКАЗАТЬ ПО, ОГРАНИЧИТЬ",

  // ── STEP 1: the primer ────────────────────────────────────────────────────
  // Six lines. Only what someone needs to type rung 1 without guessing.
  primer: [
    ["База данных — это таблицы", "Таблица состоит из строк и столбцов, как вкладка электронной таблицы. У этого есть таблица под названием <code>gem_page</code>, и одна строка в нем — это одна песня."],
    ["SELECT называет столбцы", "Вы перечисляете столбцы, которые хотите вернуть, через запятую."],
    ["FROM называет таблицу", "Вы говорите, из какой таблицы их читать."],
    ["ГДЕ хранит некоторые строки", "Он проверяет каждую строку на соответствие условию и сохраняет только те, в которых оно истинно. Текст заключается в одинарные кавычки: <code>ГДЕ жанр = «кантри»</code>."],
    ["ORDER BY сортирует строки.", "<code>DESC</code> ставит самое большое число сверху. <code>ASC</code> сначала наименьшее, и это то, что вы получите, если ничего не скажете."],
    ["LIMIT завершает список", "<code>ОГРАНИЧЕНИЕ 10</code> руки назад на десять рядов вместо пятисот."],
  ],

  // ── STEP 2: the typing rungs ──────────────────────────────────────────────
  // FOUR rungs, cut down from six on 2026-08-01 (Mike: short enough that someone finishes
  // wanting one more). One rung per read in step 3, so the typing and the lessons line up
  // exactly: SELECT & FROM, WHERE, ORDER BY & LIMIT, and a query always returns a table.
  //
  // What the cut dropped: the standalone AND rung, and the standalone ORDER BY rung that
  // was followed by a LIMIT rung. ORDER BY and LIMIT are one lesson and one idea — a top
  // ten — so they are one rung. AND survives in the WHERE lesson's notes and in the mini
  // quiz, which is where a learner meets it next.
  // `given` is the answerable-from-the-screen rule (REAL_TEST.md 5d): every decision the
  // check compares against is stated in words, on the screen, at the moment of the ask.
  // A business question does not carry its own thresholds, sort order or caps, and a learner
  // who cannot see them is being asked to guess and then told they were wrong.
  drills: [
    { adds: "Попросите три столбца",
      q: "Какие исполнители, треки и размер аудитории есть в сборнике?",
      given: ["Таблица <code>gem_page</code>",
              "Все песни в таблице, ничего не отфильтровано"],
      why: "Скелет каждого запроса, который вы когда-либо напишете: ВЫБЕРИТЕ столбцы ИЗ таблицы.",
      // `did` and `matters` are what the celebration popup carries. What you just did, in
      // words, and why a working analyst cares. Not a restatement of the syntax.
      did: "Вы извлекли три именованных столбца из таблицы из 500 песен.",
      matters: "Присвоение имен столбцам, которые вы хотите, вместо того, чтобы запрашивать их все, делает запрос доступным для чтения следующему человеку и предотвращает его сбой, когда кто-то добавляет столбец в таблицу.",
      sql:
`SELECT artist, track, listeners
FROM gem_page;`,
      pre: "Стол вмещает 500 песен. Сколько строк возвращается, когда вы ничего не отфильтровали?",
      rows: 500 },

    { adds: "Оставьте только кантри-песни",
      q: "Какая из этих песен кантри?",
      given: ["Таблица <code>gem_page</code>",
              "Страна означает <code>genre</code> столбец точно <code>country</code>"],
      why: "WHERE фильтрует строки. Одинарные кавычки позволяют SQL узнать, что страна — это текст, а не имя столбца.",
      did: "Вы вырезаете 500 песен до кантри, и таблица показывает, сколько их было.",
      matters: "WHERE — это предложение, которое вы будете использовать чаще, чем любое другое. Почти каждый вопрос, который вам задают, представляет собой фильтр с бизнес-вопросом: этот регион, этот квартал, эти клиенты.",
      sql:
`SELECT artist, track, listeners
FROM gem_page
WHERE genre = 'country';`,
      pre: "Из 500 песен кантри больше или меньше 100?",
      rows: 52 },

    { adds: "Отсортируйте их и сократите до первой десятки.",
      q: "Каковы десять самых популярных песен в стиле кантри?",
      given: ["Таблица <code>gem_page</code>",
              "Страна означает <code>genre</code> столбец точно <code>country</code>",
              "Самый большой значит самый <code>listeners</code>, первый по величине",
              "Десять рядов, не более"],
      why: "ORDER BY сортирует то, что у вас уже есть, а затем LIMIT ограничивает это. Этот порядок имеет значение: сначала ограничение, и вы должны ограничить его перед сортировкой. Именно так строится каждый отчет о десятке лучших, который вы когда-либо публикуете.",
      did: "Вы поместили самую большую аудиторию сверху и сохранили первые десять рядов.",
      matters: "Каждый отчет из первой десятки, каждая таблица лидеров и каждый «покажи мне последние новости» имеют именно такую ​​форму. Порядок двух предложений — это то, в чем люди ошибаются: сначала сортируйте, затем ограничивайте, иначе вы закроете кучу неотсортированных строк и отправите неправильные десять.",
      sql:
`SELECT artist, track, listeners
FROM gem_page
WHERE genre = 'country'
ORDER BY listeners DESC
LIMIT 10;`,
      pre: "У вас было 52 ряда. Сколько сейчас вернутся?",
      rows: 10 },

    { adds: "Посчитайте, с чем вы работаете",
      q: "Сколько существует кантри-песен и сколько разных исполнителей их написали?",
      given: ["Таблица <code>gem_page</code>",
              "Страна означает <code>genre</code> столбец точно <code>country</code>",
              // Run 008: this drill needs three words the primer never taught (COUNT,
              // DISTINCT, AS) and step 3 covers the query, so a learner was being asked to
              // retrieve syntax that had no source on the screen. Naming the words satisfies
              // 5d without writing the line: assembling them is still the work.
              "<code>СЧИТАТЬ(*)</code> считает строки; <code>СЧЕТ(ОТЛИЧНЫЕ ...)</code> считает каждое значение один раз",
              // The old wording said "Name the two numbers total_rows and artists", which
              // read exactly like the "Bring back" column lists on drills 1 to 3. The likely
              // first attempt was SELECT total_rows, artists — a real column that does not
              // exist. Say plainly that these are names being created.
              "<code>total_rows</code> и <code>artists</code> это имена, которые вы создаете с <code>AS</code>, а не столбцы в таблице",
              "Разные артисты означают, что каждый артист посчитан один раз."],
      why: "Запрос всегда возвращает таблицу, даже если ответом являются два числа. Сравнивая их, вы поймете, что один исполнитель может записать несколько песен.",
      did: "У вас есть одна строка назад, содержащая два числа: сколько существует песен в стиле кантри и сколько разных исполнителей их написали.",
      matters: "Подсчет строк и подсчет отдельных значений — это способ узнать, что на самом деле представляет собой одна строка таблицы. Если вы ошибетесь, каждое число, которое вы сообщите впоследствии, окажется неверным, и никто этого не заметит, потому что запрос все равно будет выполняться.",
      sql:
`SELECT COUNT(*) AS total_rows,
       COUNT(DISTINCT artist) AS artists
FROM gem_page
WHERE genre = 'country';`,
      pre: "Вы знаете, что есть 52 кантри-песни. Будет ли тоже 52 артиста?",
      rows: 1 },
  ],

  // ── STEP 4: what you did ──────────────────────────────────────────────────
  // One block per NEW thing the four queries introduced, and nothing else. Short enough to
  // read standing up. Each one says what the words do, why the query worked, and where a
  // working person actually meets it, across industries and roles rather than in the
  // abstract. This replaced a four-read lesson step that sat between the two typing passes.
  concepts: [
    { name: "ВЫБРАТЬ и ОТ",
      does: 'SELECT names the columns you want back. FROM names the table to read them from. Every query you write starts with these two.',
      worked: "Вы запросили три столбца из таблицы из 500 песен и получили три столбца обратно. Больше ничего с ними не пришло, потому что вы ни о чем больше не просили.",
      where: [
        ["Маркетинговый аналитик", "извлечение названий кампаний и расходов из экспорта рекламной платформы"],
        ["Менеджер медсестры", "получение идентификаторов пациентов и дат приема для передачи смены"],
        ["Планировщик склада", "получение SKU и количества запасов перед повторным заказом"]
      ] },

    { name: 'WHERE',
      does: "WHERE проверяет каждую строку на соответствие условию и сохраняет только те строки, в которых оно истинно. Текстовые значения заключаются в одинарные кавычки, поэтому SQL знает, что страна — это слово, а не имя столбца.",
      worked: "500 строк превратились в 52. Таблица не изменилась; ты просто перестал спрашивать обо всем остальном.",
      where: [
        ["Розничный аналитик", "сужение до одного региона перед ежеквартальным обзором"],
        ["Аналитик по претензиям", "извлечение только отклоненных претензий из года подачи заявок"],
        ['Recruiter', "вытягиваем только те роли, которые еще открыты"]
      ] },

    { name: "ЗАКАЗАТЬ ПО и ОГРАНИЧИТЬ",
      does: "ORDER BY сортирует уже имеющиеся строки. LIMIT ограничивает количество вернувшихся. Порядок этих двух строк фиксирован: сначала сортировка, затем ограничение, или вы ограничиваете кучу неотсортированных строк.",
      worked: "Сортировка помещала самую большую аудиторию на первое место, не добавляя и не удаляя ни одной строки, а затем LIMIT сохранял первые десять из них.",
      where: [
        ["Операции по продажам", "десять крупнейших аккаунтов по выручке, каждое утро понедельника"],
        ["Руководитель службы поддержки", "десять самых старых билетов все еще открыты"],
        ["Медиабайер", "самые эффективные группы объявлений, сначала худшие, поэтому сокращения очевидны"]
      ] },

    { name: "СЧИТАТЬ, ОТЛИЧИТЬ и КАК",
      does: "COUNT(*) подсчитывает строки. COUNT(столбец DISTINCT) подсчитывает каждое отдельное значение один раз. AS дает номеру, который вы создали, имя, потому что это не столбец, существующий в таблице.",
      worked: "Одна строка вернулась с двумя числами. Запрос всегда возвращает таблицу, даже если ответом является одна цифра.",
      where: [
        ["Любой аналитик, первый день за новым столом", "подсчет строк против подсчета различных идентификаторов - это то, как вы узнаете, что на самом деле представляет собой одна строка"],
        ['Ecommerce', "сколько заказов на какое количество клиентов, что говорит о частоте повторения"],
        ['Healthcare', "сколько посещений против скольких пациентов, это совсем другое число и совсем другая история"]
      ] },
  ],

  // ── unused since 2026-08-01 ───────────────────────────────────────────────
  // Kept because the checkpoint work will want them back. The round no longer has a lesson
  // handoff step or a mini quiz.
  // The existing kit lessons, unchanged. Deep links open the lesson directly.
  lessons: [
    { id: 1,   title: 'SELECT & FROM',                    sub: "Извлечение столбцов из таблицы" },
    { id: 2,   title: 'WHERE',                            sub: "Фильтровать строки по условию" },
    { id: 104, title: "Запрос возвращает таблицу; NULL = Неизвестно", sub: "Возвращаемая форма и что на самом деле означает пустая ячейка" },
    { id: 3,   title: "СОРТИРОВАТЬ ПО И ОГРАНИЧИТЬ",                 sub: "Сортируйте и ограничивайте результаты" },
  ],

  // ── STEP 4: the mini quiz ─────────────────────────────────────────────────
  // Four questions, one per lesson, taken from the kit's own lesson quizzes so the
  // trial is not inventing a second set of answers to keep in sync.
  quiz: [
    { q: "Какое предложение сообщает SQL, из какой таблицы следует читать?",
      opts: ['SELECT', 'FROM', 'WHERE', 'ORDER BY'], ans: 1,
      exp: "FROM называет таблицу. SELECT называет столбцы, которые вы хотите вернуть." },

    { q: "Вам нужны кантри-песни, которые слушают более 20 000 человек. Какая линия это делает?",
      opts: ["ГДЕ жанр = «кантри» И слушателей > 20 000",
             "ГДЕ жанр = страна И слушатели > 20 000",
             "ФИЛЬТР по жанру = «кантри» И слушатели > 20 000",
             "ГДЕ жанр = «кантри» ИЛИ слушателей > 20 000"], ans: 0,
      exp: "Текстовые значения должны быть заключены в одинарные кавычки, а AND означает, что строка должна соответствовать обоим условиям. ИЛИ пропускал громкую поп-песню." },

    { q: "Вы запускаете SELECT COUNT(*) и получаете 500. Вы запускаете SELECT COUNT(альбом) и получаете 480. О чем это вам говорит?",
      opts: ["В запросе есть ошибка",
             "20 строк имеют значение NULL в столбце альбома.",
             "в альбоме 20 повторяющихся значений",
             "Вместо этого вы должны использовать SUM"], ans: 1,
      exp: "COUNT(*) подсчитывает каждую строку. COUNT(столбец) пропускает NULL. Разрыв в 20 означает, что в 20 строках альбом не записан." },

    { q: "Получите 10 самых старых заказов. Какой запрос правильный?",
      opts: ['SELECT * FROM orders ORDER BY order_date ASC LIMIT 10;',
             'SELECT * FROM orders ORDER BY order_date DESC LIMIT 10;',
             'SELECT * FROM orders LIMIT 10 ORDER BY order_date;',
             'SELECT TOP 10 * FROM orders ORDER BY order_date;'], ans: 0,
      exp: "ASC сортирует сначала самые старые. LIMIT должен идти после ORDER BY, иначе вы ограничите строки перед их сортировкой." },
  ],
};
