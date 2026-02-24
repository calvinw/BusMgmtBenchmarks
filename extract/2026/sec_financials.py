"""
SEC EDGAR Financial Data Scraper
Pulls annual income statement + balance sheet data for:
  - Etsy (ETSY)
  - eBay (EBAY)
  - The RealReal (REAL)
  - Alibaba (BABA) — files 20-F, not 10-K; data pulled from companyfacts

Outputs: sec_financials.csv

Data source: SEC EDGAR XBRL Company Facts API
  https://data.sec.gov/api/xbrl/companyfacts/CIK##########.json

Notes:
  - Alibaba files a 20-F (foreign filer) and uses IFRS, so some tags differ.
  - TheRealReal IPO'd in 2019; 2018 data is not available from SEC.
  - All dollar figures are as reported to SEC (exact values, not scaled).
  - The script filters for annual (10-K / 20-F) filings only.
  - "SG&A" is approximated as SellingGeneralAndAdministrativeExpense.
  - "Inventory" may be blank for marketplace-only companies (Etsy, eBay).
  - reportDate is the fiscal year end date (last day of the fiscal year).
  - Run: python sec_financials.py
"""

import json
import time
import csv
import urllib.request
from datetime import date

# ── Company registry ───────────────────────────────────────────────────────────
# CIK must be zero-padded to 10 digits.
COMPANIES = [
    {"name": "Etsy",         "cik": "0001370637", "ticker": "ETSY", "form": "10-K"},
    {"name": "eBay",         "cik": "0001065088", "ticker": "EBAY", "form": "10-K"},
    {"name": "The RealReal", "cik": "0001573221", "ticker": "REAL", "form": "10-K"},
    {"name": "Alibaba",      "cik": "0001577552", "ticker": "BABA", "form": "20-F"},
]

# Fiscal years we want (calendar year of the fiscal year end)
TARGET_YEARS = list(range(2018, 2025))  # 2018 – 2024 inclusive

# ── XBRL concept tags ──────────────────────────────────────────────────────────
# Each entry: (output_column, [list of candidate XBRL tags in priority order])
# We try each tag in order and take the first one that has data.
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
    ("Inventory",                             ["InventoryNet", "Inventories"]),
    ("Current Assets",                        ["AssetsCurrent"]),
    ("Total Assets",                          ["Assets"]),
    ("Current Liabilities",                   ["LiabilitiesCurrent"]),
    ("Liabilities",                           ["Liabilities"]),
    ("Total Shareholder Equity",              ["StockholdersEquity",
                                               "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest"]),
    ("Total Liabilities and Shareholder Equity", ["LiabilitiesAndStockholdersEquity"]),
]

ALL_CONCEPTS = INCOME_CONCEPTS + BALANCE_CONCEPTS

HEADERS = {
    "User-Agent": "Calvin FIT research project calvin@fit.edu",
    "Accept":     "application/json",
}

# ── Helpers ────────────────────────────────────────────────────────────────────

def fetch_json(url: str) -> dict:
    """Fetch JSON from a URL."""
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def get_company_facts(cik: str) -> dict:
    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
    print(f"  Fetching company facts from: {url}")
    return fetch_json(url)


def end_date_to_year(end_str: str) -> int | None:
    """Convert a period end date string (YYYY-MM-DD) to the calendar year integer."""
    try:
        return date.fromisoformat(end_str).year
    except Exception:
        return None


def extract_best_entry(facts: dict, taxonomy: str, concept: str, target_year: int,
                        form_type: str) -> dict | None:
    """
    Find the best annual filing entry for a given XBRL concept and fiscal year.
    Returns the full entry dict (which includes 'val' and 'end') or None.
    Prefers 10-K / 20-F filings with ~365-day duration.
    If multiple entries match, picks the one filed most recently (latest amendment).
    """
    try:
        units = facts["facts"][taxonomy][concept]["units"]
    except (KeyError, TypeError):
        return None

    # Prefer USD values; fall back to any available unit
    unit_data = units.get("USD") or units.get("shares") or next(iter(units.values()), [])

    candidates = []
    for entry in unit_data:
        filed_form = entry.get("form", "")
        # Only annual filings
        if form_type not in filed_form and "10-K" not in filed_form and "20-F" not in filed_form:
            continue
        end = entry.get("end", "")
        if end_date_to_year(end) != target_year:
            continue
        # Skip short periods (quarterly data restated in annual context)
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

    # Pick the most recently filed entry (handles amendments / restatements)
    candidates.sort(key=lambda e: e.get("filed", ""), reverse=True)
    return candidates[0]


def get_entry(facts: dict, concept_tags: list, target_year: int,
              form_type: str) -> dict | None:
    """
    Try each tag across all relevant taxonomies.
    Returns the first entry dict found, or None.
    """
    for tag in concept_tags:
        for taxonomy in ("us-gaap", "ifrs-full", "dei"):
            entry = extract_best_entry(facts, taxonomy, tag, target_year, form_type)
            if entry is not None:
                return entry
    return None


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    output_file = "sec_financials.csv"

    col_labels = [label for label, _ in ALL_CONCEPTS]
    fieldnames = ["company_name", "year", "reportDate"] + col_labels

    rows = []

    for company in COMPANIES:
        name = company["name"]
        cik  = company["cik"]
        form = company["form"]
        print(f"\n{'='*60}")
        print(f"Processing: {name}  (CIK {cik}, form {form})")

        try:
            facts = get_company_facts(cik)
        except Exception as e:
            print(f"  ERROR fetching facts: {e}")
            continue

        time.sleep(0.15)  # be polite to SEC servers

        # Revenue tags — used to look up reportDate (fiscal year end date)
        rev_tags = next(tags for label, tags in INCOME_CONCEPTS if label == "Net Revenue")

        for year in TARGET_YEARS:
            print(f"  Year {year}...", end=" ")

            row = {
                "company_name": name,
                "year":         year,
                "reportDate":   "",
            }

            # Get the revenue entry first so we can read its 'end' date.
            # That end date IS the fiscal year end date — exactly what reportDate should be.
            rev_entry = get_entry(facts, rev_tags, year, form)
            if rev_entry is not None:
                row["reportDate"] = rev_entry.get("end", "")

            found_any = False
            for label, tags in ALL_CONCEPTS:
                entry = get_entry(facts, tags, year, form)
                if entry is not None:
                    val = entry.get("val")
                    row[label] = int(val) if val is not None else ""
                    found_any = True
                else:
                    row[label] = ""

            # Derive Gross Margin if it wasn't reported directly
            if row["Gross Margin"] == "" and row["Net Revenue"] != "" and row["Cost of Goods"] != "":
                row["Gross Margin"] = row["Net Revenue"] - row["Cost of Goods"]

            rows.append(row)
            status = "✓" if found_any else "– no data"
            print(status)

    # Write CSV
    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n{'='*60}")
    print(f"Done! Output saved to: {output_file}")
    print(f"Rows written: {len(rows)}")
    print("\nNotes:")
    print("  - Values are integers (as reported to SEC in USD)")
    print("  - Blank cells = data not found in XBRL for that year")
    print("  - reportDate = fiscal year end date (last day of the fiscal year)")
    print("  - Alibaba FY ends March 31; year label = calendar year of that date")
    print("  - TheRealReal IPO'd June 2019; 2018 row will be mostly blank")
    print("  - Inventory blank for Etsy/eBay — they are marketplaces with no physical stock")


if __name__ == "__main__":
    main()
