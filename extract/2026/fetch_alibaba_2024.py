"""
fetch_alibaba_2024.py

Fetches Alibaba's fiscal year ending March 31, 2025 from SEC EDGAR.
Following our database convention (year label = year before the report date),
this becomes year=2024 in the database.

Run from extract/2026/:
    python3 fetch_alibaba_2024.py
"""

import json
import time
import subprocess
import sys
import urllib.request
from datetime import date

CIK       = "0001577552"
FORM_TYPE = "20-F"
TARGET_YEAR = 2025   # fiscal year end calendar year (March 31, 2025)
DB_YEAR     = 2024   # what we label it in our database (shift back 1)
DB_DIR      = "BusMgmtBenchmarks"

HEADERS = {
    "User-Agent": "Calvin FIT research project calvin@fit.edu",
    "Accept":     "application/json",
}

INCOME_CONCEPTS = [
    ("Net Revenue",      ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax",
                          "RevenueFromContractWithCustomerIncludingAssessedTax",
                          "SalesRevenueNet", "SalesRevenueGoodsNet"]),
    ("Cost of Goods",    ["CostOfRevenue", "CostOfGoodsAndServicesSold",
                          "CostOfGoodsSold", "CostOfSales"]),
    ("Gross Margin",     ["GrossProfit"]),
    ("SGA",              ["SellingGeneralAndAdministrativeExpense",
                          "GeneralAndAdministrativeExpense"]),
    ("Operating Profit", ["OperatingIncomeLoss"]),
    ("Net Profit",       ["NetIncomeLoss", "ProfitLoss",
                          "NetIncomeLossAvailableToCommonStockholdersBasic"]),
]

BALANCE_CONCEPTS = [
    ("Inventory",                                ["InventoryNet", "Inventories"]),
    ("Current Assets",                           ["AssetsCurrent"]),
    ("Total Assets",                             ["Assets"]),
    ("Current Liabilities",                      ["LiabilitiesCurrent"]),
    ("Liabilities",                              ["Liabilities"]),
    ("Total Shareholder Equity",                 ["StockholdersEquity",
                                                  "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest"]),
    ("Total Liabilities and Shareholder Equity", ["LiabilitiesAndStockholdersEquity"]),
]

ALL_CONCEPTS = INCOME_CONCEPTS + BALANCE_CONCEPTS

def fetch_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())

def end_date_to_year(end_str):
    try:
        return date.fromisoformat(end_str).year
    except Exception:
        return None

def extract_best_entry(facts, taxonomy, concept, target_year, form_type):
    try:
        units = facts["facts"][taxonomy][concept]["units"]
    except (KeyError, TypeError):
        return None
    unit_data = units.get("USD") or units.get("shares") or next(iter(units.values()), [])
    candidates = []
    for entry in unit_data:
        filed_form = entry.get("form", "")
        if form_type not in filed_form and "10-K" not in filed_form and "20-F" not in filed_form:
            continue
        end = entry.get("end", "")
        if end_date_to_year(end) != target_year:
            continue
        start = entry.get("start", "")
        try:
            dur = (date.fromisoformat(end) - date.fromisoformat(start)).days
            if dur < 300:
                continue
        except Exception:
            pass
        candidates.append(entry)
    if not candidates:
        return None
    candidates.sort(key=lambda e: e.get("filed", ""), reverse=True)
    return candidates[0]

def get_entry(facts, concept_tags, target_year, form_type):
    for tag in concept_tags:
        for taxonomy in ("us-gaap", "ifrs-full", "dei"):
            entry = extract_best_entry(facts, taxonomy, tag, target_year, form_type)
            if entry is not None:
                return entry
    return None

def to_thousands(val):
    if val == "" or val is None:
        return "NULL"
    return str(int(val) // 1000)

def run_sql(sql):
    result = subprocess.run(
        ["dolt", "sql", "-q", sql],
        capture_output=True, text=True, cwd=DB_DIR,
    )
    if result.returncode != 0:
        print(f"ERROR:\n  {sql}\n  {result.stderr.strip()}")
        sys.exit(1)

# ── Fetch ─────────────────────────────────────────────────────────────────────
print(f"Fetching Alibaba FY{TARGET_YEAR} (ending March 31, {TARGET_YEAR}) from SEC EDGAR...")
url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{CIK}.json"
facts = fetch_json(url)
print("  Got company facts.")
time.sleep(0.15)

row = {"reportDate": ""}

rev_tags = next(tags for label, tags in INCOME_CONCEPTS if label == "Net Revenue")
rev_entry = get_entry(facts, rev_tags, TARGET_YEAR, FORM_TYPE)
if rev_entry:
    row["reportDate"] = rev_entry.get("end", "")

for label, tags in ALL_CONCEPTS:
    entry = get_entry(facts, tags, TARGET_YEAR, FORM_TYPE)
    row[label] = int(entry["val"]) if entry and entry.get("val") is not None else ""

if row["Gross Margin"] == "" and row["Net Revenue"] != "" and row["Cost of Goods"] != "":
    row["Gross Margin"] = row["Net Revenue"] - row["Cost of Goods"]

# ── Print what we found ───────────────────────────────────────────────────────
print(f"\nData found for Alibaba DB year {DB_YEAR} (reportDate {row['reportDate']}):")
for label, _ in ALL_CONCEPTS:
    val = row.get(label, "")
    print(f"  {label:45s} {val}")

if not row["reportDate"]:
    print("\nERROR: No data found for this year. The filing may not be available yet.")
    sys.exit(1)

# ── Insert into database ──────────────────────────────────────────────────────
print(f"\nInserting into database as year {DB_YEAR}...")

col_names = (
    "`Net Revenue`, `Cost of Goods`, `Gross Margin`, SGA, "
    "`Operating Profit`, `Net Profit`, Inventory, `Current Assets`, "
    "`Total Assets`, `Current Liabilities`, Liabilities, "
    "`Total Shareholder Equity`, `Total Liabilities and Shareholder Equity`"
)

FIN_COLS = [label for label, _ in ALL_CONCEPTS]
values = [to_thousands(row.get(col, "")) for col in FIN_COLS]

sql = (
    f"INSERT INTO financials "
    f"(company_name, year, reportDate, {col_names}) "
    f"VALUES ("
    f"'Alibaba', {DB_YEAR}, '{row['reportDate']}', "
    f"{', '.join(values)}"
    f") ON DUPLICATE KEY UPDATE "
    f"`Net Revenue`=VALUES(`Net Revenue`), `Cost of Goods`=VALUES(`Cost of Goods`), "
    f"`Gross Margin`=VALUES(`Gross Margin`), SGA=VALUES(SGA), "
    f"`Operating Profit`=VALUES(`Operating Profit`), `Net Profit`=VALUES(`Net Profit`), "
    f"`Total Assets`=VALUES(`Total Assets`), `Current Assets`=VALUES(`Current Assets`), "
    f"`Current Liabilities`=VALUES(`Current Liabilities`), Liabilities=VALUES(Liabilities), "
    f"`Total Shareholder Equity`=VALUES(`Total Shareholder Equity`), "
    f"`Total Liabilities and Shareholder Equity`=VALUES(`Total Liabilities and Shareholder Equity`);"
)
run_sql(sql)
print("  Inserted into financials.")

# ── Verify ────────────────────────────────────────────────────────────────────
print("\nVerification:")
subprocess.run(
    ["dolt", "sql", "-q",
     "SELECT company_name, year, reportDate, `Net Revenue`, `Gross Margin`, `Net Profit` "
     "FROM financials WHERE company_name = 'Alibaba' ORDER BY year;"],
    cwd=DB_DIR,
)

print("\nDone! Now re-run the metrics update scripts.")
