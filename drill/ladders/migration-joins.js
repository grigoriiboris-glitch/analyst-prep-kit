// Ladder: joins, framed as a data migration. Junior analyst on a migration team.
// Every query here was run against the baked tables before it was written down.
// rows = the row count the learner should get back.
//
// The spine is INNER and LEFT, because those two carry almost all migration work:
// INNER answers "who made it across", LEFT answers "who did not". RIGHT, FULL, CROSS
// and the self join each get one rung so none of them is a stranger later.
//
// Drills 6 and 7 are the pair that has to land. Six is the wrong join, run on purpose:
// 40 customers come back as 78 rows and nothing errors. Seven is the same question
// asked correctly. That trap is shown once, here, and never repeated.

const LADDER = {
  name: "JOINs, миграция клиентов",
  short: "JOINs, миграция данных",
  blurb: "Две системы, один переезд. Сверьте старый список клиентов с новым, найдите то, что не вошло в него, и оцените его ценность.",
  grain: {
    legacy_customer: "одна строка = один клиент в старой системе",
    new_customer:    "одна строка = одна запись о клиенте в новой системе",
    legacy_order:    "одна строка = один заказ в старой системе",
    contact_note:    "одна строка = один контакт в службе поддержки, несколько на каждого клиента",
    migration_wave:  "один ряд = одна волна переключения"
  },
  footnote: "Половина чтения этой практики — это серия «Миграция»: " +
            "<a href=\"../guides/what-is-data-migration/\">что такое миграция</a> · " +
            "<a href=\"../guides/migration-profiling/\">профилирование старой системы</a> · " +
            "<a href=\"../guides/migration-pitfalls/\">где миграция идет не так</a>.",
  drills: [

  { adds: "Посмотрите, что дает старая система",
    q: "Кто входит в старую клиентскую систему и в каком состоянии находятся их счета?",
    why: "Базовая форма и номер каждого сверла после него.",
    guide: { href: '../guides/migration-profiling/', label: "Читайте: профилирование старой системы" },
    header:
`-- Цель: полный список клиентов, поступающий из устаревшей системы перед переключением.
-- Источник: Heritage_customer, одна строка = один клиент в старой системе.`,
    sql:
`SELECT legacy_id, customer_name, region, account_status
FROM legacy_customer;`,
    pre: "Запишите обратный отсчет строки. Каждое упражнение после этого сравнивается с ним.",
    rows: 40 },

  { adds: "Сопоставьте их с новой системой с помощью INNER JOIN.",
    q: "Какие клиенты перешли на новую систему?",
    why: "INNER JOIN сохраняет только те строки, которые совпали с обеих сторон. Именно в этом и заключается вопрос «кто приземлился».",
    guide: { href: '../guides/sql-joins/', label: "Читайте: как работает INNER JOIN" },
    header:
`-- Цель: устаревшие клиенты, имеющие соответствующую запись в новой системе.
-- Источник: унаследованный_клиент присоединен к новому_клиенту, одна строка = один перенесенный клиент.
-- Примечание. Ключом соединения является устаревший_id, который переносится в новую систему.`,
    sql:
`SELECT c.legacy_id, c.customer_name, c.region, n.new_id
FROM legacy_customer AS c
JOIN new_customer AS n ON n.legacy_id = c.legacy_id;`,
    pre: "Сорок вошло. Вы получите сорок обратно?",
    rows: 34 },

  { adds: "Держите всех с помощью LEFT JOIN",
    q: "Как будет выглядеть тот же список, если никому не позволено исчезнуть?",
    why: "LEFT JOIN сохраняет каждую строку из левой таблицы, независимо от того, совпала она или нет. Несовпадающие значения возвращаются с NULL справа.",
    guide: { href: '../guides/sql-joins/', label: "Читайте: LEFT JOIN и NULL." },
    header:
`-- Цель: каждый устаревший клиент с новой системной записью рядом с ним, если она есть.
-- Источник: унаследованный_клиент присоединен к новому_клиенту, одна строка = один устаревший клиент.
-- Примечание: значение new_id NULL означает, что у клиента нет записей в новой системе.`,
    sql:
`SELECT c.legacy_id, c.customer_name, c.region, n.new_id
FROM legacy_customer AS c
LEFT JOIN new_customer AS n ON n.legacy_id = c.legacy_id;`,
    pre: "Одно слово изменилось. Сколько строк возвращается сейчас?",
    rows: 40 },

  { adds: "Отфильтруйте те, которые не попали",
    q: "Кому не удалось мигрировать?",
    why: "LEFT JOIN плюс IS NULL справа — это список промахов. Этот шаблон по большей части представляет собой работу по примирению.",
    guide: { href: '../guides/migration-dry-run/', label: "Читайте: согласование нагрузки" },
    header:
`-- Цель: устаревшие клиенты, у которых нет записей в новой системе после загрузки.
-- Источник: унаследованный_клиент присоединен к новому_клиенту, одна строка = один отсутствующий клиент.
-- Примечание. IS NULL для new_id означает что-либо только после LEFT JOIN, но не после INNER.`,
    sql:
`SELECT c.legacy_id, c.customer_name, c.region, c.account_status
FROM legacy_customer AS c
LEFT JOIN new_customer AS n ON n.legacy_id = c.legacy_id
WHERE n.new_id IS NULL;`,
    pre: "Сорок строк наследия, тридцать четыре совпадающих. Сколько строк должно вернуть это значение?",
    rows: 6 },

  { adds: "Сообщите о сверке в одну строку",
    q: "Сколько вошло, сколько высадилось, сколько пропало?",
    why: "COUNT(*) подсчитывает строки, COUNT(столбец) пропускает NULL. Поместите их рядом в LEFT JOIN, и вы получите согласование.",
    guide: { href: '../guides/sql-count-function/', label: "Читать: COUNT(*) против COUNT(столбец)" },
    header:
`-- Цель: подсчеты сверки при переключении для таблицы клиентов.
-- Источник: Legacy_customer присоединен к new_customer, одна строка = вся загрузка.
-- Примечание. COUNT(*) считает каждую строку, COUNT(n.new_id) пропускает NULL, поэтому пробел — это промахи.`,
    sql:
`SELECT COUNT(*) AS legacy_rows,
       COUNT(n.new_id) AS migrated_rows,
       COUNT(*) - COUNT(n.new_id) AS missing_rows
FROM legacy_customer AS c
LEFT JOIN new_customer AS n ON n.legacy_id = c.legacy_id;`,
    pre: "Один ряд назад, там три цифры. Назовите все три, прежде чем запускать его.",
    rows: 1 },

  { adds: "Неправильное объединение. Добавьте историю поддержки и наблюдайте за перерывом в подсчете",
    q: "Тот же список клиентов с указанием того, как они в последний раз обращались в службу поддержки. Что может пойти не так?",
    why: "Здесь нет никаких ошибок. Соединение является допустимым SQL, и ответ неправильный, поскольку contact_note содержит несколько строк для каждого клиента, и каждая из них умножает своего клиента.",
    guide: { href: '../guides/sql-joins/', label: "Читайте: соединения, умножающие строки" },
    header:
`-- Цель: устаревшие клиенты с каналом связи со службой поддержки.
-- Источник: Heritage_customer присоединен к new_customer и contact_note.
-- Примечание: ЗАПУСТИТЕ ЭТО И ПРОЧИТАЙТЕ ПОДСЧЕТ. Зерно больше не занимает один ряд на одного клиента`,
    sql:
`SELECT c.legacy_id, c.customer_name, n.new_id, t.channel
FROM legacy_customer AS c
LEFT JOIN new_customer AS n ON n.legacy_id = c.legacy_id
LEFT JOIN contact_note AS t ON t.legacy_id = c.legacy_id;`,
    pre: "Клиентов пока всего 40. Как вы думаете, сколько строк вернется?",
    rows: 78 },

  { adds: "Исправление. Положите зерно обратно",
    q: "Тот же вопрос, заданный, поэтому ответ снова — одна строка на каждого клиента.",
    why: "Тип соединения никогда не был ошибкой. Присоединение к таблице, которая содержит несколько строк на каждого клиента, — это то, что сдвинуло зернистость, поэтому вы сворачиваете ее обратно с помощью GROUP BY. Убедитесь, что счет снова равен 40.",
    guide: { href: '../guides/sql-group-by-having/', label: "Читайте: свертывание строк с помощью GROUP BY." },
    header:
`-- Цель: устаревшие клиенты с указанием их контактов в службе поддержки.
-- Источник: Heritage_customer присоединен к new_customer и contact_note, одна строка = один устаревший клиент.
-- Примечание. GROUP BY возвращает зернистость в одну строку для каждого клиента после соединения «один ко многим».`,
    sql:
`SELECT c.legacy_id, c.customer_name, n.new_id, COUNT(t.note_id) AS notes
FROM legacy_customer AS c
LEFT JOIN new_customer AS n ON n.legacy_id = c.legacy_id
LEFT JOIN contact_note AS t ON t.legacy_id = c.legacy_id
GROUP BY c.legacy_id, c.customer_name, n.new_id;`,
    pre: "Вернуться к 40 строкам или все же 78?",
    rows: 40 },

  { adds: "Сначала агрегируйте, затем присоединяйтесь",
    q: "Сколько стоит каждый клиент и сколько заказов они приносят?",
    why: "Другой способ выжить в таблице «один ко многим»: сначала суммировать ее в CTE, чтобы вы присоединялись к одной строке на каждого клиента. Это привычка, которая предотвращает случайное выполнение последнего упражнения.",
    guide: { href: '../guides/sql-ctes/', label: "Читать: сначала агрегировать в CTE" },
    header:
`-- Цель: каждый старый клиент с указанием количества заказов и жизненной ценности.
-- Источник: унаследованный_клиент, присоединенный к новому_клиенту, и общая сумма заказов каждого клиента.
-- Примечание: order_totals уже представляет собой одну строку для каждого клиента, поэтому присоединение к нему не может изменить детализацию.`,
    sql:
`WITH order_totals AS (
  SELECT legacy_id, COUNT(*) AS orders, SUM(amount) AS lifetime_value
  FROM legacy_order
  GROUP BY legacy_id
)
SELECT c.legacy_id, c.customer_name, n.new_id,
       COALESCE(o.orders, 0) AS orders,
       ROUND(COALESCE(o.lifetime_value, 0), 2) AS lifetime_value
FROM legacy_customer AS c
LEFT JOIN new_customer AS n ON n.legacy_id = c.legacy_id
LEFT JOIN order_totals AS o ON o.legacy_id = c.legacy_id;`,
    pre: "Некоторые клиенты никогда не заказывали. COALESCE дает им ноль или отбрасывает их?",
    rows: 40 },

  { adds: "Переверните вопрос с помощью ПРАВОГО СОЕДИНЕНИЯ",
    q: "Есть ли в новой системе записи, которых не было в старой?",
    why: "RIGHT JOIN сохраняет каждую строку из таблицы справа. Это LEFT JOIN с таблицами наоборот, и именно так вы перехватываете записи, изобретенные миграцией.",
    guide: { href: '../guides/sql-joins/', label: "Читайте: НАПРАВО и в другую сторону." },
    header:
`-- Цель: новые записи о клиентах системы без соответствующей устаревшей записи.
-- Источник: Heritage_customer присоединен к new_customer, одна строка = одна необъяснимая новая запись.
-- Примечание: это не ошибки миграции, это записи, созданные новой системой самостоятельно.`,
    sql:
`SELECT n.new_id, n.customer_name, n.region, c.legacy_id
FROM legacy_customer AS c
RIGHT JOIN new_customer AS n ON n.legacy_id = c.legacy_id
WHERE c.legacy_id IS NULL;`,
    pre: "Новая система содержит 37 записей, 34 из которых совпадают. Сколько осталось?",
    rows: 3 },

  { adds: "Показать обе ошибки одновременно с помощью FULL OUTER JOIN.",
    q: "Могу ли я передать своему лидеру одну таблицу, охватывающую все несоответствия в обоих направлениях?",
    why: "FULL OUTER JOIN сохраняет все с обеих сторон. С CASE наверху она становится единственной таблицей состояния, которую действительно запрашивает руководитель миграции.",
    guide: { href: '../guides/sql-case-expression/', label: "Читайте: маркировка строк с помощью CASE" },
    header:
`-- Цель: каждая запись клиента на любой стороне миграции с пометкой ее результата.
-- Источник: унаследованный_клиент присоединен к новому_клиенту, одна строка = по одному клиенту с каждой стороны.
-- Примечание: 34 совпавших плюс 6, которые не были перенесены, плюс 3 без устаревших записей.`,
    sql:
`SELECT c.legacy_id,
       n.new_id,
       CASE WHEN n.new_id IS NULL THEN 'did not migrate'
            WHEN c.legacy_id IS NULL THEN 'no legacy record'
            ELSE 'matched' END AS outcome
FROM legacy_customer AS c
FULL OUTER JOIN new_customer AS n ON n.legacy_id = c.legacy_id
ORDER BY outcome, c.legacy_id;`,
    pre: "Сложите три группы из примечания выше. Это ваше количество строк.",
    rows: 43 },

  { adds: "Постройте полную сетку с помощью CROSS JOIN",
    q: "Как выглядит план перехода для каждого региона в каждой волне, включая пустые?",
    why: "CROSS JOIN соединяет каждую строку слева с каждой строкой справа. При специальном использовании вы строите сетку отчетов без пропущенных ячеек.",
    guide: { href: '../guides/sql-joins/', label: "Читайте: CROSS JOIN намеренно" },
    header:
`-- Назначение: полная область по волновой сетке для плана переключения, включая пустые ячейки.
-- Источник: отдельные регионы, пересекающиеся с миграцией_волны, одна строка = один регион в одной волне.
-- Примечание. В CROSS JOIN нет предложения ON, поэтому случайное соединение разрушает запрос.`,
    sql:
`SELECT r.region, w.wave_no, w.wave_name, w.cutover_date
FROM (SELECT DISTINCT region FROM legacy_customer) AS r
CROSS JOIN migration_wave AS w
ORDER BY r.region, w.wave_no;`,
    pre: "Четыре региона, три волны. Сколько рядов?",
    rows: 12 },

  { adds: "Присоедините таблицу к самой себе, чтобы найти дубликаты",
    q: "Один и тот же человек в старом экспорте дважды находится под двумя разными идентификаторами?",
    why: "Самосоединение сравнивает таблицу с самой собой. Сопоставление по электронной почте и сохранение только более высокого идентификатора дает каждую повторяющуюся пару один раз, а не дважды.",
    guide: { href: '../guides/entity-resolution/', label: "Читайте: поиск повторяющихся записей" },
    header:
`-- Цель: клиенты дважды ввели данные в устаревший экспорт под двумя идентификаторами.
-- Источник: Heritage_customer присоединился к самому себе по электронной почте, одна строка = одна повторяющаяся пара.
-- Примечание: b.legacy_id > a.legacy_id останавливает каждую пару, возвращающуюся во второй раз перевернутой.`,
    sql:
`SELECT a.legacy_id, b.legacy_id AS duplicate_of, a.email, a.customer_name
FROM legacy_customer AS a
JOIN legacy_customer AS b ON b.email = a.email AND b.legacy_id > a.legacy_id;`,
    pre: "Отбросьте второе условие, и счет удвоится. Почему?",
    rows: 2 },

  { adds: "Закончите на номере, о котором будет встреча.",
    q: "Какой регион потерял больше всего и сколько стоят недостающие доходы?",
    why: "Расплата. Согласование LEFT JOIN, агрегат, объединенный в правильном зерне, и CASE, который превращает промахи в деньги. Это запрос, который отправляется в электронное письмо со статусом.",
    guide: { href: '../guides/defining-metrics/', label: "Читать: число, о котором идет встреча" },
    header:
`-- Цель: уровень успешной миграции и немигрированные доходы по регионам.
-- Источник: разведка, одна строка = один регион
-- Примечание. value_at_risk — это стоимость заказа за весь срок службы, принадлежащая клиентам, которые не перешли.`,
    sql:
`WITH order_totals AS (
  SELECT legacy_id, SUM(amount) AS lifetime_value
  FROM legacy_order
  GROUP BY legacy_id
),
recon AS (
  SELECT c.region, c.legacy_id, n.new_id,
         COALESCE(o.lifetime_value, 0) AS lifetime_value
  FROM legacy_customer AS c
  LEFT JOIN new_customer AS n ON n.legacy_id = c.legacy_id
  LEFT JOIN order_totals AS o ON o.legacy_id = c.legacy_id
)
SELECT region,
       COUNT(*) AS legacy_customers,
       COUNT(new_id) AS migrated,
       COUNT(*) - COUNT(new_id) AS missing,
       ROUND(100.0 * COUNT(new_id) / COUNT(*), 1) AS pct_migrated,
       ROUND(SUM(CASE WHEN new_id IS NULL THEN lifetime_value ELSE 0 END), 2) AS value_at_risk
FROM recon
GROUP BY region
ORDER BY value_at_risk DESC;`,
    pre: "Четыре региона. Будет ли регион с наибольшим количеством промахов содержать и больше всего денег?",
    rows: 4 }

  ]
};
