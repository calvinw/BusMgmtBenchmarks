import { useState, useEffect } from 'react';
import React from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import fitLogo from 'figma:asset/fd6a1765252638a4eb759f6a240b8db3c878408d.png';

// Types
interface CompanyInfo {
  company: string;
  segment: string;
  subsegment: string | null;
}

interface BenchmarkData {
  [key: string]: any;
  segment?: string;
  subsegment?: string;
}

interface APIResponse {
  query_execution_status: string;
  rows: any[];
  schema?: Array<{ columnName: string; columnType: string }>;
}

// Constants
const DB_URL = 'https://www.dolthub.com/api/v1alpha1/calvinw/BusMgmtBenchmarks/main';
const AVAILABLE_YEARS = ['2024', '2023', '2022', '2021', '2020', '2019'];

// Helper function
function formatValue(value: any, isPercentage = false, isTurnover = false, isRatio = false): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  const num = Number(value);
  if (isNaN(num)) return 'N/A';

  if (isPercentage) {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num / 100);
  }

  if (isTurnover || isRatio) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num);
  }

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// API Functions
async function fetchCompanyList(year: string): Promise<CompanyInfo[]> {
  try {
    const response = await fetch(
      DB_URL + `?q=SELECT+DISTINCT+company,+segment,+subsegment+FROM+%60benchmarks+${year}+view%60+ORDER+BY+company`
    );
    const data: APIResponse = await response.json();
    return data.rows as CompanyInfo[];
  } catch (error) {
    console.error('Error fetching company list:', error);
    return [];
  }
}

async function fetchSegmentBenchmarks(year: string): Promise<BenchmarkData[]> {
  try {
    const response = await fetch(
      DB_URL + `?q=SELECT+*+FROM+%60segment+benchmarks+${year}%60`
    );
    const data: APIResponse = await response.json();
    return data.rows;
  } catch (error) {
    console.error('Error fetching segment benchmarks:', error);
    return [];
  }
}

async function fetchSubsegmentBenchmarks(year: string): Promise<BenchmarkData[]> {
  try {
    const response = await fetch(
      DB_URL + `?q=SELECT+*+FROM+%60subsegment+benchmarks+${year}%60`
    );
    const data: APIResponse = await response.json();
    return data.rows;
  } catch (error) {
    console.error('Error fetching subsegment benchmarks:', error);
    return [];
  }
}

async function fetchCompanyBenchmarkData(company: string, year: string): Promise<BenchmarkData | null> {
  try {
    const encodedCompany = encodeURIComponent(company);
    const response = await fetch(
      DB_URL + `?q=SELECT+*+FROM+%60benchmarks+${year}+view%60+WHERE+company=%22${encodedCompany}%22`
    );
    const data: APIResponse = await response.json();
    return data.rows[0] || null;
  } catch (error) {
    console.error('Error fetching company benchmark data:', error);
    return null;
  }
}

export function CompanySegmentComparison() {
  const [selectedYear, setSelectedYear] = useState('2023');
  const [selectedCompany, setSelectedCompany] = useState("Dillard's");
  const [selectedSegment, setSelectedSegment] = useState('Department Store');
  const [selectedSubsegment, setSelectedSubsegment] = useState('');

  const [allCompanies, setAllCompanies] = useState<CompanyInfo[]>([]);
  const [segmentBenchmarks, setSegmentBenchmarks] = useState<BenchmarkData[]>([]);
  const [subsegmentBenchmarks, setSubsegmentBenchmarks] = useState<BenchmarkData[]>([]);

  const [companyData, setCompanyData] = useState<BenchmarkData | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  // Metrics definition
  const metrics = [
    ['Cost of goods percentage (COGS/Net Sales)', 'Cost of Goods %', 'Cost_of_Goods_Percentage', true, false, false],
    ['Gross margin percentage (GM/Net Sales)', 'Gross Margin %', 'Gross_Margin_Percentage', true, false, false],
    ['SG&A expense percentage (SG&A/Net Sales)', 'SGA %', 'SGA_Percentage', true, false, false],
    ['Operating profit margin percentage (Op.Profit/Net Sales)', 'Operating Profit Margin %', 'Operating_Profit_Margin_Percentage', true, false, false],
    ['Net profit margin percentage (Net Profit/Net Sales)', 'Net Profit Margin %', 'Net_Profit_Margin_Percentage', true, false, false],
    ['Inventory turnover (COGS/Inventory)', 'Inventory Turnover', 'Inventory_Turnover', false, true, false],
    ['Current Ratio (Current Assets/Current Liabilities)', 'Current Ratio', 'Current_Ratio', false, false, true],
    ['Quick Ratio ((Cash + AR)/Current Liabilities)', 'Quick Ratio', 'Quick_Ratio', false, false, true],
    ['Debt-to-Equity Ratio (Total Debt/Total Equity)', 'Debt to Equity', 'Debt_to_Equity', false, false, true],
    ['Asset turnover (Net Sales/Total Assets)', 'Asset Turnover', 'Asset_Turnover', false, true, false],
    ['Return on assets (ROA)', 'Return on Assets', 'Return_on_Assets', true, false, false],
    ['3-Year Revenue CAGR', 'Three Year Revenue CAGR', 'Three_Year_Revenue_CAGR', true, false, false]
  ] as const;

  // Load initial data for the year
  useEffect(() => {
    const loadYearData = async () => {
      setLoading(true);
      const [companies, segments, subsegments] = await Promise.all([
        fetchCompanyList(selectedYear),
        fetchSegmentBenchmarks(selectedYear),
        fetchSubsegmentBenchmarks(selectedYear)
      ]);
      setAllCompanies(companies);
      setSegmentBenchmarks(segments);
      setSubsegmentBenchmarks(subsegments);
      setLoading(false);
    };
    loadYearData();
  }, [selectedYear]);

  // Load company and benchmark data when selections change
  useEffect(() => {
    const loadData = async () => {
      if (!selectedCompany) return;

      const companyRow = await fetchCompanyBenchmarkData(selectedCompany, selectedYear);
      setCompanyData(companyRow);

      // Find benchmark data
      let benchmark: BenchmarkData | null = null;
      if (selectedSegment === 'Specialty' && selectedSubsegment) {
        benchmark = subsegmentBenchmarks.find(d => d.subsegment === selectedSubsegment) || null;
      } else if (selectedSegment && selectedSegment !== 'Specialty') {
        benchmark = segmentBenchmarks.find(d => d.segment === selectedSegment) || null;
      }
      setBenchmarkData(benchmark);
    };
    loadData();
  }, [selectedCompany, selectedYear, selectedSegment, selectedSubsegment, segmentBenchmarks, subsegmentBenchmarks]);

  // Get unique segments
  const uniqueSegments = Array.from(new Set(allCompanies.map(c => c.segment).filter(Boolean))).sort();

  // Get unique subsegments for Specialty
  const uniqueSubsegments = selectedSegment === 'Specialty'
    ? Array.from(new Set(allCompanies.filter(c => c.segment === 'Specialty').map(c => c.subsegment).filter(Boolean))).sort()
    : [];

  // Get filtered companies based on segment/subsegment
  const filteredCompanies = allCompanies
    .filter(c => {
      if (selectedSegment === 'Specialty' && selectedSubsegment) {
        return c.segment === selectedSegment && c.subsegment === selectedSubsegment;
      }
      return c.segment === selectedSegment;
    })
    .map(c => c.company)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();

  // Handle segment change
  const handleSegmentChange = (newSegment: string) => {
    setSelectedSegment(newSegment);

    if (newSegment === 'Specialty') {
      // Get first subsegment
      const subsegments = Array.from(new Set(
        allCompanies.filter(c => c.segment === 'Specialty').map(c => c.subsegment).filter(Boolean)
      )).sort();
      const firstSubsegment = subsegments[0] || '';
      setSelectedSubsegment(firstSubsegment);

      // Get first company in that subsegment
      const companies = allCompanies
        .filter(c => c.segment === 'Specialty' && c.subsegment === firstSubsegment)
        .map(c => c.company)
        .sort();
      setSelectedCompany(companies[0] || '');
    } else {
      setSelectedSubsegment('');
      // Get first company in the segment
      const companies = allCompanies
        .filter(c => c.segment === newSegment)
        .map(c => c.company)
        .sort();
      setSelectedCompany(companies[0] || '');
    }
  };

  // Handle subsegment change
  const handleSubsegmentChange = (newSubsegment: string) => {
    setSelectedSubsegment(newSubsegment);
    // Get first company in the new subsegment
    const companies = allCompanies
      .filter(c => c.segment === 'Specialty' && c.subsegment === newSubsegment)
      .map(c => c.company)
      .sort();
    setSelectedCompany(companies[0] || '');
  };

  // Excel export function
  const handleExportToExcel = () => {
    if (!companyData || !benchmarkData) {
      alert('Please wait for data to load before exporting.');
      return;
    }

    const excelData: any[][] = [];
    const benchmarkLabel = selectedSegment === 'Specialty' && selectedSubsegment
      ? `${selectedSubsegment} Average`
      : `${selectedSegment} Average`;

    excelData.push([
      'Financial Indicators',
      `${companyData.company} (${selectedYear})`,
      benchmarkLabel
    ]);

    metrics.forEach(([label, companyField, benchmarkField, isPct, isTurn, isRatio]) => {
      const companyValue = formatValue(companyData[companyField], isPct, isTurn, isRatio);
      const benchmarkValue = formatValue(benchmarkData[benchmarkField], isPct, isTurn, isRatio);
      excelData.push([label, companyValue, benchmarkValue]);
    });

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Company vs Segment');
    XLSX.writeFile(wb, `company_vs_segment_${selectedYear}.xlsx`);
  };

  const isSpecialty = selectedSegment === 'Specialty';
  const benchmarkLabel = isSpecialty && selectedSubsegment ? selectedSubsegment : selectedSegment;

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
        <h3 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950 text-sm">Select Options</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-neutral-500 font-['Geist:Medium',sans-serif]">Year</label>
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {AVAILABLE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-neutral-500 font-['Geist:Medium',sans-serif]">Company</label>
              <select
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                {filteredCompanies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-neutral-500 font-['Geist:Medium',sans-serif]">Segment</label>
              <select
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSegment}
                onChange={(e) => handleSegmentChange(e.target.value)}
              >
                {uniqueSegments.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {isSpecialty && (
                <select
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  value={selectedSubsegment}
                  onChange={(e) => handleSubsegmentChange(e.target.value)}
                >
                  {uniqueSubsegments.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Desktop Title and Year Selector */}
        <div className="hidden md:flex bg-neutral-100 border-b border-neutral-200 px-6 py-4 items-center justify-between">
          <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
            Company and Segment Comparison
          </h2>
          <div className="flex items-center gap-3">
            <span className="font-['Geist:Regular',sans-serif] text-neutral-700">
              Select Analysis Year:
            </span>
            <select
              className="px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {AVAILABLE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Desktop Header with Dropdowns */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] bg-neutral-100 border-b border-neutral-200">
          <div className="px-6 py-4 flex items-center">
            <h3 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
              Financial Indicators
            </h3>
          </div>
          <div className="px-6 py-4 border-l border-neutral-200 space-y-2">
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              {filteredCompanies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="px-6 py-4 border-l border-neutral-200 space-y-2">
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSegment}
              onChange={(e) => handleSegmentChange(e.target.value)}
            >
              {uniqueSegments.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {isSpecialty && (
              <select
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSubsegment}
                onChange={(e) => handleSubsegmentChange(e.target.value)}
              >
                {uniqueSubsegments.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Financial Indicators Rows */}
        {companyData && benchmarkData ? (
          <>
            {/* Mobile: Unified grid */}
            <div className="md:hidden grid grid-cols-[2fr_1fr_1fr]">
              {/* Mobile Header Row */}
              <div className="px-3 py-4 flex items-center bg-neutral-100 sticky top-0 z-10 border-b border-neutral-200">
                <h3 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950 text-sm">
                  Financial Indicators
                </h3>
              </div>
              <div className="px-3 py-4 border-l border-neutral-200 flex items-center justify-center bg-neutral-100 sticky top-0 z-10 border-b border-neutral-200">
                <span className="font-['Geist:Medium',sans-serif] text-neutral-950 text-xs text-center truncate">
                  {selectedCompany}
                </span>
              </div>
              <div className="px-3 py-4 border-l border-neutral-200 flex items-center justify-center bg-neutral-100 sticky top-0 z-10 border-b border-neutral-200">
                <span className="font-['Geist:Medium',sans-serif] text-neutral-950 text-xs text-center truncate">
                  {benchmarkLabel} Avg
                </span>
              </div>

              {/* Mobile Data Rows */}
              {metrics.map(([label, companyField, benchmarkField, isPct, isTurn, isRatio], index) => (
                <React.Fragment key={index}>
                  <div className={`px-3 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 ${index !== metrics.length - 1 ? 'border-b border-neutral-200' : ''}`}>{label}</div>
                  <div className={`px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right ${index !== metrics.length - 1 ? 'border-b border-neutral-200' : ''}`}>{formatValue(companyData[companyField], isPct, isTurn, isRatio)}</div>
                  <div className={`px-3 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right ${index !== metrics.length - 1 ? 'border-b border-neutral-200' : ''}`}>{formatValue(benchmarkData[benchmarkField], isPct, isTurn, isRatio)}</div>
                </React.Fragment>
              ))}
            </div>

            {/* Desktop: Original structure */}
            <div className="hidden md:block">
              {metrics.map(([label, companyField, benchmarkField, isPct, isTurn, isRatio], index) => (
                <TableRow
                  key={index}
                  label={label}
                  value1={formatValue(companyData[companyField], isPct, isTurn, isRatio)}
                  value2={formatValue(benchmarkData[benchmarkField], isPct, isTurn, isRatio)}
                  isLast={index === metrics.length - 1}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-neutral-500 italic">
            {selectedCompany && selectedSegment ? 'No data available for the selected combination.' : 'Please select a Company and Segment.'}
          </div>
        )}
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
