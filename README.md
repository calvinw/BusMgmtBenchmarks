# BusMgmtBenchmarks

Educational project for collecting and analyzing retail financial data from publicly traded companies. The project extracts financial metrics from SEC 10-K filings and provides both modern React-based applications and standalone HTML tools for comparing companies and retail segments.

## Branch Structure

- **main**: Production HTML applications with standalone JavaScript (GitHub Pages deployment)
- **dev**: Modern React SPA with Figma-based design (Netlify deployment)

## Technology Stack

**Dev Branch (Modern React SPA):**
- React 18.3.1 + TypeScript
- Vite 6.3.5
- Tailwind CSS 4.1.3
- shadcn/ui with Radix UI primitives
- Lucide React icons
- Netlify deployment

**Main Branch (HTML Apps):**
- Vanilla JavaScript + HTML
- Tailwind CSS (CDN)
- Handsontable for reports
- GitHub Pages deployment

## Quick Start (Dev Branch)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Dev Branch - Netlify Deployment

Deploying a new version:

```bash
# 1. Make your code changes in src/

# 2. Test locally
npm run dev

# 3. Build the production version
npm run build

# 4. Deploy to Netlify
netlify deploy --prod --dir=build
```

Quick workflow:
```bash
npm run build && netlify deploy --prod --dir=build
```

**Note:** You don't need to commit/push to GitHub before deploying to Netlify. Recommended workflow:
1. Test locally (`npm run dev`)
2. Build and deploy to Netlify
3. Verify it works on the live site
4. Then commit and push to GitHub

### Main Branch - GitHub Pages

Automatic deployment on push to main branch.

Live at: https://calvinw.github.io/BusMgmtBenchmarks/

## Project Structure

**Dev Branch:**
```
src/
├── components/
│   ├── FinancialComparisonTable.tsx  # Main comparison component
│   └── Sidebar.tsx                    # Navigation sidebar
├── lib/                               # Utility functions
├── App.tsx                            # Root component
└── main.tsx                           # Entry point
public/images/                         # Figma-exported assets
build/                                 # Production build output
```

**Main Branch:**
```
company_to_company.html          # Compare two companies
company_to_company_students.html # Student version
company_to_segment.html          # Company vs segment comparison
reports.html                     # Interactive reports
```

## Data Source

- **Database**: Dolt hosted at DoltHub (calvinw/BusMgmtBenchmarks)
- **API**: `https://www.dolthub.com/api/v1alpha1/calvinw/BusMgmtBenchmarks/main`
- **Coverage**: 60+ retail companies across 8 segments
- **Years**: 2019-2024

## Financial Metrics

**Core Metrics:**
- Revenue, Cost of Goods, SG&A, Operating Profit, Net Profit
- Inventory, Current Assets, Total Assets, Current Liabilities
- Total Shareholder Equity, Total Liabilities

**Calculated Metrics:**
- Margin percentages (Gross, Operating, Net Profit)
- Financial ratios (Current, Quick, Debt-to-Equity)
- Efficiency metrics (Inventory Turnover, Asset Turnover, ROA)
- Growth metrics (3-Year Revenue CAGR)

## Data Pipeline

```bash
# Extract financial data from SEC filings
cd extract/
python edgar_extract_all_filings.py

# Process HTML files
cd extract/html/
./combine_all.sh
```

## Related Resources

- [Companion SQL Database](https://www.dolthub.com/repositories/calvinw/BusMgmtBenchmarks)
- [LLM Extraction Documentation](https://calvinw.github.io/BusMgmtBenchmarks/extract/llm_for_10K_financial_data.html)
- [Live Applications](https://calvinw.github.io/BusMgmtBenchmarks/)

## Development

- Modern React app with Vite for fast HMR
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for accessible components
- Client-side financial calculations
- Real-time data fetching from Dolt REST API

## License

Educational use for Fashion Institute of Technology.

## Credits

- Fashion Institute of Technology Professors: Dr. Calvin Williamson, Shelley E. Kohan
- AI Systems Assistant: Jia Mei Lin, Direct Marketing BS 2026
- Made through the SUNY IITG Business Management Course Development Grant
