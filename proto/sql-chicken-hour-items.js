// Extracted verbatim from sql/index.html on 2026-07-27. Do not hand-edit.
// Regenerate: see the sed ranges in proto/README-chicken-hour.md
const SCHEMA = `
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  status TEXT,
  orders INTEGER
);
INSERT INTO customers VALUES
('C001','Alice Chen','alice@example.com','active',7),
('C002','Bob Martinez','bob@example.com','inactive',1),
('C003','Carol White','carol@example.com','active',3),
('C004','David Kim','david@example.com','active',12),
('C005','Eva Ross',NULL,'inactive',0),
('C006','Frank Liu','frank@example.com','active',2),
('C007','Grace Park','grace@example.com','active',5),
('C008','Henry Brown','henry@example.com','inactive',1);

CREATE TABLE orders (
  order_id TEXT PRIMARY KEY,
  customer_id TEXT,
  order_date TEXT,
  amount DECIMAL
);
INSERT INTO orders VALUES
('O001','C001','2024-01-15',120.00),
('O002','C003','2024-01-22',45.00),
('O003','C001','2024-02-03',200.00),
('O004','C004','2024-02-10',89.50),
('O005','C007','2024-02-18',310.00);

CREATE TABLE customers_old (
  id TEXT PRIMARY KEY,
  name TEXT,
  status TEXT
);
INSERT INTO customers_old VALUES
('C001','Alice Chen','active'),
('C002','Bob Martinez','inactive'),
('C003','Carol White','active'),
('C004','David Kim','active'),
('C005','Eva Ross','inactive'),
('C006','Frank Liu','active'),
('C007','Grace Park','active'),
('C008','Henry Brown','inactive'),
('C009','Irene Scott','active'),
('C010','James Lee','inactive');
`;

function seedSalesData(db){
  db.run(`
    CREATE TABLE products (
      product_id TEXT PRIMARY KEY,
      name TEXT,
      category TEXT,
      price REAL
    );
    INSERT INTO products VALUES
    ('P01','House Blend Beans','Coffee',14.00),
    ('P02','Single Origin Ethiopia','Coffee',19.50),
    ('P03','Decaf Dark Roast','Coffee',15.00),
    ('P04','Cold Brew Concentrate','Coffee',11.00),
    ('P05','Earl Grey Tin','Tea',9.50),
    ('P06','Jasmine Green Tin','Tea',10.50),
    ('P07','Chai Sampler','Tea',12.00),
    ('P08','Pour-Over Kettle','Equipment',42.00),
    ('P09','Burr Grinder','Equipment',89.00),
    ('P10','French Press','Equipment',28.00),
    ('P11','Logo Mug','Merch',13.00),
    ('P12','Canvas Tote','Merch',18.00);
    CREATE TABLE sales (
      sale_id INTEGER PRIMARY KEY,
      product_id TEXT,
      customer_id TEXT,
      sale_date TEXT,
      qty INTEGER,
      region TEXT,
      amount REAL
    );`);
  const prices={P01:14,P02:19.5,P03:15,P04:11,P05:9.5,P06:10.5,P07:12,P08:42,P09:89,P10:28,P11:13,P12:18};
  const pids=Object.keys(prices);
  const custs=['C001','C002','C003','C004','C005','C006','C007','C008','C009','C010'];
  const regions=['North','South','East','West'];
  let s=42; const rnd=()=>{ s=(s*1103515245+12345)%2147483648; return s/2147483648; };
  const rows=[];
  for(let i=1;i<=180;i++){
    const pid=pids[Math.floor(rnd()*pids.length)];
    const cid=custs[Math.floor(rnd()*custs.length)];
    const month=1+Math.floor(rnd()*6);
    const day=1+Math.floor(rnd()*28);
    const date=`2024-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const qty=1+Math.floor(rnd()*4);
    const region=rnd()<0.08?null:regions[Math.floor(rnd()*4)];
    const amount=Math.round(qty*prices[pid]*100)/100;
    rows.push(`(${i},'${pid}','${cid}','${date}',${qty},${region?`'${region}'`:'NULL'},${amount})`);
  }
  db.run(`INSERT INTO sales VALUES ${rows.join(',')};`);
}

const CARD_DRILLS = {
"SELECT":{tries:[
 {p:"Return just the name column from products.",sql:"SELECT name FROM products;"},
 {p:"Return name AND price from products.",sql:"SELECT name, price FROM products;"},
 {p:"Return every column from sales (peek at the table).",sql:"SELECT * FROM sales;"}]},
"FROM":{tries:[
 {p:"Посчитайте ряды в продуктах.",sql:"SELECT COUNT(*) FROM products;"},
 {p:"Теперь посчитаем строки в продажах — тот же запрос, другой FROM.",sql:"SELECT COUNT(*) FROM sales;"},
 {p:"И клиенты_старые.",sql:"SELECT COUNT(*) FROM customers_old;"}]},
"WHERE":{tries:[
 {p:"Товары в категории 'Чай'.",sql:"SELECT * FROM products WHERE category = 'Tea';"},
 {p:"Товары стоимостью более 20.",sql:"SELECT * FROM products WHERE price > 20;"},
 {p:"Продажи в Северном регионе при количестве от 3-х штук.",sql:"SELECT * FROM sales WHERE region = 'North' AND qty >= 3;"}]},
"ORDER BY":{tries:[
 {p:"Товары от самых дешевых до самых дорогих.",sql:"SELECT name, price FROM products ORDER BY price;"},
 {p:"Сначала самый дорогой (DESC).",sql:"SELECT name, price FROM products ORDER BY price DESC;"},
 {p:"Продажи сортируются по регионам, а затем суммируются в порядке убывания в каждом регионе.",sql:"SELECT region, amount FROM sales ORDER BY region, amount DESC;"}]},
"LIMIT":{tries:[
 {p:"5 крупнейших продаж по сумме.",sql:"SELECT * FROM sales ORDER BY amount DESC LIMIT 5;"},
 {p:"3 самых дешевых продукта.",sql:"SELECT name, price FROM products ORDER BY price LIMIT 3;"}]},
"INNER JOIN":{tries:[
 {p:"Сумма каждой продажи с названием продукта.",sql:"SELECT p.name, s.amount FROM sales s INNER JOIN products p ON s.product_id = p.product_id;"},
 {p:"Каждая продажа с указанием имени клиента (таблица клиентов).",sql:"SELECT c.name, s.amount FROM sales s INNER JOIN customers c ON s.customer_id = c.id;"}]},
"LEFT JOIN":{tries:[
 {p:"ВСЕ клиенты_старые строки с любыми продажами, которые они совершили — оставьте клиентов без ни одного.",sql:"SELECT co.name, s.sale_id FROM customers_old co LEFT JOIN sales s ON co.id = s.customer_id;"},
 {p:"Все товары с их продажами; продукт с нулевыми продажами все равно появится.",sql:"SELECT p.name, s.sale_id FROM products p LEFT JOIN sales s ON p.product_id = s.product_id;"}]},
"ON":{tries:[
 {p:"Объедините продажи с продуктами — предложение ON соединяет product_id с product_id.",sql:"SELECT p.category, s.amount FROM sales s JOIN products p ON s.product_id = p.product_id;"},
 {p:"Объедините продажи с клиентами — на этот раз ON соединяет customer_id с customer.id (разные имена столбцов!).",sql:"SELECT c.name, s.sale_date FROM sales s JOIN customers c ON s.customer_id = c.id;"}]},
"GROUP BY":{tries:[
 {p:"Количество продаж по регионам.",sql:"SELECT region, COUNT(*) AS n FROM sales GROUP BY region;"},
 {p:"Количество товаров в категории.",sql:"SELECT category, COUNT(*) AS n FROM products GROUP BY category;"},
 {p:"Общий доход по Product_id.",sql:"SELECT product_id, SUM(amount) AS revenue FROM sales GROUP BY product_id;"}]},
"COUNT(*)":{tries:[
 {p:"Сколько строк продаж?",sql:"SELECT COUNT(*) FROM sales;"},
 {p:"Сколько продаж имеют NULL-регион? (COUNT(*) считает их; COUNT(регион) — нет.)",sql:"SELECT COUNT(*) FROM sales WHERE region IS NULL;"},
 {p:"Сравните: COUNT(*) и COUNT(region) по всем продажам — определите НУЛЕВОЙ разрыв.",sql:"SELECT COUNT(*) AS all_rows, COUNT(region) AS with_region FROM sales;"}]},
"SUM(col)":{tries:[
 {p:"Общий доход по всем продажам.",sql:"SELECT SUM(amount) FROM sales;"},
 {p:"Общее количество проданных единиц (кол-во).",sql:"SELECT SUM(qty) FROM sales;"},
 {p:"Общий доход только для Восточного региона.",sql:"SELECT SUM(amount) FROM sales WHERE region = 'East';"}]},
"AVG(col)":{tries:[
 {p:"Средняя сумма продажи.",sql:"SELECT AVG(amount) FROM sales;"},
 {p:"Средняя цена продукта.",sql:"SELECT AVG(price) FROM products;"},
 {p:"Среднее количество по региону.",sql:"SELECT region, AVG(qty) FROM sales GROUP BY region;"}]},
"HAVING":{tries:[
 {p:"Регионы с более чем 40 продажами.",sql:"SELECT region, COUNT(*) AS n FROM sales GROUP BY region HAVING COUNT(*) > 40;"},
 {p:"Товары (по Product_id), общий доход которых превышает 500.",sql:"SELECT product_id, SUM(amount) AS rev FROM sales GROUP BY product_id HAVING SUM(amount) > 500;"}]},
"DISTINCT":{tries:[
 {p:"Отдельные регионы продаж (обратите внимание, что также отображается NULL).",sql:"SELECT DISTINCT region FROM sales;"},
 {p:"Отличительные идентификаторы клиентов, которые действительно что-то купили.",sql:"SELECT DISTINCT customer_id FROM sales ORDER BY customer_id;"}]},
"CASE WHEN":{tries:[
 {p:"Обозначьте каждый продукт как «премиум», если цена >= 25, в противном случае — как «стандарт».",sql:"SELECT name, price, CASE WHEN price >= 25 THEN 'premium' ELSE 'standard' END AS tier FROM products;"},
 {p:"Пакетные продажи: «большие», если сумма >= 100, «средние», если >= 40, иначе «маленькие».",sql:"SELECT amount, CASE WHEN amount >= 100 THEN 'big' WHEN amount >= 40 THEN 'medium' ELSE 'small' END AS size FROM sales;"}]},
"COALESCE":{tries:[
 {p:"Покажите регион, но замените NULL на «Не назначено».",sql:"SELECT sale_id, COALESCE(region, 'Unassigned') AS region FROM sales;"},
 {p:"Электронная почта клиентов, возвращается к «(нет электронной почты)» — у Евы NULL.",sql:"SELECT name, COALESCE(email, '(no email)') AS contact FROM customers;"}]},
"NULL":{tries:[
 {p:"Продажи без указания региона.",sql:"SELECT * FROM sales WHERE region IS NULL;"},
 {p:"Докажите, что = NULL ничего не находит (0 строк) — тогда не забудьте использовать IS NULL.",sql:"SELECT COUNT(*) FROM sales WHERE region = NULL;"}]},
"IS NULL":{tries:[
 {p:"Клиенты, у которых нет электронной почты в файле.",sql:"SELECT name FROM customers WHERE email IS NULL;"},
 {p:"Продажи, у которых ЕСТЬ регион (НЕ НУЛЬ).",sql:"SELECT COUNT(*) FROM sales WHERE region IS NOT NULL;"}]},
"Subquery":{tries:[
 {p:"Продажи выше средней суммы продажи.",sql:"SELECT * FROM sales WHERE amount > (SELECT AVG(amount) FROM sales);"},
 {p:"Продукты дороже, чем средний продукт.",sql:"SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);"}]},
"IN":{tries:[
 {p:"Товары в категориях Кофе или Чай.",sql:"SELECT name, category FROM products WHERE category IN ('Coffee','Tea');"},
 {p:"Клиенты, которые появляются в таблице продаж (IN + подзапрос).",sql:"SELECT name FROM customers WHERE id IN (SELECT DISTINCT customer_id FROM sales);"}]},
"CTE (WITH)":{tries:[
 {p:"CTE дохода по продукту, затем выберите из него строки более 400.",sql:"WITH product_rev AS (\n  SELECT product_id, SUM(amount) AS rev\n  FROM sales GROUP BY product_id\n)\nSELECT * FROM product_rev WHERE rev > 400;"},
 {p:"CTE ежемесячного дохода (strftime '%m'), затем выберите лучший месяц.",sql:"WITH monthly AS (\n  SELECT strftime('%m', sale_date) AS month, SUM(amount) AS rev\n  FROM sales GROUP BY month\n)\nSELECT * FROM monthly ORDER BY rev DESC LIMIT 1;"}]},
"ROW_NUMBER()":{tries:[
 {p:"Пронумеруйте каждую продажу от самой большой суммы к самой маленькой.",sql:"SELECT sale_id, amount, ROW_NUMBER() OVER (ORDER BY amount DESC) AS rn FROM sales;"},
 {p:"Ранжируйте товары по цене внутри всей таблицы.",sql:"SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC) AS price_rank FROM products;"}]},
"OVER (...)":{tries:[
 {p:"Каждая продажа рядом с общей средней суммой (GROUP BY не требуется).",sql:"SELECT sale_id, amount, AVG(amount) OVER () AS overall_avg FROM sales;"},
 {p:"Промежуточная сумма дохода по дате.",sql:"SELECT sale_date, amount, SUM(amount) OVER (ORDER BY sale_date, sale_id) AS running_total FROM sales;"}]},
"PARTITION BY":{tries:[
 {p:"Число продаж 1,2,3… возобновляется в каждом регионе.",sql:"SELECT region, amount, ROW_NUMBER() OVER (PARTITION BY region ORDER BY amount DESC) AS rn FROM sales;"},
 {p:"Цена каждого продукта рядом со средней по категории.",sql:"SELECT name, category, price, AVG(price) OVER (PARTITION BY category) AS cat_avg FROM products;"}]},
"Alias (AS)":{tries:[
 {p:"Переименуйте SUM(сумма) во что-нибудь читаемое.",sql:"SELECT SUM(amount) AS total_revenue FROM sales;"},
 {p:"Псевдонимы таблиц: сокращайте продажи до s, а продукты до p в соединении.",sql:"SELECT p.name, s.qty FROM sales AS s JOIN products AS p ON s.product_id = p.product_id;"}]},
"PRIMARY KEY":{tries:[
 {p:"Проверьте определение таблицы продуктов — какой столбец является PK? (PRAGMA показывает pk=1.)",sql:"PRAGMA table_info (продукты);"},
 {p:"Докажите уникальность: посчитайте строки и отдельные Product_ids — они совпадают.",sql:"SELECT COUNT(*) AS rows_, COUNT(DISTINCT product_id) AS distinct_ids FROM products;"}]},
"FOREIGN KEY":{tries:[
 {p:"sales.customer_id ссылается на customer.id — найдите «бесхозные» продажи, чьи клиенты НЕ входят в число клиентов (они есть только в списке customer_old!).",sql:"SELECT DISTINCT s.customer_id FROM sales s LEFT JOIN customers c ON s.customer_id = c.id WHERE c.id IS NULL;"},
 {p:"Следуйте счастливому направлению FK: каждая продажа со статусом своего клиента.",sql:"SELECT s.sale_id, c.name, c.status FROM sales s JOIN customers c ON s.customer_id = c.id;"}]},
"Reconciliation":{tries:[
 {p:"Согласны ли клиенты и клиенты_old относительно количества строк?",sql:"SELECT (SELECT COUNT(*) FROM customers) AS current_, (SELECT COUNT(*) FROM customers_old) AS old_;"},
 {p:"Кто есть в списке customer_old, но отсутствует в списке клиентов?",sql:"SELECT co.id, co.name FROM customers_old co LEFT JOIN customers c ON co.id = c.id WHERE c.id IS NULL;"},
 {p:"Соответствует ли СУММА (сумма) СУММЕ (количество × цена)? Классическая проверка итогов.",sql:"SELECT ROUND(SUM(s.amount),2) AS stored, ROUND(SUM(s.qty * p.price),2) AS computed FROM sales s JOIN products p ON s.product_id = p.product_id;"}]},
"RIGHT JOIN":{tries:[
 {p:"RIGHT JOIN сохраняет каждую строку таблицы RIGHT: всех клиентов_старых, совпадающих или нет.",sql:"SELECT s.sale_id, co.name FROM sales s RIGHT JOIN customers_old co ON s.customer_id = co.id;"},
 {p:"Тот же результат перевернут, что и LEFT JOIN — обычная перезапись.",sql:"SELECT s.sale_id, co.name FROM customers_old co LEFT JOIN sales s ON s.customer_id = co.id;"}]},
"FULL OUTER JOIN":{tries:[
 {p:"Все клиенты И все клиенты_старые, по возможности сопоставлены.",sql:"SELECT c.id AS cur_id, co.id AS old_id FROM customers c FULL OUTER JOIN customers_old co ON c.id = co.id;"},
 {p:"Отфильтруйте это только по несовпадениям — строки отсутствуют с обеих сторон.",sql:"SELECT c.id AS cur_id, co.id AS old_id FROM customers c FULL OUTER JOIN customers_old co ON c.id = co.id WHERE c.id IS NULL OR co.id IS NULL;"}]},
"CURDATE()":{note:"CURDATE() — это MySQL. В этой лабораторной работе используется SQLite, эквивалент которого: <code>дата('сейчас')</code> — попрактикуйтесь в написании этой идеи в SQLite.",tries:[
 {p:"Сегодняшняя дата (написание SQLite).",sql:"ВЫБРАТЬ дату('сейчас') КАК сегодня;"},
 {p:"Продажи осуществлены до сегодняшнего дня (все — данные за 2024 год).",sql:"SELECT COUNT(*) FROM sales WHERE sale_date < date('now');"}]},
"DATE_SUB(date, INTERVAL n unit)":{note:"DATE_SUB — это MySQL. SQLite использует модификаторы даты: <code>date('сейчас','-30 дней')</code>.",tries:[
 {p:"Дата 30 дней назад.",sql:"SELECT date('now','-30 day') AS thirty_days_ago;"},
 {p:"Продажи в течение 90 дней после 01 марта 2024 г. (дата + модификатор в литерале).",sql:"SELECT COUNT(*) FROM sales WHERE sale_date >= '2024-03-01' AND sale_date < date('2024-03-01','+90 day');"}]},
"DATE_FORMAT(date, format)":{note:"DATE_FORMAT — это MySQL. SQLite использует <code>strftime(формат, дата)</code> — %Y-%m дает «2024-03».",tries:[
 {p:"Месяц каждой распродажи в стиле «2024-03».",sql:"SELECT sale_date, strftime('%Y-%m', sale_date) AS month FROM sales;"},
 {p:"Доход в месяц — образец даты аналитика №1.",sql:"SELECT strftime('%Y-%m', sale_date) AS month, SUM(amount) AS revenue FROM sales GROUP BY month ORDER BY month;"}]},
"DATEDIFF(date1, date2)":{note:"DATEDIFF — это MySQL. SQLite: вычтите значения julianday(), чтобы получить количество дней между датами.",tries:[
 {p:"Дни с 1 января по 30 июня 2024 г.",sql:"SELECT julianday('2024-06-30') - julianday('2024-01-01') AS days_between;"},
 {p:"Количество дней с момента первой покупки каждого клиента по отношению к 1 июля 2024 г.",sql:"SELECT customer_id, CAST(julianday('2024-07-01') - julianday(MIN(sale_date)) AS INTEGER) AS days_since_first FROM sales GROUP BY customer_id;"}]},
"Index":{tries:[
 {p:"Проверьте план запроса для фильтра региона — SCAN означает полное сканирование таблицы.",sql:"EXPLAIN QUERY PLAN SELECT * FROM sales WHERE region = 'North';"},
 {p:"Создайте индекс по региону, затем повторно запустите план — он станет ПОИСК… ИСПОЛЬЗОВАНИЕ ИНДЕКСА.",sql:"CREATE INDEX IF NOT EXISTS idx_sales_region ON sales(region);\nEXPLAIN QUERY PLAN SELECT * FROM sales WHERE region = 'North';"}]},
"Composite index":{tries:[
 {p:"Создайте индекс из двух столбцов (регион, дата_продажи) и проверьте план запроса, фильтрующего оба столбца.",sql:"CREATE INDEX IF NOT EXISTS idx_sales_region_date ON sales(region, sale_date);\nEXPLAIN QUERY PLAN SELECT * FROM sales WHERE region = 'East' AND sale_date >= '2024-03-01';"},
 {p:"Порядок столбцов имеет значение: фильтрация ТОЛЬКО sale_date не может использовать передний столбец этого индекса.",sql:"EXPLAIN QUERY PLAN SELECT * FROM sales WHERE sale_date >= '2024-03-01';"}]},
"Temporary Table":{tries:[
 {p:"Создайте временную таблицу крупных продаж и затем запросите ее.",sql:"CREATE TEMP TABLE IF NOT EXISTS big_sales AS SELECT * FROM sales WHERE amount >= 100;\nSELECT COUNT(*) FROM big_sales;"},
 {p:"Используйте временную таблицу в объединении, как и любую другую таблицу.",sql:"SELECT p.name, COUNT(*) AS big_sale_count FROM big_sales b JOIN products p ON b.product_id = p.product_id GROUP BY p.name ORDER BY big_sale_count DESC;"}]},
"View":{tries:[
 {p:"Создайте представление дохода по категориям, а затем ВЫБЕРИТЕ из него.",sql:"CREATE VIEW IF NOT EXISTS category_revenue AS\nSELECT p.category, SUM(s.amount) AS revenue\nFROM sales s JOIN products p ON s.product_id = p.product_id\nGROUP BY p.category;\nSELECT * FROM category_revenue ORDER BY revenue DESC;"},
 {p:"Представления повторяются в реальном времени: фильтруйте представление как таблицу.",sql:"SELECT * FROM category_revenue WHERE revenue > 900;"}]}
};
