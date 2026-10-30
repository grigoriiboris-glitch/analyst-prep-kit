# SQL2 — интерактивный практикум

Источник: `sql2/index.html`.

Всего уроков: **24**. Перенесены объяснения, примеры, задания, подсказки, решения и вопросы для самопроверки.

---

## Урок 1. Выбери нужные поля товара

**Раздел:** Блок 1 · Основы запроса

**Тема:**
  SELECT

**Что нового:**
  SELECT определяет, какие столбцы попадут в результат, а FROM указывает таблицу-источник. Перечисли нужные поля через запятую. Звёздочка выбирает все столбцы, но в аналитических запросах обычно лучше указывать только необходимые.

**Синтаксис:**
  
```
SELECT column_a, column_b
FROM table_name;
```

**Задание:**
  Выведи из products только название товара и его цену. Собери запрос из блоков. Не добавляй другие столбцы.

**Подсказка:**
  Сначала реши, какие два поля отвечают за название и цену. Затем укажи таблицу, в которой они находятся.

**Решение:**
  
```
SELECT product_name, price
FROM products;
```

**Объяснение:**
  В SELECT указаны только product_name и price, поэтому остальные поля таблицы не попадут в результат. FROM products задаёт источник строк. Порядок строк не фиксирован, потому что сортировка не требуется.

**Ожидаемый результат:**
  Два столбца в порядке product_name, price. Будет шесть строк — по одной на каждый товар. Примеры: Laptop Pro — 120; Wireless Mouse — 25; Monitor 4K — 350. Порядок строк без сортировки не гарантируется.

**Типичная ошибка:**
  Использовать SELECT * и вернуть все поля, хотя по заданию нужны только два. Ещё одна ошибка — забыть запятую между столбцами.

**Вопрос для самопроверки:**
  Что попадёт в результат, если вместо product_name, price написать звёздочку (*)?

**Блоки для сборки:**
  - SELECT product_name, price
  - FROM products;
  - SELECT *
  - category
  - FROM categories;
  - price, category

---

## Урок 2. Найди три самых дорогих товара

**Раздел:** Блок 1 · Основы запроса

**Тема:**
  ORDER BY · LIMIT

**Что нового:**
  ORDER BY задаёт порядок строк: ASC означает по возрастанию, DESC — по убыванию. Если направление не указано, используется ASC. LIMIT N оставляет не более N строк и записывается после сортировки. Дополнительное поле сортировки помогает задать порядок при совпадении цен.

**Синтаксис:**
  
```
SELECT product_name, price
FROM products
ORDER BY price DESC
LIMIT 3;
```

**Задание:**
  Выведи название и цену трёх самых дорогих товаров. При одинаковой цене расположи товары по названию от А до Я.

**Подсказка:**
  Нужно сначала расположить большие цены выше меньших, затем ограничить число строк. Подумай, какой второй критерий сделает порядок однозначным.

**Решение:**
  
```
SELECT product_name, price
FROM products
ORDER BY price DESC, product_name ASC
LIMIT 3;
```

**Объяснение:**
  Сортировка по price DESC ставит самые дорогие товары первыми. product_name ASC задаёт алфавитный порядок при одинаковой цене. LIMIT 3 оставляет только три верхние строки.

**Ожидаемый результат:**
  Два столбца: product_name, price; ровно три строки. Результат: Monitor 4K — 350; Office Chair — 180; Laptop Pro — 120.

**Типичная ошибка:**
  Поставить ASC вместо DESC: тогда первыми окажутся самые дешёвые товары. Если забыть LIMIT, вернутся все товары.

**Вопрос для самопроверки:**
  Что произойдёт, если убрать LIMIT 3, оставив сортировку?

**Блоки для сборки:**
  - SELECT product_name, price
  - FROM products
  - ORDER BY price DESC, product_name ASC
  - LIMIT 3;
  - ORDER BY price ASC
  - LIMIT 10;
  - SELECT *
  - ORDER BY product_name DESC

---

## Урок 3. Оставь клиентов из South

**Раздел:** Блок 1 · Основы запроса

**Тема:**
  WHERE

**Что нового:**
  WHERE оставляет только строки, которые подходят под условие. Он располагается после FROM и до GROUP BY или ORDER BY. Текстовые значения записывают в одинарных кавычках, а сравнение на точное совпадение выполняют знаком =.

**Синтаксис:**
  
```
SELECT customer_name, region
FROM customers
WHERE region = 'South';
```

**Задание:**
  Покажи имена и регионы только тех клиентов, которые относятся к South.

**Подсказка:**
  Найди в таблице customers поле с регионом. Нужно оставить только строки с одним конкретным текстовым значением.

**Решение:**
  
```
SELECT customer_name, region
FROM customers
WHERE region = 'South';
```

**Объяснение:**
  WHERE проверяет значение region в каждой строке и пропускает в результат только клиентов из South. Кавычки показывают, что South — текст, а не имя столбца.

**Ожидаемый результат:**
  Два столбца: customer_name, region. Три строки: Boris Petrov — South; Farid Ali — South; Irina Volkova — South. Фиксированный порядок строк не требуется.

**Типичная ошибка:**
  Написать South без кавычек или поставить WHERE до FROM. В обоих случаях запрос будет записан неверно.

**Вопрос для самопроверки:**
  Как изменится результат, если в условии заменить South на North?

**Блоки для сборки:**
  - SELECT customer_name, region
  - FROM customers
  - WHERE region = 'South';
  - SELECT *
  - WHERE region = 'North';
  - WHERE region = 'West';
  - ORDER BY customer_name;

---

## Урок 4. Найди заказы без привязанного клиента

**Раздел:** Блок 1 · Основы запроса

**Тема:**
  IS NULL

**Что нового:**
  NULL обозначает отсутствие значения. Для его поиска используют IS NULL, а для поиска заполненных полей — IS NOT NULL. Обычное сравнение через = здесь не подходит: NULL не является обычным значением.

**Синтаксис:**
  
```
SELECT order_id, total_amount
FROM orders
WHERE customer_id IS NULL;
```

**Задание:**
  Найди заказы, у которых не указан customer_id. Покажи номер заказа и его сумму.

**Подсказка:**
  Нужно найти не определённое значение идентификатора, а отсутствие значения в поле. Вспомни специальную проверку для NULL.

**Решение:**
  
```
SELECT order_id, total_amount
FROM orders
WHERE customer_id IS NULL;
```

**Объяснение:**
  IS NULL находит строки, где customer_id не заполнен. В демонстрационных данных это заказ без привязанного клиента. Другие заказы в результат не попадут.

**Ожидаемый результат:**
  Два столбца: order_id, total_amount. Одна строка: 1016 — 60.

**Типичная ошибка:**
  Использовать customer_id = NULL. Такая проверка не находит пропуски; нужно специальное условие IS NULL.

**Вопрос для самопроверки:**
  Какой оператор нужно использовать, чтобы найти заказы с заполненным customer_id?

**Блоки для сборки:**
  - SELECT order_id, total_amount
  - FROM orders
  - WHERE customer_id IS NULL;
  - SELECT customer_name
  - WHERE customer_id = NULL;
  - WHERE email IS NULL;
  - WHERE customer_id IS NOT NULL;

---

## Урок 5. Покажи категории без повторов

**Раздел:** Блок 1 · Основы запроса

**Тема:**
  DISTINCT

**Что нового:**
  DISTINCT убирает повторяющиеся строки из результата и ставится сразу после SELECT. Если выбран один столбец, каждое его значение останется только один раз. DISTINCT не сортирует результат автоматически.

**Синтаксис:**
  
```
SELECT DISTINCT category
FROM products;
```

**Задание:**
  Выведи список категорий товаров так, чтобы каждая категория встретилась только один раз.

**Подсказка:**
  В таблице много товаров, но несколько товаров могут принадлежать одной категории. Нужен список разных значений, а не полный перечень товаров.

**Решение:**
  
```
SELECT DISTINCT category
FROM products;
```

**Объяснение:**
  DISTINCT оставляет по одной строке на каждую уникальную категорию. Поскольку ORDER BY не добавлен, порядок категорий не гарантируется.

**Ожидаемый результат:**
  Один столбец category и три строки: Electronics, Accessories, Home. Каждая категория встречается один раз; порядок строк не фиксирован.

**Типичная ошибка:**
  Использовать только SELECT category: тогда одинаковые категории повторятся столько раз, сколько товаров к ним относится.

**Вопрос для самопроверки:**
  Удаляет ли DISTINCT повторяющиеся строки из исходной таблицы?

**Блоки для сборки:**
  - SELECT DISTINCT category
  - FROM products;
  - SELECT category
  - SELECT *
  - DISTINCT product_name;

---

## Урок 6. Найди товар по окончанию названия

**Раздел:** Блок 2 · Фильтрация и логика

**Тема:**
  LIKE

**Что нового:**
  LIKE проверяет текст по шаблону. Символ % заменяет любое количество символов, в том числе ноль, а _ заменяет ровно один символ. Если % стоит перед фрагментом, SQL ищет текст, который заканчивается этим фрагментом.

**Синтаксис:**
  
```
SELECT product_name
FROM products
WHERE product_name LIKE '%4K';
```

**Задание:**
  Найди товары, название которых заканчивается на 4K. Выведи только название товара.

**Подсказка:**
  Подумай, что должно стоять в шаблоне перед буквами 4K, чтобы перед ними могли находиться любые символы.

**Решение:**
  
```
SELECT product_name
FROM products
WHERE product_name LIKE '%4K';
```

**Объяснение:**
  Символ % перед 4K разрешает любой текст до этого окончания. Условие LIKE проверяет весь шаблон и находит товар Monitor 4K.

**Ожидаемый результат:**
  Один столбец product_name. Одна строка: Monitor 4K.

**Типичная ошибка:**
  Поставить % после 4K: тогда будут найдены названия, которые начинаются с 4K, а не заканчиваются им.

**Вопрос для самопроверки:**
  Что означает знак % в шаблоне LIKE?

**Блоки для сборки:**
  - SELECT product_name
  - FROM products
  - WHERE product_name LIKE '%4K';
  - SELECT *
  - WHERE product_name LIKE '4K%';
  - WHERE product_name = '%4K';
  - WHERE product_name LIKE '%Pro%';

---

## Урок 7. Отбери товары в ценовом диапазоне

**Раздел:** Блок 2 · Фильтрация и логика

**Тема:**
  BETWEEN

**Что нового:**
  BETWEEN проверяет, входит ли значение в заданный диапазон. Нижняя и верхняя границы включаются. Условие можно использовать в WHERE; если требуется предсказуемая последовательность, после фильтра добавляют ORDER BY.

**Синтаксис:**
  
```
SELECT product_name, price
FROM products
WHERE price BETWEEN 25 AND 120;
```

**Задание:**
  Покажи товары стоимостью от 25 до 120 включительно. Выведи название и цену, расположив товары от самой дешёвой цены к самой дорогой.

**Подсказка:**
  Обе границы должны попасть в результат. После проверки диапазона отдельно задай порядок по цене.

**Решение:**
  
```
SELECT product_name, price
FROM products
WHERE price BETWEEN 25 AND 120
ORDER BY price ASC;
```

**Объяснение:**
  BETWEEN оставляет товары с ценой не меньше 25 и не больше 120. ORDER BY price ASC располагает найденные товары по возрастанию цены.

**Ожидаемый результат:**
  Два столбца: product_name, price. Четыре строки: Wireless Mouse — 25; Desk Lamp — 38; USB-C Hub — 45; Laptop Pro — 120.

**Типичная ошибка:**
  Использовать строгие сравнения и случайно исключить товар, цена которого равна одной из границ.

**Вопрос для самопроверки:**
  Попадёт ли в результат товар с ценой ровно 120?

**Блоки для сборки:**
  - SELECT product_name, price
  - FROM products
  - WHERE price BETWEEN 25 AND 120
  - ORDER BY price ASC;
  - WHERE price > 25;
  - WHERE price < 120;
  - ORDER BY price DESC;
  - LIMIT 4;

---

## Урок 8. Раздели товары на ценовые категории

**Раздел:** Блок 2 · Фильтрация и логика

**Тема:**
  CASE WHEN

**Что нового:**
  CASE WHEN возвращает разные значения в зависимости от условий. SQL проверяет условия сверху вниз и выбирает результат первого подходящего THEN. ELSE задаёт значение для всех остальных строк, а END завершает выражение.

**Синтаксис:**
  
```
SELECT product_name,
  CASE
    WHEN price < 50 THEN 'Budget'
    ELSE 'Standard'
  END AS price_band
FROM products;
```

**Задание:**
  Для каждого товара создай поле price_band: цена ниже 50 — Budget, от 50 до 199.99 — Standard, 200 и выше — Premium. Покажи название, цену и категорию.

**Подсказка:**
  Начни с самого низкого порога, затем добавь следующий. Для цен, которые не подошли под первые два условия, задай отдельную категорию по умолчанию.

**Решение:**
  
```
SELECT product_name, price,
  CASE
    WHEN price < 50 THEN 'Budget'
    WHEN price < 200 THEN 'Standard'
    ELSE 'Premium'
  END AS price_band
FROM products
ORDER BY product_name;
```

**Объяснение:**
  CASE проверяет цену каждого товара. Если цена меньше 50, выбирается Budget; если первое условие не подошло, проверяется граница 200. Остальные товары получают Premium. AS задаёт имя нового столбца результата.

**Ожидаемый результат:**
  Три столбца: product_name, price, price_band; шесть строк. Примеры: Desk Lamp — 38 — Budget; Office Chair — 180 — Standard; Monitor 4K — 350 — Premium.

**Типичная ошибка:**
  Поставить условие price < 200 первым: тогда товары дешевле 50 тоже попадут в Standard, потому что SQL остановится на первом совпадении.

**Вопрос для самопроверки:**
  Какую категорию получит товар ценой ровно 200?

**Блоки для сборки:**
  - SELECT product_name, price,
  - CASE
  - WHEN price < 50 THEN 'Budget'
  - WHEN price < 200 THEN 'Standard'
  - ELSE 'Premium'
  - END AS price_band
  - FROM products
  - ORDER BY product_name;
  - CASE
  - WHEN price < 50 THEN 'Budget'
  - WHEN price < 200 THEN 'Standard'
  - ELSE 'Premium'
  - END AS price_band
  - WHEN price >= 200 THEN 'Budget'

---

## Урок 9. Покажи email и подпиши пропуски

**Раздел:** Блок 2 · Фильтрация и логика

**Тема:**
  COALESCE

**Что нового:**
  COALESCE возвращает первое значение в списке, которое не равно NULL. Если email заполнен, функция вернёт его. Если email отсутствует, можно показать запасной текст; таблица при этом не меняется.

**Синтаксис:**
  
```
SELECT COALESCE(email, 'email missing') AS email_contact
FROM customers;
```

**Задание:**
  Выведи имя каждого клиента и поле email_contact. Если email отсутствует, вместо NULL покажи текст email missing.

**Подсказка:**
  Нужно сохранить существующие адреса и заменить только отсутствующие значения. Функция должна получить исходное поле и запасную подпись.

**Решение:**
  
```
SELECT customer_name,
  COALESCE(email, 'email missing') AS email_contact
FROM customers;
```

**Объяснение:**
  COALESCE сначала проверяет email. Заполненные адреса возвращаются без изменений, а для пропусков используется текст email missing. AS задаёт имя вычисляемого столбца.

**Ожидаемый результат:**
  Два столбца: customer_name, email_contact; 12 строк. Примеры: Alice Morgan — alice@example.com; Denis Ivanov — email missing; Kira Bell — email missing.

**Типичная ошибка:**
  Подменить все email одной подписью или проверить пустую строку вместо NULL. COALESCE заменяет только NULL.

**Вопрос для самопроверки:**
  Какое значение вернёт COALESCE, если email уже заполнен?

**Блоки для сборки:**
  - SELECT customer_name,
  - COALESCE(email, 'email missing') AS email_contact
  - FROM customers;
  - SELECT customer_name, email
  - COALESCE(email, 'email missing')
  - COALESCE(email, 'unknown')
  - AS email_contact

---

## Урок 10. Рассчитай показатели по товарам

**Раздел:** Блок 3 · Агрегации

**Тема:**
  COUNT · SUM · AVG

**Что нового:**
  Агрегатные функции сводят много строк к итоговым показателям. COUNT(*) считает строки, SUM складывает значения столбца, AVG вычисляет среднее арифметическое. Если использовать их без GROUP BY, результатом будет одна итоговая строка по всей таблице.

**Синтаксис:**
  
```
SELECT COUNT(*) AS row_count,
  SUM(price) AS total_price,
  AVG(price) AS average_price
FROM products;
```

**Задание:**
  Верни одну строку с тремя показателями: products_count — количество товаров, catalog_value — сумма всех цен и average_price — средняя цена товара.

**Подсказка:**
  Для количества, суммы и среднего нужны три разные агрегатные функции. Каждому результату дай имя, которое соответствует его смыслу.

**Решение:**
  
```
SELECT COUNT(*) AS products_count,
  SUM(price) AS catalog_value,
  AVG(price) AS average_price
FROM products;
```

**Объяснение:**
  COUNT(*) считает все товары, SUM складывает значения price, а AVG делит сумму заполненных цен на их количество. Без GROUP BY все шесть товаров входят в один общий расчёт.

**Ожидаемый результат:**
  Одна строка с тремя столбцами: products_count, catalog_value, average_price. Значения: 6; 758; около 126.33.

**Типичная ошибка:**
  Использовать COUNT(price) и считать, что он всегда равен количеству строк: COUNT по полю не учитывает NULL, тогда как COUNT(*) считает все строки.

**Вопрос для самопроверки:**
  Какую функцию нужно выбрать, чтобы получить общую сумму всех цен?

**Блоки для сборки:**
  - SELECT COUNT(*) AS products_count,
  - SUM(price) AS catalog_value,
  - AVG(price) AS average_price
  - FROM products;
  - COUNT(price) AS products_count,
  - SUM(price) AS average_price,
  - AVG(price) AS catalog_value
  - FROM orders;

---

## Урок 11. Посчитай заказы каждого клиента

**Раздел:** Блок 3 · Агрегации

**Тема:**
  GROUP BY

**Что нового:**
  GROUP BY объединяет строки с одинаковым значением выбранного столбца в группы. После этого агрегатная функция считает показатель отдельно для каждой группы. Если идентификатор клиента отсутствует, такие строки также образуют отдельную группу со значением NULL.

**Синтаксис:**
  
```
SELECT customer_id, COUNT(*) AS orders_count
FROM orders
GROUP BY customer_id;
```

**Задание:**
  Для каждого значения customer_id посчитай количество заказов. Покажи идентификатор и orders_count. Отсортируй сначала по количеству заказов по убыванию.

**Подсказка:**
  Нужен отдельный подсчёт внутри каждой группы одинаковых customer_id. Вспомни, какая конструкция создаёт такие группы.

**Решение:**
  
```
SELECT customer_id, COUNT(*) AS orders_count
FROM orders
GROUP BY customer_id
ORDER BY orders_count DESC, customer_id;
```

**Объяснение:**
  GROUP BY создаёт группу для каждого значения customer_id, а COUNT(*) считает строки внутри неё. Сортировка выводит клиентов с большим количеством заказов выше. Заказ без customer_id образует отдельную группу NULL.

**Ожидаемый результат:**
  Два столбца: customer_id и orders_count; 12 групп, включая одну группу NULL. Примеры: 1 — 3; 2 — 2; 3 — 2; 6 — 2.

**Типичная ошибка:**
  Посчитать общее количество заказов без группировки: тогда получится одна строка вместо отдельного показателя для каждого клиента.

**Вопрос для самопроверки:**
  Почему запрос без GROUP BY вернул бы один общий показатель, а не число заказов для каждого клиента?

**Блоки для сборки:**
  - SELECT customer_id, COUNT(*) AS orders_count
  - FROM orders
  - GROUP BY customer_id
  - ORDER BY orders_count DESC, customer_id;
  - GROUP BY status;

---

## Урок 12. Оставь клиентов с повторными заказами

**Раздел:** Блок 3 · Агрегации

**Тема:**
  HAVING

**Что нового:**
  WHERE фильтрует отдельные строки до группировки, а HAVING фильтрует уже собранные группы. Поэтому в HAVING можно проверить результат агрегатной функции, например число строк в группе. HAVING располагается после GROUP BY и до ORDER BY.

**Синтаксис:**
  
```
SELECT customer_id, COUNT(*) AS orders_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) >= 2;
```

**Задание:**
  Покажи только тех клиентов, у которых есть не меньше двух заказов. Выведи customer_id и orders_count, отсортируй по customer_id.

**Подсказка:**
  Сначала запрос должен посчитать заказы внутри каждой группы. Затем нужно убрать целые группы, в которых заказов меньше двух.

**Решение:**
  
```
SELECT customer_id, COUNT(*) AS orders_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) >= 2
ORDER BY customer_id;
```

**Объяснение:**
  GROUP BY собирает заказы по клиентам, а HAVING оставляет только группы с двумя и более строками. В демонстрационных данных это клиенты 1, 2, 3 и 6.

**Ожидаемый результат:**
  Два столбца: customer_id, orders_count. Четыре строки: 1 — 3; 2 — 2; 3 — 2; 6 — 2.

**Типичная ошибка:**
  Ставить условие по COUNT(*) в WHERE. На этом этапе группы ещё не сформированы, поэтому агрегатное условие нужно задавать через HAVING.

**Вопрос для самопроверки:**
  На каком этапе SQL применяет HAVING — до группировки строк или после?

**Блоки для сборки:**
  - SELECT customer_id, COUNT(*) AS orders_count
  - FROM orders
  - GROUP BY customer_id
  - HAVING COUNT(*) >= 2
  - ORDER BY customer_id;
  - WHERE COUNT(*) >= 2;
  - HAVING COUNT(*) = 1;

---

## Урок 13. Соедини заказы с именами клиентов

**Раздел:** Блок 4 · Объединение и расчёты

**Тема:**
  INNER JOIN

**Что нового:**
  INNER JOIN связывает строки двух таблиц, когда значения в условии ON совпадают. В результат попадают только найденные пары. Обычно таблицы связывают по идентификаторам, а не по именам или другим текстовым полям.

**Синтаксис:**
  
```
SELECT o.order_id, c.customer_name
FROM orders o
INNER JOIN customers c ON c.customer_id = o.customer_id;
```

**Задание:**
  Выведи номер каждого заказа и имя клиента, который его оформил. Расположи результат по номеру заказа.

**Подсказка:**
  Номер заказа хранится в orders, а имя — в customers. Найди поле, которое связывает запись заказа с записью клиента.

**Решение:**
  
```
SELECT o.order_id, c.customer_name
FROM orders o
INNER JOIN customers c ON c.customer_id = o.customer_id
ORDER BY o.order_id;
```

**Объяснение:**
  INNER JOIN находит клиента по совпадению customer_id. Заказ без указанного идентификатора не образует пару и не попадёт в результат. ORDER BY сохраняет порядок номеров заказов.

**Ожидаемый результат:**
  Два столбца: order_id, customer_name; 16 строк. Первая строка: 1001 — Alice Morgan. Последняя: 1017 — Leo Kim. Заказ 1016 без customer_id не попадёт в результат.

**Типичная ошибка:**
  Связывать таблицы по имени клиента или пропустить ON. Без корректного ключа сопоставление строк будет неверным.

**Вопрос для самопроверки:**
  Попадёт ли в результат заказ, у которого customer_id равен NULL?

**Блоки для сборки:**
  - SELECT o.order_id, c.customer_name
  - FROM orders o
  - INNER JOIN customers c ON c.customer_id = o.customer_id
  - ORDER BY o.order_id;
  - ON c.email = o.customer_id;
  - WHERE o.customer_id IS NOT NULL;

---

## Урок 14. Сохрани всех клиентов при соединении

**Раздел:** Блок 4 · Объединение и расчёты

**Тема:**
  LEFT JOIN

**Что нового:**
  LEFT JOIN сохраняет все строки левой таблицы. Если для строки не нашлось пары в правой таблице, её поля будут равны NULL. Поэтому результат может содержать клиента даже тогда, когда у него нет заказов.

**Синтаксис:**
  
```
SELECT c.customer_name, o.order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id;
```

**Задание:**
  Выведи каждого клиента и номера его заказов. Важно сохранить в результате также клиентов, у которых нет заказов. Отсортируй по customer_id и номеру заказа.

**Подсказка:**
  Сделай customers левой таблицей. Соединение должно сохранять её строки, даже если соответствующего order_id нет.

**Решение:**
  
```
SELECT c.customer_name, o.order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
ORDER BY c.customer_id, o.order_id;
```

**Объяснение:**
  LEFT JOIN сохраняет каждого клиента. Для клиента без заказов значение order_id будет NULL. Клиенты с несколькими заказами появятся в нескольких строках — по одной на каждый найденный заказ.

**Ожидаемый результат:**
  Два столбца: customer_name и order_id; 17 строк. Все 12 клиентов присутствуют. У Kira Bell значение order_id равно NULL, потому что у неё нет заказа.

**Типичная ошибка:**
  Использовать INNER JOIN: клиент без заказа исчезнет из результата. Для сохранения всех клиентов нужна левая сторона LEFT JOIN.

**Вопрос для самопроверки:**
  Какая таблица должна стоять после FROM, чтобы LEFT JOIN сохранил всех клиентов?

**Блоки для сборки:**
  - SELECT c.customer_name, o.order_id
  - FROM customers c
  - LEFT JOIN orders o ON o.customer_id = c.customer_id
  - ORDER BY c.customer_id, o.order_id;
  - INNER JOIN orders o ON o.customer_id = c.customer_id;
  - WHERE o.order_id IS NULL;

---

## Урок 15. Рассчитай стоимость каждой позиции

**Раздел:** Блок 4 · Объединение и расчёты

**Тема:**
  Арифметика · AS

**Что нового:**
  В SELECT можно вычислять новое значение из существующих столбцов, не меняя исходную таблицу. Для умножения используют *, а AS задаёт понятное имя вычисляемого столбца. Выражение рассчитывается отдельно для каждой строки.

**Синтаксис:**
  
```
SELECT quantity * unit_price AS line_total
FROM order_items;
```

**Задание:**
  Для каждой позиции заказа рассчитай line_total — стоимость позиции как количество, умноженное на цену за единицу. Покажи order_item_id, order_id и line_total.

**Подсказка:**
  Найди в order_items количество и цену за единицу. Вычисляемая стоимость позиции должна быть отдельным столбцом.

**Решение:**
  
```
SELECT order_item_id, order_id,
  quantity * unit_price AS line_total
FROM order_items
ORDER BY order_item_id;
```

**Объяснение:**
  SQL умножает quantity на unit_price для каждой строки order_items. AS line_total задаёт имя вычисляемого поля. Исходные значения таблицы при этом не изменяются.

**Ожидаемый результат:**
  Три столбца: order_item_id, order_id, line_total; 15 строк. Примеры: позиция 1 — заказ 1001 — 120; позиция 8 — заказ 1008 — 360; позиция 9 — заказ 1008 — 90.

**Типичная ошибка:**
  Сложить quantity и unit_price вместо умножения или забыть задать имя вычисляемого столбца.

**Вопрос для самопроверки:**
  Изменится ли значение unit_price в таблице после выполнения такого SELECT?

**Блоки для сборки:**
  - SELECT order_item_id, order_id,
  - quantity * unit_price AS line_total
  - FROM order_items
  - ORDER BY order_item_id;
  - quantity + unit_price AS line_total
  - FROM order_items;

---

## Урок 16. Посчитай суммы платежей по месяцам

**Раздел:** Блок 4 · Объединение и расчёты

**Тема:**
  STRFTIME · даты

**Что нового:**
  В SQLite STRFTIME преобразует дату в текст по заданному формату. Обозначение %Y возвращает год из четырёх цифр, а %m — месяц из двух цифр. Если сгруппировать строки по значению YYYY-MM, платежи одного месяца попадут в одну группу.

**Синтаксис:**
  
```
SELECT STRFTIME('%Y-%m', payment_date) AS month
FROM payments;
```

**Задание:**
  Сгруппируй платежи по календарным месяцам. Выведи month в формате YYYY-MM и payments_total — сумму платежей за месяц. Отсортируй месяцы по возрастанию.

**Подсказка:**
  Вместо полной даты нужен общий ключ месяца. Используй одинаковое выражение для вывода месяца и группировки строк.

**Решение:**
  
```
SELECT STRFTIME('%Y-%m', payment_date) AS month,
  SUM(paid_amount) AS payments_total
FROM payments
GROUP BY STRFTIME('%Y-%m', payment_date)
ORDER BY month;
```

**Объяснение:**
  STRFTIME('%Y-%m', payment_date) превращает дату в ключ вида год-месяц. GROUP BY объединяет платежи одного месяца, а SUM складывает их суммы. В результате одна строка соответствует одному месяцу.

**Ожидаемый результат:**
  Два столбца: month, payments_total. Пять строк: 2025-01 — 435.5; 2025-02 — 490; 2025-03 — 550; 2025-04 — 760; 2025-05 — 540.

**Типичная ошибка:**
  Группировать по полной дате payment_date: платежи разных дней одного месяца окажутся в разных группах.

**Вопрос для самопроверки:**
  Что означает %m в формате STRFTIME('%Y-%m', payment_date)?

**Блоки для сборки:**
  - SELECT STRFTIME('%Y-%m', payment_date) AS month,
  - SUM(paid_amount) AS payments_total
  - FROM payments
  - GROUP BY STRFTIME('%Y-%m', payment_date)
  - ORDER BY month;
  - SUM(paid_amount) AS payments_total
  - GROUP BY payment_date;
  - WHERE payment_status = 'Paid';

---

## Урок 17. Найди товары дороже средней цены

**Раздел:** Блок 5 · Аналитические запросы

**Тема:**
  Подзапрос

**Что нового:**
  Подзапрос — это запрос внутри другого запроса. Если он возвращает одно значение, его можно использовать в условии основного запроса. Подзапрос помещают в круглые скобки, а внешний запрос сравнивает с полученным значением каждую строку.

**Синтаксис:**
  
```
SELECT product_name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products);
```

**Задание:**
  Найди товары, цена которых выше средней цены всех товаров. Выведи название и цену, расположив самые дорогие товары первыми.

**Подсказка:**
  Сначала нужно вычислить одно общее среднее значение по products, а затем сравнить с ним цену каждого товара.

**Решение:**
  
```
SELECT product_name, price
FROM products
WHERE price > (
  SELECT AVG(price)
  FROM products
)
ORDER BY price DESC;
```

**Объяснение:**
  Внутренний SELECT возвращает одно число — среднюю цену всех товаров. Внешний запрос оставляет товары, цена которых больше этого значения. Сортировка показывает наиболее дорогой товар первым.

**Ожидаемый результат:**
  Два столбца: product_name, price. Две строки: Monitor 4K — 350; Office Chair — 180.

**Типичная ошибка:**
  Сравнивать цену с текстом или забыть круглые скобки вокруг подзапроса. Внутренний запрос должен вернуть одно число.

**Вопрос для самопроверки:**
  Какое значение возвращает внутренний запрос в этом задании?

**Блоки для сборки:**
  - SELECT product_name, price
  - FROM products
  - WHERE price > (
  - SELECT AVG(price)
  - FROM products
  - )
  - ORDER BY price DESC;
  - SELECT AVG(price)
  - WHERE price > AVG(price);

---

## Урок 18. Вынеси расчёт цен в CTE

**Раздел:** Блок 5 · Аналитические запросы

**Тема:**
  WITH

**Что нового:**
  CTE — именованный промежуточный результат, который задают в начале SQL-запроса. Общая форма: WITH имя AS (SELECT ... ) SELECT ... FROM имя;. CTE существует только во время выполнения этого запроса и помогает разделить расчёт на понятные этапы.

**Синтаксис:**
  
```
WITH result_name AS (
  SELECT column_name
  FROM table_name
)
SELECT column_name
FROM result_name;
```

**Задание:**
  Сначала рассчитай среднюю цену товаров для каждой категории. Затем выведи только категории, у которых средняя цена не меньше 100. Покажи category и average_price, отсортируй по средней цене по убыванию.

**Подсказка:**
  Помести уже знакомую группировку и AVG во временный именованный результат. Во внешнем запросе используй его имя как источник данных.

**Решение:**
  
```
WITH category_prices AS (
  SELECT category, AVG(price) AS average_price
  FROM products
  GROUP BY category
)
SELECT category, average_price
FROM category_prices
WHERE average_price >= 100
ORDER BY average_price DESC, category;
```

**Объяснение:**
  CTE category_prices сначала вычисляет среднюю цену каждой категории. Внешний SELECT использует этот результат как таблицу и оставляет категории со средней ценой от 100. Так расчёт и отбор разделены на два шага.

**Ожидаемый результат:**
  Два столбца: category, average_price. Две строки: Electronics — 235; Home — 109. Accessories не проходит условие, так как средняя цена равна 35.

**Типичная ошибка:**
  Забыть имя CTE после WITH или обратиться к average_price вне CTE, не создав этот столбец во внутреннем запросе.

**Вопрос для самопроверки:**
  Как долго существует CTE, объявленный через WITH?

**Блоки для сборки:**
  - WITH category_prices AS (
  - SELECT category, AVG(price) AS average_price
  - FROM products
  - GROUP BY category
  - )
  - SELECT category, average_price
  - FROM category_prices
  - WHERE average_price >= 100
  - ORDER BY average_price DESC, category;
  - CREATE TABLE category_prices AS
  - WHERE average_price > 100;

---

## Урок 19. Найди первый заказ каждого клиента

**Раздел:** Блок 5 · Аналитические запросы

**Тема:**
  ROW_NUMBER

**Что нового:**
  ROW_NUMBER — оконная функция, которая нумерует строки по выбранному порядку. PARTITION BY начинает нумерацию заново для каждой группы, а ORDER BY внутри OVER задаёт последовательность строк. Функция сохраняет детализацию и не объединяет заказы в одну строку.

**Синтаксис:**
  
```
SELECT customer_id,
  ROW_NUMBER() OVER (
    PARTITION BY customer_id
    ORDER BY order_date, order_id
  ) AS order_rank
FROM orders;
```

**Задание:**
  Для каждого клиента найди его самый ранний заказ. Покажи customer_id, order_id и order_date. Если даты совпадут, первым должен идти заказ с меньшим order_id.

**Подсказка:**
  Нумерация должна начинаться заново для каждого клиента. Самая ранняя дата должна получить номер 1; затем оставь только эту строку из каждой группы.

**Решение:**
  
```
WITH ranked_orders AS (
  SELECT customer_id, order_id, order_date,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY order_date, order_id
    ) AS order_rank
  FROM orders
  WHERE customer_id IS NOT NULL
)
SELECT customer_id, order_id, order_date
FROM ranked_orders
WHERE order_rank = 1
ORDER BY customer_id;
```

**Объяснение:**
  PARTITION BY делит заказы по customer_id, а сортировка внутри окна ставит ранний заказ первым. ROW_NUMBER присваивает ему номер 1. Внешний запрос оставляет по одной строке на каждого клиента; строки без customer_id исключены.

**Ожидаемый результат:**
  Три столбца: customer_id, order_id, order_date; 11 строк — по одной на каждого клиента с заказом. Примеры: 1 — 1001 — 2025-01-03; 2 — 1002 — 2025-01-05; 6 — 1008 — 2025-03-11.

**Типичная ошибка:**
  Использовать ROW_NUMBER без PARTITION BY: тогда номер 1 будет только у одной строки во всей таблице, а не у первого заказа каждого клиента.

**Вопрос для самопроверки:**
  Что делает PARTITION BY внутри оконной функции?

**Блоки для сборки:**
  - WITH ranked_orders AS (
  - SELECT customer_id, order_id, order_date,
  - ROW_NUMBER() OVER (
  - PARTITION BY customer_id
  - ORDER BY order_date, order_id
  - ) AS order_rank
  - FROM orders
  - WHERE customer_id IS NOT NULL
  - )
  - SELECT customer_id, order_id, order_date
  - FROM ranked_orders
  - WHERE order_rank = 1
  - ORDER BY customer_id;
  - SELECT customer_id, order_id, order_date,
  - ROW_NUMBER() OVER (
  - PARTITION BY customer_id
  - ORDER BY order_date, order_id
  - ) AS order_rank
  - FROM orders
  - WHERE customer_id IS NOT NULL

---

## Урок 20. Сравни число платежей с прошлым месяцем

**Раздел:** Блок 5 · Аналитические запросы

**Тема:**
  LAG

**Что нового:**
  LAG возвращает значение из предыдущей строки упорядоченного окна. По умолчанию функция смотрит на одну строку назад, а если предыдущей строки нет, возвращает NULL. Порядок строк задаёт ORDER BY внутри OVER; функция не ищет календарную дату самостоятельно.

**Синтаксис:**
  
```
SELECT month,
  LAG(payment_count) OVER (ORDER BY month) AS previous_count
FROM monthly_counts;
```

**Задание:**
  Посчитай количество платежей за каждый месяц и добавь previous_count — количество платежей в предыдущем месяце. Также выведи count_change — разницу между текущим и предыдущим месяцем.

**Подсказка:**
  Сначала получи одну строку с количеством платежей на каждый месяц. Затем возьми значение из предыдущей строки, расположив месяцы по порядку.

**Решение:**
  
```
WITH monthly_counts AS (
  SELECT STRFTIME('%Y-%m', payment_date) AS month,
    COUNT(*) AS payment_count
  FROM payments
  GROUP BY STRFTIME('%Y-%m', payment_date)
)
SELECT month, payment_count,
  LAG(payment_count) OVER (ORDER BY month) AS previous_count,
  payment_count - LAG(payment_count) OVER (ORDER BY month) AS count_change
FROM monthly_counts
ORDER BY month;
```

**Объяснение:**
  CTE monthly_counts считает платежи за каждый месяц. LAG берёт количество из предыдущей строки, а разность показывает изменение. У первого месяца нет предыдущей строки, поэтому два поля сравнения будут NULL.

**Ожидаемый результат:**
  Четыре столбца: month, payment_count, previous_count, count_change. Пять строк: 2025-01 — 3 — NULL — NULL; 2025-02 — 2 — 3 — -1; 2025-03 — 2 — 2 — 0; 2025-04 — 2 — 2 — 0; 2025-05 — 2 — 2 — 0.

**Типичная ошибка:**
  Считать, что LAG автоматически подставляет ноль. По умолчанию для первой строки окна возвращается NULL.

**Вопрос для самопроверки:**
  Что вернёт LAG для первой строки окна, если запасное значение не задано?

**Блоки для сборки:**
  - WITH monthly_counts AS (
  - SELECT STRFTIME('%Y-%m', payment_date) AS month,
  - COUNT(*) AS payment_count
  - FROM payments
  - GROUP BY STRFTIME('%Y-%m', payment_date)
  - )
  - SELECT month, payment_count,
  - LAG(payment_count) OVER (ORDER BY month) AS previous_count,
  - payment_count - LAG(payment_count) OVER (ORDER BY month) AS count_change
  - FROM monthly_counts
  - ORDER BY month;
  - LAG(payment_count) OVER (ORDER BY payment_count) AS previous_count,
  - ORDER BY month DESC;
  - GROUP BY payment_date;

---

## Урок 21. Рассчитай накопительную сумму платежей

**Раздел:** Блок 5 · Аналитические запросы

**Тема:**
  SUM OVER

**Что нового:**
  Обычная SUM с GROUP BY объединяет строки, а SUM с OVER вычисляет показатель для каждой строки и сохраняет детализацию. Для накопительного итога задают порядок и рамку окна от первой строки до текущей: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.

**Синтаксис:**
  
```
SELECT payment_id,
  SUM(paid_amount) OVER (
    ORDER BY payment_date, payment_id
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_paid
FROM payments;
```

**Задание:**
  Покажи payment_id, payment_date, paid_amount и running_paid — накопительную сумму платежей по времени. При одинаковой дате первым должен идти меньший payment_id.

**Подсказка:**
  Накопительное значение включает все платежи с начала списка до текущей строки. Вспомни, как задать порядок строк и границы окна.

**Решение:**
  
```
SELECT payment_id, payment_date, paid_amount,
  SUM(paid_amount) OVER (
    ORDER BY payment_date, payment_id
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_paid
FROM payments
ORDER BY payment_date, payment_id;
```

**Объяснение:**
  SUM работает как оконная функция из-за OVER и возвращает отдельное накопительное значение для каждой строки. Рамка начинается с первой строки и заканчивается текущей. payment_id разрешает совпадения дат.

**Ожидаемый результат:**
  Четыре столбца: payment_id, payment_date, paid_amount, running_paid; 11 строк. Первые накопительные значения: 120; 195.5; 435.5. Последнее значение — 2775.5.

**Типичная ошибка:**
  Использовать SUM без OVER: запрос свернёт все платежи в один итог, а не рассчитает накопительное значение для каждой строки.

**Вопрос для самопроверки:**
  Почему здесь SUM не должна объединять платежи в одну строку?

**Блоки для сборки:**
  - SELECT payment_id, payment_date, paid_amount,
  - SUM(paid_amount) OVER (
  - ORDER BY payment_date, payment_id
  - ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  - ) AS running_paid
  - FROM payments
  - ORDER BY payment_date, payment_id;
  - SUM(paid_amount) OVER (
  - ORDER BY payment_date, payment_id
  - ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  - ) AS running_paid
  - SUM(paid_amount)

---

## Урок 22. Найди повторяющиеся цены позиций

**Раздел:** Блок 5 · Аналитические запросы

**Тема:**
  GROUP BY · HAVING

**Что нового:**
  Чтобы найти повторяющиеся значения, сгруппируй строки по проверяемому полю и посчитай размер каждой группы. HAVING оставляет только группы, в которых больше одной строки. В отличие от простой сортировки, этот способ сразу показывает количество повторов.

**Синтаксис:**
  
```
SELECT unit_price, COUNT(*) AS items_count
FROM order_items
GROUP BY unit_price
HAVING COUNT(*) > 1;
```

**Задание:**
  Найди цены за единицу, которые встречаются более чем в одной позиции заказа. Покажи unit_price и items_count, отсортируй по цене по возрастанию.

**Подсказка:**
  Собери позиции с одинаковой unit_price в группы и посчитай строки каждой группы. Оставь только значения, которые встречаются повторно.

**Решение:**
  
```
SELECT unit_price, COUNT(*) AS items_count
FROM order_items
GROUP BY unit_price
HAVING COUNT(*) > 1
ORDER BY unit_price;
```

**Объяснение:**
  GROUP BY объединяет позиции с одинаковой ценой. COUNT(*) считает строки каждой группы, а HAVING оставляет цены, которые встретились больше одного раза. ORDER BY располагает найденные цены по возрастанию.

**Ожидаемый результат:**
  Два столбца: unit_price, items_count. Четыре строки: 25 — 2; 45 — 2; 120 — 2; 180 — 2.

**Типичная ошибка:**
  Оставить только GROUP BY: тогда появятся и цены, которые встречаются один раз. Условие на количество повторов нужно добавить после группировки.

**Вопрос для самопроверки:**
  Почему для отбора повторяющихся цен используется HAVING, а не WHERE?

**Блоки для сборки:**
  - SELECT unit_price, COUNT(*) AS items_count
  - FROM order_items
  - GROUP BY unit_price
  - HAVING COUNT(*) > 1
  - ORDER BY unit_price;
  - WHERE COUNT(*) > 1;
  - HAVING COUNT(*) = 1;

---

## Урок 23. Посчитай остаток после успешных платежей

**Раздел:** Блок 5 · Аналитические запросы

**Тема:**
  COALESCE · сверка оплат

**Что нового:**
  После LEFT JOIN заказ может не иметь успешного платежа, поэтому сумма из правой таблицы будет NULL. COALESCE позволяет заменить такую сумму нулём. Разница между суммой заказа и успешными платежами показывает остаток, который ещё не покрыт успешной оплатой.

**Синтаксис:**
  
```
SELECT COALESCE(paid_total, 0) AS paid_total
FROM paid_by_order;
```

**Задание:**
  Для каждого заказа покажи order_id, total_amount, paid_total — сумму успешных платежей — и remaining_amount — остаток к оплате. Если успешных платежей нет, считай paid_total равным нулю. Сохрани все заказы.

**Подсказка:**
  Сначала сгруппируй только успешные платежи по заказу. Затем сохрани каждый заказ через LEFT JOIN и замени отсутствующую сумму на ноль перед вычитанием.

**Решение:**
  
```
WITH paid_by_order AS (
  SELECT order_id, SUM(paid_amount) AS paid_total
  FROM payments
  WHERE payment_status = 'Paid'
  GROUP BY order_id
)
SELECT o.order_id, o.total_amount,
  COALESCE(p.paid_total, 0) AS paid_total,
  o.total_amount - COALESCE(p.paid_total, 0) AS remaining_amount
FROM orders o
LEFT JOIN paid_by_order p ON p.order_id = o.order_id
ORDER BY o.order_id;
```

**Объяснение:**
  CTE paid_by_order считает только платежи со статусом Paid. LEFT JOIN сохраняет все заказы, а COALESCE заменяет отсутствующую сумму нулём. remaining_amount показывает, сколько суммы заказа ещё не покрыто успешной оплатой.

**Ожидаемый результат:**
  Четыре столбца: order_id, total_amount, paid_total, remaining_amount; все 17 заказов. Примеры: 1001 — 120 — 120 — 0; 1002 — 75.5 — 0 — 75.5; 1008 — 420 — 400 — 20; 1011 — 260 — 0 — 260; 1017 — 40 — 0 — 40.

**Типичная ошибка:**
  Использовать INNER JOIN: тогда заказы без успешного платежа исчезнут. Если вычитать NULL напрямую, результат тоже будет NULL.

**Вопрос для самопроверки:**
  Почему LEFT JOIN важен, когда нужно показать даже заказы без успешных платежей?

**Блоки для сборки:**
  - WITH paid_by_order AS (
  - SELECT order_id, SUM(paid_amount) AS paid_total
  - FROM payments
  - WHERE payment_status = 'Paid'
  - GROUP BY order_id
  - )
  - SELECT o.order_id, o.total_amount,
  - COALESCE(p.paid_total, 0) AS paid_total,
  - o.total_amount - COALESCE(p.paid_total, 0) AS remaining_amount
  - FROM orders o
  - LEFT JOIN paid_by_order p ON p.order_id = o.order_id
  - ORDER BY o.order_id;
  - SELECT order_id, SUM(paid_amount) AS paid_total
  - FROM payments
  - WHERE payment_status = 'Paid'
  - GROUP BY order_id
  - COALESCE(p.paid_total, 0) AS paid_total,
  - o.total_amount - COALESCE(p.paid_total, 0) AS remaining_amount
  - INNER JOIN paid_by_order p

---

## Урок 24. Собери общую сводку по учебной базе

**Раздел:** Блок 5 · Аналитические запросы

**Тема:**
  Скалярные подзапросы

**Что нового:**
  Скалярный подзапрос возвращает одно значение и может использоваться как отдельный столбец основного SELECT. Каждый такой запрос заключают в круглые скобки. Несколько независимых подзапросов позволяют собрать показатели из разных таблиц в одну строку.

**Синтаксис:**
  
```
SELECT
  (SELECT COUNT(*) FROM customers) AS total_customers,
  (SELECT COUNT(*) FROM products) AS total_products;
```

**Задание:**
  Верни одну строку с тремя показателями: total_customers — число клиентов, total_products — число товаров и total_payments — число записей о платежах.

**Подсказка:**
  Каждый показатель нужно вычислить отдельным коротким запросом, возвращающим одно число. Размести эти запросы в списке столбцов внешнего SELECT.

**Решение:**
  
```
SELECT
  (SELECT COUNT(*) FROM customers) AS total_customers,
  (SELECT COUNT(*) FROM products) AS total_products,
  (SELECT COUNT(*) FROM payments) AS total_payments;
```

**Объяснение:**
  Каждый подзапрос считает строки в своей таблице и возвращает одно число. Внешний SELECT собирает три значения в одну строку, поэтому таблицы соединять не требуется.

**Ожидаемый результат:**
  Одна строка с тремя столбцами: total_customers, total_products, total_payments. Значения: 12, 6, 11.

**Типичная ошибка:**
  Написать три отдельных SELECT: тогда будут три разных результата, а не одна строка с тремя показателями.

**Вопрос для самопроверки:**
  Сколько значений должен вернуть скалярный подзапрос?

**Блоки для сборки:**
  - SELECT
  - (SELECT COUNT(*) FROM customers) AS total_customers,
  - (SELECT COUNT(*) FROM products) AS total_products,
  - (SELECT COUNT(*) FROM payments) AS total_payments;
  - (SELECT COUNT(*) FROM customers) AS total_customers,
  - (SELECT COUNT(*) FROM products) AS total_products,
  - (SELECT COUNT(*) FROM payments) AS total_payments;
  - SELECT COUNT(*) FROM customers;
  - JOIN payments

---
