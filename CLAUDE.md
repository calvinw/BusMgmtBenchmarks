# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

BusMgmtBenchmarks is an educational project for collecting and analyzing retail financial data from publicly traded companies. The project extracts financial metrics from SEC 10-K filings and provides both modern React-based applications and standalone HTML tools for comparing companies and retail segments.

## Branch Structure

- **main**: Production HTML applications with standalone JavaScript (GitHub Pages deployment)
- **dev**: Modern React SPA with Figma-based design (Netlify deployment)

## Technology Stack

**Main Branch (Production HTML Apps):**
- **Frontend**: Vanilla JavaScript + HTML
- **Styling**: Tailwind CSS (CDN)
- **Data Visualization**: Handsontable for reports
- **Deployment**: GitHub Pages
- **Data Source**: Dolt REST API with client-side calculations

**Dev Branch (Modern React SPA):**
- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.3 (compiled)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Deployment**: Netlify
- **Data Source**: Dolt REST API with client-side calculations

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

3. **Web Application** (`src/` directory):
   - React-based single-page application with component architecture
   - Interactive visualizations for company comparisons and segment analysis
   - Real-time data fetching from Dolt REST API
   - Responsive design with modern UI components

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

**Dev Branch - React Application:**
```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production (outputs to build/)
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Main Branch - HTML Applications:**
```bash
# No build step needed - standalone HTML files
# Test with any local HTTP server:
python3 -m http.server 8000
# Then visit http://localhost:8000/company_to_company.html
```

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

## Deployment

**Main Branch (GitHub Pages):**
```bash
# Automatic deployment on push to main
# Live at: https://calvinw.github.io/BusMgmtBenchmarks/
```

**Dev Branch (Netlify):**

Deploying a new version to Netlify:
```bash
# 1. Make your code changes in src/

# 2. Test locally
npm run dev

# 3. Build the production version
npm run build

# 4. Deploy to Netlify
netlify deploy --prod --dir=build
```

Quick deployment workflow:
```bash
npm run build && netlify deploy --prod --dir=build
```

Alternative - Netlify Drop (drag & drop):
```bash
# Build first
npm run build

# Then go to https://app.netlify.com/drop
# and drag the build/ folder
```

**Note:** You don't need to commit/push to GitHub before deploying to Netlify - these are separate. But it's recommended to:
1. Test locally (`npm run dev`)
2. Build and deploy to Netlify
3. Verify it works on the live site
4. Then commit and push to GitHub

## Company and Segment Structure

Companies are organized into retail segments:
- **Discount**: Walmart, Target, Dollar General, Dollar Tree, Five Below
- **Warehouse Clubs**: Costco, BJ's
- **Online**: Amazon, Wayfair, Chewy
- **Specialty**: Divided into subsegments (Beauty, Apparel, Home, etc.)

Each company has ticker symbol, CIK number, and segment classification in `companies.csv` files.

## File Structure Patterns

**Dev Branch - React Application:**
- `src/` - React application source code
- `src/components/` - Reusable React components
  - `FinancialComparisonTable.tsx` - Main comparison component with live data fetching
  - `Sidebar.tsx` - Navigation sidebar
- `src/lib/` - Utility functions and helpers
- `public/` - Static assets
- `public/images/` - Figma-exported icons and logos
- `index.html` - Main HTML entry point
- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration
- `build/` - Production build output (created by `npm run build`)

**Main Branch - HTML Applications:**
- `company_to_company.html` - Compare two companies side-by-side
- `company_to_company_students.html` - Student version with learning exercises
- `company_to_segment.html` - Compare company vs segment/subsegment benchmarks
- `reports.html` - Interactive reports with Handsontable
- All files are standalone with inline JavaScript

**Data Extraction:**
- `extract/companies.csv` - Company master list with tickers and segments
- `extract/html/[Company]-[Year].html` - Combined financial statements
- `extract/mock_extracted_financial_data.csv` - Raw extracted financial data

## Development Notes

**Dev Branch - React SPA:**
- Modern React application built with Vite for fast development and optimized production builds
- TypeScript for type safety and better developer experience
- Tailwind CSS 4 for utility-first styling
- shadcn/ui provides accessible, customizable UI components built on Radix UI
- Component-based architecture for maintainability and reusability
- Hot Module Replacement (HMR) for instant feedback during development
- Figma-based design with pixel-perfect implementation
- Real-time data fetching from Dolt REST API
- Client-side financial calculations (same logic as main branch)
- Functional company/year dropdowns with live data updates

**Main Branch - HTML Apps:**
- Standalone HTML files with no build process required
- Vanilla JavaScript for maximum compatibility
- Tailwind CSS via CDN for styling
- Direct queries to Dolt `financials` table
- Client-side calculation of all financial indicators:
  - Percentage metrics (Cost of Goods %, Gross Margin %, SG&A %, etc.)
  - Financial ratios (Current Ratio, Quick Ratio, Debt-to-Equity)
  - Efficiency metrics (Inventory Turnover, Asset Turnover, ROA)
- Separate fetch for 3-Year Revenue CAGR from `financial_metrics` table
- reports.html uses pre-computed database views for aggregate data

**Data Pipeline:**
- LLM extraction uses OpenAI API (requires API key in environment)
- Financial data follows specific sign conventions (see `rules_for_metrics.txt`)
- Years covered: 2019-2024
- Database tables:
  - `financials` - Raw financial data by company and year
  - `financial_metrics` - Pre-computed CAGR values
  - `benchmarks YEAR view` - Pre-computed company benchmarks (used by reports)
  - `segment benchmarks YEAR` - Segment aggregates (used by reports)
  - `subsegment benchmarks YEAR` - Subsegment aggregates (used by reports)
- Export functionality uses xlsx.js library for Excel downloads

## Related Resources

- [Companion SQL Database](https://www.dolthub.com/repositories/calvinw/BusMgmtBenchmarks)
- [LLM Extraction Documentation](https://calvinw.github.io/BusMgmtBenchmarks/extract/llm_for_10K_financial_data.html)
- [Live Web Applications](https://calvinw.github.io/BusMgmtBenchmarks/)