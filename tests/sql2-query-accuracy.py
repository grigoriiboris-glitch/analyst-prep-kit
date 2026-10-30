#!/usr/bin/env python3
"""Execute all new interactive SQL 2 solutions against the course's own SQLite data."""
from __future__ import annotations

import json
import math
import re
import sqlite3
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "sql2" / "index.html").read_text(encoding="utf-8")


def extract_json_strings(source: str) -> list[str]:
    values = re.findall(r'^\s*("(?:\\.|[^"\\])*")\s*,?\s*$', source, flags=re.MULTILINE)
    return [json.loads(value) for value in values]


seed_match = re.search(
    r'const SEED_SQL = \[(.*?)\]\.join\("\\n"\);',
    HTML,
    flags=re.DOTALL,
)
assert seed_match, "Could not find the SQL 2 demo schema and seed data"
seed_statements = extract_json_strings(seed_match.group(1))
assert seed_statements, "Could not extract SQL 2 seed statements"

lesson_matches = list(re.finditer(
    r'\{id:(\d+),.*?solution:("(?:\\.|[^"\\])*"),explain:',
    HTML,
))
lessons: dict[int, str] = {
    int(match.group(1)): json.loads(match.group(2))
    for match in lesson_matches
}
assert sorted(lessons) == list(range(1, 25)), (
    f"Expected SQL solutions 1..24, found lesson IDs: {sorted(lessons)}"
)

db = sqlite3.connect(":memory:")
db.executescript("\n".join(seed_statements))


def run(lesson_id: int) -> tuple[tuple[str, ...], list[tuple[Any, ...]]]:
    query = lessons[lesson_id]
    try:
        cursor = db.execute(query)
        columns = tuple(col[0] for col in (cursor.description or []))
        rows = cursor.fetchall()
    except sqlite3.Error as error:
        raise AssertionError(
            f"Lesson {lesson_id} solution failed in SQLite: {error}\n{query}"
        ) from error
    assert columns, f"Lesson {lesson_id} returned no result columns"
    return columns, rows


def check_columns(lesson_id: int, expected: tuple[str, ...]) -> list[tuple[Any, ...]]:
    columns, rows = run(lesson_id)
    assert columns == expected, (
        f"Lesson {lesson_id} columns mismatch: expected {expected}, got {columns}"
    )
    return rows


def close(actual: Any, expected: float, message: str) -> None:
    assert isinstance(actual, (int, float)) and math.isclose(
        float(actual), expected, rel_tol=1e-9, abs_tol=1e-6
    ), f"{message}: expected {expected}, got {actual}"


# 1. Projection: return only product name and price.
rows = check_columns(1, ("product_name", "price"))
assert len(rows) == 6
assert ("Laptop Pro", 120.0) in rows

# 2. ORDER BY and LIMIT: the three most expensive products.
rows = check_columns(2, ("product_name", "price"))
assert rows == [("Monitor 4K", 350.0), ("Office Chair", 180.0), ("Laptop Pro", 120.0)]

# 3. WHERE: only customers from South.
rows = check_columns(3, ("customer_name", "region"))
assert set(rows) == {
    ("Boris Petrov", "South"),
    ("Farid Ali", "South"),
    ("Irina Volkova", "South"),
}

# 4. IS NULL: order that has no customer reference.
rows = check_columns(4, ("order_id", "total_amount"))
assert rows == [(1016, 60.0)]

# 5. DISTINCT: unique product categories.
rows = check_columns(5, ("category",))
assert {row[0] for row in rows} == {"Electronics", "Accessories", "Home"}
assert len(rows) == 3

# 6. LIKE: product names ending with 4K.
rows = check_columns(6, ("product_name",))
assert rows == [("Monitor 4K",)]

# 7. BETWEEN: inclusive product price range, ordered by ascending price.
rows = check_columns(7, ("product_name", "price"))
assert rows == [
    ("Wireless Mouse", 25.0),
    ("Desk Lamp", 38.0),
    ("USB-C Hub", 45.0),
    ("Laptop Pro", 120.0),
]

# 8. CASE: price bands for every product.
rows = check_columns(8, ("product_name", "price", "price_band"))
bands = {row[0]: row[2] for row in rows}
assert bands == {
    "Desk Lamp": "Budget",
    "Laptop Pro": "Standard",
    "Monitor 4K": "Premium",
    "Office Chair": "Standard",
    "USB-C Hub": "Budget",
    "Wireless Mouse": "Budget",
}

# 9. COALESCE: preserve populated email values and label only NULL.
rows = check_columns(9, ("customer_name", "email_contact"))
assert len(rows) == 12
email_by_name = {row[0]: row[1] for row in rows}
assert email_by_name["Alice Morgan"] == "alice@example.com"
assert email_by_name["Denis Ivanov"] == "email missing"
assert email_by_name["Kira Bell"] == "email missing"

# 10. COUNT, SUM, AVG for the product catalog.
rows = check_columns(10, ("products_count", "catalog_value", "average_price"))
assert len(rows) == 1 and rows[0][0] == 6
close(rows[0][1], 758.0, "Lesson 10 catalog value")
close(rows[0][2], 758.0 / 6, "Lesson 10 average product price")

# 11. GROUP BY: one order count per customer_id, including the NULL group.
rows = check_columns(11, ("customer_id", "orders_count"))
assert len(rows) == 12
count_by_customer = {row[0]: row[1] for row in rows}
assert count_by_customer[1] == 3
assert count_by_customer[2] == 2
assert count_by_customer[3] == 2
assert count_by_customer[6] == 2
assert count_by_customer[None] == 1

# 12. HAVING: only customers with at least two orders.
rows = check_columns(12, ("customer_id", "orders_count"))
assert rows == [(1, 3), (2, 2), (3, 2), (6, 2)]

# 13. INNER JOIN: order id and matching customer name.
rows = check_columns(13, ("order_id", "customer_name"))
assert len(rows) == 16
assert rows[0] == (1001, "Alice Morgan")
assert rows[-1] == (1017, "Leo Kim")
assert all(row[1] is not None for row in rows)

# 14. LEFT JOIN: retain every customer, including Kira Bell with no order.
rows = check_columns(14, ("customer_name", "order_id"))
assert len(rows) == 17
assert len({row[0] for row in rows}) == 12
assert ("Kira Bell", None) in rows

# 15. Arithmetic expression: quantity times unit price for all order items.
rows = check_columns(15, ("order_item_id", "order_id", "line_total"))
assert len(rows) == 15
line_totals = {row[0]: row[2] for row in rows}
close(line_totals[1], 120.0, "Lesson 15 item 1")
close(line_totals[8], 360.0, "Lesson 15 item 8")
close(line_totals[9], 90.0, "Lesson 15 item 9")

# 16. STRFTIME: monthly sums of all payment records.
rows = check_columns(16, ("month", "payments_total"))
assert rows == [
    ("2025-01", 435.5),
    ("2025-02", 490.0),
    ("2025-03", 550.0),
    ("2025-04", 760.0),
    ("2025-05", 540.0),
]

# 17. Scalar subquery: products priced above the catalog average.
rows = check_columns(17, ("product_name", "price"))
assert rows == [("Monitor 4K", 350.0), ("Office Chair", 180.0)]

# 18. WITH: category average prices, filtered in the outer query.
rows = check_columns(18, ("category", "average_price"))
assert len(rows) == 2
assert rows[0][0] == "Electronics"
close(rows[0][1], 235.0, "Lesson 18 Electronics average")
assert rows[1][0] == "Home"
close(rows[1][1], 109.0, "Lesson 18 Home average")

# 19. ROW_NUMBER: the chronologically first order for each customer.
rows = check_columns(19, ("customer_id", "order_id", "order_date"))
assert len(rows) == 11
first_order = {row[0]: row[1] for row in rows}
assert first_order == {
    1: 1001, 2: 1002, 3: 1004, 4: 1005, 5: 1006,
    6: 1008, 7: 1009, 8: 1011, 9: 1013, 10: 1014, 12: 1017,
}

# 20. LAG: monthly payment counts and previous-month comparison.
rows = check_columns(20, ("month", "payment_count", "previous_count", "count_change"))
assert rows == [
    ("2025-01", 3, None, None),
    ("2025-02", 2, 3, -1),
    ("2025-03", 2, 2, 0),
    ("2025-04", 2, 2, 0),
    ("2025-05", 2, 2, 0),
]

# 21. SUM OVER: cumulative payments in chronological order.
rows = check_columns(21, ("payment_id", "payment_date", "paid_amount", "running_paid"))
assert len(rows) == 11
close(rows[0][3], 120.0, "Lesson 21 first cumulative payment")
close(rows[1][3], 195.5, "Lesson 21 second cumulative payment")
close(rows[-1][3], 2775.5, "Lesson 21 final cumulative payment")

# 22. GROUP BY / HAVING: repeated unit prices in order_items.
rows = check_columns(22, ("unit_price", "items_count"))
assert rows == [(25.0, 2), (45.0, 2), (120.0, 2), (180.0, 2)]

# 23. COALESCE with LEFT JOIN: payment totals and remaining amounts for every order.
rows = check_columns(23, ("order_id", "total_amount", "paid_total", "remaining_amount"))
assert len(rows) == 17
by_order = {row[0]: row[1:] for row in rows}
assert by_order[1001] == (120.0, 120.0, 0.0)
assert by_order[1002] == (75.5, 0, 75.5)
assert by_order[1008] == (420.0, 400.0, 20.0)
assert by_order[1011] == (260.0, 0, 260.0)
assert by_order[1017] == (40.0, 0, 40.0)

# 24. Scalar subqueries: three table counts in one result row.
rows = check_columns(24, ("total_customers", "total_products", "total_payments"))
assert rows == [(12, 6, 11)]

db.close()
print("SQL 2 accuracy check passed: all 24 new interactive lesson solutions execute and return the expected results.")
