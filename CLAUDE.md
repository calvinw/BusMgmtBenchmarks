# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

BusMgmtBenchmarks is an educational project for collecting and analyzing retail financial data from publicly traded companies. The project extracts financial metrics from SEC 10-K filings and provides a modern React-based web application with interactive visualizations for comparing companies and retail segments.

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Data Source**: Dolt REST API

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

**Web Application:**
```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
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

## Company and Segment Structure

Companies are organized into retail segments:
- **Discount**: Walmart, Target, Dollar General, Dollar Tree, Five Below
- **Warehouse Clubs**: Costco, BJ's
- **Online**: Amazon, Wayfair, Chewy
- **Specialty**: Divided into subsegments (Beauty, Apparel, Home, etc.)

Each company has ticker symbol, CIK number, and segment classification in `companies.csv` files.

## File Structure Patterns

**React Application:**
- `src/` - React application source code
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and helpers
- `public/` - Static assets
- `index.html` - Main HTML entry point
- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration

**Data Extraction:**
- `extract/companies.csv` - Company master list with tickers and segments
- `extract/html/[Company]-[Year].html` - Combined financial statements
- `extract/mock_extracted_financial_data.csv` - Raw extracted financial data

## Development Notes

**Web Application:**
- Modern React application built with Vite for fast development and optimized production builds
- TypeScript for type safety and better developer experience
- Tailwind CSS 4 for utility-first styling
- shadcn/ui provides accessible, customizable UI components built on Radix UI
- Component-based architecture for maintainability and reusability
- Hot Module Replacement (HMR) for instant feedback during development
- Responsive design with consistent FIT branding

**Data Pipeline:**
- LLM extraction uses OpenAI API (requires API key in environment)
- Financial data follows specific sign conventions (see `rules_for_metrics.txt`)
- Years covered: 2019-2024
- Export functionality uses xlsx.js library for Excel downloads

## Related Resources

- [Companion SQL Database](https://www.dolthub.com/repositories/calvinw/BusMgmtBenchmarks)
- [LLM Extraction Documentation](https://calvinw.github.io/BusMgmtBenchmarks/extract/llm_for_10K_financial_data.html)
- [Live Web Applications](https://calvinw.github.io/BusMgmtBenchmarks/)