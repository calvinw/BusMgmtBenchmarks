# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

BusMgmtBenchmarks is an educational project for collecting and analyzing retail financial data from publicly traded companies. The project extracts financial metrics from SEC 10-K filings and provides a React-based single-page application for comparing companies and retail segments.

## Branch Structure

- **main**: React SPA with production build committed in `docs/` (GitHub Pages + Netlify deployment)
- **dev**: Development branch for the React SPA (Netlify deployment for testing)

Both branches share the same React codebase. The `main` branch includes the `docs/` directory with built output for GitHub Pages.

## Technology Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.3 (compiled)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Deployment**: GitHub Pages (from `docs/` directory) + Netlify
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

3. **SEC Filing Pages** (`public/sec/` directory):
   - URL-safe-named copies of SEC filing HTML files from `extract/html/`
   - Naming convention: lowercase, spaces → hyphens, `&` → `and`, apostrophes removed
   - Files use fiscal year (e.g., `dillards-2024.html` for fiscal year 2024)
   - Two CSS files needed: `public/sec/report.css` and `public/sec/include/report.css`

4. **Web Application** (`src/` directory):
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

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production (outputs to docs/)
npm run lint         # Run ESLint
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

**GitHub Pages (main branch):**
- Serves from the `docs/` directory
- Live at: https://calvinw.github.io/BusMgmtBenchmarks/company_to_company.html
- Student version: https://calvinw.github.io/BusMgmtBenchmarks/company_to_company_students.html
- After code changes: rebuild with `npm run build`, commit `docs/`, push to main
- **Important**: Vite `base` is set to `./` for relative paths (required for GitHub Pages subdirectory)
- **Important**: SEC filing URLs in code use relative paths (`sec/...` not `/sec/...`) for the same reason

**Netlify (dev branch):**
```bash
# Deploy workflow:
npm run build && npx netlify-cli deploy --prod --dir=docs
```
- Live at: https://busmgmtbenchmarksdev.netlify.app/company_to_company.html
- Root URL redirects to company_to_company.html via `public/_redirects`

**Full deployment workflow:**
1. Make code changes in `src/`
2. Test locally with `npm run dev`
3. Build with `npm run build`
4. Test built version: `npx serve docs -l 4000`
5. Deploy to Netlify for testing: `npx netlify-cli deploy --prod --dir=docs`
6. Commit everything including `docs/` and push

## Company and Segment Structure

Companies are organized into retail segments:
- **Discount**: Walmart, Target, Dollar General, Dollar Tree, Five Below
- **Warehouse Clubs**: Costco, BJ's
- **Online**: Amazon, Wayfair, Chewy
- **Specialty**: Divided into subsegments (Beauty, Apparel, Home, etc.)

Each company has ticker symbol, CIK number, and segment classification in `companies.csv` files.

## File Structure

- `company_to_company.html` - Main HTML entry point (React SPA)
- `company_to_company_students.html` - Student version entry point
- `src/` - React application source code
- `src/components/` - React components
  - `FinancialComparisonTable.tsx` - Main comparison component with live data fetching
  - `FinancialComparisonTableStudent.tsx` - Student version (financial indicators shown as dashes)
  - `CompanySegmentComparison.tsx` - Company vs segment comparison
  - `ReportsPage.tsx` - Interactive reports
  - `Sidebar.tsx` - Navigation sidebar
- `src/lib/` - Utility functions and helpers
  - `api.ts` - Dolt API data fetching
  - `constants.ts` - Available years, non-American companies list
  - `formatters.ts` - Value formatting utilities
- `public/` - Static assets (copied to docs/ on build)
- `public/sec/` - SEC filing HTML pages (URL-safe names, fiscal year)
- `public/images/` - Icons and logos
- `public/_redirects` - Netlify redirect rules
- `docs/` - Production build output (served by GitHub Pages)
- `vite.config.ts` - Vite configuration (base: './', outDir: 'docs')
- `vite.config.student.ts` - Vite config for student-only builds
- `components.json` - shadcn/ui configuration
- `extract/` - Data extraction scripts and source HTML files

## Development Notes

- Modern React application built with Vite for fast development and optimized production builds
- TypeScript for type safety and better developer experience
- Tailwind CSS 4 for utility-first styling
- shadcn/ui provides accessible, customizable UI components built on Radix UI
- Hot Module Replacement (HMR) for instant feedback during development
- Figma-based design with pixel-perfect implementation
- Real-time data fetching from Dolt REST API
- Client-side financial calculations
- Default companies: Dillard's and Macy's (fiscal year 2024)
- Non-American companies (Louis Vuitton, H&M, Adidas, etc.) are excluded from SEC filing links
- SEC filing HTML files use fiscal year naming (e.g., `macys-2024.html` for fiscal year 2024)
- The `pre-react-merge` git tag marks the last commit before the React SPA replaced the standalone HTML apps

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
- [Live Web Application](https://calvinw.github.io/BusMgmtBenchmarks/company_to_company.html)
- [Netlify Dev Version](https://busmgmtbenchmarksdev.netlify.app/company_to_company.html)
