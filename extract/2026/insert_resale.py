"""
insert_resale.py

Reads sec_financials.csv and inserts the 4 new Resale segment companies
into the local Dolt database (BusMgmtBenchmarks).

Companies: Etsy, eBay, The RealReal, Alibaba
Segment: Resale

The CSV values are in actual dollars; the database stores values in
thousands, so we divide every financial figure by 1000.

Run from the extract/2026 directory:
    python insert_resale.py
"""

import csv
import subprocess
import sys

# ── Company metadata ──────────────────────────────────────────────────────────
COMPANY_INFO = [
    {
        "company":      "Etsy",
        "CIK":          1370637,
        "display_name": "Etsy",
        "ticker":       "ETSY",
        "segment":      "Resale",
        "subsegment":   None,
        "currency":     "USD",
        "units":        "thousands",
    },
    {
        "company":      "eBay",
        "CIK":          1065088,
        "display_name": "eBay",
        "ticker":       "EBAY",
        "segment":      "Resale",
        "subsegment":   None,
        "currency":     "USD",
        "units":        "thousands",
    },
    {
        "company":      "The RealReal",
        "CIK":          1573221,
        "display_name": "The RealReal",
        "ticker":       "REAL",
        "segment":      "Resale",
        "subsegment":   None,
        "currency":     "USD",
        "units":        "thousands",
    },
    {
        "company":      "Alibaba",
        "CIK":          1577552,
        "display_name": "Alibaba",
        "ticker":       "BABA",
        "segment":      "Resale",
        "subsegment":   None,
        "currency":     "USD",
        "units":        "thousands",
    },
]

# ── Financial columns in the CSV (and in the database) ───────────────────────
FIN_COLUMNS = [
    "Net Revenue",
    "Cost of Goods",
    "Gross Margin",
    "SGA",
    "Operating Profit",
    "Net Profit",
    "Inventory",
    "Current Assets",
    "Total Assets",
    "Current Liabilities",
    "Liabilities",
    "Total Shareholder Equity",
    "Total Liabilities and Shareholder Equity",
]

COMPANIES_IN_CSV = {"Etsy", "eBay", "The RealReal", "Alibaba"}

def to_thousands(value_str):
    """Convert a raw dollar string from the CSV to thousands (integer), or NULL."""
    if value_str.strip() == "":
        return "NULL"
    return str(int(value_str) // 1000)

def quote(value):
    """Wrap a string in single quotes for SQL, or return NULL."""
    if value is None:
        return "NULL"
    return f"'{value}'"

def run_sql(sql):
    """Run a SQL statement against the local Dolt database."""
    result = subprocess.run(
        ["dolt", "sql", "-q", sql],
        capture_output=True,
        text=True,
        cwd="BusMgmtBenchmarks",
    )
    if result.returncode != 0:
        print(f"ERROR running SQL:\n  {sql}\n  {result.stderr.strip()}")
        sys.exit(1)

# ── Step 1: Insert company_info rows ─────────────────────────────────────────
print("=== Inserting company_info rows ===")
for co in COMPANY_INFO:
    sql = (
        f"INSERT INTO company_info "
        f"(company, CIK, display_name, ticker_symbol, segment, subsegment, currency, units) "
        f"VALUES ("
        f"{quote(co['company'])}, "
        f"{co['CIK']}, "
        f"{quote(co['display_name'])}, "
        f"{quote(co['ticker'])}, "
        f"{quote(co['segment'])}, "
        f"{quote(co['subsegment'])}, "
        f"{quote(co['currency'])}, "
        f"{quote(co['units'])}"
        f");"
    )
    print(f"  Inserting company_info: {co['company']}")
    run_sql(sql)

# ── Step 2: Insert financials rows from CSV ───────────────────────────────────
print("\n=== Inserting financials rows ===")

col_names = (
    "`Net Revenue`, `Cost of Goods`, `Gross Margin`, SGA, "
    "`Operating Profit`, `Net Profit`, Inventory, `Current Assets`, "
    "`Total Assets`, `Current Liabilities`, Liabilities, "
    "`Total Shareholder Equity`, `Total Liabilities and Shareholder Equity`"
)

with open("sec_financials.csv", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        company = row["company_name"]
        if company not in COMPANIES_IN_CSV:
            continue

        year       = row["year"]
        report_date = row["reportDate"]
        values     = [to_thousands(row[col]) for col in FIN_COLUMNS]

        sql = (
            f"INSERT INTO financials "
            f"(company_name, year, reportDate, {col_names}) "
            f"VALUES ("
            f"'{company}', {year}, '{report_date}', "
            f"{', '.join(values)}"
            f");"
        )
        print(f"  Inserting financials: {company} {year}")
        run_sql(sql)

# ── Step 3: Verify ────────────────────────────────────────────────────────────
print("\n=== Verification: company_info ===")
subprocess.run(
    ["dolt", "sql", "-q",
     "SELECT company, ticker_symbol, segment, currency, units FROM company_info "
     "WHERE segment = 'Resale';"],
    cwd="BusMgmtBenchmarks",
)

print("\n=== Verification: financials row count per company ===")
subprocess.run(
    ["dolt", "sql", "-q",
     "SELECT company_name, COUNT(*) AS years, MIN(year) AS first_year, MAX(year) AS last_year "
     "FROM financials WHERE company_name IN ('Etsy','eBay','The RealReal','Alibaba') "
     "GROUP BY company_name ORDER BY company_name;"],
    cwd="BusMgmtBenchmarks",
)

print("\n=== Verification: sample financials (Etsy 2024) ===")
subprocess.run(
    ["dolt", "sql", "-q",
     "SELECT company_name, year, reportDate, `Net Revenue`, `Gross Margin`, `Net Profit` "
     "FROM financials WHERE company_name = 'Etsy' AND year = 2024;"],
    cwd="BusMgmtBenchmarks",
)

print("\nDone! If everything looks correct, commit the changes on the add-resale-segment branch.")
