"""
fix_alibaba_years.py

Alibaba's fiscal year ends March 31. Following the same convention used
for other retailers in this database (e.g. Walmart year=2022 ends 2023-01-31),
the year label should be the year BEFORE the report date.

So Alibaba's report dates map to year labels like this:
    2018-03-31  ->  2017  (outside our range, DROP)
    2019-03-31  ->  2018
    2020-03-31  ->  2019
    2021-03-31  ->  2020
    2022-03-31  ->  2021
    2023-03-31  ->  2022
    2024-03-31  ->  2023

This script:
  1. Deletes all existing Alibaba rows from financials and financial_metrics
  2. Re-inserts from sec_financials.csv with corrected year labels (dropping the 2018 row)

Run from extract/2026/:
    python3 fix_alibaba_years.py
"""

import csv
import subprocess
import sys

DB_DIR = "BusMgmtBenchmarks"

FIN_COLUMNS = [
    "Net Revenue", "Cost of Goods", "Gross Margin", "SGA",
    "Operating Profit", "Net Profit", "Inventory", "Current Assets",
    "Total Assets", "Current Liabilities", "Liabilities",
    "Total Shareholder Equity", "Total Liabilities and Shareholder Equity",
]

def to_thousands(value_str):
    if value_str.strip() == "":
        return "NULL"
    return str(int(value_str) // 1000)

def run_sql(sql):
    result = subprocess.run(
        ["dolt", "sql", "-q", sql],
        capture_output=True, text=True, cwd=DB_DIR,
    )
    if result.returncode != 0:
        print(f"ERROR:\n  {sql}\n  {result.stderr.strip()}")
        sys.exit(1)

# ── Step 1: Delete existing Alibaba rows ──────────────────────────────────────
print("=== Deleting existing Alibaba rows ===")
run_sql("DELETE FROM financial_metrics WHERE company_name = 'Alibaba';")
print("  Deleted from financial_metrics")
run_sql("DELETE FROM financials WHERE company_name = 'Alibaba';")
print("  Deleted from financials")

# ── Step 2: Re-insert with corrected year labels ──────────────────────────────
print("\n=== Re-inserting Alibaba with corrected year labels ===")

col_names = (
    "`Net Revenue`, `Cost of Goods`, `Gross Margin`, SGA, "
    "`Operating Profit`, `Net Profit`, Inventory, `Current Assets`, "
    "`Total Assets`, `Current Liabilities`, Liabilities, "
    "`Total Shareholder Equity`, `Total Liabilities and Shareholder Equity`"
)

with open("sec_financials.csv", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row["company_name"] != "Alibaba":
            continue

        original_year = int(row["year"])
        corrected_year = original_year - 1
        report_date = row["reportDate"]

        # Drop the row that falls outside our range (becomes 2017)
        if corrected_year < 2018:
            print(f"  Dropping Alibaba original year {original_year} (reportDate {report_date} -> would be {corrected_year}, out of range)")
            continue

        values = [to_thousands(row[col]) for col in FIN_COLUMNS]

        sql = (
            f"INSERT INTO financials "
            f"(company_name, year, reportDate, {col_names}) "
            f"VALUES ("
            f"'Alibaba', {corrected_year}, '{report_date}', "
            f"{', '.join(values)}"
            f");"
        )
        print(f"  Inserting Alibaba year {corrected_year} (reportDate {report_date})")
        run_sql(sql)

# ── Step 3: Verify ────────────────────────────────────────────────────────────
print("\n=== Verification: Alibaba rows in financials ===")
subprocess.run(
    ["dolt", "sql", "-q",
     "SELECT company_name, year, reportDate, `Net Revenue` FROM financials "
     "WHERE company_name = 'Alibaba' ORDER BY year;"],
    cwd=DB_DIR,
)

print("\nDone! Now re-run the metrics update scripts.")
