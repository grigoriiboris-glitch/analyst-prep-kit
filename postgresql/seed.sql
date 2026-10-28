-- Учебная схема интернет-магазина для практики PostgreSQL.
-- Данные вымышлены. Скрипт предназначен только для локальной учебной базы PGlite.
CREATE TABLE customers (
  id integer PRIMARY KEY,
  full_name text NOT NULL,
  city text NOT NULL,
  signup_date date NOT NULL,
  email text NOT NULL UNIQUE,
  segment text NOT NULL CHECK (segment IN ('retail','smb','enterprise')),
  active boolean NOT NULL DEFAULT true,
  profile jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE products (
  id integer PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  tags text[] NOT NULL DEFAULT '{}'::text[]
);
CREATE TABLE orders (
  id integer PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers(id),
  order_ts timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('paid','fulfilled','pending','cancelled','refunded')),
  channel text NOT NULL CHECK (channel IN ('web','mobile','store','partner')),
  coupon text
);
CREATE TABLE order_items (
  id integer PRIMARY KEY,
  order_id integer NOT NULL REFERENCES orders(id),
  product_id integer NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0)
);
CREATE TABLE payments (
  id integer PRIMARY KEY,
  order_id integer NOT NULL REFERENCES orders(id),
  paid_at timestamptz,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  status text NOT NULL CHECK (status IN ('authorized','captured','failed','refunded')),
  method text NOT NULL
);
CREATE TABLE support_tickets (
  id integer PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers(id),
  opened_at timestamptz NOT NULL,
  closed_at timestamptz,
  priority text NOT NULL CHECK (priority IN ('low','normal','high','urgent')),
  status text NOT NULL CHECK (status IN ('open','in_progress','closed')),
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE page_events (
  id integer PRIMARY KEY,
  customer_id integer REFERENCES customers(id),
  occurred_at timestamptz NOT NULL,
  event_name text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

INSERT INTO customers (id,full_name,city,signup_date,email,segment,active,profile) VALUES
(1,'Анна Кузнецова','Москва','2024-01-10','anna@example.ru','enterprise',true,'{"source":"organic","interests":["office","audio"]}'),
(2,'Борис Смирнов','Казань','2024-02-14','boris@example.ru','retail',true,'{"source":"ads","interests":["wireless"]}'),
(3,'Вера Орлова','Москва','2024-03-02','vera@example.ru','smb',false,'{"source":"referral","interests":["display"]}'),
(4,'Глеб Иванов','Санкт-Петербург','2024-05-21','gleb@example.ru','retail',true,'{"source":"organic","interests":["storage"]}'),
(5,'Дарья Волкова','Екатеринбург','2024-06-09','darya@example.ru','enterprise',true,'{"source":"partner","interests":["office","audio"]}'),
(6,'Егор Павлов','Москва','2024-07-17','egor@example.ru','smb',true,'{"source":"ads","interests":["office"]}'),
(7,'Жанна Фёдорова','Новосибирск','2024-08-05','zhanna@example.ru','retail',true,'{"source":"organic","interests":["cable"]}'),
(8,'Илья Соколов','Казань','2024-09-12','ilya@example.ru','smb',true,'{"source":"email","interests":["office"]}'),
(9,'Кира Морозова','Санкт-Петербург','2024-10-01','kira@example.com','retail',true,'{"source":"ads","interests":["display"]}'),
(10,'Лев Андреев','Москва','2024-11-20','lev@example.ru','enterprise',true,'{"source":"organic","interests":["office","storage"]}'),
(11,'Мария Белова','Пермь','2025-01-08','maria@example.ru','retail',true,'{"source":"referral","interests":["audio"]}'),
(12,'Никита Фролов','Москва','2025-02-03','nikita@example.ru','smb',true,'{"source":"partner","interests":["wireless"]}'),
(13,'Полина Захарова','Тюмень','2025-04-22','polina@example.com','retail',true,'{"source":"organic","interests":["ergonomics"]}');

INSERT INTO products (id,name,category,price,tags) VALUES
(1,'Клавиатура механическая','Периферия',4500.00,ARRAY['office','wired']::text[]),
(2,'Мышь беспроводная','Периферия',1800.00,ARRAY['office','wireless']::text[]),
(3,'Монитор 27 дюймов','Электроника',22000.00,ARRAY['office','display']::text[]),
(4,'SSD 1 ТБ','Хранение',7500.00,ARRAY['storage','fast']::text[]),
(5,'Наушники','Аудио',6500.00,ARRAY['audio','wireless']::text[]),
(6,'Кабель USB-C','Аксессуары',500.00,ARRAY['cable','usb-c']::text[]),
(7,'Кресло эргономичное','Мебель',18000.00,ARRAY['office','ergonomics']::text[]),
(8,'Док-станция','Аксессуары',9500.00,ARRAY['office','usb-c']::text[]);

INSERT INTO orders (id,customer_id,order_ts,status,channel,coupon) VALUES
(101,1,'2025-09-12 10:20:00+03','paid','web','WELCOME'),
(102,1,'2025-10-03 16:40:00+03','fulfilled','web',NULL),
(103,2,'2025-10-21 12:10:00+03','paid','mobile','AUTUMN'),
(104,2,'2025-11-01 09:15:00+03','cancelled','web',NULL),
(105,3,'2025-11-14 19:45:00+03','fulfilled','store','VIP'),
(106,4,'2025-12-02 11:00:00+03','paid','partner',NULL),
(107,5,'2025-12-19 14:20:00+03','pending','web',NULL),
(108,5,'2026-01-04 08:35:00+03','paid','mobile','NEWYEAR'),
(109,6,'2026-01-09 18:10:00+03','refunded','web','WELCOME'),
(110,6,'2026-01-20 10:50:00+03','fulfilled','store',NULL),
(111,7,'2026-01-27 13:25:00+03','paid','web','WINTER'),
(112,8,'2026-02-02 17:00:00+03','paid','mobile',NULL),
(113,8,'2026-02-05 09:05:00+03','cancelled','web',NULL),
(114,9,'2026-02-11 12:30:00+03','fulfilled','partner','VIP'),
(115,10,'2026-02-16 15:15:00+03','paid','web','WINTER'),
(116,10,'2026-02-18 21:10:00+03','pending','mobile',NULL),
(117,11,'2026-02-22 11:40:00+03','refunded','web',NULL),
(118,11,'2026-03-01 09:10:00+03','paid','store','WELCOME'),
(119,12,'2026-03-05 14:30:00+03','fulfilled','web',NULL),
(120,3,'2026-03-08 18:00:00+03','paid','mobile','SPRING');

INSERT INTO order_items (id,order_id,product_id,quantity,unit_price) VALUES
(201,101,1,1,4500),(202,101,2,2,1800),(203,102,3,1,22000),(204,102,6,2,500),
(205,103,2,1,1800),(206,103,5,1,6500),(207,104,6,1,500),(208,105,7,1,18000),
(209,105,1,1,4500),(210,106,4,2,7500),(211,107,8,1,9500),(212,108,3,1,22000),
(213,108,2,1,1800),(214,109,5,1,6500),(215,110,7,1,18000),(216,110,6,3,500),
(217,111,1,2,4500),(218,111,4,1,7500),(219,112,8,1,9500),(220,112,6,2,500),
(221,113,2,1,1800),(222,114,3,2,22000),(223,114,5,1,6500),(224,115,7,1,18000),
(225,115,8,1,9500),(226,116,4,1,7500),(227,117,5,1,6500),(228,118,1,1,4500),
(229,119,3,1,22000),(230,120,2,2,1800),(231,120,6,1,500);

INSERT INTO payments (id,order_id,paid_at,amount,status,method) VALUES
(301,101,'2025-09-12 10:20:10+03',8100,'captured','card'),
(302,102,'2025-10-03 16:42:00+03',23000,'captured','card'),
(303,103,'2025-10-21 12:12:00+03',8300,'captured','sbp'),
(304,105,'2025-11-14 19:46:00+03',22500,'captured','card'),
(305,106,'2025-12-02 11:04:00+03',15000,'captured','invoice'),
(306,108,'2026-01-04 08:37:00+03',23800,'captured','card'),
(307,109,'2026-01-09 18:15:00+03',6500,'refunded','card'),
(308,110,'2026-01-20 10:52:00+03',19500,'captured','sbp'),
(309,111,'2026-01-27 13:27:00+03',16500,'captured','card'),
(310,112,'2026-02-02 17:03:00+03',10500,'captured','sbp'),
(311,114,'2026-02-11 12:32:00+03',50500,'captured','card'),
(312,115,'2026-02-16 15:17:00+03',27500,'captured','card'),
(313,118,'2026-03-01 09:12:00+03',4500,'captured','cash'),
(314,120,'2026-03-08 18:03:00+03',4100,'captured','card');

INSERT INTO support_tickets (id,customer_id,opened_at,closed_at,priority,status,details) VALUES
(401,1,'2025-10-04 10:00:00+03','2025-10-04 13:00:00+03','normal','closed','{"topic":"delivery","channel":"email"}'),
(402,2,'2025-11-02 09:00:00+03',NULL,'high','open','{"topic":"refund","channel":"chat"}'),
(403,5,'2025-12-20 15:30:00+03','2025-12-21 11:00:00+03','urgent','closed','{"topic":"payment","channel":"phone"}'),
(404,8,'2026-02-06 12:20:00+03',NULL,'low','in_progress','{"topic":"product","channel":"email"}'),
(405,10,'2026-02-18 19:00:00+03',NULL,'normal','open','{"topic":"delivery","channel":"chat"}');

INSERT INTO page_events (id,customer_id,occurred_at,event_name,payload) VALUES
(501,1,'2025-09-12 10:00:00+03','product_view','{"product_id":1,"source":"search"}'),
(502,1,'2025-09-12 10:05:00+03','add_to_cart','{"product_id":1,"quantity":1}'),
(503,2,'2025-10-21 12:00:00+03','product_view','{"product_id":5,"source":"ads"}'),
(504,5,'2025-12-19 14:00:00+03','checkout_started','{"cart_items":2}'),
(505,6,'2026-01-20 10:30:00+03','purchase','{"order_id":110,"channel":"store"}'),
(506,8,'2026-02-02 16:45:00+03','product_view','{"product_id":8,"source":"email"}'),
(507,10,'2026-02-16 15:00:00+03','purchase','{"order_id":115,"channel":"web"}'),
(508,12,'2026-03-05 14:00:00+03','search','{"query":"monitor","results":4}');

CREATE INDEX idx_orders_customer_ts ON orders (customer_id, order_ts DESC);
CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_page_events_payload ON page_events USING GIN (payload);
