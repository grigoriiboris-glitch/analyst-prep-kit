// Ladder: Telco churn, the query half of a published project.
// Built 2026-08-10. The one question this ladder answers by hand:
// a rate is an average of a 1 and 0 column, and that one idea carries the whole analysis.
// Runs against telco-data.js (telco_customers, personas), the same 7,043 customer extract
// behind the Tableau story at public.tableau.com and the write-up on GitHub.
// Every query here was run against that extract before it was written down.
// rows = the row count the learner should get back.

const LADDER = {
  name: "Отток телекоммуникационных компаний, опубликованный проект",
  short: "Отток телекоммуникационных компаний",
  blurb: "Начните со списка ежемесячных клиентов и поднимитесь к сводке из четырех строк, к которой ведет настоящий анализ оттока клиентов. Каждый номер, на который вы попадаете, — это номер, который был отправлен.",
  grain: {
    telco_customers: "одна строка = один клиент",
    personas: "одна строка = одна корзина владения"
  },
  footnote: "Половина диаграммы этой практики <a href=\"../viz/?track=telco\">Виз Дрель, трек Отток телекоммуникационных компаний</a>: те же 7043 клиента, те же вопросы, построенные с полками вместо статей. Готовый анализ <a href=\"https://github.com/michaelnocito/telco-churn-analysis\" target=\"_blank\" rel=\"noopener\">на GitHub</a>.",
  drills: [

  { adds: "Составьте список клиентов, которые могут уйти в любой месяц",
    q: "Какие клиенты заключают ежемесячный контракт и сколько они платят?",
    why: "Базовая форма: именованные столбцы с фильтром. Из месяца в месяц означает, что клиент может ходить в конце любого месяца.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: ВЫБРАТЬ, ОТКУДА и ГДЕ" },
    header:
`-- Цель: перечислить ежемесячных клиентов с указанием того, сколько они платят и ушли ли они.
-- Источник: telco_customers, одна строка = один клиент.`,
    sql:
`SELECT customer_id, persona, monthly_charges, churn
FROM telco_customers
WHERE contract = 'Month-to-month';`,
    pre: "Из 7043 клиентов из месяца в месяц больше или меньше половины?",
    rows: 3875 },

  { adds: "Положите самую большую купюру сверху",
    q: "Клиенты какого месяца платят больше всего?",
    why: "Отсортируйте строки так, чтобы самая большая купюра оказалась сверху. Фильтр не изменился, поэтому количество строк тоже не изменится.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: сортировка с помощью ORDER BY" },
    header:
`-- Цель: ранжировать ежемесячных клиентов по ежемесячным счетам, начиная с крупнейших.
-- Источник: telco_customers, одна строка = один клиент.`,
    sql:
`SELECT customer_id, persona, monthly_charges, churn
FROM telco_customers
WHERE contract = 'Month-to-month'
ORDER BY monthly_charges DESC;`,
    pre: "Те же 3875 строк или меньше?",
    rows: 3875 },

  { adds: "Сократите это до первой десятки",
    q: "Каковы десять самых больших счетов по ежемесячному контракту?",
    why: "Сократите список до первой десятки, как это обычно и составляет рейтинг.",
    guide: { href: '../guides/sql-foundations/', label: "Читайте: LIMIT и списки Топ-Н" },
    header:
`-- Цель: 10 крупнейших клиентов с ежемесячным счетом.
-- Источник: telco_customers, одна строка = один клиент.`,
    sql:
`SELECT customer_id, persona, monthly_charges, churn
FROM telco_customers
WHERE contract = 'Month-to-month'
ORDER BY monthly_charges DESC
LIMIT 10;`,
    pre: "Сколько из этих десяти, по вашему мнению, уйдет?",
    rows: 10 },

  { adds: "Посчитайте всю базу, а не перечисляйте ее",
    q: "Сколько всего клиентов?",
    why: "COUNT(*) подсчитывает строки. Удаление фильтра возвращает каждого клиента, и вместо списка возвращается один номер.",
    guide: { href: '../guides/sql-count-function/', label: "Читайте: COUNT и что это значит" },
    header:
`-- Цель: общее количество клиентов в базе.
-- Источник: telco_customers, одна строка = один клиент.`,
    sql:
`SELECT COUNT(*) AS customers
FROM telco_customers;`,
    pre: "На один ряд назад или 7043?",
    rows: 1 },

  { adds: "Посчитайте каждую группу отдельно",
    q: "Насколько велика каждая группа клиентов?",
    why: "GROUP BY разбивает счетчик на одну строку для каждого человека. Персона здесь — это просто ведро с именем на нем.",
    guide: { href: '../guides/sql-group-by-having/', label: "Читать: GROUP BY без поддельного ответа" },
    header:
`-- Цель: количество клиентов на человека.
-- Источник: telco_customers, одна строка = один клиент.`,
    sql:
`SELECT persona, COUNT(*) AS customers
FROM telco_customers
GROUP BY persona
ORDER BY customers DESC;`,
    pre: "Четыре группы. Ожидаете ли вы, что они будут примерно равными?",
    rows: 4 },

  { adds: "Превратите столбцы 1 и 0 в показатель оттока",
    q: "Какая доля каждой группы осталась?",
    why: "взбитый — это 1, когда клиент ушел, и 0, когда он остался. Среднее значение единиц и нулей — это доля ушедших, а умножение на 100 дает процент. В этом весь секрет почти каждой ставки, которую вы напишете.",
    guide: { href: '../guides/sql-group-by-having/', label: "Читайте: агрегирует внутри группы" },
    header:
`-- Цель: коэффициент оттока на человека, в процентах.
-- Источник: telco_customers, одна строка = один клиент.
-- Примечание. Отток равен 1, если клиент ушел, 0, если он остался, поэтому AVG – это показатель.`,
    sql:
`SELECT persona,
       COUNT(*) AS customers,
       ROUND(AVG(churned) * 100, 1) AS churn_rate
FROM telco_customers
GROUP BY persona
ORDER BY churn_rate DESC;`,
    pre: "Как вы думаете, какая группа уходит больше всего: самые новые клиенты или самые старые?",
    rows: 4 },

  { adds: "Сохраняйте только группы над линией",
    q: "У каких групп текучесть кадров превышает 25%?",
    why: "HAVING фильтрует группы после их создания. WHERE не смог этого сделать, потому что не бывает ни одного клиента с оттоком 28%.",
    guide: { href: '../guides/sql-group-by-having/', label: "Читайте: почему ИМЕТЬ НЕ ГДЕ" },
    header:
`-- Цель: Персоны, текучесть которых превышает 25 %, заслуживающие внимания.
-- Источник: telco_customers, одна строка = один клиент.`,
    sql:
`SELECT persona,
       COUNT(*) AS customers,
       ROUND(AVG(churned) * 100, 1) AS churn_rate
FROM telco_customers
GROUP BY persona
HAVING AVG(churned) > 0.25
ORDER BY churn_rate DESC;`,
    pre: "Заходят четыре группы. Сколько чистых 25%?",
    rows: 2 },

  { adds: "Задайте тот же вопрос о контрактах",
    q: "Изменяется ли в подписанном кем-то контракте частота его ухода?",
    why: "Тот же агрегат, другой столбец группировки. Это механизм, лежащий в основе разрыва между личностями, и он более широк, чем сами личности.",
    guide: { href: '../guides/sql-group-by-having/', label: "Читайте: выбор того, по чему группировать" },
    header:
`-- Цель: коэффициент оттока по типу контракта.
-- Источник: telco_customers, одна строка = один клиент.`,
    sql:
`SELECT contract,
       COUNT(*) AS customers,
       ROUND(AVG(churned) * 100, 1) AS churn_rate
FROM telco_customers
GROUP BY contract
ORDER BY churn_rate DESC;`,
    pre: "Месяц к месяцу против двух лет. Отток в два раза или больше?",
    rows: 3 },

  { adds: "Внесите столбец из другой таблицы",
    q: "Какой диапазон полномочий на самом деле охватывает каждый персонаж?",
    why: "Имя персонажа ничего не говорит о том, насколько это долго. персонажи хранит диапазон и порядок жизненного цикла, а JOIN помещает их рядом с числами.",
    guide: { href: '../guides/sql-joins/', label: "Читайте: JOIN и что им соответствует." },
    header:
`-- Цель: коэффициент оттока на человека, помеченный диапазоном его пребывания в должности, в порядке жизненного цикла.
-- Источник: telco_customers, одна строка = один клиент.
-- персоны, одна строка = один сегмент владения`,
    sql:
`SELECT p.tenure_range,
       c.persona,
       COUNT(*) AS customers,
       ROUND(AVG(c.churned) * 100, 1) AS churn_rate
FROM telco_customers AS c
JOIN personas AS p ON p.persona = c.persona
GROUP BY p.tenure_range, c.persona, p.lifecycle_order
ORDER BY p.lifecycle_order;`,
    pre: "Все еще четыре строки, или соединение их умножает?",
    rows: 4 },

  { adds: "Напишите свои собственные ведра",
    q: "Это действительно проблема первого года обучения?",
    why: "CASE создает столбец, которого нет в таблице. Два ведра вместо четырех, и ответ становится более грубым: первый год против всего последующего.",
    guide: { href: '../guides/sql-case-expression/', label: "Читайте: CASE, построение столбца, которого нет" },
    header:
`-- Цель: отток в первый год против оттока после него.
-- Источник: telco_customers, одна строка = один клиент.`,
    sql:
`SELECT CASE WHEN tenure_months <= 12 THEN 'First year' ELSE 'Past the first year' END AS stage,
       COUNT(*) AS customers,
       ROUND(AVG(churned) * 100, 1) AS churn_rate
FROM telco_customers
GROUP BY stage
ORDER BY churn_rate DESC;`,
    pre: "Два ряда. Как вы думаете, насколько далеки друг от друга эти две ставки?",
    rows: 2 },

  { adds: "Поставьте три числа рядом друг с другом",
    q: "Клиенты, которые уходят от дешевых?",
    why: "Три агрегата в одном запросе. Ответ — нет, и причина в третьей колонке: они платят почти полную цену и больше ничего не покупают.",
    guide: { href: '../guides/sql-aliasing/', label: "Читать: присвоение имен столбцам с помощью AS" },
    header:
`-- Цель: сколько каждый человек платит, что покупает и как часто уходит.
-- Источник: telco_customers, одна строка = один клиент.`,
    sql:
`SELECT persona,
       ROUND(AVG(monthly_charges), 2) AS avg_monthly,
       ROUND(AVG(add_on_services), 1) AS avg_services,
       ROUND(AVG(churned) * 100, 1) AS churn_rate
FROM telco_customers
GROUP BY persona
ORDER BY churn_rate DESC;`,
    pre: "Группа, которая уходит больше всего. Ожидаете ли вы, что они будут платить больше или меньше, чем лояльная группа?",
    rows: 4 },

  { adds: "Закончите на столе, с помощью которого ведет проект.",
    q: "Кто уходит и чем они отличаются?",
    why: "Все из последних одиннадцати тренировок в одном запросе. Это таблица, на которой построен опубликованный анализ, и вы только что ее написали.",
    guide: { href: '../guides/sql-teaching-comments/', label: "Читать: комментируя запрос, который вы сдадите" },
    header:
`-- Цель: краткое описание персоны, которое дает анализ оттока клиентов.
-- Источник: telco_customers, одна строка = один клиент.
-- персоны, одна строка = один сегмент владения
-- Примечание: упорядочено по жизненному циклу, а не по оттоку, поэтому история читается как новая, так и лояльная.`,
    sql:
`SELECT p.persona,
       p.tenure_range,
       COUNT(*) AS customers,
       ROUND(AVG(c.churned) * 100, 1) AS churn_rate,
       ROUND(AVG(c.monthly_charges), 2) AS avg_monthly,
       ROUND(AVG(c.add_on_services), 1) AS avg_services
FROM telco_customers AS c
JOIN personas AS p ON p.persona = c.persona
GROUP BY p.persona, p.tenure_range, p.lifecycle_order
ORDER BY p.lifecycle_order;`,
    pre: "Прочитайте колонку оттока. Он падает до конца?",
    rows: 4 }

  ]
};
