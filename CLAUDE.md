# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

BusMgmtBenchmarks is an educational project for collecting and analyzing retail financial data from publicly traded companies. The project extracts financial metrics from SEC 10-K filings and provides web-based visualizations for comparing companies and retail segments.

## Core Data Pipeline

The main workflow follows this sequence:

1. **Data Extraction** (`extract/` directory):
   - `edgar_extract_all_filings.py` - Main script to extract financial data from all company 10-K filings
   - `edgar_extract_one_filing.py` - Process individual company filing using LLM to extract financial metrics
   - Output: `mock_extracted_financial_data.csv` with raw financial metrics

2. **HTML Generation** (`extract/html/` directory):
   - `download_income_and_balance_html.py` - Downloads SEC filing HTML pages
   - `combine.py` - Combines income and balance sheets into single HTML files
   - `combine_all.sh` - Batch processes all companies and years

3. **Web Applications** (root directory):
   - `company_to_company.html` - Side-by-side company comparison tool
   - `company_to_segment.html` - Company vs segment analysis
   - `reports.html` - Downloadable data reports

## Financial Metrics

**Core Extracted Metrics:**
- Net Revenue, Cost of Goods, SG&A, Operating Profit, Net Profit
- Inventory, Current Assets, Total Assets, Current Liabilities
- Total Shareholder Equity, Total Liabilities and Shareholder Equity

**Calculated Metrics:**
- Margin percentages (Gross, Operating, Net Profit)
- Financial ratios (Current, Quick, Debt-to-Equity)
- Efficiency metrics (Inventory Turnover, Asset Turnover, ROA)
- Growth metrics (3-Year Revenue CAGR)

## Data Sources

- **Primary Database**: Dolt database hosted at DoltHub (calvinw/BusMgmtBenchmarks)
- **API Endpoint**: `https://www.dolthub.com/api/v1alpha1/calvinw/BusMgmtBenchmarks/main`
- **Company Coverage**: 60+ retail companies across 8 segments (Discount, Warehouse Clubs, Off Price, Department Stores, Online, Grocery, Health & Pharmacy, Home Improvement, Specialty)

## Key Development Commands

**Data Extraction:**
```bash
cd extract/
python edgar_extract_all_filings.py  # Extract all company financial data
```

**HTML Processing:**
```bash
cd extract/html/
./combine_all.sh  # Combine income/balance sheets for all companies
```

**Web Development:**
- No build process required - static HTML files with JavaScript
- Uses Tailwind CSS via CDN
- Data fetched from Dolt REST API

## Company and Segment Structure

Companies are organized into retail segments:
- **Discount**: Walmart, Target, Dollar General, Dollar Tree, Five Below
- **Warehouse Clubs**: Costco, BJ's
- **Online**: Amazon, Wayfair, Chewy
- **Specialty**: Divided into subsegments (Beauty, Apparel, Home, etc.)

Each company has ticker symbol, CIK number, and segment classification in `companies.csv` files.

## File Structure Patterns

- `extract/companies.csv` - Company master list with tickers and segments
- `extract/html/[Company]-[Year].html` - Combined financial statements
- `extract/mock_extracted_financial_data.csv` - Raw extracted financial data
- Web apps use consistent naming: `company_to_*.html`

## Development Notes

- LLM extraction uses OpenAI API (requires API key in environment)
- Financial data follows specific sign conventions (see `rules_for_metrics.txt`)
- Years covered: 2019-2024
- Web apps are responsive and use consistent FIT branding
- Export functionality uses xlsx.js library for Excel downloads

## Related Resources

- [Companion SQL Database](https://www.dolthub.com/repositories/calvinw/BusMgmtBenchmarks)
- [LLM Extraction Documentation](https://calvinw.github.io/BusMgmtBenchmarks/extract/llm_for_10K_financial_data.html)
- [Live Web Applications](https://calvinw.github.io/BusMgmtBenchmarks/)