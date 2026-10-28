// Ladder: Steam hidden gems, the funnel that finds 175 games.
// Built 2026-08-10. The one question this ladder answers by hand:
// a definition is a stack of WHERE conditions, and you can watch the count fall through it.
// Runs against steam-data.js (steam_games, catalog_totals).
// Every query here was run against that data before it was written down.
// rows = the row count the learner should get back.
//
// The table holds the 4,892 games that clear the 2,000 review bar, not the whole catalog,
// because 82,956 rows is not a thing to hand a browser. Drill 4 says so out loud rather
// than letting anybody believe they are counting all of Steam, and drill 11 joins the real
// catalog total back in so the headline percentage is the real one.

const LADDER = {
  name: "Steam hidden gems, the funnel",
  short: "Steam gems",
  blurb: "Start at 4,892 well reviewed games and watch three conditions cut them to the 175 that are genuinely hidden. Every count on the way down is a real one.",
  grain: {
    steam_games: 'one row = one game with 2,000+ reviews',
    catalog_totals: 'one row, the counts for the whole catalog'
  },
  footnote: 'The finished analysis, the 125,000 game dataset and the data bug that had to be fixed first are <a href="https://github.com/michaelnocito/steam-hidden-gems" target="_blank" rel="noopener">on GitHub</a>. The 175 picks are browsable at <a href="https://michaelnocito.github.io/steam-hidden-gems-list/" target="_blank" rel="noopener">the list site</a>.',
  drills: [

  { adds: 'List the games somebody could afford',
    q: 'Which well reviewed games cost twenty dollars or less?',
    why: "Базовая форма: именованные столбцы с фильтром. Цена – это самый простой из трех баров для размышлений, поэтому она идет первой.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: ВЫБРАТЬ, ОТКУДА и ГДЕ" },
    header:
`-- Purpose: List the games at $20 or less, with their rating and review count
-- Source:  steam_games, one row = one game with 2,000+ reviews`,
    sql:
`SELECT name, price, total_reviews, pct_positive
FROM steam_games
WHERE price <= 20;`,
    pre: "Out of 4,892 games, is most of the list under twenty dollars?",
    rows: 4578 },

  { adds: 'Put the best reviewed on top',
    q: 'Which of those games do players rate highest?',
    why: "Сортируйте по рейтингу, а не по цене. Фильтр не изменился, поэтому количество строк тоже не изменится.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: сортировка с помощью ORDER BY" },
    header:
`-- Purpose: Rank the affordable games by how positive their reviews are
-- Source:  steam_games, one row = one game with 2,000+ reviews`,
    sql:
`SELECT name, price, total_reviews, pct_positive
FROM steam_games
WHERE price <= 20
ORDER BY pct_positive DESC;`,
    pre: "Same 4,578 rows, or fewer?",
    rows: 4578 },

  { adds: 'Cut it to a shortlist',
    q: 'What are the fifteen best reviewed cheap games?',
    why: "Сократите список до такой длины, которую человек действительно сможет прочитать. Пятнадцать — это форма, в которой представлен этот анализ.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: LIMIT и списки Top-N" },
    header:
`-- Purpose: Top 15 affordable games by review rating
-- Source:  steam_games, one row = one game with 2,000+ reviews`,
    sql:
`SELECT name, price, total_reviews, pct_positive
FROM steam_games
WHERE price <= 20
ORDER BY pct_positive DESC
LIMIT 15;`,
    pre: "How many of those fifteen do you expect to have heard of?",
    rows: 15 },

  { adds: 'Count what you are starting from',
    q: 'How many games are in this table?',
    why: "COUNT(*) подсчитывает строки. Это 4892, а не весь Steam: это каждая игра, имеющая не менее 2000 обзоров, и именно здесь начинается определение скрытой жемчужины.",
    guide: { href: '../guides/sql-count-function/', label: "Читайте: COUNT и что это значит" },
    header:
`-- Purpose: The size of the pool the hidden-gem definition starts from
-- Source:  steam_games, one row = one game with 2,000+ reviews`,
    sql:
`SELECT COUNT(*) AS games
FROM steam_games;`,
    pre: "One row back, or 4,892?",
    rows: 1 },

  { adds: 'Apply the first bar: genuinely loved',
    q: 'How many of them are rated 95% positive or better?',
    why: "Первый настоящий разрез. Счетчик с WHERE определяет размер правила, прежде чем ему доверять.",
    guide: { href: '../guides/sql-funnel-analysis/', label: "Читайте: обратный отсчет воронки" },
    header:
`-- Purpose: Step 1 of the funnel, games rated 95%+ positive
-- Source:  steam_games, one row = one game with 2,000+ reviews`,
    sql:
`SELECT COUNT(*) AS games
FROM steam_games
WHERE pct_positive >= 95;`,
    pre: "4,892 go in. Hundreds out, or thousands?",
    rows: 1 },

  { adds: 'Stack a second condition on it',
    q: 'How many of those are also twenty dollars or less?',
    why: "И складывает условия. Каждая строка должна удовлетворять обоим требованиям, поэтому счетчик может только падать или оставаться на одном уровне, но никогда не увеличиваться.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: И, ИЛИ и фильтры сложения." },
    header:
`-- Purpose: Step 2 of the funnel, loved AND affordable
-- Source:  steam_games, one row = one game with 2,000+ reviews`,
    sql:
`SELECT COUNT(*) AS games
FROM steam_games
WHERE pct_positive >= 95
  AND price <= 20;`,
    pre: "765 go in. Does price cut many of them?",
    rows: 1 },

  { adds: 'Apply the last bar and land on the answer',
    q: 'How many loved, cheap games does almost nobody own?',
    why: "Третье условие — это то, которое скрывает драгоценный камень. В этом количестве весь проект: 175 игр из каталога в 125 855.",
    guide: { href: '../guides/sql-funnel-analysis/', label: "Читайте: где на самом деле опускается воронка" },
    header:
`-- Purpose: The hidden gems: loved, affordable, and barely owned
-- Source:  steam_games, one row = one game with 2,000+ reviews
-- Note:    est_owners_mid is the midpoint of Steam's owner range, so 200000 is "small"`,
    sql:
`SELECT COUNT(*) AS hidden_gems
FROM steam_games
WHERE pct_positive >= 95
  AND price <= 20
  AND est_owners_mid <= 200000;`,
    pre: "728 go in. Do you expect to lose most of them here?",
    rows: 1 },

  { adds: 'Split the answer by genre',
    q: 'What kind of game is a hidden gem, usually?',
    why: "GROUP BY превращает одно число в одну строку для каждого жанра. Тот же фильтр, но описанный, а не посчитанный.",
    guide: { href: '../guides/sql-group-by-having/', label: "Читать: GROUP BY без поддельного ответа" },
    header:
`-- Purpose: Which genres the 175 hidden gems fall into
-- Source:  steam_games, one row = one game with 2,000+ reviews`,
    sql:
`SELECT primary_genre, COUNT(*) AS gems
FROM steam_games
WHERE pct_positive >= 95 AND price <= 20 AND est_owners_mid <= 200000
GROUP BY primary_genre
ORDER BY gems DESC;`,
    pre: "175 gems spread across how many genres?",
    rows: 9 },

  { adds: 'Drop the genres with barely any',
    q: 'Which genres have a real cluster of gems, not one or two?',
    why: "HAVING фильтрует группы после их создания. WHERE не может этого сделать, потому что ни в одной игре нет счёта 26.",
    guide: { href: '../guides/sql-group-by-having/', label: "Читайте: почему ИМЕТЬ НЕ ГДЕ" },
    header:
`-- Purpose: Genres with at least 10 hidden gems, and what they cost on average
-- Source:  steam_games, one row = one game with 2,000+ reviews`,
    sql:
`SELECT primary_genre, COUNT(*) AS gems, ROUND(AVG(price), 2) AS avg_price
FROM steam_games
WHERE pct_positive >= 95 AND price <= 20 AND est_owners_mid <= 200000
GROUP BY primary_genre
HAVING COUNT(*) >= 10
ORDER BY gems DESC;`,
    pre: "Nine genres go in. How many carry ten or more?",
    rows: 4 },

  { adds: 'Count the ones that qualify inside each group',
    q: 'Which genre is most likely to hide a gem?',
    why: "Фильтр перемещается внутри агрегата. SUM в CASE учитывает только совпадающие строки, а COUNT(*) по-прежнему считает их все, поэтому оба числа располагаются в одной строке, и вы можете их сравнить.",
    guide: { href: '../guides/sql-segment-with-case/', label: "Читайте: подсчет подмножества с помощью CASE" },
    header:
`-- Purpose: Hidden-gem rate by genre: how many qualify out of how many there are
-- Source:  steam_games, one row = one game with 2,000+ reviews`,
    sql:
`SELECT primary_genre,
       COUNT(*) AS games,
       SUM(CASE WHEN pct_positive >= 95 AND price <= 20 AND est_owners_mid <= 200000 THEN 1 ELSE 0 END) AS gems
FROM steam_games
GROUP BY primary_genre
HAVING COUNT(*) >= 100
ORDER BY gems DESC;`,
    pre: "Action has by far the most games. Do you expect it to have the most gems?",
    rows: 7 },

  { adds: 'Measure it against the whole catalog',
    q: 'What share of Steam is a hidden gem?',
    why: "Всего каталога в этой таблице нет, потому что 125 855 игр не поместятся в браузере. Catalog_totals содержит реальные значения в одной строке, а CROSS JOIN присоединяет эту строку к результату, чтобы вы могли разделить на нее.",
    guide: { href: '../guides/sql-joins/', label: "Читать: присоединение строки итогов к результату" },
    header:
`-- Purpose: The 175 gems as a share of the full Steam catalog
-- Source:  steam_games, one row = one game with 2,000+ reviews
--          catalog_totals, one row, the counts for the whole catalog`,
    sql:
`SELECT t.games_in_catalog,
       COUNT(*) AS hidden_gems,
       ROUND(COUNT(*) * 100.0 / t.games_in_catalog, 3) AS pct_of_catalog
FROM steam_games AS g
CROSS JOIN catalog_totals AS t
WHERE g.pct_positive >= 95 AND g.price <= 20 AND g.est_owners_mid <= 200000;`,
    pre: "175 out of 125,855. Above or below one percent?",
    rows: 1 },

  { adds: 'Show the gap the whole project is about',
    q: 'How much smaller is a hidden gem audience?',
    why: "CASE помещает каждую игру в одну из двух групп, поэтому драгоценные камни и все остальное усредняются рядом. Разрыв — это открытие: эти игры так же сильно любят, и в них играет небольшая часть людей.",
    guide: { href: '../guides/sql-case-expression/', label: "Читайте: CASE, построение столбца, которого нет" },
    header:
`-- Purpose: Average audience size, hidden gems against everything else
-- Source:  steam_games, one row = one game with 2,000+ reviews`,
    sql:
`SELECT CASE WHEN pct_positive >= 95 AND price <= 20 AND est_owners_mid <= 200000
            THEN 'Hidden gem' ELSE 'Everything else' END AS bucket,
       COUNT(*) AS games,
       ROUND(AVG(est_owners_mid)) AS avg_owners
FROM steam_games
GROUP BY bucket;`,
    pre: "Two rows. How many times bigger is the other bucket's audience?",
    rows: 2 },

  { adds: 'Finish on the list the project ships',
    q: 'So what should somebody actually play?',
    why: "Все из последних двенадцати детализации в одном запросе, заканчивающееся именами, а не подсчетами. Это короткий список, на основе которого создается общедоступный сайт.",
    guide: { href: '../guides/sql-teaching-comments/', label: "Читать: комментируя запрос, который вы сдадите" },
    header:
`-- Purpose: The top 15 hidden gems by rating, the shortlist the site leads with
-- Source:  steam_games, one row = one game with 2,000+ reviews
-- Note:    ties on rating are broken by review count, so the better evidenced game wins`,
    sql:
`SELECT name,
       ROUND(pct_positive, 1) AS pct_positive,
       total_reviews,
       price,
       est_owners_range
FROM steam_games
WHERE pct_positive >= 95 AND price <= 20 AND est_owners_mid <= 200000
ORDER BY pct_positive DESC, total_reviews DESC
LIMIT 15;`,
    pre: "Fifteen names. How many have you heard of?",
    rows: 15 }

  ]
};
