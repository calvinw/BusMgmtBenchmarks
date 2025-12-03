import { useState, useEffect } from 'react';
import { Search, Download, ArrowLeftRight } from 'lucide-react';
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

  // ROA = (Net Profit Margin % / 100) × Asset Turnover
  const netProfitMarginDecimal = indicators['Net Profit Margin %'] / 100;
  indicators['Return on Assets'] = roundToTenth(netProfitMarginDecimal * indicators['Asset Turnover'] * 100);

  // Three Year Revenue CAGR - fetched separately
  indicators['Three Year Revenue CAGR'] = null;

  return indicators;
}

async function fetchCAGR(company: string, year: string): Promise<number | null> {
  try {
    const response = await fetch(
      DB_URL + `?q=SELECT+Three_Year_Revenue_CAGR+FROM+financial_metrics+WHERE+company_name%3D%27${encodeURIComponent(company)}%27+AND+year%3D${year}`
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
    const encodedCompany = encodeURIComponent(company);
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
    console.log('Fetching from URL:', url);
    const response = await fetch(url);
    console.log('Response status:', response.status);
    const data: APIResponse = await response.json();
    console.log('Response data:', data);
    if (data.query_execution_status === 'Success') {
      return data.rows.map(row => row.company_name);
    }
    console.error('Query not successful:', data.query_execution_status);
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

export function FinancialComparisonTable() {
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany1, setSelectedCompany1] = useState<string>('');
  const [selectedYear1, setSelectedYear1] = useState<string>('2024');
  const [selectedCompany2, setSelectedCompany2] = useState<string>('');
  const [selectedYear2, setSelectedYear2] = useState<string>('2024');
  const [company1Data, setCompany1Data] = useState<CompanyData | null>(null);
  const [company2Data, setCompany2Data] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1000');

  // Fetch company list on mount
  useEffect(() => {
    const loadCompanies = async () => {
      console.log('Fetching company list...');
      const companyList = await fetchCompanyList();
      console.log('Company list fetched:', companyList.length, 'companies');
      setCompanies(companyList);
      if (companyList.length >= 2) {
        console.log('Setting default companies:', companyList[0], companyList[1]);
        setSelectedCompany1(companyList[0]);
        setSelectedCompany2(companyList[1]);
      } else {
        console.warn('Not enough companies found');
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  // Fetch company data when selections change
  useEffect(() => {
    const loadData = async () => {
      if (!selectedCompany1 || !selectedCompany2) {
        console.log('Waiting for company selection...');
        return;
      }

      console.log('Loading data for:', selectedCompany1, selectedYear1, 'and', selectedCompany2, selectedYear2);
      setLoading(true);
      const [data1, data2] = await Promise.all([
        fetchCompanyData(selectedCompany1, selectedYear1),
        fetchCompanyData(selectedCompany2, selectedYear2)
      ]);
      console.log('Data loaded:', data1?.company, data2?.company);
      setCompany1Data(data1);
      setCompany2Data(data2);
      setLoading(false);
    };
    loadData();
  }, [selectedCompany1, selectedYear1, selectedCompany2, selectedYear2]);

  const company1 = company1Data;
  const company2 = company2Data;

  return (
    <div className="space-y-6">
      {/* Sticky FIT Header */}
      <div className="sticky top-0 z-20 bg-neutral-50 py-6 shadow-sm">
        <div className="flex items-center justify-center">
          <img src={fitLogo} alt="FIT Retail Index Report" className="h-16" />
        </div>
      </div>

      {/* Currency Converter and Download Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="px-3 py-2 bg-white border border-neutral-200 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="KRW">KRW</option>
            <option value="JPY">JPY</option>
            <option value="GBP">GBP</option>
          </select>

          <ArrowLeftRight className="size-4 text-neutral-400" />

          <select
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            className="px-3 py-2 bg-white border border-neutral-200 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="KRW">KRW</option>
            <option value="JPY">JPY</option>
            <option value="GBP">GBP</option>
          </select>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-32 px-3 py-2 bg-white border border-neutral-200 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-['Geist:Medium',sans-serif] hover:bg-blue-700 transition-colors shadow-sm">
            Convert
          </button>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 hover:bg-neutral-50 transition-colors shadow-sm">
          <Download className="size-4" />
          Download CSV
        </button>
      </div>

      {loading && <div className="text-center py-8 text-neutral-500">Loading data...</div>}

      {!loading && company1 && company2 && (
        <>
          {/* Financial Comparison Table */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            {/* Section Header and Company Dropdowns */}
            <div className="grid grid-cols-[2fr_1fr_1fr] bg-neutral-100 sticky top-0 z-10 shadow-sm">
              <div className="px-6 py-4 flex items-center">
                <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
                  Financial Numbers (in thousands)
                </h2>
              </div>
              <div className="px-6 py-4 border-l border-neutral-200 space-y-2">
                <select
                  value={selectedCompany1}
                  onChange={(e) => setSelectedCompany1(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {companies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={selectedYear1}
                  onChange={(e) => setSelectedYear1(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AVAILABLE_YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="px-6 py-4 border-l border-neutral-200 space-y-2">
                <select
                  value={selectedCompany2}
                  onChange={(e) => setSelectedCompany2(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {companies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={selectedYear2}
                  onChange={(e) => setSelectedYear2(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AVAILABLE_YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Financial Numbers Section */}
            <TableRow label="Total Revenue" value1={formatValue(company1['Net Revenue'], 'Net Revenue', company1.company)} value2={formatValue(company2['Net Revenue'], 'Net Revenue', company2.company)} />
            <TableRow label="Cost of Goods" value1={formatValue(company1['Cost of Goods'], 'Cost of Goods', company1.company)} value2={formatValue(company2['Cost of Goods'], 'Cost of Goods', company2.company)} />
            <TableRow label="Gross Margin" value1={formatValue(company1['Gross Margin'], 'Gross Margin', company1.company)} value2={formatValue(company2['Gross Margin'], 'Gross Margin', company2.company)} />
            <TableRow label="Selling, General & Administrative Expenses" value1={formatValue(company1['SGA'], 'SGA', company1.company)} value2={formatValue(company2['SGA'], 'SGA', company2.company)} />
            <TableRow label="Operating Profit" value1={formatValue(company1['Operating Profit'], 'Operating Profit', company1.company)} value2={formatValue(company2['Operating Profit'], 'Operating Profit', company2.company)} />
            <TableRow label="Net Profit" value1={formatValue(company1['Net Profit'], 'Net Profit', company1.company)} value2={formatValue(company2['Net Profit'], 'Net Profit', company2.company)} />
            <TableRow label="Inventory" value1={formatValue(company1['Inventory'], 'Inventory', company1.company)} value2={formatValue(company2['Inventory'], 'Inventory', company2.company)} />
            <TableRow label="Total Assets" value1={formatValue(company1['Total Assets'], 'Total Assets', company1.company)} value2={formatValue(company2['Total Assets'], 'Total Assets', company2.company)} />

            {/* Financial Indicators Section */}
            <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200 border-t border-neutral-200">
              <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
                Financial Indicators
              </h2>
            </div>

            <TableRow label="Cost of goods percentage (COGS/Net Sales)" value1={formatValue(company1['Cost of Goods %'], 'Cost of Goods %', company1.company)} value2={formatValue(company2['Cost of Goods %'], 'Cost of Goods %', company2.company)} />
            <TableRow label="Gross margin percentage (GM/Net Sales)" value1={formatValue(company1['Gross Margin %'], 'Gross Margin %', company1.company)} value2={formatValue(company2['Gross Margin %'], 'Gross Margin %', company2.company)} />
            <TableRow label="SG&A expense percentage (SG&A/Net Sales)" value1={formatValue(company1['SGA %'], 'SGA %', company1.company)} value2={formatValue(company2['SGA %'], 'SGA %', company2.company)} />
            <TableRow label="Operating profit margin percentage (Op.Profit/Net Sales)" value1={formatValue(company1['Operating Profit Margin %'], 'Operating Profit Margin %', company1.company)} value2={formatValue(company2['Operating Profit Margin %'], 'Operating Profit Margin %', company2.company)} />
            <TableRow label="Net profit margin percentage (Net Profit/Net Sales)" value1={formatValue(company1['Net Profit Margin %'], 'Net Profit Margin %', company1.company)} value2={formatValue(company2['Net Profit Margin %'], 'Net Profit Margin %', company2.company)} />
            <TableRow label="Inventory turnover (COGS/Inventory)" value1={formatValue(company1['Inventory Turnover'], 'Inventory Turnover', company1.company)} value2={formatValue(company2['Inventory Turnover'], 'Inventory Turnover', company2.company)} />
            <TableRow label="Current Ratio (Current Assets/Current Liabilities)" value1={formatValue(company1['Current Ratio'], 'Current Ratio', company1.company)} value2={formatValue(company2['Current Ratio'], 'Current Ratio', company2.company)} />
            <TableRow label="Quick Ratio ((Cash + AR)/Current Liabilities)" value1={formatValue(company1['Quick Ratio'], 'Quick Ratio', company1.company)} value2={formatValue(company2['Quick Ratio'], 'Quick Ratio', company2.company)} />
            <TableRow label="Debt-to-Equity Ratio (Total Debt/Total Equity)" value1={formatValue(company1['Debt to Equity'], 'Debt to Equity', company1.company)} value2={formatValue(company2['Debt to Equity'], 'Debt to Equity', company2.company)} />
            <TableRow label="Asset turnover (Net Sales/Total Assets)" value1={formatValue(company1['Asset Turnover'], 'Asset Turnover', company1.company)} value2={formatValue(company2['Asset Turnover'], 'Asset Turnover', company2.company)} />
            <TableRow label="Return on assets (ROA)" value1={formatValue(company1['Return on Assets'], 'Return on Assets', company1.company)} value2={formatValue(company2['Return on Assets'], 'Return on Assets', company2.company)} />
            <TableRow label="3-Year Revenue CAGR" value1={formatValue(company1['Three Year Revenue CAGR'], 'Three Year Revenue CAGR', company1.company)} value2={formatValue(company2['Three Year Revenue CAGR'], 'Three Year Revenue CAGR', company2.company)} isLast />
          </div>

          {/* Footer */}
          <div className="text-neutral-500 font-['Geist:Regular',sans-serif] space-y-1">
            <p className="text-xs">
              Sources: {company1.company} {company1.year}: SEC report | {company2.company} {company2.year}: SEC report
            </p>
            <p className="text-xs">
              Fashion Institute of Technology Professors: Dr. Calvin Williamson, Shelley E. Kohan
            </p>
            <p className="text-xs">
              AI Systems Assistant: Jia Mei Lin, Direct Marketing BS 2026
            </p>
            <p className="text-xs">
              Made through the SUNY IITG Business Management Course Development Grant
            </p>
          </div>
        </>
      )}
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
      <div className="px-6 py-4 font-['Geist:Regular',sans-serif] text-neutral-950">
        {label}
      </div>
      <div className="px-6 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right">
        {value1}
      </div>
      <div className="px-6 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right">
        {value2}
      </div>
    </div>
  );
}
