import { DB_URL } from './constants';
import { roundToTenth } from './formatters';

// Common API response type
export interface APIResponse<T = Record<string, unknown>> {
  query_execution_status: string;
  rows: T[];
  schema?: Array<{ columnName: string; columnType: string }>;
}

// Company financial data from the financials table
export interface CompanyFinancials {
  company: string;
  year: number;
  'Net Revenue': number;
  'Cost of Goods': number;
  'Gross Margin': number;
  'SGA': number;
  'Operating Profit': number;
  'Net Profit': number;
  'Inventory': number;
  'Current Assets': number;
  'Total Assets': number;
  'Current Liabilities': number;
  'Total Shareholder Equity': number;
  'Total Liabilities and Shareholder Equity': number;
  // Calculated indicators
  'Cost of Goods %': number;
  'Gross Margin %': number;
  'SGA %': number;
  'Operating Profit Margin %': number;
  'Net Profit Margin %': number;
  'Inventory Turnover': number;
  'Current Ratio': number;
  'Quick Ratio': number;
  'Debt to Equity': number;
  'Asset Turnover': number;
  'Return on Assets': number;
  'Three Year Revenue CAGR': number | null;
}

// Company info with segment data from benchmarks view
export interface CompanyInfo {
  company: string;
  segment: string;
  subsegment: string | null;
}

// Benchmark data (segment or subsegment averages)
export interface BenchmarkData {
  segment?: string;
  subsegment?: string;
  [key: string]: string | number | null | undefined;
}

/**
 * Escapes a company name for use in SQL queries.
 * Doubles single quotes to prevent SQL injection.
 */
export function escapeForSQL(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Builds a query URL for the Dolt API.
 */
export function buildQueryUrl(query: string): string {
  return `${DB_URL}?q=${encodeURIComponent(query)}`;
}

/**
 * Executes a query against the Dolt API.
 */
export async function executeQuery<T = Record<string, unknown>>(
  query: string
): Promise<APIResponse<T>> {
  const response = await fetch(buildQueryUrl(query));
  return response.json();
}

/**
 * Calculates financial indicators from raw financial data.
 */
export function calculateFinancialIndicators(
  row: Record<string, number>
): Record<string, number | null> {
  const nums = {
    netRevenue: Number(row['Net Revenue']),
    costOfGoods: Number(row['Cost of Goods']),
    grossMargin: Number(row['Gross Margin']),
    sga: Number(row['SGA']),
    operatingProfit: Number(row['Operating Profit']),
    netProfit: Number(row['Net Profit']),
    inventory: Number(row['Inventory']),
    currentAssets: Number(row['Current Assets']),
    totalAssets: Number(row['Total Assets']),
    currentLiabilities: Number(row['Current Liabilities']),
    totalShareholderEquity: Number(row['Total Shareholder Equity']),
    totalLiabilitiesAndEquity: Number(row['Total Liabilities and Shareholder Equity'])
  };

  const indicators: Record<string, number | null> = {};

  // Percentage metrics (as percentages, not decimals)
  indicators['Cost of Goods %'] = roundToTenth((nums.costOfGoods / nums.netRevenue) * 100);
  indicators['Gross Margin %'] = roundToTenth((nums.grossMargin / nums.netRevenue) * 100);
  indicators['SGA %'] = roundToTenth((nums.sga / nums.netRevenue) * 100);
  indicators['Operating Profit Margin %'] = roundToTenth((nums.operatingProfit / nums.netRevenue) * 100);
  indicators['Net Profit Margin %'] = roundToTenth((nums.netProfit / nums.netRevenue) * 100);

  // Turnover and ratio metrics
  indicators['Inventory Turnover'] = nums.inventory > 0 ? roundToTenth(nums.costOfGoods / nums.inventory) : null;
  indicators['Current Ratio'] = roundToTenth(nums.currentAssets / nums.currentLiabilities);
  indicators['Quick Ratio'] = roundToTenth((nums.currentAssets - nums.inventory) / nums.currentLiabilities);

  // Debt to Equity: (Total Liabilities and Equity - Total Equity) / Total Equity
  const totalDebt = nums.totalLiabilitiesAndEquity - nums.totalShareholderEquity;
  indicators['Debt to Equity'] = roundToTenth(totalDebt / nums.totalShareholderEquity);

  // Asset Turnover
  indicators['Asset Turnover'] = roundToTenth(nums.netRevenue / nums.totalAssets);

  // ROA = Net Profit Margin % × Asset Turnover (using rounded displayed values)
  indicators['Return on Assets'] = roundToTenth(
    (indicators['Net Profit Margin %'] ?? 0) * (indicators['Asset Turnover'] ?? 0)
  );

  // Three Year Revenue CAGR - fetched separately
  indicators['Three Year Revenue CAGR'] = null;

  return indicators;
}

/**
 * Fetches the 3-Year Revenue CAGR for a company.
 */
export async function fetchCAGR(company: string, year: string): Promise<number | null> {
  try {
    const escapedCompany = escapeForSQL(company);
    const query = `SELECT Three_Year_Revenue_CAGR FROM financial_metrics WHERE company_name='${escapedCompany}' AND year=${year}`;
    const data = await executeQuery<{ Three_Year_Revenue_CAGR: number }>(query);

    if (data.query_execution_status === 'Success' && data.rows.length > 0) {
      return data.rows[0].Three_Year_Revenue_CAGR;
    }
    return null;
  } catch (error) {
    console.error('Error fetching CAGR:', error);
    return null;
  }
}

/**
 * Fetches company financial data and calculates indicators.
 */
export async function fetchCompanyFinancials(
  company: string,
  year: string
): Promise<CompanyFinancials | null> {
  try {
    const escapedCompany = escapeForSQL(company);
    const query = `SELECT * FROM financials WHERE company_name='${escapedCompany}' AND year=${year}`;
    const data = await executeQuery<Record<string, number>>(query);

    if (data.query_execution_status === 'Success' && data.rows.length > 0) {
      const row = data.rows[0];
      const indicators = calculateFinancialIndicators(row);

      // Fetch CAGR separately
      const cagr = await fetchCAGR(company, year);

      return {
        ...row,
        ...indicators,
        company,
        year: Number(year),
        'Three Year Revenue CAGR': cagr
      } as CompanyFinancials;
    }
    return null;
  } catch (error) {
    console.error('Error fetching company data:', error);
    return null;
  }
}

/**
 * Fetches list of all company names from the financials table.
 */
export async function fetchCompanyNames(): Promise<string[]> {
  try {
    const query = 'SELECT DISTINCT company_name FROM financials ORDER BY company_name';
    const data = await executeQuery<{ company_name: string }>(query);

    if (data.query_execution_status === 'Success') {
      return data.rows.map(row => row.company_name);
    }
    return [];
  } catch (error) {
    console.error('Error fetching company list:', error);
    return [];
  }
}

/**
 * Fetches company list with segment info from benchmarks view.
 */
export async function fetchCompaniesWithSegments(year: string): Promise<CompanyInfo[]> {
  try {
    const query = `SELECT DISTINCT company, segment, subsegment FROM \`benchmarks ${year} view\` ORDER BY company`;
    const data = await executeQuery<CompanyInfo>(query);
    return data.rows;
  } catch (error) {
    console.error('Error fetching company list:', error);
    return [];
  }
}

/**
 * Fetches segment benchmark averages.
 */
export async function fetchSegmentBenchmarks(year: string): Promise<BenchmarkData[]> {
  try {
    const query = `SELECT * FROM \`segment benchmarks ${year}\``;
    const data = await executeQuery<BenchmarkData>(query);
    return data.rows;
  } catch (error) {
    console.error('Error fetching segment benchmarks:', error);
    return [];
  }
}

/**
 * Fetches subsegment benchmark averages.
 */
export async function fetchSubsegmentBenchmarks(year: string): Promise<BenchmarkData[]> {
  try {
    const query = `SELECT * FROM \`subsegment benchmarks ${year}\``;
    const data = await executeQuery<BenchmarkData>(query);
    return data.rows;
  } catch (error) {
    console.error('Error fetching subsegment benchmarks:', error);
    return [];
  }
}

/**
 * Fetches company benchmark data from the benchmarks view.
 */
export async function fetchCompanyBenchmark(
  company: string,
  year: string
): Promise<BenchmarkData | null> {
  try {
    const query = `SELECT * FROM \`benchmarks ${year} view\` WHERE company="${company}"`;
    const data = await executeQuery<BenchmarkData>(query);
    return data.rows[0] || null;
  } catch (error) {
    console.error('Error fetching company benchmark data:', error);
    return null;
  }
}

// Report types for the Reports page
export const REPORT_TYPES = {
  segments_and_benchmarks: 'Segment and Benchmark Reports',
  segments: 'Segment Reports',
  benchmarks: 'Benchmark Reports',
  subsegments: 'Subsegment Reports'
} as const;

export type ReportType = keyof typeof REPORT_TYPES;

/**
 * Fetches report data based on report type.
 */
export async function fetchReportData(
  reportType: ReportType,
  year: string
): Promise<APIResponse | null> {
  const queries: Record<ReportType, string> = {
    segments_and_benchmarks: `SELECT * FROM \`segment and company benchmarks ${year}\``,
    benchmarks: `SELECT * FROM \`benchmarks ${year} view\``,
    segments: `SELECT * FROM \`segment benchmarks ${year}\``,
    subsegments: `SELECT * FROM \`subsegment benchmarks ${year}\``
  };

  try {
    const query = queries[reportType];
    if (!query) return null;

    return await executeQuery(query);
  } catch (error) {
    console.error('Error fetching report data:', error);
    return null;
  }
}
