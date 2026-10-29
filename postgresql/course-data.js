window.PostgreSQLLessons = [
  {
    "id": 1,
    "unit": "0 · Старт",
    "title": "Что такое PostgreSQL и чем он отличается от SQL",
    "goal": "Различать СУБД, язык SQL, клиент и сервер.",
    "explain": "SQL — язык запросов. PostgreSQL — система управления базами данных, которая понимает SQL и расширяет его собственными возможностями. Клиент (psql, pgAdmin или приложение) отправляет запрос серверу и получает результат. В этом курсе PostgreSQL запускается прямо в браузере через WebAssembly (PGlite) (PGlite) (PGlite) (PGlite) (PGlite) (PGlite) (PGlite) (PGlite). К реальным базам данных курс не подключается.",
    "gotcha": "Синтаксис и функции зависят от СУБД. Не переноси функции между СУБД вслепую: синтаксис MySQL, SQL Server, SQLite и PostgreSQL различается. Перед использованием проверь документацию нужной СУБД.",
    "exampleSql": "SELECT version() AS postgres_version, current_database() AS database_name, current_user AS current_role;",
    "starterSql": "SELECT version() AS postgres_version, current_database() AS database_name;",
    "task": "Выполни запрос и найди версию движка и имя учебной базы.",
    "checks": {
      "columns": [
        "postgres_version",
        "database_name"
      ],
      "minRows": 1
    },
    "visual": [
      "Клиент отправляет SQL",
      "PostgreSQL выполняет запрос",
      "Результат возвращается таблицей"
    ],
    "quiz": {
      "q": "Что такое PostgreSQL?",
      "options": [
        "Язык запросов без движка",
        "СУБД, которая выполняет SQL и хранит данные",
        "Инструмент только для построения графиков"
      ],
      "correct": 1,
      "why": "SQL — язык, PostgreSQL — СУБД, а клиент нужен для отправки запросов и просмотра результата."
    }
  },
  {
    "id": 2,
    "unit": "0 · Старт",
    "title": "База данных, схема, таблица и путь_поиска",
    "goal": "Понимать уровни организации объектов и безопасно обращаться к таблицам.",
    "explain": "В одном экземпляре сервера могут быть базы данных; внутри базы — схемы; внутри схем — таблицы, представления, функции и другие объекты. `public` часто используют для учебных примеров, но в рабочих проектах схемы помогают разделять области и права. `search_path` определяет, где PostgreSQL ищет объект с неуказанной схемой.",
    "gotcha": "Одноимённые таблицы в разных схемах — разные объекты. Для критичных запросов явно указывай схему, например `analytics.orders`.",
    "exampleSql": "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;",
    "starterSql": "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;",
    "task": "Посмотри список таблиц учебной схемы и найди `orders`.",
    "checks": {
      "columns": [
        "table_schema",
        "table_name"
      ],
      "minRows": 5,
      "contains": {
        "column": "table_name",
        "value": "orders"
      }
    },
    "visual": [
      "База данных",
      "Схема public",
      "Таблицы и другие объекты"
    ],
    "quiz": {
      "q": "Зачем в запросе писать `analytics.orders` вместо `orders`?",
      "options": [
        "Чтобы явно указать схему и избежать неоднозначного поиска",
        "Чтобы PostgreSQL ускорил каждый запрос в несколько раз",
        "Так можно обращаться только к временным таблицам"
      ],
      "correct": 0,
      "why": "Квалифицированное имя явно задаёт схему объекта и делает запрос понятнее."
    }
  },
  {
    "id": 3,
    "unit": "1 · Запросы и фильтрация",
    "title": "SELECT, FROM и псевдонимы",
    "goal": "Выбирать только нужные поля и давать результату понятные имена.",
    "explain": "`SELECT` задаёт столбцы или выражения, `FROM` — источник данных. Псевдоним через `AS` задаёт удобное имя выходного столбца. В PostgreSQL не заключённые в кавычки идентификаторы приводятся к нижнему регистру; двойные кавычки сохраняют точное написание, поэтому `\"CustomerName\"` и `customername` — не одно и то же.",
    "gotcha": "Не используй `SELECT *` как постоянный контракт отчёта: добавленные в таблицу поля могут неожиданно изменить структуру результата.",
    "exampleSql": "SELECT id, full_name AS customer_name, city FROM customers ORDER BY id LIMIT 5;",
    "starterSql": "SELECT id, full_name AS customer_name, city FROM customers ORDER BY id LIMIT 5;",
    "task": "Запусти выборку и сравни имена исходного поля `full_name` и псевдонима `customer_name`.",
    "checks": {
      "columns": [
        "id",
        "customer_name",
        "city"
      ],
      "minRows": 5
    },
    "visual": [
      "FROM — источник",
      "SELECT — список полей",
      "AS — имена результата"
    ],
    "quiz": {
      "q": "Что меняет `AS customer_name`?",
      "options": [
        "Физически переименовывает столбец в таблице",
        "Задаёт имя столбца только в результате запроса",
        "Создаёт новый столбец в базе"
      ],
      "correct": 1,
      "why": "Псевдоним меняет метку в результате, но не структуру сохранённой таблицы."
    }
  },
  {
    "id": 4,
    "unit": "1 · Запросы и фильтрация",
    "title": "WHERE и логика условий",
    "goal": "Фильтровать строки и корректно сочетать AND, OR и скобки.",
    "explain": "`WHERE` проверяет условие для каждой строки до группировки. Сначала учитывай приоритет `NOT`, затем `AND`, затем `OR`. Скобки делают бизнес-правило явным. Сравнение с `NULL` не истинно и не ложно, а даёт неизвестный результат — это отдельная тема следующего урока.",
    "gotcha": "`city = 'Москва' OR city = 'Казань' AND active` не эквивалентно `(city IN ('Москва','Казань')) AND active`. Используй скобки, если фильтр состоит из нескольких бизнес-условий.",
    "exampleSql": "SELECT id, full_name, city FROM customers WHERE city IN ('Москва', 'Казань') AND active IS TRUE ORDER BY city, full_name;",
    "starterSql": "SELECT id, full_name, city FROM customers WHERE city IN ('Москва', 'Казань') AND active IS TRUE ORDER BY city, full_name;",
    "task": "Получи активных клиентов из Москвы или Казани.",
    "checks": {
      "columns": [
        "id",
        "full_name",
        "city"
      ],
      "minRows": 3
    },
    "visual": [
      "Все клиенты",
      "WHERE проверяет условие",
      "Остаются подходящие строки"
    ],
    "quiz": {
      "q": "Зачем ставить скобки в сложном `WHERE`?",
      "options": [
        "Они меняют порядок и делают логику условия явной",
        "Они обязательны вокруг каждого имени поля",
        "Они превращают NULL в пустую строку"
      ],
      "correct": 0,
      "why": "Скобки помогают однозначно выразить правило и избежать ошибок приоритета AND/OR."
    }
  },
  {
    "id": 5,
    "unit": "1 · Запросы и фильтрация",
    "title": "NULL, COALESCE и IS DISTINCT FROM",
    "goal": "Обрабатывать пропуски без потери смысла данных.",
    "explain": "`NULL` означает неизвестное или отсутствующее значение. Проверяй его через `IS NULL` и `IS NOT NULL`, а не через `= NULL`. `COALESCE(a,b)` возвращает первое не-NULL значение. `IS DISTINCT FROM` сравнивает значения с безопасной семантикой для NULL: два NULL считаются равными в этом сравнении.",
    "gotcha": "`COUNT(*)` считает строки, а `COUNT(column)` игнорирует NULL в этом столбце. Не заменяй пропуски нулями без подтверждённого бизнес-правила.",
    "exampleSql": "SELECT id, coupon, COALESCE(coupon, 'без купона') AS coupon_label FROM orders WHERE coupon IS NULL ORDER BY id;",
    "starterSql": "SELECT id, coupon, COALESCE(coupon, 'без купона') AS coupon_label FROM orders WHERE coupon IS NULL ORDER BY id;",
    "task": "Найди заказы без купона и покажи понятную подпись вместо NULL.",
    "checks": {
      "columns": [
        "id",
        "coupon",
        "coupon_label"
      ],
      "minRows": 3,
      "contains": {
        "column": "coupon_label",
        "value": "без купона"
      }
    },
    "visual": [
      "NULL — неизвестно",
      "IS NULL — найти пропуск",
      "COALESCE — задать резервное значение"
    ],
    "quiz": {
      "q": "Как правильно найти строки, где `coupon` отсутствует?",
      "options": [
        "`купон = NULL`",
        "`купон НУЛЬ`",
        "`coupon = ''` — это всегда то же самое"
      ],
      "correct": 1,
      "why": "NULL и пустая строка — разные состояния. Для NULL используется IS NULL."
    }
  },
  {
    "id": 6,
    "unit": "1 · Запросы и фильтрация",
    "title": "Поиск по тексту: LIKE, ILIKE и регулярные выражения",
    "goal": "Находить строки по шаблону и понимать PostgreSQL-специфичный ILIKE.",
    "explain": "`LIKE` чувствителен к регистру в обычном сопоставлении, `ILIKE` выполняет регистронезависимое сравнение в соответствии с локалью. `%` соответствует любой последовательности символов, `_` — одному символу. Для более сложных шаблонов PostgreSQL поддерживает регулярные выражения через `~` и `~*`.",
    "gotcha": "Начинающий с `%` шаблон, например `ILIKE '%@example.ru'`, часто не может эффективно использовать обычный B-дерево индекс. Для частых поисков нужен отдельный анализ плана и подходящий индекс.",
    "exampleSql": "SELECT id, full_name, email FROM customers WHERE email ILIKE '%@example.ru' ORDER BY full_name;",
    "starterSql": "SELECT id, full_name, email FROM customers WHERE email ILIKE '%@example.ru' ORDER BY full_name;",
    "task": "Найди клиентов по домену почты без учёта регистра.",
    "checks": {
      "columns": [
        "id",
        "full_name",
        "email"
      ],
      "minRows": 8
    },
    "visual": [
      "Текст столбца",
      "ILIKE сравнивает без учёта регистра",
      "Совпавшие строки"
    ],
    "quiz": {
      "q": "Что означает `%` в `ILIKE '%@example.ru'`?",
      "options": [
        "Ровно один любой символ",
        "Любая последовательность символов, в том числе пустая",
        "Только цифры"
      ],
      "correct": 1,
      "why": "Процент обозначает любое количество символов; подчёркивание соответствует одному символу."
    }
  },
  {
    "id": 7,
    "unit": "1 · Запросы и фильтрация",
    "title": "ORDER BY, LIMIT и правильная пагинация",
    "goal": "Стабильно сортировать результаты и выбирать способ постраничного чтения.",
    "explain": "`ORDER BY` задаёт порядок результата; `LIMIT` ограничивает количество строк, `OFFSET` пропускает первые строки. Если сортировка не уникальна, PostgreSQL вправе возвращать строки с одинаковым значением в разном порядке. Для больших меняющихся таблиц keyset pagination по последнему уникальному ключу часто надёжнее большого OFFSET.",
    "gotcha": "Без `ORDER BY` порядок строк не гарантирован. Для повторяемого отчёта добавляй уникальный критерий, например `ORDER BY order_ts DESC, id DESC`.",
    "exampleSql": "SELECT id, customer_id, order_ts, status FROM orders ORDER BY order_ts DESC, id DESC LIMIT 5 OFFSET 0;",
    "starterSql": "SELECT id, customer_id, order_ts, status FROM orders ORDER BY order_ts DESC, id DESC LIMIT 5 OFFSET 0;",
    "task": "Покажи пять самых свежих заказов с детерминированной сортировкой.",
    "checks": {
      "columns": [
        "id",
        "customer_id",
        "order_ts",
        "status"
      ],
      "exactRows": 5
    },
    "visual": [
      "Строки источника",
      "ORDER BY: дата и уникальный id",
      "LIMIT: первые 5"
    ],
    "quiz": {
      "q": "Почему `ORDER BY order_ts DESC, id DESC` лучше, чем только `ORDER BY order_ts DESC`?",
      "options": [
        "Дополнительный ID разрешает равенство временных меток",
        "ID заставляет сервер использовать индекс",
        "Дата не поддерживает DESC"
      ],
      "correct": 0,
      "why": "Если время совпадает, уникальный ID задаёт стабильный порядок строк."
    }
  },
  {
    "id": 8,
    "unit": "2 · Типы и время",
    "title": "Типы данных и явное приведение",
    "goal": "Выбирать точные типы для денег, идентификаторов и вычислений.",
    "explain": "PostgreSQL имеет строгие типы. `numeric` обеспечивает точную десятичную арифметику и полезен для денежных сумм; `real` и `double precision` используют числа с плавающей точкой. Приведение типа пишут через `CAST(value AS type)` или `value::type`. `text` удобен для строк; идентификаторы могут быть `integer`, `bigint` или `uuid` в зависимости от задачи.",
    "gotcha": "`'10'` — текст, а `10` — число. Не полагайся на неявные преобразования при сравнении или соединении столбцов разных типов.",
    "exampleSql": "SELECT 0.1::numeric + 0.2::numeric AS exact_decimal, '42'::integer AS parsed_id, pg_typeof(0.1::numeric) AS value_type;",
    "starterSql": "SELECT 0.1::numeric + 0.2::numeric AS exact_decimal, '42'::integer AS parsed_id, pg_typeof(0.1::numeric) AS value_type;",
    "task": "Сравни точное десятичное вычисление с типом результата и явным приведением текста к числу.",
    "checks": {
      "columns": [
        "exact_decimal",
        "parsed_id",
        "value_type"
      ],
      "exactRows": 1,
      "contains": {
        "column": "exact_decimal",
        "value": "0.3"
      }
    },
    "visual": [
      "Входное значение",
      "CAST / :: задаёт тип",
      "PostgreSQL вычисляет результат по правилам типа"
    ],
    "quiz": {
      "q": "Почему денежные суммы часто хранят как `numeric`, а не `real`?",
      "options": [
        "числовой запрещает отрицательные значения",
        "числовой хранит десятичные значения с точностью, заданной типом",
        "Настоящий не поддерживает сложение"
      ],
      "correct": 1,
      "why": "Плавающая точка может иметь двоичное представление с округлением; числовой лучше подходит для точной десятичной арифметики."
    }
  },
  {
    "id": 9,
    "unit": "2 · Типы и время",
    "title": "DATE, временная метка и часовые пояса",
    "goal": "Не путать календарную дату и точный момент времени.",
    "explain": "`date` хранит календарную дату без времени; `timestamp` — дату и время без информации о часовом поясе; `timestamptz` интерпретирует вход как момент времени и отображает его согласно настройке часового пояса сессии. Для аналитики событий обычно важен момент, поэтому `timestamptz` — частый выбор. Для локального календарного дня явно указывай бизнес-часовой пояс.",
    "gotcha": "`timestamp without time zone` не становится временем UTC сам по себе. Сдвиг между часовыми поясами может изменить дату события при группировке по дням.",
    "exampleSql": "SELECT id, order_ts, order_ts AT TIME ZONE 'Europe/Moscow' AS moscow_local_time FROM orders ORDER BY order_ts DESC LIMIT 5;",
    "starterSql": "SELECT id, order_ts, order_ts AT TIME ZONE 'Europe/Moscow' AS moscow_local_time FROM orders ORDER BY order_ts DESC LIMIT 5;",
    "task": "Сравни хранимый момент заказа и его локальное представление в Москве.",
    "checks": {
      "columns": [
        "id",
        "order_ts",
        "moscow_local_time"
      ],
      "exactRows": 5
    },
    "visual": [
      "временная метка — момент времени",
      "AT TIME ZONE",
      "Локальное дата-время бизнеса"
    ],
    "quiz": {
      "q": "Что точнее описывает `timestamptz`?",
      "options": [
        "Всегда хранит исходное название зоны в каждой строке",
        "Представляет момент времени, отображаемый в часовом поясе сессии",
        "Хранит только календарный день"
      ],
      "correct": 1,
      "why": "PostgreSQL нормализует момент времени; исходная текстовая метка зоны обычно не сохраняется как часть значения."
    }
  },
  {
    "id": 10,
    "unit": "3 · Агрегации",
    "title": "COUNT, SUM, AVG и FILTER",
    "goal": "Считать показатели и разделять группы по условиям.",
    "explain": "Агрегаты сворачивают несколько строк в одно значение: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`. `FILTER (WHERE ...)` позволяет вычислять несколько условных метрик в одном запросе. `COUNT(*)` считает все строки; `COUNT(expr)` считает только строки, где expr не NULL. `SUM` и `AVG` игнорируют NULL.",
    "gotcha": "Перед суммированием после JOIN проверяй уровень детализации: одна сущность может повториться из-за связи один-ко-многим и искусственно увеличить сумму.",
    "exampleSql": "SELECT status, COUNT(*) AS orders_count, COUNT(*) FILTER (WHERE channel = 'web') AS web_orders, SUM(CASE WHEN status IN ('paid','fulfilled') THEN 1 ELSE 0 END) AS accepted_orders FROM orders GROUP BY status ORDER BY orders_count DESC;",
    "starterSql": "SELECT status, COUNT(*) AS orders_count, COUNT(*) FILTER (WHERE channel = 'web') AS web_orders FROM orders GROUP BY status ORDER BY orders_count DESC;",
    "task": "Посчитай все заказы и отдельно заказы из канала сеть по статусам.",
    "checks": {
      "columns": [
        "status",
        "orders_count",
        "web_orders"
      ],
      "minRows": 3
    },
    "visual": [
      "Исходные строки Заказы",
      "GROUP BY статусу",
      "COUNT и FILTER внутри каждой группы"
    ],
    "quiz": {
      "q": "Чем `COUNT(*)` отличается от `COUNT(coupon)`?",
      "options": [
        "Ничем",
        "COUNT(coupon) не считает строки, где купон равен NULL",
        "COUNT(*) считает только уникальные строки"
      ],
      "correct": 1,
      "why": "COUNT(expr) игнорирует NULL в выражение, а COUNT(*) учитывает каждую строку."
    }
  },
  {
    "id": 11,
    "unit": "3 · Агрегации",
    "title": "GROUP BY, HAVING и уровень детализации",
    "goal": "Собирать показатели по категориям и фильтровать готовые группы.",
    "explain": "`GROUP BY` задаёт зерно результата: по одной строке на каждую комбинацию группирующих полей. `WHERE` фильтрует исходные строки до агрегации; `HAVING` фильтрует уже собранные группы. В PostgreSQL каждое выбранное неагрегированное поле должно быть корректно связано с группировкой.",
    "gotcha": "Если включить в GROUP BY уникальный `order_id`, агрегация по категории может перестать сворачиваться до уровня категории.",
    "exampleSql": "SELECT p.category, SUM(oi.quantity * oi.unit_price) AS revenue, COUNT(DISTINCT oi.order_id) AS orders_count FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category HAVING SUM(oi.quantity * oi.unit_price) > 10000 ORDER BY revenue DESC;",
    "starterSql": "SELECT p.category, SUM(oi.quantity * oi.unit_price) AS revenue, COUNT(DISTINCT oi.order_id) AS orders_count FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category HAVING SUM(oi.quantity * oi.unit_price) > 10000 ORDER BY revenue DESC;",
    "task": "Найди категории с выручкой более 10 000 и количеством уникальных заказов.",
    "checks": {
      "columns": [
        "category",
        "revenue",
        "orders_count"
      ],
      "minRows": 2
    },
    "visual": [
      "Строки товарных позиций",
      "GROUP BY категории",
      "HAVING оставляет группы по сумме"
    ],
    "quiz": {
      "q": "Когда применяют `HAVING`?",
      "options": [
        "Для фильтрации отдельных исходных строк до группировки",
        "Для фильтрации сгруппированных результатов, например по SUM",
        "Только для сортировки"
      ],
      "correct": 1,
      "why": "WHERE действует до группировки, HAVING — после формирования групп."
    }
  },
  {
    "id": 12,
    "unit": "4 · Связи и сложные запросы",
    "title": "JOIN и кардинальность связей",
    "goal": "Объединять таблицы, не удваивая выручку незаметно.",
    "explain": "`JOIN` связывает строки по условию. Внешний ключ заказа указывает на клиента; позиции заказа указывают на товары. `INNER JOIN` оставляет совпадения, `LEFT JOIN` сохраняет все строки слева. Перед объединением зафиксируй уровень детализации обеих таблиц и проверь, не размножаются ли строки.",
    "gotcha": "Нельзя суммировать стоимость заказа после соединения с несколькими товарными позициями без проверки уровня детализации. Сумма товарных строк — не то же самое, что сумма заказов.",
    "exampleSql": "SELECT o.id AS order_id, c.full_name, o.status, SUM(oi.quantity * oi.unit_price) AS order_total FROM orders o JOIN customers c ON c.id = o.customer_id JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id, c.full_name, o.status ORDER BY order_total DESC LIMIT 8;",
    "starterSql": "SELECT o.id AS order_id, c.full_name, o.status, SUM(oi.quantity * oi.unit_price) AS order_total FROM orders o JOIN customers c ON c.id = o.customer_id JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id, c.full_name, o.status ORDER BY order_total DESC LIMIT 8;",
    "task": "Покажи восемь заказов с именем клиента и суммой товарных строк.",
    "checks": {
      "columns": [
        "order_id",
        "full_name",
        "status",
        "order_total"
      ],
      "exactRows": 8
    },
    "visual": [
      "Заказы: одна строка на заказ",
      "заказ_предметы: много строк на заказ",
      "GROUP BY возвращает одну строку на заказ"
    ],
    "quiz": {
      "q": "Почему сумма может вырасти после JOIN?",
      "options": [
        "JOIN автоматически удваивает числовые значения",
        "Связь один-ко-многим размножает строки левой таблицы",
        "PostgreSQL считает каждую таблицу дважды"
      ],
      "correct": 1,
      "why": "Один заказ соединяется с несколькими позициями. Нужно осознавать гранулярность и агрегировать на правильном уровне."
    }
  },
  {
    "id": 13,
    "unit": "4 · Связи и сложные запросы",
    "title": "EXISTS и проверка наличия связанных строк",
    "goal": "Формулировать условия существования без лишнего размножения строк.",
    "explain": "`EXISTS` возвращает истину, если подзапрос нашёл хотя бы одну строку. Он особенно полезен, когда нужно выбрать клиентов, у которых есть оплаченные заказы, не присоединяя каждый заказ к результату. Подзапрос может ссылаться на строку внешнего запроса — это коррелированный подзапрос.",
    "gotcha": "JOIN и EXISTS отвечают на разные вопросы. Если требуется список клиентов, у которых есть хотя бы один заказ, EXISTS помогает сохранить одну строку на клиента.",
    "exampleSql": "SELECT c.id, c.full_name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status IN ('paid','fulfilled')) ORDER BY c.id;",
    "starterSql": "SELECT c.id, c.full_name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status IN ('paid','fulfilled')) ORDER BY c.id;",
    "task": "Найди клиентов, у которых есть хотя бы один оплаченный или выполненный заказ.",
    "checks": {
      "columns": [
        "id",
        "full_name"
      ],
      "minRows": 6
    },
    "visual": [
      "Строка клиента",
      "EXISTS проверяет связанные заказы",
      "Клиент остаётся одной строкой"
    ],
    "quiz": {
      "q": "Когда `EXISTS` особенно удобен?",
      "options": [
        "Когда нужен факт наличия связанных строк, а не каждая строка связи",
        "Когда нужно отсортировать таблицу",
        "Когда надо создать индекс"
      ],
      "correct": 0,
      "why": "EXISTS проверяет факт существования и не размножает наружные строки количеством совпадений."
    }
  },
  {
    "id": 14,
    "unit": "4 · Связи и сложные запросы",
    "title": "Подзапросы, NOT EXISTS и ловушка NOT IN",
    "goal": "Использовать подзапросы и избегать ошибок с NULL в отрицании.",
    "explain": "Подзапрос может вернуть значение, таблицу или булев результат. `IN` проверяет наличие значения в наборе. `NOT IN` неожиданно может вернуть неизвестный результат, если набор содержит NULL. В задачах «найди строки, для которых нет пары» часто безопаснее и понятнее использовать `NOT EXISTS`.",
    "gotcha": "Не выбирай NOT IN автоматически. Если в подзапросе хотя бы одно значение NULL, условие может перестать возвращать ожидаемые строки.",
    "exampleSql": "SELECT c.id, c.full_name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ORDER BY c.id;",
    "starterSql": "SELECT c.id, c.full_name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ORDER BY c.id;",
    "task": "Найди клиентов, у которых ещё нет заказов.",
    "checks": {
      "columns": [
        "id",
        "full_name"
      ],
      "minRows": 1
    },
    "visual": [
      "Внешняя строка",
      "NOT EXISTS ищет отсутствие пары",
      "Остаются клиенты без заказов"
    ],
    "quiz": {
      "q": "Почему `NOT IN (подзапрос)` требует осторожности?",
      "options": [
        "Он всегда медленнее LEFT JOIN",
        "NULL в наборе может превратить проверку в UNKNOWN",
        "Он работает только с числами"
      ],
      "correct": 1,
      "why": "Логика сравнения с NULL трёхзначная; при неизвестном элементе отрицание может дать UNKNOWN."
    }
  },
  {
    "id": 15,
    "unit": "4 · Связи и сложные запросы",
    "title": "CTE: WITH как имя промежуточного результата",
    "goal": "Разбивать сложный запрос на логические шаги.",
    "explain": "Общее табличное выражение `WITH` даёт имя промежуточному запросу, который можно использовать далее в той же инструкции. Это облегчает чтение и проверку бизнес-логики. PostgreSQL может встраивать CTE в основной запрос или материализовать его; не считай каждый CTE автоматически временной таблицей.",
    "gotcha": "CTE улучшает структуру кода, но не гарантирует ускорение. Для производительности смотри EXPLAIN и проверяй версию PostgreSQL и свойства запроса.",
    "exampleSql": "WITH order_totals AS (SELECT order_id, SUM(quantity * unit_price) AS total FROM order_items GROUP BY order_id) SELECT o.id, o.status, t.total FROM orders o JOIN order_totals t ON t.order_id = o.id ORDER BY t.total DESC LIMIT 8;",
    "starterSql": "WITH order_totals AS (SELECT order_id, SUM(quantity * unit_price) AS total FROM order_items GROUP BY order_id) SELECT o.id, o.status, t.total FROM orders o JOIN order_totals t ON t.order_id = o.id ORDER BY t.total DESC LIMIT 8;",
    "task": "Сначала рассчитай сумму товарных строк в CTE, затем покажи восемь заказов с максимальным итогом.",
    "checks": {
      "columns": [
        "id",
        "status",
        "total"
      ],
      "exactRows": 8
    },
    "visual": [
      "CTE order_totals",
      "JOIN с Заказы",
      "Упорядоченный итог"
    ],
    "quiz": {
      "q": "Что даёт CTE?",
      "options": [
        "Именованный шаг запроса для читаемости и повторного использования в инструкции",
        "Постоянную таблицу, сохраняемую после запроса",
        "Автоматический индекс на результат"
      ],
      "correct": 0,
      "why": "CTE именует промежуточный результат внутри одной SQL-инструкции; физическая материализация зависит от запроса и планировщика."
    }
  },
  {
    "id": 16,
    "unit": "4 · Связи и сложные запросы",
    "title": "Рекурсивный CTE",
    "goal": "Понимать базовый случай и рекурсивный шаг обхода иерархий.",
    "explain": "`WITH RECURSIVE` строит результат итеративно. Нужен начальный набор (якорь) и рекурсивная часть, которая ссылается на CTE. Каждый шаг добавляет новые строки, пока рекурсивная часть не перестанет находить результаты. Так обходят деревья категорий, организационные структуры и календарные ряды.",
    "gotcha": "Рекурсия должна иметь корректное условие остановки. На циклических связях возможен бесконечный рост; на реальных графах учитывай защиту от циклов.",
    "exampleSql": "WITH RECURSIVE levels(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM levels WHERE n < 5) SELECT n AS level FROM levels ORDER BY n;",
    "starterSql": "WITH RECURSIVE levels(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM levels WHERE n < 5) SELECT n AS level FROM levels ORDER BY n;",
    "task": "Сгенерируй уровни от 1 до 5 и найди базовый случай и условие остановки.",
    "checks": {
      "columns": [
        "level"
      ],
      "exactRows": 5
    },
    "visual": [
      "Якорь: н = 1",
      "Рекурсивный шаг: н + 1",
      "Условие н < 5 останавливает цикл"
    ],
    "quiz": {
      "q": "Какие две части нужны простому рекурсивному CTE?",
      "options": [
        "SELECT и ORDER BY",
        "Начальный запрос и рекурсивная часть с условием остановки",
        "Таблица и индекс"
      ],
      "correct": 1,
      "why": "Начальный запрос задаёт старт, а рекурсивная часть строит последующие уровни."
    }
  },
  {
    "id": 17,
    "unit": "4 · Связи и сложные запросы",
    "title": "Оконные функции: ROW_NUMBER, RANK, LAG",
    "goal": "Считать ранги и сравнения, не сворачивая строки.",
    "explain": "Оконная функция выполняет расчёт по набору связанных строк, сохраняя строку результата. `PARTITION BY` разделяет независимые группы, `ORDER BY` задаёт порядок внутри группы. `ROW_NUMBER` нумерует строки; `RANK` оставляет пропуски после равенств; `DENSE_RANK` — нет. `LAG` берёт значение предыдущей строки в порядке окна.",
    "gotcha": "ORDER BY внутри окна не гарантирует сортировку финального результата — для отображения добавь внешний ORDER BY. Результат зависит от порядка внутри окна, поэтому при равных значениях задавай тай-брейк.",
    "exampleSql": "SELECT customer_id, id AS order_id, order_ts, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_ts DESC, id DESC) AS order_rank, LAG(status) OVER (PARTITION BY customer_id ORDER BY order_ts, id) AS previous_status FROM orders ORDER BY customer_id, order_ts;",
    "starterSql": "SELECT customer_id, id AS order_id, order_ts, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_ts DESC, id DESC) AS order_rank FROM orders ORDER BY customer_id, order_ts;",
    "task": "Пронумеруй заказы каждого клиента от самого нового к старому.",
    "checks": {
      "columns": [
        "customer_id",
        "order_id",
        "order_ts",
        "order_rank"
      ],
      "minRows": 15
    },
    "visual": [
      "РАЗДЕЛЕНИЕ ПО customer_id",
      "ORDER BY order_ts DESC",
      "ROW_NUMBER нумерует внутри клиента"
    ],
    "quiz": {
      "q": "Чем оконная функция отличается от GROUP BY?",
      "options": [
        "Оконная функция обычно сохраняет детализацию строк, а GROUP BY сворачивает их",
        "Оконная функция всегда удаляет дубликаты",
        "GROUP BY может работать только с текстом"
      ],
      "correct": 0,
      "why": "Окно рассчитывает значение для каждой строки в контексте соседних/сгруппированных строк; группировка создаёт сводные строки."
    }
  },
  {
    "id": 18,
    "unit": "4 · Связи и сложные запросы",
    "title": "UNION, UNION ALL, INTERSECT и EXCEPT",
    "goal": "Объединять совместимые выборки и осознанно работать с повторами.",
    "explain": "Операции множеств требуют одинаковое количество столбцов в совместимых типах. `UNION` объединяет результаты и убирает дубликаты; `UNION ALL` сохраняет их и обычно избегает затрат на дедупликацию. `INTERSECT` оставляет общие строки, `EXCEPT` — строки первой выборки, которых нет во второй.",
    "gotcha": "Для событий и фактов повторы могут быть значимы. Не добавляй UNION вместо UNION ALL, если повторные события должны сохраняться.",
    "exampleSql": "SELECT city AS location, 'customer_city' AS source FROM customers UNION ALL SELECT channel AS location, 'order_channel' AS source FROM orders ORDER BY source, location LIMIT 12;",
    "starterSql": "SELECT city AS location, 'customer_city' AS source FROM customers UNION ALL SELECT channel AS location, 'order_channel' AS source FROM orders ORDER BY source, location LIMIT 12;",
    "task": "Объедини города клиентов и каналы заказов в единый список с признаком источника.",
    "checks": {
      "columns": [
        "location",
        "source"
      ],
      "exactRows": 12
    },
    "visual": [
      "Выборка клиентов",
      "UNION ALL сохраняет все строки",
      "Выборка каналов заказов"
    ],
    "quiz": {
      "q": "Когда стоит выбрать UNION ALL вместо UNION?",
      "options": [
        "Когда дубликаты нужно сохранить и дедупликация не требуется",
        "Когда столбцы разных типов нельзя совместить",
        "Когда нужна только сортировка"
      ],
      "correct": 0,
      "why": "UNION удаляет дубликаты. UNION ALL сохраняет все строки и часто дешевле."
    }
  },
  {
    "id": 19,
    "unit": "5 · Модель данных и изменения",
    "title": "CREATE TABLE, ограничения и идентификаторы",
    "goal": "Создавать таблицы с явными правилами целостности.",
    "explain": "Ограничения — это проверяемые правила хранения данных: `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL` и `CHECK`. Они защищают данные независимо от приложения. Для новых идентификаторов PostgreSQL поддерживает `GENERATED ... AS IDENTITY`; `serial` — исторический удобный механизм на базе последовательности. Для связи используй внешний ключ, а действие `ON DELETE` выбирай осознанно.",
    "gotcha": "Не заменяй ограничение проверкой только в интерфейсе: другие клиенты могут записать недопустимые данные. `CHECK` не заменяет `NOT NULL`, потому что условие CHECK с UNKNOWN не отклоняет строку.",
    "exampleSql": "CREATE TABLE demo_events (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, event_name text NOT NULL, quantity integer NOT NULL CHECK (quantity > 0), code text UNIQUE);",
    "starterSql": "SELECT conname, contype FROM pg_constraint WHERE conrelid = 'orders'::regclass ORDER BY conname;",
    "task": "Посмотри ограничения учебной таблицы `orders`. Затем изучи пример CREATE TABLE и найди первичный ключ и CHECK.",
    "checks": {
      "columns": [
        "conname",
        "contype"
      ],
      "minRows": 2
    },
    "visual": [
      "Столбцы и типы",
      "Ограничения валидируют данные",
      "Невалидная запись отклоняется"
    ],
    "quiz": {
      "q": "Почему CHECK (количество > 0) не заменяет NOT NULL?",
      "options": [
        "CHECK никогда не работает с числами",
        "При NULL условие CHECK может быть UNKNOWN и не отклонить строку",
        "NOT NULL нужен только для индексов"
      ],
      "correct": 1,
      "why": "Если поле обязательно, задавай NOT NULL явно — CHECK не обеспечивает то же самое для NULL."
    }
  },
  {
    "id": 20,
    "unit": "5 · Модель данных и изменения",
    "title": "INSERT, UPDATE, DELETE и RETURNING",
    "goal": "Менять строки контролируемо и проверять, какие значения реально изменились.",
    "explain": "`INSERT` добавляет записи, `UPDATE` изменяет подходящие строки, `DELETE` удаляет их. В PostgreSQL `RETURNING` возвращает значения вставленных, изменённых или удалённых строк сразу в том же запросе. До UPDATE/DELETE сначала проверь предикат через SELECT; в боевой работе делай изменения в транзакции и сверяй количество строк.",
    "gotcha": "UPDATE без WHERE изменит все строки таблицы. DELETE без WHERE удалит их все. Для опасных действий в Производство соблюдай процедуру, резервное копирование и минимальные права.",
    "exampleSql": "UPDATE customers SET segment = segment WHERE id = 1 RETURNING id, full_name, segment;",
    "starterSql": "UPDATE customers SET segment = segment WHERE id = 1 RETURNING id, full_name, segment;",
    "task": "Запусти безопасное учебное обновление одной строки и изучи результат RETURNING.",
    "checks": {
      "columns": [
        "id",
        "full_name",
        "segment"
      ],
      "exactRows": 1
    },
    "visual": [
      "UPDATE выбирает строки WHERE",
      "Меняет значения",
      "RETURNING показывает изменённые строки"
    ],
    "quiz": {
      "q": "Что возвращает RETURNING в UPDATE?",
      "options": [
        "Все строки таблицы до запроса",
        "Строки, затронутые операцией, и выбранные выражения",
        "Только число обновлённых индексов"
      ],
      "correct": 1,
      "why": "RETURNING позволяет сразу увидеть запись после модификации без отдельного SELECT."
    }
  },
  {
    "id": 21,
    "unit": "5 · Модель данных и изменения",
    "title": "INSERT ... ON CONFLICT: вставка с обработкой конфликта",
    "goal": "Безопасно обрабатывать повторную вставку по уникальному ключу.",
    "explain": "`INSERT ... ON CONFLICT` позволяет задать реакцию на нарушение уникальности: `DO NOTHING` или `DO UPDATE`. Конфликт определяется уникальным или первичным ключом/индексом. Это часто используют для идемпотентных загрузок. В `DO UPDATE` можно ссылаться на предложенную строку через `EXCLUDED`.",
    "gotcha": "UPSERT не делает бизнес-операцию автоматически корректной: выбери правильный ключ конфликта, проверь побочные эффекты триггеров и учти конкурентные записи.",
    "exampleSql": "INSERT INTO products (id, name, category, price, tags) VALUES (99, 'Учебный товар', 'Аксессуары', 100, ARRAY['demo']::text[]) ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price RETURNING id, name, price;",
    "starterSql": "INSERT INTO products (id, name, category, price, tags) VALUES (99, 'Учебный товар', 'Аксессуары', 100, ARRAY['demo']::text[]) ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price RETURNING id, name, price;",
    "task": "Запусти UPSERT дважды: второй запуск должен обновить ту же запись, а не создать дубликат.",
    "checks": {
      "columns": [
        "id",
        "name",
        "price"
      ],
      "exactRows": 1,
      "contains": {
        "column": "name",
        "value": "Учебный товар"
      }
    },
    "visual": [
      "INSERT предлагает строку",
      "ON CONFLICT ловит уникальный ключ",
      "DO UPDATE делает повторный запуск идемпотентным"
    ],
    "quiz": {
      "q": "Что означает `EXCLUDED.price` в `ON CONFLICT DO UPDATE`?",
      "options": [
        "Текущую цену из существующей строки",
        "Цена, предложенная INSERT, которая конфликтовала",
        "Цену из последнего SELECT"
      ],
      "correct": 1,
      "why": "EXCLUDED представляет строку, которую INSERT пытался вставить."
    }
  },
  {
    "id": 22,
    "unit": "5 · Модель данных и изменения",
    "title": "Транзакции, COMMIT, ROLLBACK и SAVEPOINT",
    "goal": "Понимать атомарность и безопасно группировать изменения.",
    "explain": "Транзакция объединяет операции в одну логическую единицу. `COMMIT` подтверждает изменения, `ROLLBACK` отменяет их. `SAVEPOINT` создаёт точку, до которой можно частично откатиться. ACID описывает атомарность, согласованность, изоляцию и долговечность. Уровни изоляции влияют на то, какие параллельные изменения могут наблюдаться.",
    "gotcha": "ROLLBACK помогает только до COMMIT. В браузерной песочнице нет настоящего второго клиентского соединения, поэтому конкурентное поведение и уровни изоляции нужно проверить на реальном сервере.",
    "exampleSql": "BEGIN; UPDATE orders SET status = 'cancelled' WHERE id = 101 RETURNING id, status; ROLLBACK;",
    "starterSql": "BEGIN; UPDATE orders SET status = 'cancelled' WHERE id = 101 RETURNING id, status; ROLLBACK;",
    "task": "Убедись, что UPDATE возвращает строку, а ROLLBACK отменяет изменение. После запуска проверь статус запроса SELECT.",
    "checks": {
      "columns": [
        "id",
        "status"
      ],
      "exactRows": 1,
      "contains": {
        "column": "status",
        "value": "cancelled"
      }
    },
    "visual": [
      "BEGIN открывает транзакцию",
      "Изменение временно видно внутри",
      "ROLLBACK отменяет его"
    ],
    "quiz": {
      "q": "Что делает ROLLBACK до COMMIT?",
      "options": [
        "Подтверждает изменения",
        "Отменяет изменения текущей транзакции",
        "Создаёт резервную копию"
      ],
      "correct": 1,
      "why": "ROLLBACK отменяет незакоммиченные действия. После COMMIT обычный ROLLBACK уже не вернёт их назад."
    }
  },
  {
    "id": 23,
    "unit": "6 · Возможности PostgreSQL",
    "title": "JSON и JSONB",
    "goal": "Извлекать значения из полуструктурированных данных и понимать индексацию JSONB.",
    "explain": "`json` хранит исходный текст JSON, а `jsonb` — бинарно обработанное представление, удобное для запросов и индексации. Оператор `->` возвращает JSON-значение; `->>` извлекает текст. `@>` проверяет включение структуры, `?` — наличие ключа или элемента. Для выборочного ускорения JSONB-поиска используют подходящий GIN-индекс и проверяют его планом.",
    "gotcha": "Не превращай всю реляционную модель в один JSONB-столбец. Данные, нужные для связей, ограничений и регулярных фильтров, часто лучше хранить в типизированных столбцах.",
    "exampleSql": "SELECT full_name, profile ->> 'source' AS acquisition_source, profile -> 'interests' AS interests FROM customers WHERE profile ? 'source' ORDER BY id LIMIT 8;",
    "starterSql": "SELECT full_name, profile ->> 'source' AS acquisition_source, profile -> 'interests' AS interests FROM customers WHERE profile ? 'source' ORDER BY id LIMIT 8;",
    "task": "Извлеки источник привлечения как текст и интересы как JSON.",
    "checks": {
      "columns": [
        "full_name",
        "acquisition_source",
        "interests"
      ],
      "minRows": 5
    },
    "visual": [
      "Профиль хранит JSONB",
      "->> извлекает текст",
      "Фильтр ? проверяет наличие ключа"
    ],
    "quiz": {
      "q": "Чем `->>` отличается от `->`?",
      "options": [
        "->> возвращает текст, а -> сохраняет JSON-тип",
        "->> удаляет ключ из исходного значения",
        "-> возвращает только логическое значение"
      ],
      "correct": 0,
      "why": "Оператор -> возвращает JSON/JSONB, а ->> — текстовое представление выбранного значения."
    }
  },
  {
    "id": 24,
    "unit": "6 · Возможности PostgreSQL",
    "title": "Массивы, ANY и ALL",
    "goal": "Читать PostgreSQL-массивы и знать, когда лучше нормализовать данные.",
    "explain": "PostgreSQL поддерживает массивы типов, операторы `ANY`, `ALL`, проверку включения и `unnest` для превращения элементов массива в строки. Массив полезен для ограниченного набора связанных значений. Если у каждого элемента свои атрибуты, связи или жизненный цикл, отдельная дочерняя таблица обычно удобнее.",
    "gotcha": "Массив не становится автоматически хорошей заменой таблице связи многие-ко-многим. Подумай о целостности, уникальности каждого элемента и способе индексирования запросов.",
    "exampleSql": "SELECT id, name, tags FROM products WHERE tags @> ARRAY['office']::text[] ORDER BY name;",
    "starterSql": "SELECT id, name, tags FROM products WHERE tags @> ARRAY['office']::text[] ORDER BY name;",
    "task": "Найди товары, у которых массив тегов содержит `office`.",
    "checks": {
      "columns": [
        "id",
        "name",
        "tags"
      ],
      "minRows": 2
    },
    "visual": [
      "Массив теги",
      "@> проверяет включение",
      "Остаются товары с нужным тегом"
    ],
    "quiz": {
      "q": "Когда отдельная таблица лучше массива?",
      "options": [
        "Когда элементы имеют собственные атрибуты и связи или должны иметь ограничения",
        "Всегда, даже для простого фиксированного набора",
        "Никогда: массив всегда производительнее"
      ],
      "correct": 0,
      "why": "Отдельная таблица позволяет задавать ключи, внешние ключи и ограничения на каждом элементе."
    }
  },
  {
    "id": 25,
    "unit": "6 · Возможности PostgreSQL",
    "title": "DISTINCT ON: PostgreSQL-способ выбрать последнюю строку",
    "goal": "Получать по одной самой свежей записи на каждую группу.",
    "explain": "`DISTINCT ON (expression)` — специфичная для PostgreSQL возможность оставить первую строку каждой группы. Её порядок определяется `ORDER BY`; выражения в DISTINCT ON должны соответствовать левым выражениям сортировки. Это удобно для последнего статуса или последнего заказа клиента.",
    "gotcha": "Без правильного ORDER BY «первая» строка группы не определена. Если есть одинаковые даты, добавляй уникальный тай-брейк.",
    "exampleSql": "SELECT DISTINCT ON (customer_id) customer_id, id AS latest_order_id, order_ts, status FROM orders ORDER BY customer_id, order_ts DESC, id DESC;",
    "starterSql": "SELECT DISTINCT ON (customer_id) customer_id, id AS latest_order_id, order_ts, status FROM orders ORDER BY customer_id, order_ts DESC, id DESC;",
    "task": "Верни по одному самому свежему заказу каждого клиента.",
    "checks": {
      "columns": [
        "customer_id",
        "latest_order_id",
        "order_ts",
        "status"
      ],
      "minRows": 10
    },
    "visual": [
      "Разделить по customer_id",
      "Сортировать по дате и ИДЕНТИФИКАТОР ПО УБЫТКУ",
      "DISTINCT ON оставляет первую строку группы"
    ],
    "quiz": {
      "q": "Что определяет выбранную строку в DISTINCT ON?",
      "options": [
        "Случайный порядок хранения данных",
        "Порядок ORDER BY, где первой идёт нужная строка группы",
        "Минимальный первичный ключ независимо от ORDER BY"
      ],
      "correct": 1,
      "why": "DISTINCT ON оставляет первую строку группы в порядке сортировки; ORDER BY нужен для детерминированного результата."
    }
  },
  {
    "id": 26,
    "unit": "6 · Возможности PostgreSQL",
    "title": "Индексы: B-дерево, составные, частичные и GIN",
    "goal": "Понимать компромисс ускорения чтения и стоимости записи.",
    "explain": "Индекс — отдельная структура, помогающая найти строки или получить порядок без полного чтения таблицы. B-дерево подходит многим сравнениям и сортировкам; составной индекс зависит от порядка полей; частичный индекс хранит только строки, соответствующие предикату; индекс по выражению может обслуживать конкретную функцию; GIN подходит для некоторых поисков по JSONB, массивам и полнотекстовому поиску.",
    "gotcha": "Индекс занимает место и замедляет вставки/обновления, потому что его тоже нужно поддерживать. Наличие индекса не означает, что планировщик обязан его использовать — на маленькой таблице последовательное чтение может быть дешевле.",
    "exampleSql": "CREATE INDEX IF NOT EXISTS idx_orders_status_demo ON orders (status); SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'orders' AND indexname = 'idx_orders_status_demo';",
    "starterSql": "CREATE INDEX IF NOT EXISTS idx_orders_status_demo ON orders (status); SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'orders' AND indexname = 'idx_orders_status_demo';",
    "task": "Создай учебный индекс по статусу и посмотри его определение в системном каталоге.",
    "checks": {
      "columns": [
        "indexname",
        "indexdef"
      ],
      "exactRows": 1
    },
    "visual": [
      "Фильтр по статус",
      "Индекс помогает искать кандидатов",
      "Планировщик сравнивает стоимость"
    ],
    "quiz": {
      "q": "Почему нельзя добавлять индексы на каждый столбец без анализа?",
      "options": [
        "Индексы увеличивают стоимость записи и расходуют место",
        "В PostgreSQL разрешён только один индекс",
        "Индексы запрещены для текстовых полей"
      ],
      "correct": 0,
      "why": "Индекс ускоряет некоторые чтения, но должен обновляться при записи и потребляет дисковое пространство."
    }
  },
  {
    "id": 27,
    "unit": "6 · Возможности PostgreSQL",
    "title": "EXPLAIN и EXPLAIN ANALYZE",
    "goal": "Читать план выполнения и понимать отличие оценки от фактического запуска.",
    "explain": "`EXPLAIN` показывает выбранный план и оценки стоимости/числа строк. `EXPLAIN ANALYZE` реально выполняет запрос и добавляет фактическое время и количество строк. Сравни оценку планировщика с реальным результатом, смотри узкие места и проверяй индексные условия, не делая вывод по одной цифре.",
    "gotcha": "EXPLAIN ANALYZE действительно запускает SQL. Для UPDATE/DELETE/INSERT это означает изменение данных; если нужна безопасная проверка, используй транзакцию и ROLLBACK там, где это уместно.",
    "exampleSql": "EXPLAIN (ANALYZE, FORMAT TEXT) SELECT id, status FROM orders WHERE status = 'paid' ORDER BY order_ts DESC;",
    "starterSql": "EXPLAIN (ANALYZE, FORMAT TEXT) SELECT id, status FROM orders WHERE status = 'paid' ORDER BY order_ts DESC;",
    "task": "Посмотри реальный план выборки заказов и найди узел чтения таблицы и сортировки.",
    "checks": {
      "columns": [
        "QUERY PLAN"
      ],
      "minRows": 2,
      "contains": {
        "column": "QUERY PLAN",
        "value": ""
      }
    },
    "visual": [
      "SQL и статистика",
      "Планировщик выбирает узлы",
      "EXPLAIN ANALYZE добавляет фактические данные"
    ],
    "quiz": {
      "q": "Чем опасен EXPLAIN ANALYZE для изменяющего запроса?",
      "options": [
        "Он никогда не выполняет запрос",
        "Он выполняет запрос и может изменить данные",
        "Он только проверяет синтаксис"
      ],
      "correct": 1,
      "why": "ANALYZE запускает выражение; применяй его к безопасному запросу или используй осознанную транзакцию."
    }
  },
  {
    "id": 28,
    "unit": "6 · Возможности PostgreSQL",
    "title": "Полнотекстовый поиск",
    "goal": "Искать по смысловым токенам, а не только по подстроке.",
    "explain": "Полнотекстовый поиск PostgreSQL преобразует текст в нормализованные лексемы. `to_tsvector` строит документ для поиска, `plainto_tsquery` превращает текст запроса в условие, `@@` проверяет совпадение. Для ранжирования используется `ts_rank`. Для другого языка выбирай соответствующую конфигурацию поиска и тестируй морфологию на реальном корпусе.",
    "gotcha": "LIKE/ILIKE ищет подстроку, полнотекстовый поиск оперирует токенами и правилами конфигурации. Эти механизмы решают разные задачи.",
    "exampleSql": "SELECT id, full_name FROM customers WHERE to_tsvector('simple', full_name) @@ plainto_tsquery('simple', 'Анна') ORDER BY id;",
    "starterSql": "SELECT id, full_name FROM customers WHERE to_tsvector('simple', full_name) @@ plainto_tsquery('simple', 'Анна') ORDER BY id;",
    "task": "Найди записи, в которых полнотекстовый индексный вектор содержит токен «Анна».",
    "checks": {
      "columns": [
        "id",
        "full_name"
      ],
      "minRows": 1,
      "contains": {
        "column": "full_name",
        "value": "Анна"
      }
    },
    "visual": [
      "Текст клиента",
      "to_tsvector нормализует токены",
      "@@ проверяет цвери"
    ],
    "quiz": {
      "q": "Чем полнотекстовый поиск отличается от ILIKE?",
      "options": [
        "Он использует токены и конфигурацию языка, а не только подстроку",
        "Он работает лишь с числами",
        "ILIKE всегда ищет по смыслу"
      ],
      "correct": 0,
      "why": "Полнотекстовый поиск строит лексемы и запрос, а ILIKE сопоставляет символьный шаблон."
    }
  },
  {
    "id": 29,
    "unit": "7 · Рабочий процесс и безопасность",
    "title": "Роли, GRANT, схемы и эксплуатация",
    "goal": "Понимать разделение прав и базовые рабочие команды psql.",
    "explain": "В реальном сервере разделяй пользователя приложения, аналитика и администратора. `GRANT` выдаёт только нужные права; `REVOKE` отзывает; доступ к схеме и таблицам — отдельные уровни. Безопасность на уровне строк (RLS) может ограничивать видимые строки. В реальной работе также нужны параметры подключения без публикации паролей, `psql`, миграции, резервное копирование и мониторинг.",
    "gotcha": "PGlite в браузере — учебная песочница на одном клиентском экземпляре. Она не заменяет настройку пользователей, реальные сетевые подключения, репликацию или процедуру бэкапа. Не сохраняй пароли в коде и не выдавай приложению роль суперпользователь.",
    "exampleSql": "-- На реальном сервере администратор настраивает отдельную роль:\n-- CREATE ROLE analyst_readonly LOGIN;\n-- GRANT CONNECT ON DATABASE analytics TO analyst_readonly;\n-- GRANT USAGE ON SCHEMA reporting TO analyst_readonly;\n-- GRANT SELECT ON ALL TABLES IN SCHEMA reporting TO analyst_readonly;\nSELECT current_user AS current_role, current_database() AS database_name, current_schema() AS schema_name;",
    "starterSql": "SELECT current_user AS current_role, current_database() AS database_name, current_schema() AS schema_name;",
    "task": "Посмотри текущую учебную роль и базу, а затем объясни, почему команды GRANT из примера выполняются администратором на реальном сервере.",
    "checks": {
      "columns": [
        "current_role",
        "database_name",
        "schema_name"
      ],
      "exactRows": 1
    },
    "visual": [
      "Роль и подключение",
      "GRANT выдаёт минимальные права",
      "Приложение работает без прав администратора"
    ],
    "quiz": {
      "q": "Какой принцип следует применять к роли приложения?",
      "options": [
        "Выдать суперпользователь, чтобы запросы никогда не падали",
        "Выдать только необходимые права на конкретные объекты",
        "Использовать пароль администратора в публичном JS"
      ],
      "correct": 1,
      "why": "Принцип минимальных привилегий уменьшает последствия ошибки или компрометации приложения."
    }
  },
  {
    "id": 30,
    "unit": "8 · Итоговый кейс",
    "title": "Итоговый проект: выручка интернет-магазина",
    "goal": "Собрать аналитический запрос, проверить гранулярность и подготовить объяснимый результат.",
    "explain": "Используй учебную модель магазина: `orders` хранит заказ, `order_items` — позиции заказа, `products` — товары, `customers` — клиентов. Итоговый отчёт должен показывать месяц и категорию, количество заказов и выручку только по принятым статусам. Проверь гранулярность соединений и убедись, что сумма считается из товарных позиций, а не из повторяющихся строк заказа.",
    "gotcha": "Условия «выручка» и «оплаченный заказ» должны быть определены. Возвраты, отмены, скидки, налоги и дата признания дохода могут менять бизнес-правило; в рабочем проекте зафиксируй его с заказчиком.",
    "exampleSql": "WITH accepted_orders AS (SELECT id, order_ts FROM orders WHERE status IN ('paid','fulfilled')), revenue_by_order AS (SELECT oi.order_id, p.category, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY oi.order_id, p.category) SELECT date_trunc('month', ao.order_ts)::date AS month, r.category, COUNT(DISTINCT ao.id) AS orders_count, SUM(r.revenue) AS revenue FROM accepted_orders ao JOIN revenue_by_order r ON r.order_id = ao.id GROUP BY 1, r.category ORDER BY month, revenue DESC;",
    "starterSql": "WITH accepted_orders AS (SELECT id, order_ts FROM orders WHERE status IN ('paid','fulfilled')), revenue_by_order AS (SELECT oi.order_id, p.category, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY oi.order_id, p.category) SELECT date_trunc('month', ao.order_ts)::date AS month, r.category, COUNT(DISTINCT ao.id) AS orders_count, SUM(r.revenue) AS revenue FROM accepted_orders ao JOIN revenue_by_order r ON r.order_id = ao.id GROUP BY 1, r.category ORDER BY month, revenue DESC;",
    "task": "Запусти отчёт. Затем попробуй добавить город клиента или канал заказа и заранее подумай, изменится ли детализация результата.",
    "checks": {
      "columns": [
        "month",
        "category",
        "orders_count",
        "revenue"
      ],
      "minRows": 5
    },
    "visual": [
      "Проверить статус и дату",
      "Агрегировать позиции на правильном уровне",
      "Свести по месяцу и категории"
    ],
    "quiz": {
      "q": "Что нужно проверить перед сдачей аналитического SQL-проекта?",
      "options": [
        "Только то, что запрос выполняется без ошибки",
        "Определение метрики, уровень детализации таблиц, кардинальность JOIN, NULL и крайние случаи",
        "Достаточно сделать запрос длиннее"
      ],
      "correct": 1,
      "why": "Рабочий SQL должен не только выполняться, но и корректно отражать бизнес-правило и проходить проверки данных."
    }
  }
];
