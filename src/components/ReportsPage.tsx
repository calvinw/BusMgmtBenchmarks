import { useState, useEffect } from 'react';
import { ChevronDown, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import fitLogo from 'figma:asset/fd6a1765252638a4eb759f6a240b8db3c878408d.png';

// Types
interface APIResponse {
  query_execution_status: string;
  rows: any[];
  schema?: Array<{ columnName: string; columnType: string }>;
}

// Constants
const DB_URL = 'https://www.dolthub.com/api/v1alpha1/calvinw/BusMgmtBenchmarks/main';
const AVAILABLE_YEARS = ['2024', '2023', '2022', '2021', '2020', '2019'];

const REPORT_TYPES = {
  'segments_and_benchmarks': 'Segment and Benchmark Reports',
  'segments': 'Segment Reports',
  'benchmarks': 'Benchmark Reports',
  'subsegments': 'Subsegment Reports'
};

const REPORT_URLS = {
  segments_and_benchmarks: (year: string) => DB_URL + `?q=SELECT+*+FROM+%60segment+and+company+benchmarks+${year}%60`,
  benchmarks: (year: string) => DB_URL + `?q=SELECT+*+FROM+%60benchmarks+${year}+view%60`,
  segments: (year: string) => DB_URL + `?q=SELECT+*+FROM+%60segment+benchmarks+${year}%60`,
  subsegments: (year: string) => DB_URL + `?q=SELECT+*+FROM+%60subsegment+benchmarks+${year}%60`
};

// Helper function to format column headers
function formatColumnHeader(header: string): string {
  return header
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

// Helper function to format cell values
function formatValue(value: any, columnName: string): string {
  if (value === null || value === undefined) return 'N/A';

  const num = Number(value);
  if (isNaN(num)) return String(value);

  // Percentage columns
  if (columnName.includes('%') || columnName.includes('_Percentage')) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }) + '%';
  }

  // CAGR and ROA
  if (columnName.includes('CAGR') || columnName.includes('Return_on_Assets')) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }) + '%';
  }

  // Turnover and ratio columns
  if (columnName.includes('Turnover') || columnName.includes('Ratio')) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  }

  // Default number formatting
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// API fetch function
async function fetchReportData(reportType: string, year: string): Promise<APIResponse | null> {
  try {
    const urlFn = REPORT_URLS[reportType as keyof typeof REPORT_URLS];
    if (!urlFn) return null;

    const response = await fetch(urlFn(year));
    const data: APIResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching report data:', error);
    return null;
  }
}

export function ReportsPage() {
  const [reportType, setReportType] = useState('segments_and_benchmarks');
  const [year, setYear] = useState('2024');
  const [data, setData] = useState<any[]>([]);
  const [schema, setSchema] = useState<Array<{ columnName: string; columnType: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [segmentFilterOpen, setSegmentFilterOpen] = useState(false);
  const [companyFilterOpen, setCompanyFilterOpen] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [segmentSearch, setSegmentSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');

  // Fetch data when report type or year changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await fetchReportData(reportType, year);
      if (result && result.rows && result.schema) {
        setData(result.rows);
        setSchema(result.schema);

        // Initialize filters with all segments/companies
        const segments = Array.from(new Set(result.rows.map((r: any) => r.segment).filter(Boolean))).sort();
        const companies = Array.from(new Set(result.rows.map((r: any) => r.company).filter(Boolean))).sort();
        setSelectedSegments(segments as string[]);
        setSelectedCompanies(companies as string[]);
      } else {
        setData([]);
        setSchema([]);
      }
      setLoading(false);
    };
    loadData();
  }, [reportType, year]);

  // Get unique segments and companies for filters
  const uniqueSegments = Array.from(new Set(data.map(row => row.segment).filter(Boolean))).sort() as string[];
  const uniqueCompanies = Array.from(new Set(data.map(row => row.company).filter(Boolean))).sort() as string[];

  // Filter data
  const filteredData = data.filter(row => {
    const segmentMatch = !row.segment || selectedSegments.includes(row.segment);
    const companyMatch = !row.company || selectedCompanies.includes(row.company);
    return segmentMatch && companyMatch;
  });

  const handleSegmentToggle = (segment: string) => {
    setSelectedSegments(prev =>
      prev.includes(segment)
        ? prev.filter(s => s !== segment)
        : [...prev, segment]
    );
  };

  const handleCompanyToggle = (company: string) => {
    setSelectedCompanies(prev =>
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  const filteredSegments = uniqueSegments.filter(seg =>
    seg.toLowerCase().includes(segmentSearch.toLowerCase())
  );

  const filteredCompanies = uniqueCompanies.filter(comp =>
    comp.toLowerCase().includes(companySearch.toLowerCase())
  );

  const handleExportToExcel = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      // Create headers from schema
      const headers = schema.map(col => formatColumnHeader(col.columnName));

      // Create data rows
      const excelData = filteredData.map(row =>
        schema.map(col => {
          const value = row[col.columnName];
          if (value === null || value === undefined) return '';
          if (typeof value === 'number') return value;
          return value;
        })
      );

      // Combine headers and data
      const worksheetData = [headers, ...excelData];

      // Create worksheet and workbook
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');

      // Download file
      const filename = `${reportType}_${year}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  // Get columns to display
  const displayColumns = schema.filter(col => {
    // Always show segment/company/subsegment columns
    if (['segment', 'company', 'subsegment'].includes(col.columnName)) return true;
    // Show other columns
    return true;
  });

  return (
    <div className="flex flex-col items-center">
      {/* Sticky Header Area - Centered */}
      <div className="sticky top-0 z-30 bg-neutral-50 w-full flex flex-col items-center pb-6">
        {/* FIT Header - Centered */}
        <div className="py-6">
          <img src={fitLogo} alt="FIT Retail Index Report" className="h-16" />
        </div>

        {/* Controls Row - Report Type & Year (left), Export to Excel (right) */}
        <div className="flex items-center justify-between gap-4 mb-4" style={{ width: '1280px', maxWidth: '95vw' }}>
          <div className="flex items-center gap-6">
            {/* Report Type */}
            <div className="flex items-center gap-3">
              <span className="font-['Geist:Medium',sans-serif] text-neutral-950">Report Type:</span>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-4 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[320px]"
              >
                {Object.entries(REPORT_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="flex items-center gap-3">
              <span className="font-['Geist:Medium',sans-serif] text-neutral-950">Year:</span>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-4 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AVAILABLE_YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Export to Excel Button - Right Side */}
          <button
            onClick={handleExportToExcel}
            disabled={loading || filteredData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white border border-green-600 rounded-lg font-['Geist:Medium',sans-serif] hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="size-4" />
            Export to Excel
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-neutral-500">Loading data...</div>
      )}

      {!loading && filteredData.length === 0 && (
        <div className="text-center py-8 text-neutral-500 italic">No data available for the selected filters.</div>
      )}

      {!loading && filteredData.length > 0 && (
      /* Fixed-Size Table Viewport Container - Centered */
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm" style={{ width: '1280px', maxWidth: '95vw', height: '720px' }}>
        <div className="overflow-auto h-full" style={{ position: 'relative' }}>
          <table className="border-collapse" style={{ minWidth: '100%', width: 'max-content' }}>
            <thead>
              <tr className="bg-neutral-100 sticky top-0 z-20">
                {displayColumns.map((col, index) => {
                  const isSegment = col.columnName === 'segment';
                  const isCompany = col.columnName === 'company';
                  const isSubsegment = col.columnName === 'subsegment';
                  const isSticky = isSegment || isCompany;

                  const stickyLeft = isSegment ? '0' : isCompany ? '180px' : undefined;
                  const minWidth = isSegment ? '180px' : isCompany ? '200px' : '160px';

                  return (
                    <th
                      key={col.columnName}
                      className={`px-6 py-4 text-${isSticky || isSubsegment ? 'left' : 'right'} font-['Geist:Medium',sans-serif] text-neutral-950 border-b ${index > 0 ? 'border-l' : ''} border-neutral-200 ${isSticky ? 'sticky z-30 shadow-[2px_0_4px_rgba(0,0,0,0.05)]' : ''} bg-neutral-100 whitespace-nowrap`}
                      style={{
                        minWidth,
                        ...(isSticky ? { left: stickyLeft, top: 0 } : {})
                      }}
                    >
                      {isSegment ? (
                        <div className="flex items-center justify-between gap-2">
                          <span>{formatColumnHeader(col.columnName)}</span>
                          {uniqueSegments.length > 0 && (
                          <div className="relative">
                            <button
                              onClick={() => setSegmentFilterOpen(!segmentFilterOpen)}
                              className="text-neutral-500 hover:text-neutral-700"
                            >
                              <ChevronDown className="size-4" />
                            </button>
                            {segmentFilterOpen && (
                              <div className="absolute left-0 bg-white border border-neutral-300 rounded-lg shadow-lg p-3 w-56 text-sm" style={{ top: 'calc(100% + 14px)', zIndex: 9999 }}>
                                <div className="mb-2">
                                  <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                                    <input
                                      type="text"
                                      placeholder="Search"
                                      value={segmentSearch}
                                      onChange={(e) => setSegmentSearch(e.target.value)}
                                      className="w-full pl-8 pr-2 py-1.5 text-sm border border-neutral-300 rounded font-['Geist:Regular',sans-serif] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 mb-2">
                                  <button
                                    onClick={() => setSelectedSegments(uniqueSegments)}
                                    className="font-['Geist:Regular',sans-serif] text-blue-600 hover:underline text-xs"
                                  >
                                    Select all
                                  </button>
                                  <button
                                    onClick={() => setSelectedSegments([])}
                                    className="font-['Geist:Regular',sans-serif] text-blue-600 hover:underline text-xs"
                                  >
                                    Clear
                                  </button>
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-1.5">
                                  {filteredSegments.map(segment => (
                                    <label key={segment} className="flex items-center gap-2 cursor-pointer py-0.5">
                                      <input
                                        type="checkbox"
                                        checked={selectedSegments.includes(segment)}
                                        onChange={() => handleSegmentToggle(segment)}
                                        className="size-3.5 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                                      />
                                      <span className="font-['Geist:Regular',sans-serif] text-neutral-950 text-sm">{segment}</span>
                                    </label>
                                  ))}
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-neutral-200">
                                  <button
                                    onClick={() => setSegmentFilterOpen(false)}
                                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded font-['Geist:Medium',sans-serif] hover:bg-green-700"
                                  >
                                    OK
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedSegments(uniqueSegments);
                                      setSegmentFilterOpen(false);
                                    }}
                                    className="px-3 py-1.5 text-sm bg-neutral-200 text-neutral-950 rounded font-['Geist:Medium',sans-serif] hover:bg-neutral-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          )}
                        </div>
                      ) : isCompany ? (
                        <div className="flex items-center justify-between gap-2">
                          <span>{formatColumnHeader(col.columnName)}</span>
                          {uniqueCompanies.length > 0 && (
                          <div className="relative">
                            <button
                              onClick={() => setCompanyFilterOpen(!companyFilterOpen)}
                              className="text-neutral-500 hover:text-neutral-700"
                            >
                              <ChevronDown className="size-4" />
                            </button>
                            {companyFilterOpen && (
                              <div className="absolute left-0 bg-white border border-neutral-300 rounded-lg shadow-lg p-3 w-56 text-sm" style={{ top: 'calc(100% + 14px)', zIndex: 9999 }}>
                                <div className="mb-2">
                                  <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                                    <input
                                      type="text"
                                      placeholder="Search"
                                      value={companySearch}
                                      onChange={(e) => setCompanySearch(e.target.value)}
                                      className="w-full pl-8 pr-2 py-1.5 text-sm border border-neutral-300 rounded font-['Geist:Regular',sans-serif] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 mb-2">
                                  <button
                                    onClick={() => setSelectedCompanies(uniqueCompanies)}
                                    className="font-['Geist:Regular',sans-serif] text-blue-600 hover:underline text-xs"
                                  >
                                    Select all
                                  </button>
                                  <button
                                    onClick={() => setSelectedCompanies([])}
                                    className="font-['Geist:Regular',sans-serif] text-blue-600 hover:underline text-xs"
                                  >
                                    Clear
                                  </button>
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-1.5">
                                  {filteredCompanies.map(company => (
                                    <label key={company} className="flex items-center gap-2 cursor-pointer py-0.5">
                                      <input
                                        type="checkbox"
                                        checked={selectedCompanies.includes(company)}
                                        onChange={() => handleCompanyToggle(company)}
                                        className="size-3.5 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                                      />
                                      <span className="font-['Geist:Regular',sans-serif] text-neutral-950 text-sm">{company}</span>
                                    </label>
                                  ))}
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-neutral-200">
                                  <button
                                    onClick={() => setCompanyFilterOpen(false)}
                                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded font-['Geist:Medium',sans-serif] hover:bg-green-700"
                                  >
                                    OK
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedCompanies(uniqueCompanies);
                                      setCompanyFilterOpen(false);
                                    }}
                                    className="px-3 py-1.5 text-sm bg-neutral-200 text-neutral-950 rounded font-['Geist:Medium',sans-serif] hover:bg-neutral-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          )}
                        </div>
                      ) : (
                        formatColumnHeader(col.columnName)
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-neutral-50 transition-colors">
                  {displayColumns.map((col, colIndex) => {
                    const isSegment = col.columnName === 'segment';
                    const isCompany = col.columnName === 'company';
                    const isSubsegment = col.columnName === 'subsegment';
                    const isSticky = isSegment || isCompany;

                    const stickyLeft = isSegment ? '0' : isCompany ? '180px' : undefined;

                    return (
                      <td
                        key={col.columnName}
                        className={`px-6 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 text-${isSticky || isSubsegment ? 'left' : 'right'} border-b ${colIndex > 0 ? 'border-l' : ''} border-neutral-200 ${isSticky ? 'sticky z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)]' : ''} bg-white whitespace-nowrap`}
                        style={isSticky ? { left: stickyLeft } : {}}
                      >
                        {isSticky || isSubsegment ? row[col.columnName] : formatValue(row[col.columnName], col.columnName)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Footer */}
      <div className="text-neutral-500 font-['Geist:Regular',sans-serif] space-y-1 mt-6" style={{ width: '1280px', maxWidth: '95vw' }}>
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
    </div>
  );
}
