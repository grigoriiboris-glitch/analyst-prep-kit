// Ladder: music gems, country section, generalist junior business analyst.
// Every query here was run against music_gems.db before it was written down.
// rows = the row count the learner should get back.

const LADDER = {
  name: "Country Gems, младший бакалавр широкого профиля",
  short: "General",
  blurb: "Начните с отфильтрованного списка кантри-треков и перейдите к ответу в две строки о том, где на самом деле сидит публика.",
  grain: {
    gem_page: "одна строка = одна тщательно подобранная дорожка драгоценных камней",
    artist_era: "один ряд = один исполнитель"
  },
  footnote: "Половина диаграммы этой практики <a href=\"../viz/\">Виз Дрель</a>: те же 52 кантри-трека, те же вопросы, построенные с полочками вместо статей.",
  drills: [

  { adds: "Перечислите кантри-треки",
    q: "Какие кантри-треки есть в коллекции и насколько велик каждый из них?",
    why: "Базовая форма: именованные столбцы с фильтром.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: ВЫБРАТЬ, ОТКУДА и ГДЕ" },
    header:
`-- Цель: составить список кантри-треков из коллекции драгоценных камней с указанием размера их аудитории.
-- Источник: gem_page, одна строка = одна тщательно подобранная дорожка драгоценных камней.`,
    sql:
`SELECT artist, track, listeners
FROM gem_page
WHERE genre = 'country';`,
    pre: "Среди 500 драгоценных треков кантри больше или меньше 100?",
    rows: 52 },

  { adds: "Поместите самую большую аудиторию на первое место",
    q: "Какой кантри-трек имеет больше всего слушателей?",
    why: "Отсортируйте строки так, чтобы самая большая аудитория была сверху.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: сортировка с помощью ORDER BY" },
    header:
`-- Цель: ранжировать страны по размеру аудитории, начиная с самой большой.
-- Источник: gem_page, одна строка = одна тщательно подобранная дорожка драгоценных камней.`,
    sql:
`SELECT artist, track, listeners
FROM gem_page
WHERE genre = 'country'
ORDER BY listeners DESC;`,
    pre: "Те же 52 строки или меньше?",
    rows: 52 },

  { adds: "Сократите это до первой десятки",
    q: "Каковы десять крупнейших кантри-треков?",
    why: "Сократите список до первой десятки, как это обычно и составляет рейтинг.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: LIMIT и списки Top-N" },
    header:
`-- Цель: 10 лучших стран по размеру аудитории для раздела стран.
-- Источник: gem_page, одна строка = одна тщательно подобранная дорожка драгоценных камней.`,
    sql:
`SELECT artist, track, listeners
FROM gem_page
WHERE genre = 'country'
ORDER BY listeners DESC
LIMIT 10;`,
    pre: "Сколько разных артистов вы ожидаете в этих 10 рядах?",
    rows: 10 },

  { adds: "Посчитайте треки, которые есть у каждого исполнителя",
    q: "Художники каких стран чаще всего появляются в сборнике?",
    why: "GROUP BY: сжимает строки до одной на каждого исполнителя, чтобы вы могли их посчитать.",
    guide: { href: '../guides/sql-group-by-having/', label: "Читайте: как работает GROUP BY" },
    header:
`-- Цель: у каких исполнителей кантри больше всего драгоценных треков в коллекции.
-- Источник: gem_page, одна строка = один исполнитель после группировки.`,
    sql:
`SELECT artist, COUNT(*) AS tracks
FROM gem_page
WHERE genre = 'country'
GROUP BY artist
ORDER BY tracks DESC
LIMIT 10;`,
    pre: "Больше строк, чем 52, с которых вы начали, или меньше?",
    rows: 10 },

  { adds: "Оставляйте только исполнителей, у которых более одного трека.",
    q: "Какие артисты появляются более одного раза и как часто?",
    why: "HAVING, который фильтрует группы после подсчета. ОГРАНИЧИТЕЛЬ сбрасывается.",
    guide: { href: '../guides/sql-group-by-having/', label: "Читайте: ГДЕ против ИМЕТЬ" },
    header:
`-- Цель: исполнители кантри, имеющие более одного драгоценного трека, ранжированные по количеству треков.
-- Источник: gem_page, одна строка = один исполнитель после группировки.
-- Примечание. HAVING фильтрует группы после подсчета, WHERE фильтрует строки перед ним.`,
    sql:
`SELECT artist, COUNT(*) AS tracks
FROM gem_page
WHERE genre = 'country'
GROUP BY artist
HAVING COUNT(*) >= 2
ORDER BY tracks DESC, artist;`,
    pre: "Ближе к 12 строкам или ближе к 30?",
    rows: 12 },

  { adds: "Сложите аудиторию для каждого исполнителя",
    q: "Какой повторяющийся артист имеет самую большую общую аудиторию?",
    why: "Второй совокупный показатель, поэтому каждый исполнитель сообщает об общей аудитории, а также о количестве треков.",
    guide: { href: '../guides/sql-count-function/', label: "Читать: счет и суммирование." },
    header:
`-- Цель: повторять кантри-исполнителей, ранжированных по общей аудитории их драгоценных треков.
-- Источник: gem_page, одна строка = один исполнитель после группировки.
-- Примечание: значение total_listeners суммируется по трекам этого исполнителя, поэтому количество треков увеличивается.`,
    sql:
`SELECT artist,
       COUNT(*) AS tracks,
       SUM(listeners) AS total_listeners
FROM gem_page
WHERE genre = 'country'
GROUP BY artist
HAVING COUNT(*) >= 2
ORDER BY total_listeners DESC;`,
    pre: "Соответствует ли художник наверху тому, кто превзошел упражнение 3?",
    rows: 12 },

  { adds: "Добавьте, как сильно фанаты их переигрывают.",
    q: "Есть ли у крупнейших артистов самые преданные слушатели?",
    why: "Среднее, округленное, чтобы столбец можно было прочитать в отчете.",
    guide: { href: '../guides/sql-group-by-having/', label: "Читайте: средние значения в сгруппированном запросе" },
    header:
`-- Цель: повторять кантри-исполнителей с учетом размера аудитории и того, насколько сильно фанаты их воспроизводят.
-- Источник: gem_page, одна строка = один исполнитель после группировки.
-- Примечание: play_per_listener — это количество воспроизведений, разделенное на количество слушателей, поэтому это чтение лояльности.`,
    sql:
`SELECT artist,
       COUNT(*) AS tracks,
       SUM(listeners) AS total_listeners,
       ROUND(AVG(plays_per_listener), 2) AS avg_plays_per_listener
FROM gem_page
WHERE genre = 'country'
GROUP BY artist
HAVING COUNT(*) >= 2
ORDER BY total_listeners DESC;`,
    pre: "Будет ли у крупнейшего артиста наибольшее количество прослушиваний на одного слушателя?",
    rows: 12 },

  { adds: "Вспомните десятилетие, которое начал каждый художник",
    q: "Когда эти артисты впервые попали в чарты?",
    why: "JOIN вытягивает дебютное десятилетие из второго стола.",
    guide: { href: '../guides/sql-joins/', label: "Читать: присоединение ко второму столу" },
    header:
`-- Цель: повторить кантри-исполнителей того десятилетия, которое они впервые попали в чарты.
-- Источник: gem_page присоединен к Artist_era, одна строка = один исполнитель после группировки.
-- Примечание: ключом присоединения является имя исполнителя, поэтому артист, отсутствующий в Artist_era, выпадает из списка.`,
    sql:
`SELECT g.artist,
       e.debut_decade,
       COUNT(*) AS tracks,
       SUM(g.listeners) AS total_listeners
FROM gem_page AS g
JOIN artist_era AS e ON e.primary_artist = g.artist
WHERE g.genre = 'country'
GROUP BY g.artist, e.debut_decade
HAVING COUNT(*) >= 2
ORDER BY total_listeners DESC;`,
    pre: "Те же 12 артистов, что и в прошлом упражнении, или объединение кого-то потеряет?",
    rows: 12 },

  { adds: "Задавайте вопрос по десятилетиям, а не по художникам.",
    q: "Какое десятилетие художников собирает самую большую аудиторию?",
    why: "Измените зерно: группируйте по десятилетиям, а не по художникам.",
    guide: { href: '../guides/defining-metrics/', label: "Читайте: выбираем зерно" },
    header:
`-- Цель: в каком дебютном десятилетии на самом деле находится аудитория кантри-джемов?
-- Источник: gem_page присоединен к Artist_era, одна строка = одно дебютное десятилетие.
-- Примечание: исполнители учитываются отдельно, поскольку у одного исполнителя есть несколько треков.`,
    sql:
`SELECT e.debut_decade,
       COUNT(DISTINCT g.artist) AS artists,
       COUNT(*) AS tracks,
       SUM(g.listeners) AS total_listeners
FROM gem_page AS g
JOIN artist_era AS e ON e.primary_artist = g.artist
WHERE g.genre = 'country'
GROUP BY e.debut_decade
ORDER BY total_listeners DESC;`,
    pre: "Какое десятилетие вы ожидаете на вершине?",
    rows: 7 },

  { adds: "Превратите суммы в доли",
    q: "Какую долю аудитории страны занимает каждое десятилетие?",
    why: "Доля от общей суммы, с использованием подзапроса в качестве знаменателя.",
    guide: { href: '../guides/data-driven-thresholds/', label: "Читайте: Превращение итогов в доли" },
    header:
`-- Цель: доля аудитории кантри-джемов, занимаемой каждым дебютным десятилетием.
-- Источник: gem_page присоединен к Artist_era, одна строка = одно дебютное десятилетие.
-- Примечание: 100,0 сил десятичное деление, только 100 округляет каждую долю до нуля.`,
    sql:
`SELECT e.debut_decade,
       COUNT(DISTINCT g.artist) AS artists,
       COUNT(*) AS tracks,
       SUM(g.listeners) AS total_listeners,
       ROUND(100.0 * SUM(g.listeners) /
             (SELECT SUM(listeners) FROM gem_page WHERE genre = 'country'), 1) AS pct_of_country
FROM gem_page AS g
JOIN artist_era AS e ON e.primary_artist = g.artist
WHERE g.genre = 'country'
GROUP BY e.debut_decade
ORDER BY total_listeners DESC;`,
    pre: "Должна ли сумма в столбце «проценты» составлять 100 или немного меньше?",
    rows: 7 },

  { adds: "Назовите набор один раз, чтобы не повторять его.",
    q: "Те же акции, написанные для того, чтобы рецензент мог за ними следить.",
    why: "CTE, который присваивает отфильтрованному набору имя один раз, чтобы остальная часть запроса не повторяла его.",
    guide: { href: '../guides/sql-ctes/', label: "Читайте: что такое CTE" },
    header:
`-- Цель: доля аудитории кантри-джема к дебютному десятилетию, основанная на названном выпуске.
-- Источник: Country_gems, одна строка = один трек кантри-джема с десятилетием исполнителя.
-- Примечание. Сначала запускается CTE, поэтому знаменатель подзапроса теперь считывается из того же набора.`,
    sql:
`WITH country_gems AS (
  SELECT g.artist, g.track, g.listeners, e.debut_decade
  FROM gem_page AS g
  JOIN artist_era AS e ON e.primary_artist = g.artist
  WHERE g.genre = 'country'
)
SELECT debut_decade,
       COUNT(DISTINCT artist) AS artists,
       COUNT(*) AS tracks,
       SUM(listeners) AS total_listeners,
       ROUND(100.0 * SUM(listeners) /
             (SELECT SUM(listeners) FROM country_gems), 1) AS pct_of_country
FROM country_gems
GROUP BY debut_decade
ORDER BY total_listeners DESC;`,
    pre: "Должны ли цифры измениться по сравнению с последним упражнением или точно совпадать?",
    rows: 7 },

  { adds: "Соедините десятилетия в новое и старое",
    q: "Какие десятилетия считаются новыми художниками, а какие — каталогом?",
    why: "CASE, в котором десятилетия разделены на две группы, о которых вы действительно можете говорить.",
    guide: { href: '../guides/sql-case-expression/', label: "Читайте: выражения CASE." },
    header:
`-- Цель: аудитория драгоценных камней по странам по десятилетиям, с тегами «современно» или «каталог».
-- Источник: Country_gems, одна строка = один трек кантри-джема с десятилетием исполнителя.
-- Примечание: «современный» означает, что артист впервые попал в чарты в 2010 году или позже.`,
    sql:
`WITH country_gems AS (
  SELECT g.artist, g.track, g.listeners, e.debut_decade,
         CASE WHEN e.debut_decade IN ('2010s', '2020s') THEN 'modern'
              ELSE 'catalog' END AS era_group
  FROM gem_page AS g
  JOIN artist_era AS e ON e.primary_artist = g.artist
  WHERE g.genre = 'country'
)
SELECT debut_decade,
       era_group,
       COUNT(*) AS tracks,
       SUM(listeners) AS total_listeners,
       ROUND(100.0 * SUM(listeners) /
             (SELECT SUM(listeners) FROM country_gems), 1) AS pct_of_country
FROM country_gems
GROUP BY debut_decade, era_group
ORDER BY total_listeners DESC;`,
    pre: "По-прежнему 7 строк, или столбец CASE разбивает несколько десятилетий на две части?",
    rows: 7 },

  { adds: "Закончите ответом в две строки.",
    q: "Кантри-зрители сидят с новыми артистами или со старыми?",
    why: "Результат: группировка по корзинам, и вся лестница распадается на два ряда, по которым может действовать менеджер.",
    guide: { href: '../guides/defining-metrics/', label: "Читайте: номер, по которому действует менеджер" },
    header:
`-- Цель: Как аудитория кантри-джемов распределяется между современными и каталожными художниками.
-- Источник: Country_gems, одна строка = одна группа эпох.
-- Примечание. avg_listeners_per_track — это корректное сравнение, поскольку группы содержат разное количество дорожек.`,
    sql:
`WITH country_gems AS (
  SELECT g.artist, g.track, g.listeners, e.debut_decade,
         CASE WHEN e.debut_decade IN ('2010s', '2020s') THEN 'modern'
              ELSE 'catalog' END AS era_group
  FROM gem_page AS g
  JOIN artist_era AS e ON e.primary_artist = g.artist
  WHERE g.genre = 'country'
)
SELECT era_group,
       COUNT(DISTINCT artist) AS artists,
       COUNT(*) AS tracks,
       SUM(listeners) AS total_listeners,
       ROUND(AVG(listeners)) AS avg_listeners_per_track,
       ROUND(100.0 * SUM(listeners) /
             (SELECT SUM(listeners) FROM country_gems), 1) AS pct_of_country
FROM country_gems
GROUP BY era_group
ORDER BY total_listeners DESC;`,
    pre: "Художники-каталогисты — самая большая по численности группа. Будут ли они больше по аудитории?",
    rows: 2 }

  ]
};
