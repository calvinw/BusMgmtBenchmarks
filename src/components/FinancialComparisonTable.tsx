import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import fitLogo from 'figma:asset/fd6a1765252638a4eb759f6a240b8db3c878408d.png';

// Types
interface CompanyData {
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

interface APIResponse {
  query_execution_status: string;
  rows: any[];
  schema: Array<{ columnName: string; columnType: string }>;
}

// Constants
const DB_URL = 'https://www.dolthub.com/api/v1alpha1/calvinw/BusMgmtBenchmarks/main';
const AVAILABLE_YEARS = ['2024', '2023', '2022', '2021', '2020', '2019'];

const currencyMap: Record<string, string> = {
  'Louis Vuitton': '€',
  'Inditex/Zara': '€',
  'H&M': 'kr',
  'Adidas': '€',
  'Aritzia': 'CA$',
  'Ahold Delhaize': '€',
  'ASOS': '£'
};

// Non-American companies (no SEC filings)
const NON_AMERICAN_COMPANIES = new Set([
  'Louis Vuitton',
  'Inditex/Zara',
  'H&M',
  'Adidas',
  'Aritzia',
  'Ahold Delhaize',
  'ASOS'
]);

// Convert company name to URL-safe format for SEC filing links
function toUrlSafeCompanyName(company: string): string {
  return company
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/&/g, 'and')
    .replace(/\//g, '-')
    .replace(/ /g, '-');
}

// Get SEC filing URL for a company and fiscal year
// HTML files use year+1 (e.g., fiscal 2024 data is in Amazon-2025.html)
function getSecFilingUrl(company: string, fiscalYear: number): string | null {
  if (NON_AMERICAN_COMPANIES.has(company)) {
    return null;
  }
  const safeCompany = toUrlSafeCompanyName(company);
  const fileYear = fiscalYear + 1;
  return `/sec/${safeCompany}-${fileYear}.html`;
}

// Helper functions
function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function calculateFinancialIndicators(row: any): Partial<CompanyData> {
  if (!row) return {};

  const indicators: any = {};
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

  // Percentage metrics (as percentages, not decimals)
  indicators['Cost of Goods %'] = roundToTenth((nums.costOfGoods / nums.netRevenue) * 100);
  indicators['Gross Margin %'] = roundToTenth((nums.grossMargin / nums.netRevenue) * 100);
  indicators['SGA %'] = roundToTenth((nums.sga / nums.netRevenue) * 100);
  indicators['Operating Profit Margin %'] = roundToTenth((nums.operatingProfit / nums.netRevenue) * 100);
  indicators['Net Profit Margin %'] = roundToTenth((nums.netProfit / nums.netRevenue) * 100);

  // Turnover and ratio metrics
  indicators['Inventory Turnover'] = roundToTenth(nums.costOfGoods / nums.inventory);
  indicators['Current Ratio'] = roundToTenth(nums.currentAssets / nums.currentLiabilities);

  // Quick Ratio: (Current Assets - Inventory) / Current Liabilities
  indicators['Quick Ratio'] = roundToTenth((nums.currentAssets - nums.inventory) / nums.currentLiabilities);

  // Debt to Equity: (Total Liabilities and Equity - Total Equity) / Total Equity
  const totalDebt = nums.totalLiabilitiesAndEquity - nums.totalShareholderEquity;
  indicators['Debt to Equity'] = roundToTenth(totalDebt / nums.totalShareholderEquity);

  // Asset Turnover
  indicators['Asset Turnover'] = roundToTenth(nums.netRevenue / nums.totalAssets);

  // ROA = Net Profit Margin % × Asset Turnover (using rounded displayed values)
  // This matches what students calculate manually from the displayed values
  indicators['Return on Assets'] = roundToTenth(indicators['Net Profit Margin %'] * indicators['Asset Turnover']);

  // Three Year Revenue CAGR - fetched separately
  indicators['Three Year Revenue CAGR'] = null;

  return indicators;
}

async function fetchCAGR(company: string, year: string): Promise<number | null> {
  try {
    // Escape single quotes for SQL by doubling them
    const escapedCompany = company.replace(/'/g, "''");
    const response = await fetch(
      DB_URL + `?q=SELECT+Three_Year_Revenue_CAGR+FROM+financial_metrics+WHERE+company_name%3D%27${encodeURIComponent(escapedCompany)}%27+AND+year%3D${year}`
    );
    const data: APIResponse = await response.json();
    if (data.query_execution_status === 'Success' && data.rows.length > 0) {
      return data.rows[0].Three_Year_Revenue_CAGR;
    }
    return null;
  } catch (error) {
    console.error('Error fetching CAGR:', error);
    return null;
  }
}

async function fetchCompanyData(company: string, year: string): Promise<CompanyData | null> {
  try {
    // Escape single quotes for SQL by doubling them
    const escapedCompany = company.replace(/'/g, "''");
    const encodedCompany = encodeURIComponent(escapedCompany);
    const response = await fetch(
      DB_URL + `?q=SELECT+*+FROM+financials+WHERE+company_name%3D%27${encodedCompany}%27+AND+year%3D${year}`
    );
    const data: APIResponse = await response.json();

    if (data.query_execution_status === 'Success' && data.rows.length > 0) {
      const row = data.rows[0];
      row.company = company;
      row.year = year;

      // Calculate financial indicators
      const indicators = calculateFinancialIndicators(row);
      Object.assign(row, indicators);

      // Fetch CAGR separately
      const cagr = await fetchCAGR(company, year);
      if (cagr !== null) {
        row['Three Year Revenue CAGR'] = cagr;
      }

      return row as CompanyData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching company data:', error);
    return null;
  }
}

async function fetchCompanyList(): Promise<string[]> {
  try {
    const url = DB_URL + `?q=SELECT+DISTINCT+company_name+FROM+financials+ORDER+BY+company_name`;
    const response = await fetch(url);
    const data: APIResponse = await response.json();
    if (data.query_execution_status === 'Success') {
      return data.rows.map(row => row.company_name);
    }
    return [];
  } catch (error) {
    console.error('Error fetching company list:', error);
    return [];
  }
}

function formatValue(value: number | null, fieldName: string, company: string): string {
  if (value === null || value === undefined) return 'N/A';

  const num = Number(value);

  // Handle percentage fields (already calculated as percentages)
  if (fieldName.includes('%') || fieldName === 'Three Year Revenue CAGR' || fieldName === 'Return on Assets') {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }) + '%';
  }

  // Handle currency fields
  if (fieldName === 'Gross Margin' || ['Net Revenue', 'Cost of Goods', 'SGA', 'Operating Profit', 'Net Profit', 'Inventory', 'Total Assets'].includes(fieldName)) {
    const currency = currencyMap[company] || 'USD';
    const symbol = currency === 'USD' ? '$' : currency;
    return symbol + num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  // Handle ratio fields (decimal values)
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

function formatValueWithMissingData(
  companyData: CompanyData | null,
  fieldName: string,
  companyName: string,
  year: string
): string {
  if (!companyData) {
    return '-';
  }
  return formatValue(companyData[fieldName as keyof CompanyData] as number, fieldName, companyName);
}

export function FinancialComparisonTable() {
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany1, setSelectedCompany1] = useState<string>('');
  const [selectedYear1, setSelectedYear1] = useState<string>('2024');
  const [selectedCompany2, setSelectedCompany2] = useState<string>('');
  const [selectedYear2, setSelectedYear2] = useState<string>('2024');
  const [company1Data, setCompany1Data] = useState<CompanyData | null>(null);
  const [company2Data, setCompany2Data] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch company list on mount
  useEffect(() => {
    const loadCompanies = async () => {
      const companyList = await fetchCompanyList();
      setCompanies(companyList);
      if (companyList.length >= 2) {
        setSelectedCompany1(companyList[0]);
        setSelectedCompany2(companyList[1]);
      } else {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  // Fetch company data when selections change
  useEffect(() => {
    const loadData = async () => {
      if (!selectedCompany1 || !selectedCompany2) {
        return;
      }

      setLoading(true);
      const [data1, data2] = await Promise.all([
        fetchCompanyData(selectedCompany1, selectedYear1),
        fetchCompanyData(selectedCompany2, selectedYear2)
      ]);
      setCompany1Data(data1);
      setCompany2Data(data2);
      setLoading(false);
    };
    loadData();
  }, [selectedCompany1, selectedYear1, selectedCompany2, selectedYear2]);

  const handleExportToExcel = () => {
    if (!company1Data && !company2Data) {
      alert('No data available to export. Please select companies and years that have data.');
      return;
    }

    // Define the sections and their fields
    const sections = {
      'Financial Numbers (in thousands)': [
        ['Total Revenue', 'Net Revenue'],
        ['Cost of Goods', 'Cost of Goods'],
        ['Gross Margin', 'Gross Margin'],
        ['Selling, General & Administrative Expenses', 'SGA'],
        ['Operating Profit', 'Operating Profit'],
        ['Net Profit', 'Net Profit'],
        ['Inventory', 'Inventory'],
        ['Total Assets', 'Total Assets']
      ],
      'Financial Indicators': [
        ['Cost of goods percentage (COGS/Net Sales)', 'Cost of Goods %'],
        ['Gross margin percentage (GM/Net Sales)', 'Gross Margin %'],
        ['SG&A expense percentage (SG&A/Net Sales)', 'SGA %'],
        ['Operating profit margin percentage (Op.Profit/Net Sales)', 'Operating Profit Margin %'],
        ['Net profit margin percentage (Net Profit/Net Sales)', 'Net Profit Margin %'],
        ['Inventory turnover (COGS/Inventory)', 'Inventory Turnover'],
        ['Current Ratio (Current Assets/Current Liabilities)', 'Current Ratio'],
        ['Quick Ratio ((Cash + AR)/Current Liabilities)', 'Quick Ratio'],
        ['Debt-to-Equity Ratio (Total Debt/Total Equity)', 'Debt to Equity'],
        ['Asset turnover (Net Sales/Total Assets)', 'Asset Turnover'],
        ['Return on assets (ROA)', 'Return on Assets'],
        ['3-Year Revenue CAGR', 'Three Year Revenue CAGR']
      ]
    };

    // Build the data array for Excel
    const excelData: any[][] = [];

    // Add header row
    excelData.push([
      '',
      company1Data ? `${company1Data.company} (${company1Data.year})` : `${selectedCompany1} (${selectedYear1}) - No Data`,
      company2Data ? `${company2Data.company} (${company2Data.year})` : `${selectedCompany2} (${selectedYear2}) - No Data`
    ]);

    // Add each section
    for (const [sectionName, fields] of Object.entries(sections)) {
      // Add section header
      excelData.push([sectionName, '', '']);

      // Add data rows
      for (const [label, fieldName] of fields) {
        const value1 = company1Data ? formatValue(company1Data[fieldName as keyof CompanyData] as number, fieldName, company1Data.company) : '-';
        const value2 = company2Data ? formatValue(company2Data[fieldName as keyof CompanyData] as number, fieldName, company2Data.company) : '-';
        excelData.push([label, value1, value2]);
      }
    }

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Company Comparison');

    // Download the file
    XLSX.writeFile(wb, 'company_comparison.xlsx');
  };

  const company1 = company1Data;
  const company2 = company2Data;

  return (
    <div className="space-y-2">
      {/* Sticky FIT Header */}
      <div className="sticky top-0 z-20 bg-neutral-50 py-6 shadow-sm">
        <div className="flex items-center justify-center">
          <img src={fitLogo} alt="FIT Retail Index Report" className="h-16" />
        </div>
      </div>

      {/* Export Section */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleExportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white border border-green-600 rounded-lg font-['Geist:Medium',sans-serif] hover:bg-green-700 transition-colors shadow-sm"
        >
          <Download className="size-4" />
          Export to Excel
        </button>
      </div>

      {loading && <div className="text-center py-8 text-neutral-500">Loading data...</div>}

      {!loading && (
      <>
      {/* Mobile Selector Panel - visible only on mobile */}
      <div className="md:hidden bg-white rounded-xl border border-neutral-200 shadow-sm p-4 space-y-4">
        <h3 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950 text-sm">Select Companies to Compare</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-neutral-500 font-['Geist:Medium',sans-serif]">Company 1</label>
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCompany1}
              onChange={(e) => setSelectedCompany1(e.target.value)}
            >
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedYear1}
              onChange={(e) => setSelectedYear1(e.target.value)}
            >
              {AVAILABLE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {!company1Data && (
              <div className="text-red-600 text-xs font-['Geist:Regular',sans-serif]">
                No data available
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs text-neutral-500 font-['Geist:Medium',sans-serif]">Company 2</label>
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCompany2}
              onChange={(e) => setSelectedCompany2(e.target.value)}
            >
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedYear2}
              onChange={(e) => setSelectedYear2(e.target.value)}
            >
              {AVAILABLE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {!company2Data && (
              <div className="text-red-600 text-xs font-['Geist:Regular',sans-serif]">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Comparison Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Desktop Header - with dropdowns */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] bg-neutral-100 sticky top-0 z-10 shadow-sm">
          <div className="px-6 py-4 flex items-center">
            <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
              Financial Numbers (in thousands)
            </h2>
          </div>
          <div className="px-6 py-4 border-l border-neutral-200 space-y-2">
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCompany1}
              onChange={(e) => setSelectedCompany1(e.target.value)}
            >
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedYear1}
              onChange={(e) => setSelectedYear1(e.target.value)}
            >
              {AVAILABLE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {!company1Data && (
              <div className="text-red-600 text-sm font-['Geist:Regular',sans-serif] mt-2">
                {selectedCompany1} {selectedYear1}: No data available
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-l border-neutral-200 space-y-2">
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCompany2}
              onChange={(e) => setSelectedCompany2(e.target.value)}
            >
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedYear2}
              onChange={(e) => setSelectedYear2(e.target.value)}
            >
              {AVAILABLE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {!company2Data && (
              <div className="text-red-600 text-sm font-['Geist:Regular',sans-serif] mt-2">
                {selectedCompany2} {selectedYear2}: No data available
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Unified grid for both sections */}
        <div className="md:hidden grid grid-cols-[2fr_1fr_1fr]">
          {/* Financial Numbers Header Row */}
          <div className="px-3 py-4 flex items-center bg-neutral-100 sticky top-0 z-10 border-b border-neutral-200">
            <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950 text-sm">
              Financial Numbers (in thousands)
            </h2>
          </div>
          <div className="px-3 py-4 border-l border-neutral-200 flex items-center justify-center bg-neutral-100 sticky top-0 z-10 border-b border-neutral-200">
            <span className="font-['Geist:Medium',sans-serif] text-neutral-950 text-xs text-center truncate">
              {selectedCompany1} ({selectedYear1})
            </span>
          </div>
          <div className="px-3 py-4 border-l border-neutral-200 flex items-center justify-center bg-neutral-100 sticky top-0 z-10 border-b border-neutral-200">
            <span className="font-['Geist:Medium',sans-serif] text-neutral-950 text-xs text-center truncate">
              {selectedCompany2} ({selectedYear2})
            </span>
          </div>

          {/* Financial Numbers Data Rows */}
          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Total Revenue</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Net Revenue', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Net Revenue', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Cost of Goods</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Cost of Goods', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Cost of Goods', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Gross Margin</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Gross Margin', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Gross Margin', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Selling, General & Administrative Expenses</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'SGA', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'SGA', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Operating Profit</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Operating Profit', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Operating Profit', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Net Profit</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Net Profit', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Net Profit', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Inventory</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Inventory', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Inventory', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Total Assets</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Total Assets', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Total Assets', selectedCompany2, selectedYear2)}</div>

          {/* Financial Indicators Header */}
          <div className="px-3 py-4 flex items-center bg-neutral-50 border-b border-neutral-200">
            <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950 text-sm">
              Financial Indicators
            </h2>
          </div>
          <div className="px-3 py-4 border-l border-neutral-200 bg-neutral-50 border-b border-neutral-200"></div>
          <div className="px-3 py-4 border-l border-neutral-200 bg-neutral-50 border-b border-neutral-200"></div>

          {/* Financial Indicators Data Rows */}
          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Cost of goods percentage (COGS/Net Sales)</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Cost of Goods %', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Cost of Goods %', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Gross margin percentage (GM/Net Sales)</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Gross Margin %', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Gross Margin %', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">SG&A expense percentage (SG&A/Net Sales)</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'SGA %', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'SGA %', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Operating profit margin percentage (Op.Profit/Net Sales)</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Operating Profit Margin %', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Operating Profit Margin %', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Net profit margin percentage (Net Profit/Net Sales)</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Net Profit Margin %', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Net Profit Margin %', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Inventory turnover (COGS/Inventory)</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Inventory Turnover', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Inventory Turnover', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Current Ratio (Current Assets/Current Liabilities)</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Current Ratio', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Current Ratio', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Quick Ratio ((Cash + AR)/Current Liabilities)</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Quick Ratio', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Quick Ratio', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Debt-to-Equity Ratio (Total Debt/Total Equity)</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Debt to Equity', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Debt to Equity', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Asset turnover (Net Sales/Total Assets)</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Asset Turnover', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Asset Turnover', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200">Return on assets (ROA)</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company1, 'Return on Assets', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right border-b border-neutral-200">{formatValueWithMissingData(company2, 'Return on Assets', selectedCompany2, selectedYear2)}</div>

          <div className="px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950">3-Year Revenue CAGR</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right">{formatValueWithMissingData(company1, 'Three Year Revenue CAGR', selectedCompany1, selectedYear1)}</div>
          <div className="px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right">{formatValueWithMissingData(company2, 'Three Year Revenue CAGR', selectedCompany2, selectedYear2)}</div>
        </div>

        {/* Desktop: Original structure */}
        <div className="hidden md:block">
          <TableRow label="Total Revenue" value1={formatValueWithMissingData(company1, 'Net Revenue', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Net Revenue', selectedCompany2, selectedYear2)} />
          <TableRow label="Cost of Goods" value1={formatValueWithMissingData(company1, 'Cost of Goods', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Cost of Goods', selectedCompany2, selectedYear2)} />
          <TableRow label="Gross Margin" value1={formatValueWithMissingData(company1, 'Gross Margin', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Gross Margin', selectedCompany2, selectedYear2)} />
          <TableRow label="Selling, General & Administrative Expenses" value1={formatValueWithMissingData(company1, 'SGA', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'SGA', selectedCompany2, selectedYear2)} />
          <TableRow label="Operating Profit" value1={formatValueWithMissingData(company1, 'Operating Profit', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Operating Profit', selectedCompany2, selectedYear2)} />
          <TableRow label="Net Profit" value1={formatValueWithMissingData(company1, 'Net Profit', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Net Profit', selectedCompany2, selectedYear2)} />
          <TableRow label="Inventory" value1={formatValueWithMissingData(company1, 'Inventory', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Inventory', selectedCompany2, selectedYear2)} />
          <TableRow label="Total Assets" value1={formatValueWithMissingData(company1, 'Total Assets', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Total Assets', selectedCompany2, selectedYear2)} />

          {/* Financial Indicators Section */}
          <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200 border-t border-neutral-200">
            <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
              Financial Indicators
            </h2>
          </div>

          <TableRow label="Cost of goods percentage (COGS/Net Sales)" value1={formatValueWithMissingData(company1, 'Cost of Goods %', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Cost of Goods %', selectedCompany2, selectedYear2)} />
          <TableRow label="Gross margin percentage (GM/Net Sales)" value1={formatValueWithMissingData(company1, 'Gross Margin %', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Gross Margin %', selectedCompany2, selectedYear2)} />
          <TableRow label="SG&A expense percentage (SG&A/Net Sales)" value1={formatValueWithMissingData(company1, 'SGA %', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'SGA %', selectedCompany2, selectedYear2)} />
          <TableRow label="Operating profit margin percentage (Op.Profit/Net Sales)" value1={formatValueWithMissingData(company1, 'Operating Profit Margin %', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Operating Profit Margin %', selectedCompany2, selectedYear2)} />
          <TableRow label="Net profit margin percentage (Net Profit/Net Sales)" value1={formatValueWithMissingData(company1, 'Net Profit Margin %', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Net Profit Margin %', selectedCompany2, selectedYear2)} />
          <TableRow label="Inventory turnover (COGS/Inventory)" value1={formatValueWithMissingData(company1, 'Inventory Turnover', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Inventory Turnover', selectedCompany2, selectedYear2)} />
          <TableRow label="Current Ratio (Current Assets/Current Liabilities)" value1={formatValueWithMissingData(company1, 'Current Ratio', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Current Ratio', selectedCompany2, selectedYear2)} />
          <TableRow label="Quick Ratio ((Cash + AR)/Current Liabilities)" value1={formatValueWithMissingData(company1, 'Quick Ratio', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Quick Ratio', selectedCompany2, selectedYear2)} />
          <TableRow label="Debt-to-Equity Ratio (Total Debt/Total Equity)" value1={formatValueWithMissingData(company1, 'Debt to Equity', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Debt to Equity', selectedCompany2, selectedYear2)} />
          <TableRow label="Asset turnover (Net Sales/Total Assets)" value1={formatValueWithMissingData(company1, 'Asset Turnover', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Asset Turnover', selectedCompany2, selectedYear2)} />
          <TableRow label="Return on assets (ROA)" value1={formatValueWithMissingData(company1, 'Return on Assets', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Return on Assets', selectedCompany2, selectedYear2)} />
          <TableRow label="3-Year Revenue CAGR" value1={formatValueWithMissingData(company1, 'Three Year Revenue CAGR', selectedCompany1, selectedYear1)} value2={formatValueWithMissingData(company2, 'Three Year Revenue CAGR', selectedCompany2, selectedYear2)} isLast />
        </div>
      </div>
      </>
      )}

      {/* Footer */}
      <div className="text-neutral-500 font-['Geist:Regular',sans-serif] space-y-1">
        {/* Row 1: SEC report links aligned with table columns */}
        <div className="grid grid-cols-[2fr_1fr_1fr] text-xs items-start">
          <span className="px-6"></span>
          <div className="px-6 border-l border-neutral-200 text-right text-[10px]">
            {company1 ? (
              getSecFilingUrl(company1.company, Number(company1.year)) ? (
                <>
                  Source: <a
                    href={getSecFilingUrl(company1.company, Number(company1.year))!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {company1.company} {company1.year} SEC Report
                  </a>
                </>
              ) : (
                <span>{company1.company} {company1.year}: No SEC report</span>
              )
            ) : (
              <span>{selectedCompany1} {selectedYear1}: No data available</span>
            )}
          </div>
          <div className="px-6 border-l border-neutral-200 text-right text-[10px]">
            {company2 ? (
              getSecFilingUrl(company2.company, Number(company2.year)) ? (
                <>
                  Source: <a
                    href={getSecFilingUrl(company2.company, Number(company2.year))!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {company2.company} {company2.year} SEC Report
                  </a>
                </>
              ) : (
                <span>{company2.company} {company2.year}: No SEC report</span>
              )
            ) : (
              <span>{selectedCompany2} {selectedYear2}: No data available</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function TableRow({
  label,
  value1,
  value2,
  isLast = false
}: {
  label: string;
  value1: string;
  value2: string;
  isLast?: boolean;
}) {
  return (
    <div className={`grid grid-cols-[2fr_1fr_1fr] ${!isLast ? 'border-b border-neutral-200' : ''}`}>
      <div className="px-3 md:px-6 py-4 font-['Geist:Regular',sans-serif] text-neutral-950">
        {label}
      </div>
      <div className="px-3 md:px-6 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right">
        {value1}
      </div>
      <div className="px-3 md:px-6 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right">
        {value2}
      </div>
    </div>
  );
}