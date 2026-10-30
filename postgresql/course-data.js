window.PostgreSQLLessons = [
  {
    "id": 1,
    "unit": "0 · Старт",
    "title": "VERSION(): проверяем, что запущен PostgreSQL",
    "goal": "Увидеть версию PostgreSQL, в которой выполняется учебный запрос.",
    "explain": "Функция VERSION() возвращает сведения о сервере PostgreSQL и его версии. Функцию можно вызвать прямо в списке SELECT, даже если таблица не нужна. В этом уроке тренируем только вызов VERSION().",
    "gotcha": "Не путай SQL и PostgreSQL: SQL — язык запросов, а PostgreSQL — СУБД. Функция VERSION() относится к PostgreSQL и не обязана существовать в других СУБД.",
    "exampleSql": "SELECT VERSION() AS postgres_version;",
    "starterSql": "SELECT 1 AS postgres_version;",
    "task": "Замени число 1 в заготовке на вызов функции, чтобы получить сведения о версии PostgreSQL.",
    "checks": {
      "columns": [
        "postgres_version"
      ],
      "columnOrder": true,
      "exactRows": 1,
      "sqlIncludes": [
        "version()"
      ]
    },
    "visual": [
      "Запрос вызывает VERSION()",
      "PostgreSQL возвращает строку",
      "Результат имеет имя postgres_version"
    ],
    "quiz": {
      "q": "Что возвращает VERSION() в PostgreSQL?",
      "options": [
        "Список таблиц базы",
        "Сведения о версии сервера PostgreSQL",
        "Количество строк во всех таблицах"
      ],
      "correct": 1,
      "why": "VERSION() возвращает текстовую информацию о запущенном сервере и его версии."
    },
    "hint": "Какую встроенную функцию PostgreSQL можно вызвать без FROM, чтобы узнать версию сервера?",
    "expected": "Столбец: postgres_version. Одна строка с текстом, в котором указаны PostgreSQL и номер версии. Точное значение зависит от версии движка учебной среды.",
    "solutionSql": "SELECT VERSION() AS postgres_version;",
    "solutionExplain": "VERSION() вызывается без аргументов и возвращает строку с информацией о сервере. AS postgres_version задаёт понятное имя столбца результата."
  },
  {
    "id": 2,
    "unit": "0 · Старт",
    "title": "INFORMATION_SCHEMA.TABLES: список таблиц учебной схемы",
    "goal": "Посмотреть, какие таблицы доступны в схеме public.",
    "explain": "INFORMATION_SCHEMA.TABLES — системное представление PostgreSQL, в котором описаны таблицы и представления базы. Поле table_schema показывает схему, а table_name — имя объекта. Чтобы увидеть таблицы учебной схемы, выбери строки со значением public.",
    "gotcha": "Не ищи таблицу только по имени, если в базе есть несколько схем. Одноимённые таблицы из разных схем могут быть разными объектами.",
    "exampleSql": "SELECT table_schema,\n       table_name\nFROM information_schema.tables\nWHERE table_schema = 'public'\nORDER BY table_name;",
    "starterSql": "SELECT table_schema,\n       table_name\nFROM information_schema.tables\nWHERE table_schema = 'information_schema'\nORDER BY table_name;",
    "task": "Получи список объектов схемы public и найди в нём таблицу orders.",
    "checks": {
      "columns": [
        "table_schema",
        "table_name"
      ],
      "columnOrder": true,
      "exactRows": 7,
      "contains": {
        "column": "table_name",
        "value": "orders"
      },
      "sqlIncludes": [
        "where table_schema = 'public'"
      ]
    },
    "visual": [
      "INFORMATION_SCHEMA.TABLES содержит описание объектов",
      "WHERE оставляет схему public",
      "В результате видны 7 учебных таблиц"
    ],
    "quiz": {
      "q": "Какое поле показывает схему, в которой находится таблица?",
      "options": [
        "table_name",
        "table_schema",
        "table_type"
      ],
      "correct": 1,
      "why": "table_schema хранит имя схемы, а table_name — имя объекта внутри неё."
    },
    "hint": "В каком значении table_schema находятся таблицы учебной схемы, а не служебные представления PostgreSQL?",
    "expected": "Столбцы в таком порядке: table_schema, table_name. В учебной схеме public ожидается 7 таблиц: customers, order_items, orders, page_events, payments, products и support_tickets.",
    "solutionSql": "SELECT table_schema,\n       table_name\nFROM information_schema.tables\nWHERE table_schema = 'public'\nORDER BY table_name;",
    "solutionExplain": "Представление information_schema.tables показывает объекты базы. Условие оставляет только схему public, а ORDER BY располагает имена таблиц по алфавиту."
  },
  {
    "id": 3,
    "unit": "1 · Запросы и фильтрация",
    "title": "AS: задаём псевдоним столбцу результата",
    "goal": "Переименовать столбец только в результате запроса.",
    "explain": "Псевдоним задаёт столбцу результата новое, более понятное имя. В PostgreSQL для этого используют AS: выражение AS alias. Псевдоним не меняет название поля в исходной таблице.",
    "gotcha": "Не заключай псевдоним в одинарные кавычки: 'customer_name' — строковое значение, а не имя столбца. Для обычных псевдонимов кавычки вообще не нужны.",
    "exampleSql": "SELECT full_name AS customer_name,\n       city\nFROM customers\nORDER BY id;",
    "starterSql": "SELECT full_name,\n       city\nFROM customers\nORDER BY id;",
    "task": "Покажи имя клиента под названием customer_name, оставив рядом его город.",
    "checks": {
      "columns": [
        "customer_name",
        "city"
      ],
      "columnOrder": true,
      "exactRows": 13,
      "firstRow": {
        "customer_name": "Анна Кузнецова",
        "city": "Москва"
      },
      "sqlIncludes": [
        "as customer_name"
      ]
    },
    "visual": [
      "full_name хранится в customers",
      "AS задаёт новое имя в выдаче",
      "В результате отображается customer_name"
    ],
    "quiz": {
      "q": "Что делает AS customer_name?",
      "options": [
        "Физически переименовывает поле customers",
        "Задаёт имя столбца только в результате запроса",
        "Создаёт новую таблицу"
      ],
      "correct": 1,
      "why": "Псевдоним существует только в результате запроса и не меняет структуру исходной таблицы."
    },
    "hint": "Какое ключевое слово нужно поставить после full_name, чтобы назвать этот столбец customer_name только в результате?",
    "expected": "Столбцы в таком порядке: customer_name, city. Например: Анна Кузнецова | Москва; Борис Смирнов | Казань; Вера Орлова | Москва.",
    "solutionSql": "SELECT full_name AS customer_name,\n       city\nFROM customers\nORDER BY id;",
    "solutionExplain": "SELECT выбирает имя и город из customers. AS customer_name меняет только подпись первого столбца в выдаче; исходное поле по-прежнему называется full_name."
  },
  {
    "id": 4,
    "unit": "1 · Запросы и фильтрация",
    "title": "WHERE: отбираем активных клиентов",
    "goal": "Оставить в результате только строки, которые подходят под условие.",
    "explain": "WHERE проверяет каждую строку до того, как она попадёт в результат. После WHERE указывают условие, которое должно быть истинным. Для логического поля active значение TRUE означает, что клиент активен.",
    "gotcha": "Не записывай логическое условие как active = 'true': в одинарных кавычках находится текст. Для boolean используй TRUE или FALSE без кавычек.",
    "exampleSql": "SELECT id,\n       full_name,\n       city\nFROM customers\nWHERE active IS TRUE;",
    "starterSql": "SELECT id,\n       full_name,\n       city\nFROM customers\nORDER BY id;",
    "task": "Выведи только активных клиентов, сохранив идентификатор, имя и город.",
    "checks": {
      "columns": [
        "id",
        "full_name",
        "city"
      ],
      "columnOrder": true,
      "exactRows": 12,
      "firstRow": {
        "id": 1,
        "full_name": "Анна Кузнецова"
      },
      "sqlIncludes": [
        "where active is true"
      ]
    },
    "visual": [
      "Таблица содержит всех клиентов",
      "WHERE проверяет active",
      "Остаются только активные строки"
    ],
    "quiz": {
      "q": "На каком этапе запроса WHERE отбирает строки?",
      "options": [
        "До группировки и вычисления агрегатов",
        "После ORDER BY",
        "Только после LIMIT"
      ],
      "correct": 0,
      "why": "WHERE сначала отбирает исходные строки, а затем оставшиеся данные обрабатываются следующими частями запроса."
    },
    "hint": "Какое поле показывает активность клиента и какое значение должно быть у него, чтобы строка осталась в результате?",
    "expected": "Столбцы: id, full_name, city. Ожидается 12 активных клиентов. Первые примеры: 1 | Анна Кузнецова | Москва; 2 | Борис Смирнов | Казань; 4 | Глеб Иванов | Санкт-Петербург.",
    "solutionSql": "SELECT id,\n       full_name,\n       city\nFROM customers\nWHERE active IS TRUE;",
    "solutionExplain": "WHERE отбрасывает клиентов, у которых active не равно TRUE. В учебных данных неактивен клиент с id = 3, поэтому в результате остаются 12 строк."
  },
  {
    "id": 5,
    "unit": "1 · Запросы и фильтрация",
    "title": "IS NULL: находим заказы без купона",
    "goal": "Найти строки, в которых значение отсутствует.",
    "explain": "NULL означает, что значение неизвестно или не задано. Для поиска таких строк в PostgreSQL используют IS NULL, а для строк с заполненным значением — IS NOT NULL. NULL нельзя проверять обычным знаком равенства.",
    "gotcha": "Условие coupon = NULL не найдёт пропуски: сравнение с NULL даёт неизвестный результат. Используй именно IS NULL; пустая строка '' — отдельное значение.",
    "exampleSql": "SELECT id,\n       coupon\nFROM orders\nWHERE coupon IS NULL\nORDER BY id;",
    "starterSql": "SELECT id,\n       coupon\nFROM orders;",
    "task": "Найди все заказы, в которых купон не указан. Покажи номер заказа и значение coupon.",
    "checks": {
      "columns": [
        "id",
        "coupon"
      ],
      "columnOrder": true,
      "exactRows": 9,
      "firstRow": {
        "id": 102
      },
      "sqlIncludes": [
        "coupon is null"
      ]
    },
    "visual": [
      "В поле coupon есть NULL",
      "IS NULL проверяет отсутствие значения",
      "В выдаче остаются 9 заказов без купона"
    ],
    "quiz": {
      "q": "Как правильно выбрать строки, где coupon отсутствует?",
      "options": [
        "coupon = NULL",
        "coupon IS NULL",
        "coupon = ''"
      ],
      "correct": 1,
      "why": "IS NULL проверяет отсутствие значения. Пустая строка и NULL не означают одно и то же."
    },
    "hint": "Какое специальное условие проверяет отсутствие значения, а не сравнивает coupon с пустым текстом?",
    "expected": "Столбцы: id, coupon. Ожидается 9 строк; во всех coupon отображается как NULL. Первые номера заказов: 102, 104 и 106.",
    "solutionSql": "SELECT id,\n       coupon\nFROM orders\nWHERE coupon IS NULL\nORDER BY id;",
    "solutionExplain": "IS NULL оставляет только заказы без значения coupon. ORDER BY id упорядочивает найденные заказы по номеру."
  },
  {
    "id": 6,
    "unit": "1 · Запросы и фильтрация",
    "title": "ILIKE: поиск текста без учёта регистра",
    "goal": "Найти адреса электронной почты по текстовому шаблону.",
    "explain": "ILIKE сравнивает текст без учёта регистра и является расширением PostgreSQL. Знак % в шаблоне означает любую последовательность символов, в том числе пустую. Например, шаблон с окончанием почтового домена помогает найти все адреса этого домена.",
    "gotcha": "Не ставь шаблон в двойные кавычки: двойные кавычки обозначают имена объектов. Строковый шаблон всегда заключай в одинарные кавычки.",
    "exampleSql": "SELECT id,\n       full_name,\n       email\nFROM customers\nWHERE email ILIKE '%@example.ru'\nORDER BY id;",
    "starterSql": "SELECT id,\n       full_name,\n       email\nFROM customers;",
    "task": "Найди клиентов с адресами почты, которые заканчиваются на @example.ru, независимо от регистра букв.",
    "checks": {
      "columns": [
        "id",
        "full_name",
        "email"
      ],
      "columnOrder": true,
      "exactRows": 11,
      "firstRow": {
        "id": 1,
        "email": "anna@example.ru"
      },
      "sqlIncludes": [
        "ilike '%@example.ru'"
      ]
    },
    "visual": [
      "email содержит адрес",
      "ILIKE сравнивает без учёта регистра",
      "% заменяет произвольную часть адреса"
    ],
    "quiz": {
      "q": "Что означает знак % в шаблоне ILIKE '%@example.ru'?",
      "options": [
        "Ровно один символ",
        "Любую последовательность символов, включая пустую",
        "Только цифры"
      ],
      "correct": 1,
      "why": "Процент заменяет любое количество символов. Поэтому шаблон находит адреса с разной частью до домена."
    },
    "hint": "Какой оператор PostgreSQL подходит для поиска по шаблону, если заглавные и строчные буквы нужно считать одинаковыми?",
    "expected": "Столбцы: id, full_name, email. Ожидается 11 клиентов с доменом example.ru. Примеры: 1 | anna@example.ru; 2 | boris@example.ru; 3 | vera@example.ru.",
    "solutionSql": "SELECT id,\n       full_name,\n       email\nFROM customers\nWHERE email ILIKE '%@example.ru'\nORDER BY id;",
    "solutionExplain": "ILIKE проверяет, соответствует ли email шаблону без учёта регистра. Символ % перед @example.ru допускает любую часть адреса до домена."
  },
  {
    "id": 7,
    "unit": "1 · Запросы и фильтрация",
    "title": "ORDER BY: сортируем строки результата",
    "goal": "Получить заказы в нужной последовательности.",
    "explain": "ORDER BY задаёт порядок строк в результате запроса. По умолчанию используется возрастание ASC, а DESC задаёт убывание. Для сортировки по дате сначала укажи поле order_ts, а затем DESC, чтобы новые заказы оказались сверху.",
    "gotcha": "Без ORDER BY база не обязана возвращать строки в порядке вставки или по первичному ключу. Не полагайся на случайный порядок результата.",
    "exampleSql": "SELECT id,\n       customer_id,\n       order_ts,\n       status\nFROM orders\nORDER BY order_ts DESC, id DESC;",
    "starterSql": "SELECT id,\n       customer_id,\n       order_ts,\n       status\nFROM orders;",
    "task": "Выведи заказы от самого нового к самому старому. При одинаковой дате используй id как дополнительный критерий сортировки.",
    "checks": {
      "columns": [
        "id",
        "customer_id",
        "order_ts",
        "status"
      ],
      "columnOrder": true,
      "exactRows": 20,
      "firstRow": {
        "id": 120
      },
      "sqlIncludes": [
        "order by order_ts desc"
      ]
    },
    "visual": [
      "ORDER BY получает поле сортировки",
      "DESC ставит поздние даты выше",
      "id разрешает равенство дат"
    ],
    "quiz": {
      "q": "Что делает DESC в ORDER BY?",
      "options": [
        "Сортирует значения по убыванию",
        "Удаляет повторяющиеся строки",
        "Ограничивает количество строк"
      ],
      "correct": 0,
      "why": "DESC означает обратный порядок: от большего к меньшему или от более поздней даты к ранней."
    },
    "hint": "Какой порядок нужен для самых свежих дат в начале списка: ASC или DESC? Что поможет упорядочить строки с одинаковой датой?",
    "expected": "Столбцы: id, customer_id, order_ts, status. Всего 20 строк. Первая строка — заказ 120, затем заказ 119 и заказ 118.",
    "solutionSql": "SELECT id,\n       customer_id,\n       order_ts,\n       status\nFROM orders\nORDER BY order_ts DESC, id DESC;",
    "solutionExplain": "ORDER BY order_ts DESC ставит самые поздние даты первыми. Дополнительная сортировка по id DESC делает порядок однозначным, когда у нескольких заказов совпадает время."
  },
  {
    "id": 8,
    "unit": "2 · Типы и время",
    "title": "Приведение типа через ::INTEGER",
    "goal": "Преобразовать текстовое значение в целое число.",
    "explain": "В PostgreSQL тип значения можно указать после двух двоеточий. Запись value::INTEGER пытается преобразовать value в целое число. Если текст нельзя представить целым числом, PostgreSQL вернёт ошибку.",
    "gotcha": "Не заключай тип INTEGER в одинарные кавычки и не используй десятичную запятую в числовом литерале. Строку для преобразования записывай в одинарных кавычках, а тип — без кавычек.",
    "exampleSql": "SELECT '42'::INTEGER AS parsed_id,\n       PG_TYPEOF('42'::INTEGER) AS result_type;",
    "starterSql": "SELECT '42'::TEXT AS parsed_id,\n       PG_TYPEOF('42'::TEXT) AS result_type;",
    "task": "Преобразуй текст '42' в целое число и проверь тип полученного значения.",
    "checks": {
      "columns": [
        "parsed_id",
        "result_type"
      ],
      "columnOrder": true,
      "exactRows": 1,
      "firstRow": {
        "parsed_id": 42,
        "result_type": "integer"
      },
      "sqlIncludes": [
        "::integer"
      ]
    },
    "visual": [
      "Значение '42' изначально текстовое",
      "::INTEGER задаёт целевой тип",
      "PostgreSQL возвращает целое число 42"
    ],
    "quiz": {
      "q": "Что означает запись '42'::INTEGER?",
      "options": [
        "Преобразовать число в текст",
        "Преобразовать текст '42' в целое число",
        "Округлить значение до двух знаков"
      ],
      "correct": 1,
      "why": "Два двоеточия задают явное приведение выражения к типу INTEGER."
    },
    "hint": "Какой тип нужно указать после ::, чтобы строка '42' стала целым числом, а не осталась текстом?",
    "expected": "Столбцы: parsed_id, result_type. Одна строка: 42 | integer. parsed_id должен иметь числовой тип INTEGER.",
    "solutionSql": "SELECT '42'::INTEGER AS parsed_id,\n       PG_TYPEOF('42'::INTEGER) AS result_type;",
    "solutionExplain": "Оператор ::INTEGER преобразует строку '42' в целое число. PG_TYPEOF показывает фактический тип выражения и возвращает integer."
  },
  {
    "id": 9,
    "unit": "2 · Типы и время",
    "title": "EXTRACT(): извлекаем месяц из даты заказа",
    "goal": "Получить отдельную часть даты или времени для анализа.",
    "explain": "EXTRACT() извлекает выбранную часть значения даты или времени. Синтаксис: EXTRACT(MONTH FROM timestamp_column). В PostgreSQL также доступны NOW() для текущего момента, CURRENT_DATE для текущей даты и AGE() для разницы между датами. Поле order_ts в учебной таблице orders имеет тип timestamptz: оно обозначает конкретный момент времени, который PostgreSQL показывает с учётом часового пояса сессии.",
    "gotcha": "Не пиши EXTRACT('MONTH' FROM order_ts): MONTH — ключевое слово, а не строковый литерал. Строковые значения вроде '2025-09-12' заключаются в одинарные кавычки, но часть даты MONTH — без кавычек.",
    "exampleSql": "SELECT id,\n       order_ts,\n       EXTRACT(MONTH FROM order_ts) AS order_month\nFROM orders\nORDER BY id;",
    "starterSql": "SELECT id,\n       order_ts,\n       EXTRACT(DAY FROM order_ts) AS order_month\nFROM orders\nORDER BY id;",
    "task": "Добавь к каждому заказу номер месяца, в котором он был создан.",
    "checks": {
      "columns": [
        "id",
        "order_ts",
        "order_month"
      ],
      "columnOrder": true,
      "exactRows": 20,
      "firstRow": {
        "id": 101,
        "order_month": 9
      },
      "sqlIncludes": [
        "extract(month from order_ts)"
      ]
    },
    "visual": [
      "order_ts содержит дату и время",
      "EXTRACT выбирает MONTH",
      "В выдаче появляется order_month"
    ],
    "quiz": {
      "q": "Какую часть даты возвращает EXTRACT(MONTH FROM order_ts)?",
      "options": [
        "Номер месяца",
        "Номер дня недели",
        "Количество лет с момента заказа"
      ],
      "correct": 0,
      "why": "MONTH возвращает номер месяца от 1 до 12."
    },
    "hint": "Какую часть даты нужно указать внутри EXTRACT(), чтобы получить месяц, а не день?",
    "expected": "Столбцы: id, order_ts, order_month. Ожидается 20 строк. Для заказа 101 дата 2025-09-12, поэтому order_month равен 9; для заказа 102 он равен 10.",
    "solutionSql": "SELECT id,\n       order_ts,\n       EXTRACT(MONTH FROM order_ts) AS order_month\nFROM orders\nORDER BY id;",
    "solutionExplain": "EXTRACT(MONTH FROM order_ts) возвращает номер месяца из даты и времени заказа. Исходное поле order_ts остаётся без изменений, а номер месяца появляется отдельным столбцом."
  },
  {
    "id": 10,
    "unit": "3 · Агрегации",
    "title": "COUNT(*): считаем количество строк",
    "goal": "Получить общее число заказов в таблице.",
    "explain": "COUNT(*) — агрегатная функция PostgreSQL, которая считает строки, попавшие в выборку. В отличие от COUNT(column), COUNT(*) учитывает каждую строку, даже если отдельные поля содержат NULL. Функция возвращает одну строку с итоговым числом.",
    "gotcha": "COUNT(column) не учитывает строки, где значение этого столбца равно NULL. Для подсчёта всех строк используй COUNT(*).",
    "exampleSql": "SELECT COUNT(*) AS orders_count\nFROM orders;",
    "starterSql": "SELECT COUNT(coupon) AS orders_count\nFROM orders;",
    "task": "Посчитай общее количество заказов в таблице orders.",
    "checks": {
      "columns": [
        "orders_count"
      ],
      "columnOrder": true,
      "exactRows": 1,
      "firstRow": {
        "orders_count": 20
      },
      "sqlIncludes": [
        "count(*)"
      ]
    },
    "visual": [
      "Таблица orders содержит строки",
      "COUNT(*) считает каждую строку",
      "Возвращается одно число"
    ],
    "quiz": {
      "q": "Что считает COUNT(*)?",
      "options": [
        "Только уникальные значения",
        "Все строки, попавшие в выборку",
        "Только строки без NULL во всех полях"
      ],
      "correct": 1,
      "why": "Звёздочка означает, что считаются сами строки, а не значения выбранного столбца."
    },
    "hint": "Как записать COUNT, чтобы посчитать все строки таблицы, а не значения отдельного столбца?",
    "expected": "Один столбец: orders_count. Одна строка со значением 20 — столько заказов содержится в учебной таблице.",
    "solutionSql": "SELECT COUNT(*) AS orders_count\nFROM orders;",
    "solutionExplain": "COUNT(*) считает все строки таблицы orders и возвращает общее число заказов. Псевдоним orders_count делает назначение результата понятным."
  },
  {
    "id": 11,
    "unit": "3 · Агрегации",
    "title": "GROUP BY: считаем заказы по статусам",
    "goal": "Собрать строки в группы и получить показатель для каждой группы.",
    "explain": "GROUP BY объединяет строки с одинаковыми значениями выбранного поля. После группировки агрегатная функция, например COUNT(*), вычисляется отдельно для каждой группы. Все выбранные поля без агрегатной функции должны входить в GROUP BY или быть функционально зависимыми от ключа группировки. WHERE отбирает отдельные строки до группировки, а HAVING фильтрует уже собранные группы. В этой практике тренируем только GROUP BY; HAVING используй, когда нужно оставить группы по условию на агрегат.",
    "gotcha": "Не добавляй в SELECT поля, которые не сгруппированы и не обёрнуты в агрегатную функцию: PostgreSQL сообщит об ошибке. Сначала реши, на каком уровне должна быть одна строка результата.",
    "exampleSql": "SELECT status,\n       COUNT(*) AS orders_count\nFROM orders\nGROUP BY status\nORDER BY status;",
    "starterSql": "SELECT DISTINCT status\nFROM orders\nORDER BY status;",
    "task": "Посчитай, сколько заказов имеет каждый статус.",
    "checks": {
      "columns": [
        "status",
        "orders_count"
      ],
      "columnOrder": true,
      "exactRows": 5,
      "firstRow": {
        "status": "cancelled",
        "orders_count": 2
      },
      "sqlIncludes": [
        "group by status"
      ]
    },
    "visual": [
      "Заказы имеют одинаковые статусы",
      "GROUP BY объединяет их в группы",
      "COUNT(*) считает строки в каждой группе"
    ],
    "quiz": {
      "q": "Сколько строк результата создаёт GROUP BY status?",
      "options": [
        "По одной строке на каждый уникальный статус",
        "Всегда одну строку",
        "По одной строке на каждый заказ"
      ],
      "correct": 0,
      "why": "GROUP BY формирует одну группу для каждого уникального значения status."
    },
    "hint": "Как объединить заказы с одинаковым status и посчитать количество строк внутри каждой такой группы?",
    "expected": "Столбцы: status, orders_count. Пять строк: cancelled — 2; fulfilled — 5; paid — 9; pending — 2; refunded — 2.",
    "solutionSql": "SELECT status,\n       COUNT(*) AS orders_count\nFROM orders\nGROUP BY status\nORDER BY status;",
    "solutionExplain": "GROUP BY status формирует отдельную группу для каждого статуса. COUNT(*) считает количество заказов внутри каждой группы, а ORDER BY делает список статусов удобным для чтения."
  },
  {
    "id": 12,
    "unit": "4 · Связи и сложные запросы",
    "title": "INNER JOIN: соединяем заказ с клиентом",
    "goal": "Добавить к заказу имя клиента из связанной таблицы.",
    "explain": "JOIN соединяет строки двух таблиц по условию связи. INNER JOIN оставляет только пары, для которых условие ON истинно. В этой модели orders.customer_id ссылается на customers.id, поэтому заказ можно дополнить именем его клиента.",
    "gotcha": "Не соединяй таблицы без условия ON: это может создать декартово произведение и многократно увеличить число строк. Проверяй, что ключи сравниваются с правильными полями.",
    "exampleSql": "SELECT o.id AS order_id,\n       c.full_name,\n       o.status\nFROM orders AS o\nINNER JOIN customers AS c\n        ON c.id = o.customer_id\nORDER BY o.id;",
    "starterSql": "SELECT o.id AS order_id,\n       c.full_name,\n       o.status\nFROM orders AS o\nCROSS JOIN customers AS c\nORDER BY o.id;",
    "task": "Соедини orders и customers по идентификатору клиента и покажи номер заказа, имя клиента и статус.",
    "checks": {
      "columns": [
        "order_id",
        "full_name",
        "status"
      ],
      "columnOrder": true,
      "exactRows": 20,
      "firstRow": {
        "order_id": 101,
        "full_name": "Анна Кузнецова"
      },
      "sqlIncludes": [
        "inner join customers",
        "on c.id = o.customer_id"
      ]
    },
    "visual": [
      "orders содержит customer_id",
      "INNER JOIN сопоставляет его с customers.id",
      "В строку заказа добавляется имя клиента"
    ],
    "quiz": {
      "q": "Для чего в INNER JOIN используется ON?",
      "options": [
        "Для задания условия, по которому строки двух таблиц соединяются",
        "Для сортировки результата",
        "Для переименования таблицы"
      ],
      "correct": 0,
      "why": "ON описывает связь между полями таблиц, например orders.customer_id и customers.id."
    },
    "hint": "Как связать customer_id из orders с id из customers, чтобы в результат попала только пара с совпадающим идентификатором?",
    "expected": "Столбцы: order_id, full_name, status. Ожидается 20 строк — по одной на каждый заказ. Примеры: 101 | Анна Кузнецова | paid; 102 | Анна Кузнецова | fulfilled; 103 | Борис Смирнов | paid.",
    "solutionSql": "SELECT o.id AS order_id,\n       c.full_name,\n       o.status\nFROM orders AS o\nINNER JOIN customers AS c\n        ON c.id = o.customer_id\nORDER BY o.id;",
    "solutionExplain": "INNER JOIN сопоставляет каждую строку заказа со строкой клиента, где customers.id равен orders.customer_id. В результате остаётся одна строка на заказ, а имя клиента добавляется из customers."
  },
  {
    "id": 13,
    "unit": "4 · Связи и сложные запросы",
    "title": "EXISTS: проверяем наличие связанных заказов",
    "goal": "Найти клиентов, у которых есть хотя бы один заказ.",
    "explain": "EXISTS проверяет, возвращает ли вложенный запрос хотя бы одну строку. Для каждой строки внешнего запроса PostgreSQL проверяет условие подзапроса. Если совпадение найдено, клиент попадает в результат; сами строки заказов при этом не размножают строку клиента.",
    "gotcha": "Не используй обычный JOIN, если нужен только факт наличия заказа: клиент с пятью заказами появится в результате пять раз. EXISTS проверяет наличие и сохраняет одну строку клиента.",
    "exampleSql": "SELECT c.id,\n       c.full_name\nFROM customers AS c\nWHERE EXISTS (\n    SELECT 1\n    FROM orders AS o\n    WHERE o.customer_id = c.id\n)\nORDER BY c.id;",
    "starterSql": "SELECT c.id,\n       c.full_name\nFROM customers AS c\nORDER BY c.id;",
    "task": "Выведи клиентов, у которых есть хотя бы один заказ, независимо от статуса заказа.",
    "checks": {
      "columns": [
        "id",
        "full_name"
      ],
      "columnOrder": true,
      "exactRows": 12,
      "firstRow": {
        "id": 1,
        "full_name": "Анна Кузнецова"
      },
      "sqlIncludes": [
        "where exists"
      ]
    },
    "visual": [
      "Берём строку клиента",
      "Вложенный запрос ищет его заказы",
      "EXISTS оставляет клиента при наличии совпадения"
    ],
    "quiz": {
      "q": "Что проверяет EXISTS?",
      "options": [
        "Существование хотя бы одной строки во вложенном запросе",
        "Количество всех строк в таблице",
        "Отсутствие повторяющихся значений"
      ],
      "correct": 0,
      "why": "EXISTS даёт TRUE, если вложенный запрос вернул хотя бы одну строку."
    },
    "hint": "Какой оператор позволяет проверить, существует ли хотя бы одна строка orders с тем же customer_id?",
    "expected": "Столбцы: id, full_name. Ожидается 12 клиентов. Клиент с id 13 — Полина Захарова — в результат не попадёт, так как у неё нет заказов.",
    "solutionSql": "SELECT c.id,\n       c.full_name\nFROM customers AS c\nWHERE EXISTS (\n    SELECT 1\n    FROM orders AS o\n    WHERE o.customer_id = c.id\n)\nORDER BY c.id;",
    "solutionExplain": "Вложенный запрос ищет заказ текущего клиента. EXISTS возвращает TRUE, если такой заказ найден, поэтому клиенты без заказов исключаются, а повторные заказы не создают дубликаты клиента."
  },
  {
    "id": 14,
    "unit": "4 · Связи и сложные запросы",
    "title": "NOT EXISTS: находим клиентов без заказов",
    "goal": "Найти записи, для которых нет связанной строки в другой таблице.",
    "explain": "NOT EXISTS — отрицательная проверка существования. Она оставляет строку внешней таблицы, только если вложенный запрос не нашёл ни одного совпадения. Такой подход подходит для задач «клиенты без заказов», «товары без продаж» и похожих проверок.",
    "gotcha": "Не подменяй NOT EXISTS выражением NOT IN без проверки NULL. Если вложенный список содержит NULL, результат NOT IN может стать неизвестным и вернуть не те строки.",
    "exampleSql": "SELECT c.id,\n       c.full_name\nFROM customers AS c\nWHERE NOT EXISTS (\n    SELECT 1\n    FROM orders AS o\n    WHERE o.customer_id = c.id\n)\nORDER BY c.id;",
    "starterSql": "SELECT c.id,\n       c.full_name\nFROM customers AS c\nORDER BY c.id;",
    "task": "Найди клиентов, у которых нет ни одного заказа.",
    "checks": {
      "columns": [
        "id",
        "full_name"
      ],
      "columnOrder": true,
      "exactRows": 1,
      "firstRow": {
        "id": 13,
        "full_name": "Полина Захарова"
      },
      "sqlIncludes": [
        "where not exists"
      ]
    },
    "visual": [
      "Проверяем клиента",
      "Подзапрос ищет связанные заказы",
      "NOT EXISTS оставляет клиентов без совпадений"
    ],
    "quiz": {
      "q": "Что вернёт NOT EXISTS, если вложенный запрос нашёл строку?",
      "options": [
        "Оставит внешнюю строку",
        "Не оставит внешнюю строку",
        "Добавит найденную строку второй раз"
      ],
      "correct": 1,
      "why": "NOT EXISTS истинно только тогда, когда вложенный запрос не вернул ни одной строки."
    },
    "hint": "Как изменить проверку существования из предыдущего урока, чтобы оставить только клиентов, для которых совпадение не найдено?",
    "expected": "Столбцы: id, full_name. Одна строка: 13 | Полина Захарова. У остальных клиентов в учебных данных есть хотя бы один заказ.",
    "solutionSql": "SELECT c.id,\n       c.full_name\nFROM customers AS c\nWHERE NOT EXISTS (\n    SELECT 1\n    FROM orders AS o\n    WHERE o.customer_id = c.id\n)\nORDER BY c.id;",
    "solutionExplain": "Подзапрос ищет заказы с тем же customer_id. NOT EXISTS оставляет клиента только тогда, когда такого заказа нет; в учебной базе это Полина Захарова."
  },
  {
    "id": 15,
    "unit": "4 · Связи и сложные запросы",
    "title": "WITH: называем промежуточный результат запроса",
    "goal": "Разделить длинный запрос на понятные последовательные шаги.",
    "explain": "WITH создаёт общее табличное выражение (CTE) — именованный результат, доступный в основной части той же SQL-команды. После WITH указывают имя и запрос в скобках, затем основной SELECT обращается к этому имени как к источнику данных. CTE помогает читать запрос по шагам, но сам по себе не означает создание постоянной таблицы.",
    "gotcha": "Не ставь точку с запятой сразу после закрывающей скобки CTE: основная часть SELECT является продолжением той же команды. Точка с запятой ставится в конце всего запроса.",
    "exampleSql": "WITH order_totals AS (\n    SELECT order_id,\n           SUM(quantity * unit_price) AS total\n    FROM order_items\n    GROUP BY order_id\n)\nSELECT order_id,\n       total\nFROM order_totals\nORDER BY total DESC;",
    "starterSql": "SELECT order_id,\n       SUM(quantity * unit_price) AS total\nFROM order_items\nGROUP BY order_id\nORDER BY total DESC;",
    "task": "Создай CTE order_totals, который считает сумму товарных позиций отдельно для каждого заказа, а затем выведи номер заказа и рассчитанную сумму.",
    "checks": {
      "columns": [
        "order_id",
        "total"
      ],
      "columnOrder": true,
      "exactRows": 20,
      "firstRow": {
        "order_id": 114,
        "total": 50500
      },
      "sqlIncludes": [
        "with order_totals as"
      ]
    },
    "visual": [
      "WITH запускает именованный запрос",
      "CTE order_totals считает суммы",
      "Основной SELECT читает CTE"
    ],
    "quiz": {
      "q": "Где можно использовать имя CTE, созданное через WITH?",
      "options": [
        "В основной части той же SQL-команды",
        "Во всех будущих подключениях к базе",
        "Как имя новой постоянной таблицы"
      ],
      "correct": 0,
      "why": "CTE существует в пределах одной SQL-команды и доступен её последующим частям."
    },
    "hint": "Как можно дать имя результату агрегирующего запроса, чтобы затем обратиться к нему во внешнем SELECT?",
    "expected": "Столбцы: order_id, total. Ожидается 20 строк — по одной на каждый заказ. Самые большие суммы: 114 | 50500; 115 | 27500; 108 | 23800.",
    "solutionSql": "WITH order_totals AS (\n    SELECT order_id,\n           SUM(quantity * unit_price) AS total\n    FROM order_items\n    GROUP BY order_id\n)\nSELECT order_id,\n       total\nFROM order_totals\nORDER BY total DESC;",
    "solutionExplain": "CTE order_totals сначала рассчитывает сумму quantity × unit_price для каждого заказа. Основной SELECT читает готовый результат из order_totals и сортирует заказы по сумме."
  },
  {
    "id": 16,
    "unit": "4 · Связи и сложные запросы",
    "title": "WITH RECURSIVE: строим последовательность шаг за шагом",
    "goal": "Понять начальную и повторяющуюся части рекурсивного запроса.",
    "explain": "WITH RECURSIVE позволяет запросу ссылаться на собственный результат. Сначала выполняется начальная часть, задающая стартовые строки; затем рекурсивная часть добавляет новые строки. Рекурсия заканчивается, когда условие следующего шага больше не выполняется.",
    "gotcha": "Не забывай условие остановки. Если рекурсивная часть продолжает создавать новые строки бесконечно, запрос может долго выполняться или завершиться по ограничению среды.",
    "exampleSql": "WITH RECURSIVE levels(level) AS (\n    SELECT 1\n    UNION ALL\n    SELECT level + 1\n    FROM levels\n    WHERE level < 5\n)\nSELECT level\nFROM levels\nORDER BY level;",
    "starterSql": "WITH RECURSIVE levels(level) AS (\n    SELECT 1\n)\nSELECT level\nFROM levels;",
    "task": "Дополни рекурсивный CTE так, чтобы он сформировал числа от 1 до 5 включительно.",
    "checks": {
      "columns": [
        "level"
      ],
      "columnOrder": true,
      "exactRows": 5,
      "firstRow": {
        "level": 1
      },
      "sqlIncludes": [
        "union all",
        "from levels",
        "where level < 5"
      ]
    },
    "visual": [
      "Начальная часть создаёт 1",
      "Рекурсивная часть прибавляет 1",
      "Условие level < 5 останавливает цикл"
    ],
    "quiz": {
      "q": "Какие части есть у простого рекурсивного CTE?",
      "options": [
        "Начальная выборка и рекурсивная часть",
        "Только ORDER BY и LIMIT",
        "CREATE TABLE и CREATE INDEX"
      ],
      "correct": 0,
      "why": "Начальный запрос задаёт старт, а рекурсивная часть формирует следующие значения."
    },
    "hint": "Какое значение нужно прибавлять к уже полученному level и какое условие остановит последовательность на 5?",
    "expected": "Один столбец: level. Пять строк со значениями 1, 2, 3, 4 и 5.",
    "solutionSql": "WITH RECURSIVE levels(level) AS (\n    SELECT 1\n    UNION ALL\n    SELECT level + 1\n    FROM levels\n    WHERE level < 5\n)\nSELECT level\nFROM levels\nORDER BY level;",
    "solutionExplain": "Начальная часть создаёт число 1. Рекурсивная часть прибавляет единицу к предыдущему результату и повторяется, пока level меньше 5; затем запрос останавливается."
  },
  {
    "id": 17,
    "unit": "4 · Связи и сложные запросы",
    "title": "ROW_NUMBER(): нумеруем строки внутри группы",
    "goal": "Пронумеровать заказы каждого клиента по дате.",
    "explain": "ROW_NUMBER() — оконная функция PostgreSQL, которая присваивает каждой строке номер внутри окна. PARTITION BY начинает нумерацию заново для каждого клиента, а ORDER BY задаёт порядок строк внутри его группы. В отличие от GROUP BY, оконная функция сохраняет отдельную строку для каждого заказа.",
    "gotcha": "ORDER BY внутри OVER задаёт порядок расчёта функции, но не порядок всей выдачи. Для удобного отображения отдельно добавь внешний ORDER BY.",
    "exampleSql": "SELECT customer_id,\n       id AS order_id,\n       order_ts,\n       ROW_NUMBER() OVER (\n           PARTITION BY customer_id\n           ORDER BY order_ts DESC, id DESC\n       ) AS order_rank\nFROM orders\nORDER BY customer_id, order_ts DESC, id DESC;",
    "starterSql": "SELECT customer_id,\n       id AS order_id,\n       order_ts\nFROM orders\nORDER BY customer_id, order_ts DESC, id DESC;",
    "task": "Добавь к каждому заказу номер, чтобы самый новый заказ каждого клиента имел номер 1.",
    "checks": {
      "columns": [
        "customer_id",
        "order_id",
        "order_ts",
        "order_rank"
      ],
      "columnOrder": true,
      "exactRows": 20,
      "firstRow": {
        "customer_id": 1,
        "order_id": 102,
        "order_rank": 1
      },
      "sqlIncludes": [
        "row_number() over",
        "partition by customer_id"
      ]
    },
    "visual": [
      "Заказы разделяются по customer_id",
      "ROW_NUMBER присваивает номер в группе",
      "Самый новый заказ получает 1"
    ],
    "quiz": {
      "q": "Зачем в окне ROW_NUMBER() используется PARTITION BY customer_id?",
      "options": [
        "Чтобы начинать нумерацию отдельно для каждого клиента",
        "Чтобы удалить клиентов без заказов",
        "Чтобы сгруппировать результат в одну строку"
      ],
      "correct": 0,
      "why": "PARTITION BY разделяет строки на независимые группы, в каждой из которых нумерация начинается с 1."
    },
    "hint": "Какую оконную функцию нужно добавить и по какому полю разделить строки, чтобы нумерация начиналась заново у каждого клиента?",
    "expected": "Столбцы: customer_id, order_id, order_ts, order_rank. Ожидается 20 строк. У клиента 1 заказ 102 получает номер 1, заказ 101 — номер 2; у клиента 2 заказ 104 получает номер 1.",
    "solutionSql": "SELECT customer_id,\n       id AS order_id,\n       order_ts,\n       ROW_NUMBER() OVER (\n           PARTITION BY customer_id\n           ORDER BY order_ts DESC, id DESC\n       ) AS order_rank\nFROM orders\nORDER BY customer_id, order_ts DESC, id DESC;",
    "solutionExplain": "PARTITION BY customer_id делит заказы по клиентам. ROW_NUMBER() нумерует их внутри каждой группы, а сортировка по дате DESC ставит самый новый заказ первым."
  },
  {
    "id": 18,
    "unit": "4 · Связи и сложные запросы",
    "title": "UNION ALL: объединяем результаты двух запросов",
    "goal": "Собрать строки из двух совместимых выборок в один список.",
    "explain": "UNION ALL добавляет строки второго SELECT к строкам первого SELECT и сохраняет повторы. В обоих запросах должно быть одинаковое количество столбцов в совместимых типах. Имена итоговых столбцов берутся из первого SELECT.",
    "gotcha": "Не используй UNION вместо UNION ALL, если повторы имеют значение. UNION удаляет дубликаты, а UNION ALL сохраняет все строки.",
    "exampleSql": "SELECT city AS location,\n       'customer_city' AS source\nFROM customers\nUNION ALL\nSELECT channel AS location,\n       'order_channel' AS source\nFROM orders\nORDER BY source, location;",
    "starterSql": "SELECT city AS location\nFROM customers;",
    "task": "Объедини города клиентов и каналы заказов в один список. Добавь столбец source, чтобы было видно, откуда взято каждое значение.",
    "checks": {
      "columns": [
        "location",
        "source"
      ],
      "columnOrder": true,
      "exactRows": 33,
      "sqlIncludes": [
        "union all"
      ]
    },
    "visual": [
      "Первый SELECT возвращает города",
      "Второй SELECT возвращает каналы",
      "UNION ALL объединяет 33 строки"
    ],
    "quiz": {
      "q": "Чем UNION ALL отличается от UNION?",
      "options": [
        "UNION ALL сохраняет повторяющиеся строки",
        "UNION ALL объединяет только числа",
        "UNION ALL всегда сортирует результат"
      ],
      "correct": 0,
      "why": "UNION удаляет дубликаты, а UNION ALL оставляет все строки из обеих выборок."
    },
    "hint": "Как добавить строки второго SELECT к первому и сохранить все значения, даже если они повторяются?",
    "expected": "Столбцы: location, source. Всего 33 строки: 13 городов клиентов и 20 каналов заказов. В source используются значения customer_city и order_channel.",
    "solutionSql": "SELECT city AS location,\n       'customer_city' AS source\nFROM customers\nUNION ALL\nSELECT channel AS location,\n       'order_channel' AS source\nFROM orders\nORDER BY source, location;",
    "solutionExplain": "Первый SELECT возвращает города, второй — каналы заказов. UNION ALL складывает обе выборки в общий набор и сохраняет повторяющиеся значения; source указывает происхождение строки."
  },
  {
    "id": 19,
    "unit": "5 · Модель данных и изменения",
    "title": "pg_constraint: смотрим ограничения таблицы",
    "goal": "Узнать, какие ограничения защищают данные таблицы orders.",
    "explain": "pg_constraint — системный каталог PostgreSQL, в котором хранятся сведения об ограничениях таблиц. Поле conname содержит имя ограничения, а contype — его тип: p означает первичный ключ, f — внешний ключ, c — CHECK. По полю conrelid можно выбрать ограничения конкретной таблицы.",
    "gotcha": "Не путай contype с названием ограничения: contype содержит короткий код типа. Не заключай имя таблицы в одинарные кавычки как часть обычного FROM; здесь строка 'orders' нужна именно для преобразования в REGCLASS.",
    "exampleSql": "SELECT conname,\n       contype\nFROM pg_constraint\nWHERE conrelid = 'orders'::REGCLASS\nORDER BY conname;",
    "starterSql": "SELECT conname\nFROM pg_constraint;",
    "task": "Выведи имена и типы ограничений, которые настроены для таблицы orders.",
    "checks": {
      "columns": [
        "conname",
        "contype"
      ],
      "columnOrder": true,
      "exactRows": 4,
      "sqlIncludes": [
        "from pg_constraint",
        "where conrelid = 'orders'::regclass"
      ]
    },
    "visual": [
      "pg_constraint хранит метаданные",
      "conrelid выбирает таблицу orders",
      "contype показывает вид ограничения"
    ],
    "quiz": {
      "q": "Что означает значение f в поле contype?",
      "options": [
        "Первичный ключ",
        "Внешний ключ",
        "Ограничение CHECK"
      ],
      "correct": 1,
      "why": "В системном каталоге PostgreSQL тип f обозначает внешнее ограничение — FOREIGN KEY."
    },
    "hint": "Какие два поля каталога нужно выбрать, чтобы увидеть имя ограничения и его тип? Как указать, что интересует только таблица orders?",
    "expected": "Столбцы: conname, contype. Для orders ожидаются 4 ограничения: первичный ключ (p), внешний ключ (f) и два CHECK (c).",
    "solutionSql": "SELECT conname,\n       contype\nFROM pg_constraint\nWHERE conrelid = 'orders'::REGCLASS\nORDER BY conname;",
    "solutionExplain": "pg_constraint хранит метаданные ограничений. Приведение 'orders'::REGCLASS позволяет указать конкретную таблицу, после чего WHERE оставляет только её ограничения."
  },
  {
    "id": 20,
    "unit": "5 · Модель данных и изменения",
    "title": "UPDATE ... RETURNING: изменяем строку и сразу видим результат",
    "goal": "Обновить значение одной записи и получить изменённые данные.",
    "explain": "UPDATE изменяет значения в строках таблицы. SET указывает новое значение поля, а WHERE ограничивает изменение нужными строками. В PostgreSQL RETURNING возвращает поля изменённых строк сразу после выполнения команды.",
    "gotcha": "UPDATE без WHERE изменит все строки таблицы. Перед изменением проверь условие отбора и убедись, что оно ограничивает нужное количество записей.",
    "exampleSql": "UPDATE customers\nSET segment = 'smb'\nWHERE id = 1\nRETURNING id, full_name, segment;",
    "starterSql": "UPDATE customers\nSET segment = 'enterprise'\nWHERE id = 1\nRETURNING id, full_name, segment;",
    "task": "Измени segment клиента с id = 1 на smb и выведи его id, имя и новый сегмент.",
    "checks": {
      "columns": [
        "id",
        "full_name",
        "segment"
      ],
      "columnOrder": true,
      "exactRows": 1,
      "firstRow": {
        "id": 1,
        "full_name": "Анна Кузнецова",
        "segment": "smb"
      },
      "sqlIncludes": [
        "update customers",
        "set segment = 'smb'",
        "returning"
      ]
    },
    "visual": [
      "UPDATE выбирает строку по WHERE",
      "SET меняет segment",
      "RETURNING показывает обновлённую запись"
    ],
    "quiz": {
      "q": "Что возвращает RETURNING после UPDATE?",
      "options": [
        "Строки, которые были изменены, и указанные поля",
        "Все строки до обновления",
        "Только список индексов таблицы"
      ],
      "correct": 0,
      "why": "RETURNING позволяет сразу получить значения обновлённых строк."
    },
    "hint": "Какое значение нужно указать после SET segment =, чтобы у клиента с id 1 появился сегмент smb?",
    "expected": "Столбцы: id, full_name, segment. Одна строка: 1 | Анна Кузнецова | smb.",
    "solutionSql": "UPDATE customers\nSET segment = 'smb'\nWHERE id = 1\nRETURNING id, full_name, segment;",
    "solutionExplain": "UPDATE меняет segment только у клиента с id = 1. RETURNING сразу показывает изменённую запись, поэтому отдельный SELECT для проверки не требуется."
  },
  {
    "id": 21,
    "unit": "5 · Модель данных и изменения",
    "title": "ON CONFLICT DO UPDATE: обновляем строку при совпадении ключа",
    "goal": "Вставить запись или обновить существующую без создания дубликата.",
    "explain": "В PostgreSQL конструкция INSERT ... ON CONFLICT задаёт действие при нарушении уникальности. DO UPDATE обновляет найденную конфликтующую строку, а EXCLUDED содержит значения, которые пытались вставить. Для этого урока ключом конфликта выступает products.id.",
    "gotcha": "ON CONFLICT сработает только при конфликте с подходящим уникальным ограничением или индексом. Укажи правильный ключ, иначе PostgreSQL не сможет определить, какой конфликт обрабатывать.",
    "exampleSql": "INSERT INTO products (id, name, category, price, tags)\nVALUES (99, 'Учебный товар', 'Аксессуары', 100, ARRAY['demo']::TEXT[])\nON CONFLICT (id) DO UPDATE\nSET price = EXCLUDED.price\nRETURNING id, name, price;",
    "starterSql": "INSERT INTO products (id, name, category, price, tags)\nVALUES (99, 'Учебный товар', 'Аксессуары', 100, ARRAY['demo']::TEXT[])\nON CONFLICT (id) DO NOTHING\nRETURNING id, name, price;",
    "task": "Добавь учебный товар с id = 99. При повторном запуске запроса должна обновляться цена существующей записи, а не появляться новая строка.",
    "checks": {
      "columns": [
        "id",
        "name",
        "price"
      ],
      "columnOrder": true,
      "exactRows": 1,
      "firstRow": {
        "id": 99,
        "name": "Учебный товар",
        "price": 100
      },
      "sqlIncludes": [
        "on conflict (id) do update",
        "excluded.price"
      ]
    },
    "visual": [
      "INSERT предлагает товар с id 99",
      "ON CONFLICT проверяет уникальный ключ",
      "DO UPDATE обновляет цену через EXCLUDED"
    ],
    "quiz": {
      "q": "Что означает EXCLUDED.price внутри DO UPDATE?",
      "options": [
        "Цена из уже существующей строки",
        "Цена, которую текущий INSERT пытался записать",
        "Средняя цена всех товаров"
      ],
      "correct": 1,
      "why": "EXCLUDED обращается к значениям строки, предложенной командой INSERT."
    },
    "hint": "Что нужно поставить вместо DO NOTHING, чтобы при конфликте PostgreSQL обновил поле price значением из EXCLUDED?",
    "expected": "Столбцы: id, name, price. Одна строка: 99 | Учебный товар | 100. Повторный запуск не должен создавать вторую запись с id = 99.",
    "solutionSql": "INSERT INTO products (id, name, category, price, tags)\nVALUES (99, 'Учебный товар', 'Аксессуары', 100, ARRAY['demo']::TEXT[])\nON CONFLICT (id) DO UPDATE\nSET price = EXCLUDED.price\nRETURNING id, name, price;",
    "solutionExplain": "При отсутствии id = 99 INSERT создаёт товар. При следующем запуске срабатывает ON CONFLICT, а DO UPDATE берёт новую цену из EXCLUDED и обновляет существующую строку."
  },
  {
    "id": 22,
    "unit": "5 · Модель данных и изменения",
    "title": "ROLLBACK: отменяем изменения внутри транзакции",
    "goal": "Проверить изменение и отменить его до подтверждения транзакции.",
    "explain": "Транзакция объединяет несколько SQL-команд в одну операцию. BEGIN начинает транзакцию, ROLLBACK отменяет её незавершённые изменения, а COMMIT подтверждает их. После ROLLBACK данные должны вернуться к состоянию до BEGIN.",
    "gotcha": "ROLLBACK отменяет изменения только до COMMIT. Если сначала выполнить COMMIT, обычный ROLLBACK уже не восстановит исходные данные.",
    "exampleSql": "BEGIN;\nUPDATE orders\nSET status = 'cancelled'\nWHERE id = 101\nRETURNING id, status AS status_in_transaction;\nROLLBACK;\nSELECT id,\n       status AS status_after_rollback\nFROM orders\nWHERE id = 101;",
    "starterSql": "BEGIN;\nUPDATE orders\nSET status = status\nWHERE id = 101\nRETURNING id, status AS status_in_transaction;\nCOMMIT;\nSELECT id,\n       status AS status_after_rollback\nFROM orders\nWHERE id = 101;",
    "task": "Временно измени статус заказа 101 на cancelled, затем отмени изменение и последним SELECT проверь исходный статус.",
    "checks": {
      "columns": [
        "id",
        "status_after_rollback"
      ],
      "columnOrder": true,
      "exactRows": 1,
      "firstRow": {
        "id": 101,
        "status_after_rollback": "paid"
      },
      "sqlIncludes": [
        "rollback",
        "status_after_rollback"
      ]
    },
    "visual": [
      "BEGIN начинает транзакцию",
      "UPDATE временно меняет статус",
      "ROLLBACK отменяет изменение, SELECT показывает paid"
    ],
    "quiz": {
      "q": "Что произойдёт после ROLLBACK до COMMIT?",
      "options": [
        "Изменения текущей транзакции будут отменены",
        "Изменения станут постоянными",
        "Создастся копия таблицы"
      ],
      "correct": 0,
      "why": "ROLLBACK отменяет все незакоммиченные изменения текущей транзакции."
    },
    "hint": "Какую команду нужно поставить вместо COMMIT, чтобы отменить изменение? Как проверить значение после завершения транзакции?",
    "expected": "Последний результат: столбцы id, status_after_rollback. Одна строка: 101 | paid. Во время транзакции UPDATE вернёт cancelled, но после отката в таблице останется paid.",
    "solutionSql": "BEGIN;\nUPDATE orders\nSET status = 'cancelled'\nWHERE id = 101\nRETURNING id, status AS status_in_transaction;\nROLLBACK;\nSELECT id,\n       status AS status_after_rollback\nFROM orders\nWHERE id = 101;",
    "solutionExplain": "BEGIN открывает транзакцию, UPDATE временно меняет статус заказа и RETURNING показывает это промежуточное значение. ROLLBACK отменяет изменение; завершающий SELECT подтверждает, что в таблице по-прежнему хранится paid."
  },
  {
    "id": 23,
    "unit": "6 · Возможности PostgreSQL",
    "title": "JSONB: извлекаем текст оператором ->>",
    "goal": "Получить отдельное текстовое значение из JSONB-поля.",
    "explain": "JSONB хранит структурированные данные в одном поле. Оператор -> возвращает выбранный фрагмент как JSONB, а оператор ->> извлекает его как обычный текст. Если значение нужно показать как строку или сравнивать с текстом, обычно удобен ->>.",
    "gotcha": "Не используй ->, когда ожидаешь обычный текст: -> возвращает JSONB-значение. Для текста нужен ->>. Имя ключа JSON — строковый литерал в одинарных кавычках.",
    "exampleSql": "SELECT full_name,\n       profile ->> 'source' AS acquisition_source\nFROM customers\nORDER BY id\nLIMIT 5;",
    "starterSql": "SELECT full_name,\n       profile -> 'source' AS acquisition_source\nFROM customers\nORDER BY id\nLIMIT 5;",
    "task": "Извлеки из profile текстовое значение ключа source и назови выходной столбец acquisition_source.",
    "checks": {
      "columns": [
        "full_name",
        "acquisition_source"
      ],
      "columnOrder": true,
      "exactRows": 5,
      "firstRow": {
        "full_name": "Анна Кузнецова"
      },
      "sqlIncludes": [
        "profile ->> 'source'"
      ]
    },
    "visual": [
      "profile содержит JSONB-объект",
      "->> выбирает ключ source как текст",
      "Результат отображается в acquisition_source"
    ],
    "quiz": {
      "q": "Какой оператор возвращает извлечённое значение JSONB как текст?",
      "options": [
        "->",
        "->>",
        "@>"
      ],
      "correct": 1,
      "why": "Оператор ->> возвращает текстовое значение, а -> сохраняет тип JSON или JSONB."
    },
    "hint": "Какой из двух операторов, -> или ->>, возвращает значение JSONB именно как текст?",
    "expected": "Столбцы: full_name, acquisition_source. Пять строк. Примеры: Анна Кузнецова | organic; Борис Смирнов | ads; Вера Орлова | referral.",
    "solutionSql": "SELECT full_name,\n       profile ->> 'source' AS acquisition_source\nFROM customers\nORDER BY id\nLIMIT 5;",
    "solutionExplain": "profile ->> 'source' извлекает значение ключа source из JSONB и возвращает его текстом. Псевдоним acquisition_source задаёт понятное имя столбца."
  },
  {
    "id": 24,
    "unit": "6 · Возможности PostgreSQL",
    "title": "Массивы PostgreSQL: оператор @> проверяет наличие элемента",
    "goal": "Отобрать товары по значению внутри массива тегов.",
    "explain": "PostgreSQL поддерживает массивы значений одного типа. Оператор @> проверяет, содержит ли левый массив все элементы правого массива. Для поиска товаров с тегом office достаточно сравнить поле tags с массивом, в котором находится этот тег. Для других задач у PostgreSQL также есть ANY для проверки элемента по списку и unnest() для превращения элементов массива в строки; здесь изучаем только оператор включения @>.",
    "gotcha": "Не путай @> с оператором равенства: массив может содержать несколько элементов. Для текстового массива указывай совместимый тип TEXT[].",
    "exampleSql": "SELECT id,\n       name,\n       tags\nFROM products\nWHERE tags @> ARRAY['office']::TEXT[]\nORDER BY id;",
    "starterSql": "SELECT id,\n       name,\n       tags\nFROM products\nORDER BY id;",
    "task": "Найди товары, у которых в массиве tags есть значение office.",
    "checks": {
      "columns": [
        "id",
        "name",
        "tags"
      ],
      "columnOrder": true,
      "exactRows": 5,
      "firstRow": {
        "id": 1,
        "name": "Клавиатура механическая"
      },
      "sqlIncludes": [
        "tags @> array['office']::text[]"
      ]
    },
    "visual": [
      "products.tags хранит массив тегов",
      "@> проверяет включение office",
      "Остаются 5 подходящих товаров"
    ],
    "quiz": {
      "q": "Что проверяет выражение tags @> ARRAY['office']::TEXT[]?",
      "options": [
        "Что tags полностью равен массиву из office",
        "Что массив tags содержит элемент office",
        "Что массив tags пустой"
      ],
      "correct": 1,
      "why": "@> проверяет включение: все элементы массива справа должны присутствовать в массиве слева."
    },
    "hint": "Какой оператор PostgreSQL проверяет, что массив слева содержит указанный массив справа?",
    "expected": "Столбцы: id, name, tags. Ожидается 5 товаров: id 1, 2, 3, 7 и 8. У каждого массива тегов есть office.",
    "solutionSql": "SELECT id,\n       name,\n       tags\nFROM products\nWHERE tags @> ARRAY['office']::TEXT[]\nORDER BY id;",
    "solutionExplain": "ARRAY['office']::TEXT[] создаёт массив из одного текстового элемента. Оператор @> оставляет только товары, массив tags которых содержит этот элемент."
  },
  {
    "id": 25,
    "unit": "6 · Возможности PostgreSQL",
    "title": "DISTINCT ON: выбираем последнюю строку каждой группы",
    "goal": "Получить только самый свежий заказ каждого клиента.",
    "explain": "DISTINCT ON — возможность PostgreSQL, которая оставляет первую строку для каждого значения указанного выражения. Какую именно строку оставить, определяет ORDER BY. Поля в DISTINCT ON должны соответствовать начальным выражениям сортировки.",
    "gotcha": "Не меняй порядок ORDER BY произвольно: для DISTINCT ON выражение customer_id должно стоять в начале сортировки. Без точного дополнительного критерия выбор строки при одинаковой дате может быть неоднозначным.",
    "exampleSql": "SELECT DISTINCT ON (customer_id)\n       customer_id,\n       id AS latest_order_id,\n       order_ts,\n       status\nFROM orders\nORDER BY customer_id, order_ts DESC, id DESC;",
    "starterSql": "SELECT customer_id,\n       id AS latest_order_id,\n       order_ts,\n       status\nFROM orders\nORDER BY customer_id, order_ts DESC, id DESC;",
    "task": "Выведи по одному самому новому заказу для каждого клиента.",
    "checks": {
      "columns": [
        "customer_id",
        "latest_order_id",
        "order_ts",
        "status"
      ],
      "columnOrder": true,
      "exactRows": 12,
      "firstRow": {
        "customer_id": 1,
        "latest_order_id": 102
      },
      "sqlIncludes": [
        "distinct on (customer_id)"
      ]
    },
    "visual": [
      "Строки разделяются по customer_id",
      "ORDER BY ставит новый заказ первым",
      "DISTINCT ON оставляет первую строку группы"
    ],
    "quiz": {
      "q": "Что определяет, какую строку оставит DISTINCT ON?",
      "options": [
        "Порядок ORDER BY",
        "Порядок физического хранения таблицы",
        "Минимальное значение любого столбца"
      ],
      "correct": 0,
      "why": "DISTINCT ON оставляет первую строку каждой группы в том порядке, который задаёт ORDER BY."
    },
    "hint": "Какую конструкцию PostgreSQL нужно поставить сразу после SELECT, чтобы оставить одну первую строку для каждого customer_id?",
    "expected": "Столбцы: customer_id, latest_order_id, order_ts, status. Ожидается 12 строк — по одной на каждого клиента с заказами. Примеры: клиент 1 — заказ 102; клиент 2 — заказ 104; клиент 3 — заказ 120.",
    "solutionSql": "SELECT DISTINCT ON (customer_id)\n       customer_id,\n       id AS latest_order_id,\n       order_ts,\n       status\nFROM orders\nORDER BY customer_id, order_ts DESC, id DESC;",
    "solutionExplain": "DISTINCT ON (customer_id) оставляет одну строку для каждого клиента. Сортировка по order_ts DESC и id DESC ставит самый новый заказ первым, поэтому он и попадает в результат."
  },
  {
    "id": 26,
    "unit": "6 · Возможности PostgreSQL",
    "title": "CREATE INDEX: создаём B-tree индекс по статусу",
    "goal": "Создать простой индекс и увидеть его определение в каталоге PostgreSQL.",
    "explain": "CREATE INDEX создаёт структуру, которая может ускорить поиск и сортировку по выбранным полям. По умолчанию PostgreSQL создаёт B-tree индекс — универсальный вариант для равенства, диапазонов и сортировки. Индекс занимает место и требует обновления при изменении данных. В этом упражнении создаётся только B-tree индекс по умолчанию. PostgreSQL также поддерживает GIN для массивов и JSONB, но выбор типа индекса зависит от запроса.",
    "gotcha": "Не создавай индексы на все поля подряд: каждый индекс занимает место и увеличивает стоимость INSERT, UPDATE и DELETE. Сначала определи частые запросы, затем проверь план выполнения.",
    "exampleSql": "CREATE INDEX IF NOT EXISTS idx_orders_status_demo\nON orders (status);\n\nSELECT indexname,\n       indexdef\nFROM pg_indexes\nWHERE tablename = 'orders'\n  AND indexname = 'idx_orders_status_demo';",
    "starterSql": "SELECT indexname,\n       indexdef\nFROM pg_indexes\nWHERE tablename = 'orders'\n  AND indexname = 'idx_orders_status_demo';",
    "task": "Создай B-tree индекс для поля status в таблице orders и выведи его определение.",
    "checks": {
      "columns": [
        "indexname",
        "indexdef"
      ],
      "columnOrder": true,
      "exactRows": 1,
      "firstRow": {
        "indexname": "idx_orders_status_demo"
      },
      "sqlIncludes": [
        "create index if not exists idx_orders_status_demo",
        "on orders (status)"
      ]
    },
    "visual": [
      "CREATE INDEX задаёт имя и поле",
      "PostgreSQL создаёт B-tree структуру",
      "pg_indexes показывает определение"
    ],
    "quiz": {
      "q": "Какой тип индекса PostgreSQL создаёт по умолчанию, если USING не указан?",
      "options": [
        "GIN",
        "B-tree",
        "BRIN"
      ],
      "correct": 1,
      "why": "По умолчанию CREATE INDEX создаёт индекс типа B-tree."
    },
    "hint": "Какой оператор создаёт индекс? Какое поле таблицы orders нужно указать в скобках?",
    "expected": "Столбцы: indexname, indexdef. Одна строка с именем idx_orders_status_demo и определением индекса по полю status.",
    "solutionSql": "CREATE INDEX IF NOT EXISTS idx_orders_status_demo\nON orders (status);\n\nSELECT indexname,\n       indexdef\nFROM pg_indexes\nWHERE tablename = 'orders'\n  AND indexname = 'idx_orders_status_demo';",
    "solutionExplain": "CREATE INDEX создаёт индекс idx_orders_status_demo для поля status. Затем представление pg_indexes показывает имя и SQL-определение созданного индекса; IF NOT EXISTS позволяет безопасно повторить создание."
  },
  {
    "id": 27,
    "unit": "6 · Возможности PostgreSQL",
    "title": "EXPLAIN ANALYZE: смотрим фактический план запроса",
    "goal": "Посмотреть, как PostgreSQL выполнил запрос, а не только его текст.",
    "explain": "EXPLAIN показывает план, который выбрал планировщик PostgreSQL. EXPLAIN ANALYZE дополнительно выполняет запрос и выводит фактические данные о времени и количестве строк. Это помогает сравнить оценку планировщика с реальным выполнением.",
    "gotcha": "ANALYZE действительно запускает запрос. Для UPDATE, DELETE и INSERT это может изменить данные; начинай с безопасных SELECT-запросов.",
    "exampleSql": "EXPLAIN (ANALYZE, FORMAT TEXT)\nSELECT id,\n       status\nFROM orders\nWHERE status = 'paid';",
    "starterSql": "SELECT id,\n       status\nFROM orders\nWHERE status = 'paid';",
    "task": "Добавь EXPLAIN ANALYZE к запросу и посмотри план чтения заказов со статусом paid.",
    "checks": {
      "columns": [
        "QUERY PLAN"
      ],
      "columnOrder": true,
      "minRows": 1,
      "sqlIncludes": [
        "explain (analyze",
        "format text"
      ]
    },
    "visual": [
      "EXPLAIN показывает выбранный план",
      "ANALYZE выполняет запрос",
      "QUERY PLAN содержит фактические показатели"
    ],
    "quiz": {
      "q": "Чем EXPLAIN ANALYZE отличается от обычного EXPLAIN?",
      "options": [
        "Он выполняет запрос и показывает фактические показатели",
        "Он только проверяет синтаксис",
        "Он всегда создаёт индекс"
      ],
      "correct": 0,
      "why": "ANALYZE реально выполняет запрос, чтобы добавить фактические показатели в план."
    },
    "hint": "Какой оператор PostgreSQL нужно поставить перед SELECT, чтобы увидеть план и фактическое выполнение?",
    "expected": "Один столбец: QUERY PLAN. Несколько строк текстового плана; среди них будет узел чтения таблицы orders и сведения о фактическом выполнении.",
    "solutionSql": "EXPLAIN (ANALYZE, FORMAT TEXT)\nSELECT id,\n       status\nFROM orders\nWHERE status = 'paid';",
    "solutionExplain": "EXPLAIN ANALYZE выполняет SELECT и возвращает текст плана. В нём можно увидеть способ чтения таблицы, фактическое число строк и затраченное время."
  },
  {
    "id": 28,
    "unit": "6 · Возможности PostgreSQL",
    "title": "Полнотекстовый поиск: to_tsvector и @@",
    "goal": "Найти запись по поисковому слову с помощью механизма PostgreSQL.",
    "explain": "Полнотекстовый поиск преобразует текст в набор поисковых лексем. TO_TSVECTOR строит поисковое представление текста, PLAINTO_TSQUERY формирует запрос, а оператор @@ проверяет совпадение. Для этого учебного примера используется конфигурация simple без языковой морфологии.",
    "gotcha": "ILIKE ищет символьный шаблон, а полнотекстовый поиск работает с лексемами и настройками конфигурации. Эти способы решают разные задачи; для русского языка подбирай и проверяй конфигурацию отдельно.",
    "exampleSql": "SELECT id,\n       full_name\nFROM customers\nWHERE TO_TSVECTOR('simple', full_name) @@ PLAINTO_TSQUERY('simple', 'Анна')\nORDER BY id;",
    "starterSql": "SELECT id,\n       full_name\nFROM customers\nORDER BY id;",
    "task": "Найди клиента, в имени которого полнотекстовый поиск находит слово Анна.",
    "checks": {
      "columns": [
        "id",
        "full_name"
      ],
      "columnOrder": true,
      "exactRows": 1,
      "firstRow": {
        "id": 1,
        "full_name": "Анна Кузнецова"
      },
      "sqlIncludes": [
        "to_tsvector('simple'",
        "@@ plainto_tsquery('simple'"
      ]
    },
    "visual": [
      "TO_TSVECTOR подготавливает текст",
      "PLAINTO_TSQUERY формирует запрос",
      "@@ проверяет совпадение лексем"
    ],
    "quiz": {
      "q": "За что отвечает оператор @@ в полнотекстовом поиске PostgreSQL?",
      "options": [
        "Сравнивает поисковый вектор с поисковым запросом",
        "Создаёт обычный B-tree индекс",
        "Преобразует текст в число"
      ],
      "correct": 0,
      "why": "@@ проверяет, соответствует ли поисковый вектор заданному поисковому запросу."
    },
    "hint": "Какая функция превращает текст в поисковый вектор, а какой оператор сравнивает его с поисковым запросом?",
    "expected": "Столбцы: id, full_name. Одна строка: 1 | Анна Кузнецова.",
    "solutionSql": "SELECT id,\n       full_name\nFROM customers\nWHERE TO_TSVECTOR('simple', full_name) @@ PLAINTO_TSQUERY('simple', 'Анна')\nORDER BY id;",
    "solutionExplain": "TO_TSVECTOR подготавливает имя клиента для поиска, а PLAINTO_TSQUERY создаёт запрос со словом Анна. Оператор @@ оставляет строки, в которых поисковый вектор соответствует запросу."
  },
  {
    "id": 29,
    "unit": "7 · Рабочий процесс и безопасность",
    "title": "CURRENT_USER: узнаём роль текущей сессии",
    "goal": "Посмотреть, под какой ролью выполняется запрос.",
    "explain": "CURRENT_USER возвращает имя роли, от имени которой выполняется текущий запрос. В PostgreSQL роль определяет доступные действия и права на объекты. Команды GRANT и REVOKE применяют на реальном сервере, чтобы выдавать и отзывать права; учебная песочница показывает текущую роль, но не заменяет настройку доступа production-базы. На реальном сервере администратор выдаёт права через GRANT и отзывает их через REVOKE; здесь тренируем только чтение имени текущей роли, поскольку браузерная песочница не настраивает серверные учётные записи.",
    "gotcha": "Не публикуй учётные данные и не выдавай приложению роль superuser. В рабочей базе назначай только те права, которые действительно нужны пользователю или приложению.",
    "exampleSql": "SELECT CURRENT_USER AS current_role;",
    "starterSql": "SELECT SESSION_USER;",
    "task": "Выведи имя роли, от которой выполняется текущая учебная сессия.",
    "checks": {
      "columns": [
        "current_role"
      ],
      "columnOrder": true,
      "exactRows": 1,
      "sqlIncludes": [
        "current_user"
      ]
    },
    "visual": [
      "Сессия подключается к базе",
      "CURRENT_USER определяет действующую роль",
      "Имя роли возвращается в current_role"
    ],
    "quiz": {
      "q": "Что показывает CURRENT_USER?",
      "options": [
        "Имя роли, действующей для текущего запроса",
        "Имя текущей таблицы",
        "Количество пользователей в базе"
      ],
      "correct": 0,
      "why": "CURRENT_USER возвращает имя текущей роли PostgreSQL в контексте выполнения команды."
    },
    "hint": "Какое специальное значение PostgreSQL возвращает роль, действующую в текущем контексте выполнения запроса?",
    "expected": "Один столбец: current_role. Одна строка с именем текущей роли учебной сессии. В браузерной среде это значение может отличаться от роли на рабочем сервере.",
    "solutionSql": "SELECT CURRENT_USER AS current_role;",
    "solutionExplain": "CURRENT_USER возвращает имя роли, права которой применяются к текущему запросу. AS current_role задаёт понятный заголовок результата."
  },
  {
    "id": 30,
    "unit": "8 · Итоговый кейс",
    "title": "Итоговый проект: выручка магазина по месяцам и категориям",
    "goal": "Собрать отчёт, который объединяет уже изученные приёмы SQL.",
    "explain": "В итоговом проекте используются CTE, соединение таблиц, группировка, агрегаты и работа с датами. Заказ считается принятым, если его статус paid или fulfilled; выручка рассчитывается как quantity × unit_price по товарным позициям. Результат показывает отдельную строку для каждого месяца и категории товара.",
    "gotcha": "Не суммируй order_total после JOIN с несколькими товарными позициями без проверки уровня детализации: строки могут размножиться. В этом проекте сумма считается из order_items, а бизнес-правило явно ограничено статусами paid и fulfilled.",
    "exampleSql": "WITH accepted_orders AS (\n    SELECT id,\n           order_ts\n    FROM orders\n    WHERE status IN ('paid', 'fulfilled')\n), revenue_by_order AS (\n    SELECT oi.order_id,\n           p.category,\n           SUM(oi.quantity * oi.unit_price) AS revenue\n    FROM order_items AS oi\n    INNER JOIN products AS p\n            ON p.id = oi.product_id\n    GROUP BY oi.order_id, p.category\n)\nSELECT DATE_TRUNC('month', ao.order_ts)::DATE AS month,\n       r.category,\n       COUNT(DISTINCT ao.id) AS orders_count,\n       SUM(r.revenue) AS revenue\nFROM accepted_orders AS ao\nINNER JOIN revenue_by_order AS r\n        ON r.order_id = ao.id\nGROUP BY 1, r.category\nORDER BY month, revenue DESC;",
    "starterSql": "WITH accepted_orders AS (\n    SELECT id,\n           order_ts\n    FROM orders\n    WHERE status IN ('paid', 'fulfilled')\n)\nSELECT id,\n       order_ts\nFROM accepted_orders;",
    "task": "Построй отчёт по месяцам и категориям: покажи количество заказов и выручку по принятым заказам. Используй товары и позиции заказов, чтобы получить категорию и сумму.",
    "checks": {
      "columns": [
        "month",
        "category",
        "orders_count",
        "revenue"
      ],
      "columnOrder": true,
      "minRows": 5,
      "sqlIncludes": [
        "with accepted_orders as",
        "inner join products",
        "group by 1, r.category"
      ]
    },
    "visual": [
      "CTE отбирает принятые заказы и считает позиции",
      "JOIN добавляет категории товаров",
      "Группировка собирает выручку по месяцу и категории"
    ],
    "quiz": {
      "q": "Что нужно проверить перед сдачей итогового отчёта?",
      "options": [
        "Только отсутствие синтаксической ошибки",
        "Бизнес-правило выручки, уровень детализации JOIN и порядок группировки",
        "Только количество строк в SQL-файле"
      ],
      "correct": 1,
      "why": "Корректный отчёт должен считать нужную метрику на правильном уровне детализации и учитывать согласованное бизнес-правило."
    },
    "hint": "На каком уровне сначала удобнее посчитать сумму товарных позиций: по каждой позиции, по заказу или по месяцу и категории? Какие таблицы содержат категорию товара и его цену?",
    "expected": "Столбцы в таком порядке: month, category, orders_count, revenue. В результате одна строка на месяц и категорию для принятых заказов. Примеры: 2025-09-01 | Периферия | 1 | 8100; 2025-10-01 | Аксессуары | 1 | 1000; 2025-10-01 | Периферия | 1 | 8300. Выручка считается по quantity × unit_price.",
    "solutionSql": "WITH accepted_orders AS (\n    SELECT id,\n           order_ts\n    FROM orders\n    WHERE status IN ('paid', 'fulfilled')\n), revenue_by_order AS (\n    SELECT oi.order_id,\n           p.category,\n           SUM(oi.quantity * oi.unit_price) AS revenue\n    FROM order_items AS oi\n    INNER JOIN products AS p\n            ON p.id = oi.product_id\n    GROUP BY oi.order_id, p.category\n)\nSELECT DATE_TRUNC('month', ao.order_ts)::DATE AS month,\n       r.category,\n       COUNT(DISTINCT ao.id) AS orders_count,\n       SUM(r.revenue) AS revenue\nFROM accepted_orders AS ao\nINNER JOIN revenue_by_order AS r\n        ON r.order_id = ao.id\nGROUP BY 1, r.category\nORDER BY month, revenue DESC;",
    "solutionExplain": "Первый CTE оставляет только заказы со статусами paid и fulfilled. Второй считает выручку товарных позиций по заказу и категории; затем основной запрос группирует результат по месяцу и категории. Подсчёт DISTINCT защищает количество заказов от повторов, если в одной категории у заказа несколько позиций."
  }
];
