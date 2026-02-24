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
  - All dollar figures are in thousands (000s) unless noted.
  - The script filters for annual (10-K / 20-F) filings only.
  - "SG&A" is approximated as SellingGeneralAndAdministrativeExpense.
  - "Inventory" may be 0 or missing for marketplace-only companies.
  - Run: python sec_financials.py
"""

import json
import time
import csv
import urllib.request
from datetime import datetime, date

# ── Company registry ───────────────────────────────────────────────────────────
# CIK must be zero-padded to 10 digits.
COMPANIES = [
    {"name": "Etsy",        "cik": "0001370637", "ticker": "ETSY", "form": "10-K"},
    {"name": "eBay",        "cik": "0001065088", "ticker": "EBAY", "form": "10-K"},
    {"name": "The RealReal","cik": "0001573221", "ticker": "REAL", "form": "10-K"},
    {"name": "Alibaba",     "cik": "0001577552", "ticker": "BABA", "form": "20-F"},
]

# Fiscal years we want (calendar year of the fiscal year end)
TARGET_YEARS = list(range(2018, 2025))  # 2018 – 2024 inclusive

# ── XBRL concept tags ──────────────────────────────────────────────────────────
# Each entry: (output_column, [list of candidate XBRL tags in priority order])
# We try each tag in order and take the first one that has data.
INCOME_CONCEPTS = [
    ("Net Revenue",       ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax",
                           "RevenueFromContractWithCustomerIncludingAssessedTax",
                           "SalesRevenueNet", "SalesRevenueGoodsNet"]),
    ("Cost of Goods",     ["CostOfRevenue", "CostOfGoodsAndServicesSold",
                           "CostOfGoodsSold", "CostOfSales"]),
    ("Gross Margin",      ["GrossProfit"]),
    ("SGA",               ["SellingGeneralAndAdministrativeExpense",
                           "GeneralAndAdministrativeExpense"]),
    ("Operating Profit",  ["OperatingIncomeLoss"]),
    ("Net Profit",        ["NetIncomeLoss", "ProfitLoss",
                           "NetIncomeLossAvailableToCommonStockholdersBasic"]),
]

BALANCE_CONCEPTS = [
    ("Inventory",                        ["InventoryNet", "Inventories"]),
    ("Current Assets",                   ["AssetsCurrent"]),
    ("Total Assets",                     ["Assets"]),
    ("Current Liabilities",              ["LiabilitiesCurrent"]),
    ("Liabilities",                      ["Liabilities"]),
    ("Total Shareholder Equity",         ["StockholdersEquity",
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
    """Fetch JSON from a URL with polite delay."""
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def get_company_facts(cik: str) -> dict:
    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
    print(f"  Fetching company facts from: {url}")
    return fetch_json(url)


def end_date_to_year(end_str: str) -> int | None:
    """Convert a period end date string (YYYY-MM-DD) to the fiscal year integer."""
    try:
        d = date.fromisoformat(end_str)
        # Accept anything between Oct 1 and Mar 31 of following year as that FY
        # Simpler: just use the calendar year of the end date.
        return d.year
    except Exception:
        return None


def extract_annual_value(facts: dict, taxonomy: str, concept: str, target_year: int,
                         form_type: str) -> float | None:
    """
    Pull the most relevant annual filing value for a given concept + fiscal year.
    Prioritises 10-K / 20-F filings with ~365-day duration.
    """
    try:
        units = facts["facts"][taxonomy][concept]["units"]
    except (KeyError, TypeError):
        return None

    # Prefer USD; fall back to any unit key
    unit_data = units.get("USD") or units.get("shares") or next(iter(units.values()), [])

    candidates = []
    for entry in unit_data:
        filed_form = entry.get("form", "")
        # Only annual filings
        if form_type not in filed_form and "10-K" not in filed_form and "20-F" not in filed_form:
            continue
        end = entry.get("end", "")
        yr = end_date_to_year(end)
        if yr != target_year:
            continue
        # Prefer entries with ~365-day duration (annual, not quarterly restated)
        start = entry.get("start", "")
        try:
            dur = (date.fromisoformat(end) - date.fromisoformat(start)).days
            if dur < 300:          # skip short periods
                continue
        except Exception:
            pass
        candidates.append(entry)

    if not candidates:
        return None

    # If multiple, pick the one filed latest (most recent restatement / amendment)
    candidates.sort(key=lambda e: e.get("filed", ""), reverse=True)
    val = candidates[0].get("val")
    return float(val) if val is not None else None


def get_value(facts: dict, concept_tags: list[str], target_year: int,
              form_type: str) -> float | None:
    """Try each taxonomy + tag until we find a value."""
    for tag in concept_tags:
        for taxonomy in ("us-gaap", "ifrs-full", "dei"):
            val = extract_annual_value(facts, taxonomy, tag, target_year, form_type)
            if val is not None:
                return val
    return None


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    output_file = "sec_financials.csv"

    # Build column order
    col_labels = [label for label, _ in ALL_CONCEPTS]
    fieldnames = ["company_name", "year", "reportDate"] + col_labels

    rows = []

    for company in COMPANIES:
        name     = company["name"]
        cik      = company["cik"]
        form     = company["form"]
        print(f"\n{'='*60}")
        print(f"Processing: {name}  (CIK {cik}, form {form})")

        try:
            facts = get_company_facts(cik)
        except Exception as e:
            print(f"  ERROR fetching facts: {e}")
            continue

        # Also grab filing dates so we can report reportDate
        # Pull from submissions endpoint
        try:
            sub_url = f"https://data.sec.gov/submissions/CIK{cik}.json"
            submissions = fetch_json(sub_url)
            filings_recent = submissions.get("filings", {}).get("recent", {})
            filing_dates_map: dict[int, str] = {}  # year -> filed date
            forms_list = filings_recent.get("form", [])
            filed_list = filings_recent.get("filed", [])
            period_list = filings_recent.get("reportDate", filings_recent.get("periodOfReport", []))
            for f, fl, p in zip(forms_list, filed_list, period_list):
                if form in f:
                    yr = end_date_to_year(p) if p else None
                    if yr and yr not in filing_dates_map:
                        filing_dates_map[yr] = fl
        except Exception as e:
            print(f"  WARNING: could not fetch submission dates: {e}")
            filing_dates_map = {}

        time.sleep(0.15)  # be polite to SEC servers

        for year in TARGET_YEARS:
            print(f"  Year {year}...", end=" ")
            row = {
                "company_name": name,
                "year":         year,
                "reportDate":   filing_dates_map.get(year, ""),
            }
            found_any = False
            for label, tags in ALL_CONCEPTS:
                val = get_value(facts, tags, year, form)
                row[label] = val if val is not None else ""
                if val is not None:
                    found_any = True

            # Derive Gross Margin if not directly available
            if row["Gross Margin"] == "" and row["Net Revenue"] != "" and row["Cost of Goods"] != "":
                rev = row["Net Revenue"]
                cogs = row["Cost of Goods"]
                if rev and cogs:
                    row["Gross Margin"] = rev - cogs

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
    print("  - Values are in USD thousands (as reported to SEC)")
    print("  - Blank cells = data not found in XBRL for that year")
    print("  - Alibaba FY ends March 31; year label = calendar year of filing")
    print("  - TheRealReal IPO'd June 2019; 2018 row will be mostly blank")
    print("  - SG&A may exclude R&D depending on how the company files")


if __name__ == "__main__":
    main()

