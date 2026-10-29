#!/usr/bin/env python3
"""Execute every SQL 2 lesson solution against the module's own SQLite demo data."""
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
    r'const SEED_SQL = \[(.*?)\]\.join\("\\\\n"\);',
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


# 1. SELECT only the requested product fields.
rows = check_columns(1, ("product_name", "category"))
assert len(rows) == 6

# 2. Latest five orders, newest first, with the specified tie-breaker.
rows = check_columns(2, ("order_id", "order_date", "total_amount"))
assert [row[0] for row in rows] == [1017, 1015, 1014, 1013, 1012]

# 3. Filter North customers and sort by name.
rows = check_columns(3, ("customer_id", "customer_name", "region"))
assert [(r[0], r[1], r[2]) for r in rows] == [
    (1, "Alice Morgan", "North"),
    (4, "Denis Ivanov", "North"),
    (10, "Jonas Reed", "North"),
]

# 4. Find absent emails.
rows = check_columns(4, ("customer_id", "customer_name"))
assert rows == [(4, "Denis Ivanov"), (11, "Kira Bell")]

# 5. Unique regions in alphabetic order.
rows = check_columns(5, ("region",))
assert [r[0] for r in rows] == ["Central", "East", "North", "South", "West"]

# 6. Search for a fragment anywhere in a product name.
rows = check_columns(6, ("product_name", "price"))
assert len(rows) == 1 and rows[0][0] == "Laptop Pro"
close(rows[0][1], 120, "Lesson 6 product price")

# 7. Inclusive amount range, sorted by total_amount then order_id.
rows = check_columns(7, ("order_id", "total_amount"))
assert [r[0] for r in rows] == [1013, 1001, 1009, 1006, 1015, 1003, 1011]
assert [r[1] for r in rows] == sorted(r[1] for r in rows)
close(rows[0][1], 110, "Lesson 7 first amount")
close(rows[-1][1], 260, "Lesson 7 last amount")

# 8. Case-based order categories.
rows = check_columns(8, ("order_id", "total_amount", "amount_band"))
by_id = {r[0]: r[2] for r in rows}
assert by_id[1001] == "Low" and by_id[1003] == "Medium" and by_id[1004] == "High"

# 9. COALESCE should preserve populated email and fill only NULL values.
rows = check_columns(9, ("customer_name", "display_email"))
assert len(rows) == 12
assert rows[0] == ("Alice Morgan", "alice@example.com")
assert rows[3] == ("Denis Ivanov", "no email")
assert rows[10] == ("Kira Bell", "no email")

# 10. Counts, sum and average for all orders.
rows = check_columns(10, ("total_orders", "revenue", "average_order"))
assert len(rows) == 1 and rows[0][0] == 17
close(rows[0][1], 3245.4, "Lesson 10 revenue")
close(rows[0][2], 3245.4 / 17, "Lesson 10 average")

# 11–12. Group by status, then retain only groups meeting the HAVING threshold.
rows = check_columns(11, ("status", "orders_count"))
assert rows == [("Delivered", 10), ("Pending", 5), ("Cancelled", 2)]
rows = check_columns(12, ("status", "orders_count"))
assert rows == [("Delivered", 10), ("Pending", 5)]

# 13. INNER JOIN order and customer fields, filtered to orders above 200.
rows = check_columns(13, ("customer_name", "order_id", "order_date", "total_amount"))
assert len(rows) == 7
assert [(r[1], r[3]) for r in rows[:3]] == [(1012, 500.0), (1008, 420.0), (1014, 330.0)]

# 14. LEFT JOIN anti-match finds customers with no order.
rows = check_columns(14, ("customer_id", "customer_name"))
assert rows == [(11, "Kira Bell")]

# 15. Quantity multiplied by unit price for order 1008.
rows = check_columns(15, ("product_name", "quantity", "unit_price", "line_total"))
assert len(rows) == 2
assert rows[0][0] == "Office Chair" and rows[0][1] == 2
close(rows[0][3], 360, "Lesson 15 Office Chair line total")
assert rows[1][0] == "USB-C Hub" and rows[1][1] == 2
close(rows[1][3], 90, "Lesson 15 USB-C Hub line total")

# 16. Monthly revenue grouped by the SQLite year-month key.
rows = check_columns(16, ("month", "revenue"))
assert [r[0] for r in rows] == ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05"]
for row, expected in zip(rows, [435.5, 545, 754.9, 870, 640]):
    close(row[1], expected, f"Lesson 16 revenue for {row[0]}")

# 17. Orders greater than the mean of the full table.
rows = check_columns(17, ("order_id", "total_amount"))
assert [r[0] for r in rows] == [1012, 1008, 1014, 1004, 1011, 1003, 1015]
assert all(r[1] > 3245.4 / 17 for r in rows)

# 18. CTE regional summary above the requested revenue threshold.
rows = check_columns(18, ("region", "orders_count", "revenue"))
assert [r[0] for r in rows] == ["North", "South", "West", "East"]
assert [r[1] for r in rows] == [5, 5, 3, 2]
for row, expected in zip(rows, [1245, 910.5, 549.9, 440]):
    close(row[2], expected, f"Lesson 18 revenue for {row[0]}")

# 19. One highest-value order per customer with orders.
rows = check_columns(19, ("customer_name", "order_id", "total_amount"))
assert len(rows) == 11
assert [(r[0], r[1], r[2]) for r in rows[:3]] == [
    ("Alice Morgan", 1012, 500.0),
    ("Boris Petrov", 1007, 95.0),
    ("Carla Gomez", 1004, 310.0),
]

# 20. Previous month and month-over-month change.
rows = check_columns(20, ("month", "revenue", "previous_revenue", "revenue_change"))
assert len(rows) == 5
assert rows[0][2] is None and rows[0][3] is None
close(rows[1][2], 435.5, "Lesson 20 February previous revenue")
close(rows[1][3], 109.5, "Lesson 20 February change")
close(rows[-1][3], -230, "Lesson 20 May change")

# 21. Running sum preserves the 17 order rows.
rows = check_columns(21, ("order_id", "order_date", "total_amount", "running_revenue"))
assert len(rows) == 17
close(rows[0][3], 120, "Lesson 21 first running total")
close(rows[1][3], 195.5, "Lesson 21 second running total")
close(rows[-1][3], 3245.4, "Lesson 21 last running total")
assert rows[-1][0] == 1017

# 22. Duplicate email groups exclude NULL.
rows = check_columns(22, ("email", "customers_count"))
assert rows == [("alice@example.com", 2)]

# 23. Mismatched orders include orders with no successful payment.
rows = check_columns(23, ("order_id", "total_amount", "paid_total", "difference"))
assert [r[0] for r in rows] == [1002, 1005, 1007, 1008, 1010, 1011, 1013, 1015, 1016, 1017]
assert rows[0] == (1002, 75.5, 0, 75.5)
assert rows[-1] == (1017, 40.0, 0, 40.0)

# 24. One-row data-quality summary from scalar subqueries.
rows = check_columns(
    24,
    ("total_orders", "orders_without_customer", "customers_without_email"),
)
assert rows == [(17, 1, 2)]

db.close()
print("SQL 2 accuracy check passed: all 24 lesson solutions execute and return the expected columns and key results.")
