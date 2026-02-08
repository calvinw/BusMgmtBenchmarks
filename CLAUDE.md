# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

BusMgmtBenchmarks is an educational project for collecting and analyzing retail financial data from publicly traded companies. The project extracts financial metrics from SEC 10-K filings and provides a React-based single-page application for comparing companies and retail segments.

## Branch Structure

- **main**: React SPA deployed to GitHub Pages via GitHub Actions (build output is NOT committed)
- **dev**: Development branch for the React SPA (Netlify deployment for testing)

Both branches share the same React codebase. GitHub Actions builds and deploys to GitHub Pages automatically on push to main.

## Technology Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.18 (via @tailwindcss/vite plugin)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Deployment**: GitHub Pages (via GitHub Actions) + Netlify
- **Data Source**: Dolt REST API with client-side calculations

## Core Data Pipeline

The main workflow follows this sequence:

1. **Data Extraction** (`extract/` directory):
   - `batch_generate_financials.py` - Main script to extract financial data from all company 10-K filings
   - `get_financials_html.py` - Process individual company filing using LLM to extract financial metrics

2. **HTML Generation** (`extract/html/` directory):
   - `gen_html.py` - Generates SEC filing HTML pages
   - `rename_files.py` - Renames files to URL-safe format
   - `combine_all.sh` - Batch processes all companies and years (calls `combine.py`)
   - Note: `combine.py` must be created from one of the backup versions (`combine.py.good`, `combine.py.responsive`, etc.)

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
- **Company Coverage**: 50+ retail companies across 9 segments (Discount, Warehouse Clubs, Off Price, Department Stores, Online, Grocery, Health & Pharmacy, Home Improvement, Specialty)

## Key Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run dev:student  # Start dev server for student version
npm run build        # Build for production (outputs to docs/)
npm run build:student # Build student version only
```

**Data Extraction:**
```bash
cd extract/
python batch_generate_financials.py  # Extract all company financial data
```

**HTML Processing:**
```bash
cd extract/html/
./combine_all.sh  # Combine income/balance sheets for all companies
```

## Deployment

**GitHub Pages (main branch — automated via GitHub Actions):**
- On push to `main`, GitHub Actions runs `npm run build` and deploys `docs/` to GitHub Pages
- The `docs/` directory is in `.gitignore` — build output is NOT committed to the repo
- Workflow file: `.github/workflows/deploy.yml`
- Live at: https://calvinw.github.io/BusMgmtBenchmarks/company_to_company.html
- Student version: https://calvinw.github.io/BusMgmtBenchmarks/company_to_company_students.html
- **Important**: Vite `base` is set to `./` for relative paths (required for GitHub Pages subdirectory)
- **Important**: SEC filing URLs in code use relative paths (`sec/...` not `/sec/...`) for the same reason
- **Repo setting**: Pages source must be set to "GitHub Actions" (Settings → Pages → Source)

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
3. Build locally with `npm run build` and test: `npx serve docs -l 4000`
4. Commit and push to `main` — GitHub Actions builds and deploys automatically
5. (Optional) Deploy to Netlify for testing: `npx netlify-cli deploy --prod --dir=docs`

## Company and Segment Structure

Companies are organized into retail segments:
- **Discount**: Walmart, Target, Dollar General, Dollar Tree, Five Below
- **Warehouse Clubs**: Costco, BJ's
- **Off Price**: TJ Maxx, Ross, Burlington
- **Department Stores**: Macy's, Nordstrom, Dillard's, Kohl's
- **Online**: Amazon, Wayfair, Chewy
- **Grocery**: Kroger, Albertsons
- **Health & Pharmacy**: Walgreens, CVS, Rite Aid
- **Home Improvement**: Home Depot, Lowe's, Tractor Supply
- **Specialty**: Divided into subsegments (Beauty, Apparel, Accessories & Shoes, Category Killer, Home)

Additional non-US companies (Louis Vuitton, H&M, Adidas, Inditex/Zara, Aritzia, Ahold Delhaize, ASOS) are included but excluded from SEC filing links.

Each company has ticker symbol, CIK number, and segment classification in `extract/companies.csv`.

## File Structure

- `company_to_company.html` - Main HTML entry point (React SPA)
- `company_to_company_students.html` - Student version entry point
- `src/` - React application source code
  - `App.tsx` - Main application component
  - `StudentApp.tsx` - Student version application component
  - `main.tsx` - Main entry point
  - `student-main.tsx` - Student entry point
- `src/components/` - React components
  - `FinancialComparisonTable.tsx` - Main comparison component with live data fetching
  - `FinancialComparisonTableStudent.tsx` - Student version (financial indicators shown as dashes)
  - `CompanySegmentComparison.tsx` - Company vs segment comparison
  - `ReportsPage.tsx` - Interactive reports
  - `Sidebar.tsx` - Navigation sidebar
  - `ui/` - shadcn/ui component library (50+ components)
  - `figma/ImageWithFallback.tsx` - Image component with fallback
- `src/lib/` - Utility functions and helpers
  - `api.ts` - Dolt API data fetching
  - `constants.ts` - Available years, non-American companies list
  - `formatters.ts` - Value formatting utilities
- `public/` - Static assets (copied to docs/ on build)
  - `sec/` - SEC filing HTML pages (URL-safe names, fiscal year)
  - `images/` - Icons and logos
  - `financial-dashboard.html` - Standalone financial dashboard (Chart.js-based)
  - `_redirects` - Netlify redirect rules
- `docs/` - Production build output (generated by `npm run build`, not committed — deployed via GitHub Actions)
- `vite.config.ts` - Vite configuration (base: './', outDir: 'docs')
- `vite.config.student.ts` - Vite config for student-only builds
- `components.json` - shadcn/ui configuration
- `extract/` - Data extraction scripts and source HTML files
  - `companies.csv` - Company names, tickers, CIK numbers, segment classifications

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
- Financial data follows specific sign conventions
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
