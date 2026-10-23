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
  return `sec/${safeCompany}-${fiscalYear}.html`;
}

// Helper to format a value from company data, returning dash if no data
function formatCompanyValue(
  companyData: CompanyFinancials | null,
  fieldName: string
): string {
  if (!companyData) {
    return '-';
  }
  return formatValueOrDash(
    companyData[fieldName as keyof CompanyFinancials] as number,
    fieldName,
    companyData.company
  );
}

const BRIDGE_REQUEST_TYPE = 'busmgmt.bridge.request';
const BRIDGE_RESPONSE_TYPE = 'busmgmt.bridge.response';

const NUMBERS_SECTION = 'Financial Numbers (in thousands)';
const INDICATORS_SECTION = 'Financial Indicators';

const FINANCIAL_SECTIONS: Record<string, Array<[string, string]>> = {
  [NUMBERS_SECTION]: [
    ['Total Revenue', 'Net Revenue'],
    ['Cost of Goods', 'Cost of Goods'],
    ['Gross Margin', 'Gross Margin'],
    ['Selling, General & Administrative Expenses', 'SGA'],
    ['Operating Profit', 'Operating Profit'],
    ['Net Profit', 'Net Profit'],
    ['Inventory', 'Inventory'],
    ['Total Assets', 'Total Assets']
  ],
  [INDICATORS_SECTION]: [
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

// Shorter row labels used in the narrow mobile table
const MOBILE_LABELS: Record<string, string> = {
  'Net Revenue': 'Revenue',
  'Cost of Goods': 'COGS',
  'Gross Margin': 'Gross Margin',
  'SGA': 'SG&A',
  'Operating Profit': 'Op. Profit',
  'Net Profit': 'Net Profit',
  'Inventory': 'Inventory',
  'Total Assets': 'Total Assets',
  'Cost of Goods %': 'COGS %',
  'Gross Margin %': 'Gross %',
  'SGA %': 'SG&A %',
  'Operating Profit Margin %': 'Op. Margin %',
  'Net Profit Margin %': 'Net Margin %',
  'Inventory Turnover': 'Inv. Turn',
  'Current Ratio': 'Current',
  'Quick Ratio': 'Quick',
  'Debt to Equity': 'D/E',
  'Asset Turnover': 'Asset Turn',
  'Return on Assets': 'ROA',
  'Three Year Revenue CAGR': '3Y CAGR'
};

// Column layouts: label column + one column per company (3 companies)
const DESKTOP_GRID = 'grid-cols-[2fr_1fr_1fr_1fr]';
const MOBILE_GRID = 'grid-cols-4';

type BridgeAction = 'get_selection' | 'set_selection' | 'get_financial_data';

interface BridgeRequestMessage {
  type: typeof BRIDGE_REQUEST_TYPE;
  requestId: string;
  action: BridgeAction;
  payload?: {
    company1?: string;
    year1?: string;
    company2?: string;
    year2?: string;
    company3?: string;
    year3?: string;
  };
}

type CompareMode = 'companies' | 'years';

// One selected company column: which company/year is picked and its loaded data
interface CompanySlot {
  company: string;
  year: string;
  data: CompanyFinancials | null;
  setCompany: (company: string) => void;
  setYear: (year: string) => void;
}

function slotLabel(slot: CompanySlot): string {
  return slot.data
    ? `${slot.data.company} (${slot.data.year})`
    : `${slot.company} (${slot.year}) - No Data`;
}

function buildBridgeFinancialData(slots: CompanySlot[]) {
  const formatMetric = (companyData: CompanyFinancials | null, fieldName: string) => {
    if (!companyData) {
      return '-';
    }
    return formatValue(
      companyData[fieldName as keyof CompanyFinancials] as number,
      fieldName,
      companyData.company
    );
  };

  const buildSection = (sectionName: string) => {
    const section: Record<string, Record<string, string>> = {};
    for (const [label, fieldName] of FINANCIAL_SECTIONS[sectionName]) {
      section[label] = {};
      slots.forEach((slot, i) => {
        section[label][`company${i + 1}`] = formatMetric(slot.data, fieldName);
      });
    }
    return section;
  };

  const labels: Record<string, string> = {};
  slots.forEach((slot, i) => {
    labels[`company${i + 1}`] = slotLabel(slot);
  });

  return {
    ...labels,
    financial_numbers: buildSection(NUMBERS_SECTION),
    financial_indicators: buildSection(INDICATORS_SECTION),
    note: 'Values are formatted as shown in the UI, with financial numbers in thousands.'
  };
}

export function FinancialComparisonTable() {
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany1, setSelectedCompany1] = useState<string>('');
  const [selectedYear1, setSelectedYear1] = useState<string>('2025');
  const [selectedCompany2, setSelectedCompany2] = useState<string>('');
  const [selectedYear2, setSelectedYear2] = useState<string>('2025');
  const [selectedCompany3, setSelectedCompany3] = useState<string>('');
  const [selectedYear3, setSelectedYear3] = useState<string>('2025');
  // 'companies' = three different companies; 'years' = one company across three years
  const [mode, setMode] = useState<CompareMode>('companies');
  const [trendCompany, setTrendCompany] = useState<string>('');
  const [trendYears, setTrendYears] = useState<string[]>(['2023', '2024', '2025']);
  const [columnData, setColumnData] = useState<Array<CompanyFinancials | null>>([null, null, null]);
  const [loading, setLoading] = useState(true);

  const isYearsMode = mode === 'years';

  const setTrendYear = (index: number) => (year: string) =>
    setTrendYears(prev => prev.map((y, i) => (i === index ? year : y)));

  const slots: CompanySlot[] = isYearsMode
    ? trendYears.map((year, i) => ({
        company: trendCompany,
        year,
        data: columnData[i],
        setCompany: setTrendCompany,
        setYear: setTrendYear(i)
      }))
    : [
        { company: selectedCompany1, year: selectedYear1, data: columnData[0], setCompany: setSelectedCompany1, setYear: setSelectedYear1 },
        { company: selectedCompany2, year: selectedYear2, data: columnData[1], setCompany: setSelectedCompany2, setYear: setSelectedYear2 },
        { company: selectedCompany3, year: selectedYear3, data: columnData[2], setCompany: setSelectedCompany3, setYear: setSelectedYear3 }
      ];

  // Changes whenever any visible column's company or year changes
  const selectionKey = slots.map(slot => `${slot.company}|${slot.year}`).join(',');

  // Fetch company list on mount
  useEffect(() => {
    const loadCompanies = async () => {
      const companyList = await fetchCompanyNames();
      setCompanies(companyList);
      if (companyList.length >= 2) {
        setSelectedCompany1(companyList.includes("Dillard's") ? "Dillard's" : companyList[0]);
        setSelectedCompany2(companyList.includes("Macy's") ? "Macy's" : companyList[1]);
        setSelectedCompany3(companyList.includes("Kohl's") ? "Kohl's" : companyList[Math.min(2, companyList.length - 1)]);
        setTrendCompany(companyList.includes("Macy's") ? "Macy's" : companyList[0]);
      } else {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  // Fetch data for the visible columns when selections or mode change
  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      if (slots.some(slot => !slot.company)) {
        return;
      }

      setLoading(true);
      const results = await Promise.all(
        slots.map(slot => fetchCompanyFinancials(slot.company, slot.year))
      );
      // Ignore results if the selection changed while this request was in flight
      if (!cancelled) {
        setColumnData(results);
        setLoading(false);
      }
    };
    loadData();
    return () => {
      cancelled = true;
    };
  }, [selectionKey]);

  useEffect(() => {
    const isBridgeRequest = (value: unknown): value is BridgeRequestMessage => {
      if (!value || typeof value !== 'object') {
        return false;
      }
      const data = value as Record<string, unknown>;
      return (
        data.type === BRIDGE_REQUEST_TYPE &&
        typeof data.requestId === 'string' &&
        typeof data.action === 'string'
      );
    };

    const postBridgeResponse = (
      source: MessageEventSource | null,
      origin: string,
      requestId: string,
      action: BridgeAction,
      success: boolean,
      payload: unknown
    ) => {
      if (!source || typeof (source as Window).postMessage !== 'function') {
        return;
      }

      (source as Window).postMessage(
        {
          type: BRIDGE_RESPONSE_TYPE,
          requestId,
          action,
          success,
          ...(success ? { result: payload } : { error: payload })
        },
        origin || '*'
      );
    };

    const onMessage = (event: MessageEvent) => {
      if (!isBridgeRequest(event.data)) {
        return;
      }

      const { requestId, action, payload } = event.data;

      if (action === 'get_selection') {
        const selection: Record<string, string> = { mode };
        slots.forEach((slot, i) => {
          selection[`company${i + 1}`] = slot.company;
          selection[`year${i + 1}`] = slot.year;
        });
        postBridgeResponse(event.source, event.origin, requestId, action, true, selection);
        return;
      }

      if (action === 'set_selection') {
        const updates: Record<string, string> = {};
        const warnings: string[] = [];
        const selection: Record<string, string> = {};

        slots.forEach((slot, i) => {
          const companyKey = `company${i + 1}` as 'company1' | 'company2' | 'company3';
          const yearKey = `year${i + 1}` as 'year1' | 'year2' | 'year3';
          const requestedCompany = payload?.[companyKey];
          const requestedYear = payload?.[yearKey];

          selection[companyKey] = slot.company;
          selection[yearKey] = slot.year;

          if (requestedCompany) {
            if (companies.includes(requestedCompany)) {
              slot.setCompany(requestedCompany);
              updates[companyKey] = requestedCompany;
              selection[companyKey] = requestedCompany;
            } else {
              warnings.push(`Unknown ${companyKey} value: ${requestedCompany}`);
            }
          }

          if (requestedYear) {
            if (AVAILABLE_YEARS.includes(requestedYear)) {
              slot.setYear(requestedYear);
              updates[yearKey] = requestedYear;
              selection[yearKey] = requestedYear;
            } else {
              warnings.push(`Unsupported ${yearKey} value: ${requestedYear}`);
            }
          }
        });

        postBridgeResponse(event.source, event.origin, requestId, action, true, {
          updates,
          warnings,
          selection
        });
        return;
      }

      if (action === 'get_financial_data') {
        postBridgeResponse(event.source, event.origin, requestId, action, true, buildBridgeFinancialData(slots));
        return;
      }

      postBridgeResponse(event.source, event.origin, requestId, action, false, `Unsupported bridge action: ${action}`);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [companies, columnData, mode, selectionKey]);

  const handleExportToExcel = () => {
    if (slots.every(slot => !slot.data)) {
      alert('No data available to export. Please select companies and years that have data.');
      return;
    }

    // Build the data array for Excel
    const excelData: any[][] = [];

    // Add header row
    excelData.push(['', ...slots.map(slotLabel)]);

    // Add each section
    for (const [sectionName, fields] of Object.entries(FINANCIAL_SECTIONS)) {
      // Add section header
      excelData.push([sectionName, ...slots.map(() => '')]);

      // Add data rows
      for (const [label, fieldName] of fields) {
        excelData.push([
          label,
          ...slots.map(slot =>
            slot.data ? formatValue(slot.data[fieldName as keyof CompanyFinancials] as number, fieldName, slot.data.company) : '-'
          )
        ]);
      }
    }

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Company Comparison');

    // Download the file
    XLSX.writeFile(wb, isYearsMode ? 'company_year_comparison.xlsx' : 'company_comparison.xlsx');
  };

  const isIframe = new URLSearchParams(window.location.search).get('iframe') === 'true';

  const mobileCell = "px-2 py-3 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs text-right min-w-0";
  const mobileLabelCell = "px-2 py-3 font-['Geist:Regular',sans-serif] text-neutral-950 text-xs min-w-0 truncate";
  const indicatorFields = FINANCIAL_SECTIONS[INDICATORS_SECTION];

  const renderMobileRows = (fields: Array<[string, string]>, isLastSection: boolean) =>
    fields.map(([, fieldName], rowIndex) => {
      const isLastRow = isLastSection && rowIndex === fields.length - 1;
      const border = isLastRow ? '' : ' border-b border-neutral-200';
      return (
        <div key={fieldName} className="contents">
          <div className={mobileLabelCell + border}>{MOBILE_LABELS[fieldName] ?? fieldName}</div>
          {slots.map((slot, i) => (
            <div key={i} className={mobileCell + border}>{formatCompanyValue(slot.data, fieldName)}</div>
          ))}
        </div>
      );
    });

  // Column heading text for the narrow mobile table
  const columnTitle = (slot: CompanySlot) => (isYearsMode ? slot.year : `${slot.company} (${slot.year})`);

  const companySelect = (value: string, onChange: (company: string) => void, sizeClass = '') => (
    <select
      className={`w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${sizeClass}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {companies.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  );

  const yearSelect = (value: string, onChange: (year: string) => void, sizeClass = '') => (
    <select
      className={`w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${sizeClass}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {AVAILABLE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
    </select>
  );

  const modeButton = (value: CompareMode, label: string) => (
    <button
      onClick={() => setMode(value)}
      aria-pressed={mode === value}
      className={`px-3 py-1.5 rounded-md text-sm font-['Geist:Medium',sans-serif] transition-colors ${
        mode === value ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-600 hover:text-neutral-950'
      }`}
    >
      {label}
    </button>
  );

  const renderSecLink =(slot: CompanySlot, linkText: string) => {
    const url = slot.data ? getSecFilingUrl(slot.data.company, Number(slot.data.year)) : null;
    return url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        {linkText}
      </a>
    ) : (
      <span>No SEC report</span>
    );
  };

  return (
    <div className="space-y-2">
      {/* Sticky FIT Header — hidden at narrow widths when embedded in the chat wrapper */}
      <div className={`sticky top-0 z-20 bg-neutral-50 py-6 shadow-sm${isIframe ? ' hidden md:block' : ''}`}>
        <div className="flex items-center justify-center">
          <img src={fitLogo} alt="FIT Retail Index Report" className="h-16" />
        </div>
      </div>

      {/* Mode switch + Export Section — hidden at narrow widths when embedded in the chat wrapper */}
      <div className={`flex flex-wrap items-center justify-between gap-2${isIframe ? ' hidden md:flex' : ''}`}>
        <div className="inline-flex p-1 bg-neutral-200 rounded-lg" role="group" aria-label="Comparison mode">
          {modeButton('companies', 'Compare Companies')}
          {modeButton('years', 'Compare Years')}
        </div>
        <button
          onClick={handleExportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white border border-green-700 rounded-lg font-['Geist:Medium',sans-serif] hover:bg-green-800 transition-colors shadow-sm"
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
        <h3 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950 text-sm">
          {isYearsMode ? 'Select a Company and Years to Compare' : 'Select Companies to Compare'}
        </h3>
        {isYearsMode && (
          <div className="space-y-2">
            <label className="text-xs text-neutral-500 font-['Geist:Medium',sans-serif]">Company</label>
            {companySelect(trendCompany, setTrendCompany, 'text-sm')}
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot, i) => (
            <div key={i} className="space-y-2 min-w-0">
              <label className="text-xs text-neutral-500 font-['Geist:Medium',sans-serif]">
                {isYearsMode ? `Year ${i + 1}` : `Company ${i + 1}`}
              </label>
              {!isYearsMode && companySelect(slot.company, slot.setCompany, 'px-2 text-sm')}
              {yearSelect(slot.year, slot.setYear, 'px-2 text-sm')}
              {!slot.data && (
                <div className="text-red-600 text-xs font-['Geist:Regular',sans-serif]">
                  No data available
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Financial Comparison Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Desktop Header - with dropdowns */}
        <div className={`hidden md:grid ${DESKTOP_GRID} bg-neutral-100 sticky top-0 z-10 shadow-sm`}>
          <div className="px-6 py-4 flex flex-col justify-center gap-2">
            {isYearsMode && (
              <div className="max-w-xs">
                {companySelect(trendCompany, setTrendCompany)}
              </div>
            )}
            <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
              {NUMBERS_SECTION}
            </h2>
          </div>
          {slots.map((slot, i) => (
            <div key={i} className="px-4 py-4 border-l border-neutral-200 space-y-2 min-w-0 flex flex-col justify-center">
              {!isYearsMode && companySelect(slot.company, slot.setCompany)}
              {yearSelect(slot.year, slot.setYear)}
              {!slot.data && (
                <div className="text-red-600 text-sm font-['Geist:Regular',sans-serif] mt-2">
                  {slot.company} {slot.year}: No data available
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: Unified grid for both sections */}
        <div className={`md:hidden grid ${MOBILE_GRID}`}>
          {/* Financial Numbers Header Row */}
          <div className="px-2 py-3 flex items-center bg-neutral-100 sticky top-0 z-10 border-b border-neutral-200 min-w-0">
            <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950 text-xs truncate">
              Financials (000s)
            </h2>
          </div>
          {slots.map((slot, i) => (
            <div key={i} className="px-2 py-3 border-l border-neutral-200 flex items-center justify-center bg-neutral-100 sticky top-0 z-10 border-b border-neutral-200 min-w-0">
              <span className="font-['Geist:Medium',sans-serif] text-neutral-950 text-[10px] text-center truncate">
                {columnTitle(slot)}
              </span>
            </div>
          ))}

          {/* Financial Numbers Data Rows */}
          {renderMobileRows(FINANCIAL_SECTIONS[NUMBERS_SECTION], false)}

          {/* Financial Indicators Header */}
          <div className="px-2 py-3 flex items-center bg-neutral-50 border-b border-neutral-200 min-w-0">
            <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950 text-xs truncate">
              Indicators
            </h2>
          </div>
          {slots.map((_, i) => (
            <div key={i} className="px-2 py-3 border-l border-neutral-200 bg-neutral-50 border-b border-neutral-200 min-w-0"></div>
          ))}

          {/* Financial Indicators Data Rows */}
          {renderMobileRows(indicatorFields, true)}
        </div>

        {/* Desktop: Original structure */}
        <div className="hidden md:block">
          {FINANCIAL_SECTIONS[NUMBERS_SECTION].map(([label, fieldName]) => (
            <TableRow key={fieldName} label={label} values={slots.map(slot => formatCompanyValue(slot.data, fieldName))} />
          ))}

          {/* Financial Indicators Section */}
          <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200 border-t border-neutral-200">
            <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
              {INDICATORS_SECTION}
            </h2>
          </div>

          {indicatorFields.map(([label, fieldName], rowIndex) => (
            <TableRow
              key={fieldName}
              label={label}
              values={slots.map(slot => formatCompanyValue(slot.data, fieldName))}
              isLast={rowIndex === indicatorFields.length - 1}
            />
          ))}
        </div>
      </div>
      </>
      )}

      {/* Footer */}
      <div className="text-neutral-500 font-['Geist:Regular',sans-serif] space-y-1">
        {/* Desktop: SEC report links + Attribution aligned with desktop table (2:1:1:1 ratio) */}
        <div className={`hidden md:grid ${DESKTOP_GRID} text-xs items-start`}>
          <div className="px-6 text-[11px] space-y-1">
            <p>Fashion Institute of Technology Professors: <strong>Dr. Calvin Williamson</strong>, <strong>Shelley E. Kohan</strong></p>
            <p><strong>Seonmin (Diana) Lee</strong> – AI Systems &amp; Backend Developer</p>
            <p><strong>Souyen (Ivy) Park</strong> – Web Systems &amp; Designer</p>
            <p><strong>Jia Mei Lin</strong> – AI Systems Assistant (v1)</p>
            <p className="font-['Geist:Medium',sans-serif]">Made through SUNY IITG Business Management Course Development Grants</p>
          </div>
          {slots.map((slot, i) => (
            <div key={i} className="px-6 border-l border-neutral-200 text-right text-[11px]">
              {renderSecLink(slot, 'Source: SEC report')}
            </div>
          ))}
        </div>

        {/* Mobile: SEC report links aligned with mobile table (equal columns) */}
        <div className={`md:hidden grid ${MOBILE_GRID} text-xs items-start`}>
          <span className="px-2"></span>
          {slots.map((slot, i) => (
            <div key={i} className="px-2 border-l border-neutral-200 text-right text-[11px]">
              {renderSecLink(slot, 'Source: SEC')}
            </div>
          ))}
        </div>

        {/* Mobile: Attribution (appears below SEC links on mobile only) */}
        <div className="md:hidden px-2 py-3 text-[11px] space-y-1 border-t border-neutral-200">
          <p>Fashion Institute of Technology Professors: <strong>Dr. Calvin Williamson</strong>, <strong>Shelley E. Kohan</strong></p>
          <p><strong>Seonmin (Diana) Lee</strong> – AI Systems &amp; Backend Developer</p>
          <p><strong>Souyen (Ivy) Park</strong> – Web Systems &amp; Designer</p>
          <p><strong>Jia Mei Lin</strong> – AI Systems Assistant (v1)</p>
          <p className="font-['Geist:Medium',sans-serif]">Made through SUNY IITG Business Management Course Development Grants</p>
        </div>
      </div>
    </div>
  );
}

function TableRow({
  label,
  values,
  isLast = false
}: {
  label: string;
  values: string[];
  isLast?: boolean;
}) {
  return (
    <div className={`grid ${DESKTOP_GRID} ${!isLast ? 'border-b border-neutral-200' : ''}`}>
      <div className="px-3 md:px-6 py-4 font-['Geist:Regular',sans-serif] text-neutral-950">
        {label}
      </div>
      {values.map((value, i) => (
        <div key={i} className="px-3 md:px-6 py-4 border-l border-neutral-200 font-['Geist:Regular',sans-serif] text-neutral-950 text-right">
          {value}
        </div>
      ))}
    </div>
  );
}
