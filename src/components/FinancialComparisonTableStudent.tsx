import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import fitLogo from 'figma:asset/fd6a1765252638a4eb759f6a240b8db3c878408d.png';
import { AVAILABLE_YEARS, NON_AMERICAN_COMPANIES } from '@/lib/constants';
import { formatValue, formatValueOrDash } from '@/lib/formatters';
import { fetchCompanyFinancials, fetchCompanyNames, type CompanyFinancials } from '@/lib/api';

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
function getSecFilingUrl(company: string, fiscalYear: number): string | null {
  if (NON_AMERICAN_COMPANIES.has(company)) {
    return null;
  }
  const safeCompany = toUrlSafeCompanyName(company);
  return `/sec/${safeCompany}-${fiscalYear}.html`;
}

// Financial Indicator fields that should show dashes in student version
const INDICATOR_FIELDS = [
  'Cost of Goods %', 'Gross Margin %', 'SGA %',
  'Operating Profit Margin %', 'Net Profit Margin %',
  'Inventory Turnover', 'Current Ratio', 'Quick Ratio',
  'Debt to Equity', 'Asset Turnover', 'Return on Assets',
  'Three Year Revenue CAGR'
];

// Helper to format a value from company data, returning dash if no data
function formatCompanyValue(
  companyData: CompanyFinancials | null,
  fieldName: string
): string {
  if (!companyData) {
    return '-';
  }

  // For student version, show dashes for all indicator fields
  if (INDICATOR_FIELDS.includes(fieldName)) {
    return '-';
  }

  return formatValueOrDash(
    companyData[fieldName as keyof CompanyFinancials] as number,
    fieldName,
    companyData.company
  );
}

export function FinancialComparisonTableStudent() {
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany1, setSelectedCompany1] = useState<string>('');
  const [selectedYear1, setSelectedYear1] = useState<string>('2024');
  const [selectedCompany2, setSelectedCompany2] = useState<string>('');
  const [selectedYear2, setSelectedYear2] = useState<string>('2024');
  const [company1Data, setCompany1Data] = useState<CompanyFinancials | null>(null);
  const [company2Data, setCompany2Data] = useState<CompanyFinancials | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch company list on mount
  useEffect(() => {
    const loadCompanies = async () => {
      const companyList = await fetchCompanyNames();
      setCompanies(companyList);
      if (companyList.length >= 2) {
        setSelectedCompany1(companyList.includes("Dillard's") ? "Dillard's" : companyList[0]);
        setSelectedCompany2(companyList.includes("Macy's") ? "Macy's" : companyList[1]);
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
        fetchCompanyFinancials(selectedCompany1, selectedYear1),
        fetchCompanyFinancials(selectedCompany2, selectedYear2)
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
        // For student version, show dashes for all indicator fields
        let value1: string;
        let value2: string;

        if (INDICATOR_FIELDS.includes(fieldName)) {
          value1 = '-';
          value2 = '-';
        } else {
          value1 = company1Data ? formatValue(company1Data[fieldName as keyof CompanyFinancials] as number, fieldName, company1Data.company) : '-';
          value2 = company2Data ? formatValue(company2Data[fieldName as keyof CompanyFinancials] as number, fieldName, company2Data.company) : '-';
        }
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
        <div className="md:hidden grid grid-cols-3">
          {/* Financial Numbers Header Row */}
          <div className="px-2 py-3 flex items-center bg-neutral-100 sticky top-0 z-10 border-b border-neutral-200 min-w-0">
            <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950 text-xs truncate">
              Financials (000s)
            </h2>
          </div>
          <div className="px-2 py-3 border-l border-neutral-200 flex items-center justify-center bg-neutral-100 sticky top-0 z-10 border-b border-neutral-200 min-w-0">
            <span className="font-['Geist:Medium',sans-serif] text-neutral-950 text-[10px] text-center truncate">
              {selectedCompany1} ({selectedYear1})
            </span>
          </div>
          <div className="px-2 py-3 border-l border-neutral-200 flex items-center justify-center bg-neutral-100 sticky top-0 z-10 border-b border-neutral-200 min-w-0">
            <span className="font-['Geist:Medium',sans-serif] text-neutral-950 text-[10px] text-center truncate">
              {selectedCompany2} ({selectedYear2})
            </span>
          </div>

          {/* Financial Numbers Data Rows */}
          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Revenue</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Net Revenue')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Net Revenue')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">COGS</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Cost of Goods')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Cost of Goods')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Gross Margin</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Gross Margin')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Gross Margin')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">SG&A</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'SGA')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'SGA')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Op. Profit</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Operating Profit')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Operating Profit')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Net Profit</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Net Profit')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Net Profit')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Inventory</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Inventory')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Inventory')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Total Assets</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Total Assets')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Total Assets')}</div>

          {/* Financial Indicators Header */}
          <div className="px-2 py-3 flex items-center bg-neutral-50 border-b border-neutral-200 min-w-0">
            <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950 text-xs truncate">
              Indicators
            </h2>
          </div>
          <div className="px-2 py-3 border-l border-neutral-200 bg-neutral-50 border-b border-neutral-200 min-w-0"></div>
          <div className="px-2 py-3 border-l border-neutral-200 bg-neutral-50 border-b border-neutral-200 min-w-0"></div>

          {/* Financial Indicators Data Rows - All show dashes in student version */}
          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">COGS %</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Cost of Goods %')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Cost of Goods %')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Gross %</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Gross Margin %')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Gross Margin %')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">SG&A %</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'SGA %')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'SGA %')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Op. Margin %</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Operating Profit Margin %')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Operating Profit Margin %')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Net Margin %</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Net Profit Margin %')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Net Profit Margin %')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Inv. Turn</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Inventory Turnover')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Inventory Turnover')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Current</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Current Ratio')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Current Ratio')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Quick</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Quick Ratio')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Quick Ratio')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">D/E</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Debt to Equity')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Debt to Equity')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">Asset Turn</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Asset Turnover')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Asset Turnover')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs border-b border-neutral-200 min-w-0 truncate">ROA</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company1, 'Return on Assets')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right border-b border-neutral-200 min-w-0">{formatCompanyValue(company2, 'Return on Assets')}</div>

          <div className="px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs min-w-0 truncate">3Y CAGR</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right min-w-0">{formatCompanyValue(company1, 'Three Year Revenue CAGR')}</div>
          <div className="px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right min-w-0">{formatCompanyValue(company2, 'Three Year Revenue CAGR')}</div>
        </div>

        {/* Desktop: Original structure */}
        <div className="hidden md:block">
          <TableRow label="Total Revenue" value1={formatCompanyValue(company1, 'Net Revenue')} value2={formatCompanyValue(company2, 'Net Revenue')} />
          <TableRow label="Cost of Goods" value1={formatCompanyValue(company1, 'Cost of Goods')} value2={formatCompanyValue(company2, 'Cost of Goods')} />
          <TableRow label="Gross Margin" value1={formatCompanyValue(company1, 'Gross Margin')} value2={formatCompanyValue(company2, 'Gross Margin')} />
          <TableRow label="Selling, General & Administrative Expenses" value1={formatCompanyValue(company1, 'SGA')} value2={formatCompanyValue(company2, 'SGA')} />
          <TableRow label="Operating Profit" value1={formatCompanyValue(company1, 'Operating Profit')} value2={formatCompanyValue(company2, 'Operating Profit')} />
          <TableRow label="Net Profit" value1={formatCompanyValue(company1, 'Net Profit')} value2={formatCompanyValue(company2, 'Net Profit')} />
          <TableRow label="Inventory" value1={formatCompanyValue(company1, 'Inventory')} value2={formatCompanyValue(company2, 'Inventory')} />
          <TableRow label="Total Assets" value1={formatCompanyValue(company1, 'Total Assets')} value2={formatCompanyValue(company2, 'Total Assets')} />

          {/* Financial Indicators Section */}
          <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200 border-t border-neutral-200">
            <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
              Financial Indicators
            </h2>
          </div>

          <TableRow label="Cost of goods percentage (COGS/Net Sales)" value1={formatCompanyValue(company1, 'Cost of Goods %')} value2={formatCompanyValue(company2, 'Cost of Goods %')} />
          <TableRow label="Gross margin percentage (GM/Net Sales)" value1={formatCompanyValue(company1, 'Gross Margin %')} value2={formatCompanyValue(company2, 'Gross Margin %')} />
          <TableRow label="SG&A expense percentage (SG&A/Net Sales)" value1={formatCompanyValue(company1, 'SGA %')} value2={formatCompanyValue(company2, 'SGA %')} />
          <TableRow label="Operating profit margin percentage (Op.Profit/Net Sales)" value1={formatCompanyValue(company1, 'Operating Profit Margin %')} value2={formatCompanyValue(company2, 'Operating Profit Margin %')} />
          <TableRow label="Net profit margin percentage (Net Profit/Net Sales)" value1={formatCompanyValue(company1, 'Net Profit Margin %')} value2={formatCompanyValue(company2, 'Net Profit Margin %')} />
          <TableRow label="Inventory turnover (COGS/Inventory)" value1={formatCompanyValue(company1, 'Inventory Turnover')} value2={formatCompanyValue(company2, 'Inventory Turnover')} />
          <TableRow label="Current Ratio (Current Assets/Current Liabilities)" value1={formatCompanyValue(company1, 'Current Ratio')} value2={formatCompanyValue(company2, 'Current Ratio')} />
          <TableRow label="Quick Ratio ((Cash + AR)/Current Liabilities)" value1={formatCompanyValue(company1, 'Quick Ratio')} value2={formatCompanyValue(company2, 'Quick Ratio')} />
          <TableRow label="Debt-to-Equity Ratio (Total Debt/Total Equity)" value1={formatCompanyValue(company1, 'Debt to Equity')} value2={formatCompanyValue(company2, 'Debt to Equity')} />
          <TableRow label="Asset turnover (Net Sales/Total Assets)" value1={formatCompanyValue(company1, 'Asset Turnover')} value2={formatCompanyValue(company2, 'Asset Turnover')} />
          <TableRow label="Return on assets (ROA)" value1={formatCompanyValue(company1, 'Return on Assets')} value2={formatCompanyValue(company2, 'Return on Assets')} />
          <TableRow label="3-Year Revenue CAGR" value1={formatCompanyValue(company1, 'Three Year Revenue CAGR')} value2={formatCompanyValue(company2, 'Three Year Revenue CAGR')} isLast />
        </div>
      </div>
      </>
      )}

      {/* Footer */}
      <div className="text-neutral-500 font-['Geist:Regular',sans-serif] space-y-1">
        {/* Mobile: SEC report links aligned with mobile table (equal columns) */}
        <div className="md:hidden grid grid-cols-3 text-xs items-start">
          <span className="px-2"></span>
          <div className="px-2 border-l border-neutral-200 text-right text-[10px]">
            {company1 && getSecFilingUrl(company1.company, Number(company1.year)) ? (
              <a
                href={getSecFilingUrl(company1.company, Number(company1.year))!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Source: SEC
              </a>
            ) : (
              <span>No SEC report</span>
            )}
          </div>
          <div className="px-2 border-l border-neutral-200 text-right text-[10px]">
            {company2 && getSecFilingUrl(company2.company, Number(company2.year)) ? (
              <a
                href={getSecFilingUrl(company2.company, Number(company2.year))!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Source: SEC
              </a>
            ) : (
              <span>No SEC report</span>
            )}
          </div>
        </div>

        {/* Desktop: SEC report links aligned with desktop table (2:1:1 ratio) */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] text-xs items-start">
          <span className="px-6"></span>
          <div className="px-6 border-l border-neutral-200 text-right text-[10px]">
            {company1 && getSecFilingUrl(company1.company, Number(company1.year)) ? (
              <a
                href={getSecFilingUrl(company1.company, Number(company1.year))!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Source: SEC report
              </a>
            ) : (
              <span>No SEC report</span>
            )}
          </div>
          <div className="px-6 border-l border-neutral-200 text-right text-[10px]">
            {company2 && getSecFilingUrl(company2.company, Number(company2.year)) ? (
              <a
                href={getSecFilingUrl(company2.company, Number(company2.year))!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Source: SEC report
              </a>
            ) : (
              <span>No SEC report</span>
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
