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
  name: "Паровые скрытые драгоценные камни, воронка",
  short: "Паровые драгоценные камни",
  blurb: "Начните с 4892 игр с хорошими отзывами и посмотрите, как три условия сокращают их до 175, которые действительно скрыты. Каждый счет на пути вниз реален.",
  grain: {
    steam_games: "одна строка = одна игра с 2000+ отзывов",
    catalog_totals: "одна строка, количество по всему каталогу"
  },
  footnote: "Готовый анализ, 125 000 игровых данных и ошибка в данных, которую нужно было исправить в первую очередь, представлены ниже. <a href=\"https://github.com/michaelnocito/steam-hidden-gems\" target=\"_blank\" rel=\"noopener\">на GitHub</a>. 175 выборов доступны для просмотра на <a href=\"https://michaelnocito.github.io/steam-hidden-gems-list/\" target=\"_blank\" rel=\"noopener\">сайт со списком</a>.",
  drills: [

  { adds: "Перечислите игры, которые кто-то может себе позволить",
    q: "Какие игры с хорошими отзывами стоят двадцать долларов или меньше?",
    why: "Базовая форма: именованные столбцы с фильтром. Цена – это самый простой из трех баров для размышлений, поэтому она идет первой.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: ВЫБРАТЬ, ОТКУДА и ГДЕ" },
    header:
`-- Цель: перечислить игры стоимостью 20 долларов США или меньше, указав их рейтинг и количество обзоров.
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.`,
    sql:
`SELECT name, price, total_reviews, pct_positive
FROM steam_games
WHERE price <= 20;`,
    pre: "Из 4892 игр большая часть списка стоит меньше двадцати долларов?",
    rows: 4578 },

  { adds: "Поместите лучшие отзывы сверху",
    q: "Какую из этих игр игроки оценивают выше всего?",
    why: "Сортируйте по рейтингу, а не по цене. Фильтр не изменился, поэтому количество строк тоже не изменится.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: сортировка с помощью ORDER BY" },
    header:
`-- Цель: ранжировать доступные игры по положительности их отзывов.
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.`,
    sql:
`SELECT name, price, total_reviews, pct_positive
FROM steam_games
WHERE price <= 20
ORDER BY pct_positive DESC;`,
    pre: "Те же 4578 строк или меньше?",
    rows: 4578 },

  { adds: "Сократите это до короткого списка",
    q: "Каковы пятнадцать дешевых игр с лучшими обзорами?",
    why: "Сократите список до такой длины, которую человек действительно сможет прочитать. Пятнадцать — это форма, в которой представлен этот анализ.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: LIMIT и списки Топ-Н" },
    header:
`-- Цель: Топ-15 доступных игр по рейтингу обзоров.
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.`,
    sql:
`SELECT name, price, total_reviews, pct_positive
FROM steam_games
WHERE price <= 20
ORDER BY pct_positive DESC
LIMIT 15;`,
    pre: "О скольких из этих пятнадцати вы думаете, что слышали?",
    rows: 15 },

  { adds: "Посчитайте, от чего вы начинаете",
    q: "Сколько игр в этой таблице?",
    why: "COUNT(*) подсчитывает строки. Это 4892, а не весь Пар: это каждая игра, имеющая не менее 2000 обзоров, и именно здесь начинается определение скрытой жемчужины.",
    guide: { href: '../guides/sql-count-function/', label: "Читайте: COUNT и что это значит" },
    header:
`-- Назначение: размер пула, с которого начинается определение скрытого драгоценного камня.
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.`,
    sql:
`SELECT COUNT(*) AS games
FROM steam_games;`,
    pre: "На один ряд назад или на 4892?",
    rows: 1 },

  { adds: "Примените первую планку: искренне любим",
    q: "Сколько из них имеют положительный рейтинг на 95% или выше?",
    why: "Первый настоящий разрез. Счетчик с WHERE определяет размер правила, прежде чем ему доверять.",
    guide: { href: '../guides/sql-funnel-analysis/', label: "Читайте: обратный отсчет воронки" },
    header:
`-- Цель: первый шаг воронки, игры с положительным рейтингом более 95 %.
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.`,
    sql:
`SELECT COUNT(*) AS games
FROM steam_games
WHERE pct_positive >= 95;`,
    pre: "Входит 4892 человека. Выходят сотни или тысячи?",
    rows: 1 },

  { adds: "Добавьте к нему второе условие",
    q: "Сколько из них также стоит двадцать долларов или меньше?",
    why: "И складывает условия. Каждая строка должна удовлетворять обоим требованиям, поэтому счетчик может только падать или оставаться на одном уровне, но никогда не увеличиваться.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: И, ИЛИ и фильтры сложения." },
    header:
`-- Цель: второй шаг воронки продаж, любимый и доступный.
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.`,
    sql:
`SELECT COUNT(*) AS games
FROM steam_games
WHERE pct_positive >= 95
  AND price <= 20;`,
    pre: "765 входит. На многие ли из них снижается цена?",
    rows: 1 },

  { adds: "Примените последнюю полоску и получите ответ.",
    q: "Сколько любимых дешевых игр почти ни у кого нет?",
    why: "Третье условие — это то, которое скрывает драгоценный камень. В этом количестве весь проект: 175 игр из каталога в 125 855.",
    guide: { href: '../guides/sql-funnel-analysis/', label: "Читайте: где на самом деле опускается воронка" },
    header:
`-- Цель: скрытые сокровища: любимые, доступные и почти не владеемые.
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.
-- Примечание. est_owners_mid — это середина диапазона владельцев Пар, поэтому 200000 — это «маленькое».`,
    sql:
`SELECT COUNT(*) AS hidden_gems
FROM steam_games
WHERE pct_positive >= 95
  AND price <= 20
  AND est_owners_mid <= 200000;`,
    pre: "Входит 728 человек. Ожидаете ли вы, что здесь потеряете большую часть из них?",
    rows: 1 },

  { adds: "Разделите ответ по жанрам",
    q: "Какая игра обычно является скрытой жемчужиной?",
    why: "GROUP BY превращает одно число в одну строку для каждого жанра. Тот же фильтр, но описанный, а не посчитанный.",
    guide: { href: '../guides/sql-group-by-having/', label: "Читать: GROUP BY без поддельного ответа" },
    header:
`-- Цель: к каким жанрам относятся 175 скрытых жемчужин.
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.`,
    sql:
`SELECT primary_genre, COUNT(*) AS gems
FROM steam_games
WHERE pct_positive >= 95 AND price <= 20 AND est_owners_mid <= 200000
GROUP BY primary_genre
ORDER BY gems DESC;`,
    pre: "175 драгоценных камней, разбросанных по скольким жанрам?",
    rows: 9 },

  { adds: "Отбросьте жанры практически без каких-либо",
    q: "В каких жанрах есть настоящий кластер жемчужин, а не один или два?",
    why: "HAVING фильтрует группы после их создания. WHERE не может этого сделать, потому что ни в одной игре нет счёта 26.",
    guide: { href: '../guides/sql-group-by-having/', label: "Читайте: почему ИМЕТЬ НЕ ГДЕ" },
    header:
`-- Цель: жанры, в которых есть как минимум 10 скрытых драгоценных камней, и их средняя стоимость.
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.`,
    sql:
`SELECT primary_genre, COUNT(*) AS gems, ROUND(AVG(price), 2) AS avg_price
FROM steam_games
WHERE pct_positive >= 95 AND price <= 20 AND est_owners_mid <= 200000
GROUP BY primary_genre
HAVING COUNT(*) >= 10
ORDER BY gems DESC;`,
    pre: "Входит девять жанров. Сколько из них содержат десять или больше?",
    rows: 4 },

  { adds: "Подсчитайте тех, кто соответствует критериям внутри каждой группы.",
    q: "Какой жанр, скорее всего, скрывает жемчужину?",
    why: "Фильтр перемещается внутри агрегата. SUM в CASE учитывает только совпадающие строки, а COUNT(*) по-прежнему считает их все, поэтому оба числа располагаются в одной строке, и вы можете их сравнить.",
    guide: { href: '../guides/sql-segment-with-case/', label: "Читайте: подсчет подмножества с помощью CASE" },
    header:
`-- Цель: рейтинг скрытых драгоценных камней по жанрам: сколько из них соответствует критериям
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.`,
    sql:
`SELECT primary_genre,
       COUNT(*) AS games,
       SUM(CASE WHEN pct_positive >= 95 AND price <= 20 AND est_owners_mid <= 200000 THEN 1 ELSE 0 END) AS gems
FROM steam_games
GROUP BY primary_genre
HAVING COUNT(*) >= 100
ORDER BY gems DESC;`,
    pre: "В Действие на сегодняшний день больше всего игр. Ожидаете ли вы, что в нем будет больше всего драгоценных камней?",
    rows: 7 },

  { adds: "Сравните это со всем каталогом",
    q: "Какая доля Пар является скрытой жемчужиной?",
    why: "Всего каталога в этой таблице нет, потому что 125 855 игр не поместятся в браузере. Каталог_итогов содержит реальные значения в одной строке, а CROSS JOIN присоединяет эту строку к результату, чтобы вы могли разделить на нее.",
    guide: { href: '../guides/sql-joins/', label: "Читать: присоединение строки итогов к результату" },
    header:
`-- Цель: 175 драгоценных камней как часть полного каталога Пар.
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.
--Каталог_итогов, одна строка, количество по всему каталогу`,
    sql:
`SELECT t.games_in_catalog,
       COUNT(*) AS hidden_gems,
       ROUND(COUNT(*) * 100.0 / t.games_in_catalog, 3) AS pct_of_catalog
FROM steam_games AS g
CROSS JOIN catalog_totals AS t
WHERE g.pct_positive >= 95 AND g.price <= 20 AND g.est_owners_mid <= 200000;`,
    pre: "175 из 125 855. Выше или ниже одного процента?",
    rows: 1 },

  { adds: "Покажите пробел, в котором заключается весь проект",
    q: "Насколько меньше аудитория скрытой жемчужины?",
    why: "CASE помещает каждую игру в одну из двух групп, поэтому драгоценные камни и все остальное усредняются рядом. Разрыв — это открытие: эти игры так же сильно любят, и в них играет небольшая часть людей.",
    guide: { href: '../guides/sql-case-expression/', label: "Читайте: CASE, построение столбца, которого нет" },
    header:
`-- Цель: средний размер аудитории, скрытые сокровища на фоне всего остального.
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.`,
    sql:
`SELECT CASE WHEN pct_positive >= 95 AND price <= 20 AND est_owners_mid <= 200000
            THEN 'Hidden gem' ELSE 'Everything else' END AS bucket,
       COUNT(*) AS games,
       ROUND(AVG(est_owners_mid)) AS avg_owners
FROM steam_games
GROUP BY bucket;`,
    pre: "Два ряда. Во сколько раз аудитория другой корзины больше?",
    rows: 2 },

  { adds: "Завершите список проектов, которые будут реализованы.",
    q: "Так во что же на самом деле стоит играть?",
    why: "Все из последних двенадцати детализации в одном запросе, заканчивающееся именами, а не подсчетами. Это короткий список, на основе которого создается общедоступный сайт.",
    guide: { href: '../guides/sql-teaching-comments/', label: "Читать: комментируя запрос, который вы сдадите" },
    header:
`-- Цель: 15 лучших скрытых сокровищ по рейтингу, шорт-лист, в котором лидирует сайт.
-- Источник: Steam_games, одна строка = одна игра с более чем 2000 обзоров.
-- Примечание. Равенство рейтингов зависит от количества обзоров, поэтому побеждает игра с более убедительными доказательствами.`,
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
    pre: "Пятнадцать имен. О скольких вы слышали?",
    rows: 15 }

  ]
};
