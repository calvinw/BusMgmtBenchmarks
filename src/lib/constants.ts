// Database configuration
export const DB_URL = 'https://www.dolthub.com/api/v1alpha1/calvinw/BusMgmtBenchmarks/main';

// Available fiscal years for data selection
export const AVAILABLE_YEARS = ['2024', '2023', '2022', '2021', '2020', '2019'];

// Currency symbols for non-USD companies
export const CURRENCY_MAP: Record<string, string> = {
  'Louis Vuitton': '€',
  'Inditex/Zara': '€',
  'H&M': 'kr',
  'Adidas': '€',
  'Aritzia': 'CA$',
  'Ahold Delhaize': '€',
  'ASOS': '£'
};

// Non-American companies (no SEC filings available)
export const NON_AMERICAN_COMPANIES = new Set([
  'Louis Vuitton',
  'Inditex/Zara',
  'H&M',
  'Adidas',
  'Aritzia',
  'Ahold Delhaize',
  'ASOS'
]);

// Field names that should be formatted as currency
export const CURRENCY_FIELDS = new Set([
  'Net Revenue',
  'Cost of Goods',
  'Gross Margin',
  'SGA',
  'Operating Profit',
  'Net Profit',
  'Inventory',
  'Current Assets',
  'Total Assets',
  'Current Liabilities',
  'Total Shareholder Equity',
  'Total Liabilities and Shareholder Equity'
]);

// Field names that should be formatted as percentages
export const PERCENTAGE_FIELDS = new Set([
  'Cost of Goods %',
  'Gross Margin %',
  'SGA %',
  'Operating Profit Margin %',
  'Net Profit Margin %',
  'Three Year Revenue CAGR',
  'Return on Assets',
  '3_Year_Revenue_CAGR',
  'Return_on_Assets'
]);

// Field names that should be formatted as ratios (1 decimal place, no symbol)
export const RATIO_FIELDS = new Set([
  'Inventory Turnover',
  'Current Ratio',
  'Quick Ratio',
  'Debt to Equity',
  'Asset Turnover',
  'Inventory_Turnover',
  'Current_Ratio',
  'Quick_Ratio',
  'Debt_to_Equity',
  'Asset_Turnover'
]);
