import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Download } from 'lucide-react';
import ExcelJS from 'exceljs';
import fitLogo from 'figma:asset/fd6a1765252638a4eb759f6a240b8db3c878408d.png';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/components/ui/utils';
import { AVAILABLE_YEARS } from '@/lib/constants';
import { formatValue, formatColumnHeader } from '@/lib/formatters';
import { fetchReportData, REPORT_TYPES, type ReportType } from '@/lib/api';

// Types
interface ColumnMeta {
  isSticky?: boolean;
  stickyLeft?: string;
  minWidth?: string;
  align?: 'left' | 'right';
}

export function ReportsPage() {
  const [reportType, setReportType] = useState('segments_and_benchmarks');
  const [year, setYear] = useState('2025');
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
  const uniqueSegments = useMemo(() =>
    Array.from(new Set(data.map(row => row.segment).filter(Boolean))).sort() as string[],
    [data]
  );
  const uniqueCompanies = useMemo(() =>
    Array.from(new Set(data.map(row => row.company).filter(Boolean))).sort() as string[],
    [data]
  );

  // Build company to segment mapping by tracking row order
  // (segment rows are followed by their company rows)
  const companyToSegment = useMemo(() => {
    const mapping: Record<string, string> = {};
    let currentSegment = '';

    data.forEach(row => {
      if (row.segment && !row.company) {
        // This is a segment aggregate row - track it as current segment
        currentSegment = row.segment;
      } else if (row.company) {
        // This is a company row
        if (row.segment) {
          // If row has segment field, use it directly
          mapping[row.company] = row.segment;
        } else if (currentSegment) {
          // Otherwise use the last seen segment
          mapping[row.company] = currentSegment;
        }
      }
    });
    return mapping;
  }, [data]);

  // Filter data - when a segment is deselected, also filter out all companies in that segment
  const filteredData = useMemo(() =>
    data.filter(row => {
      // Check segment filter
      const segmentMatch = !row.segment || selectedSegments.includes(row.segment);

      // Check company filter
      let companyMatch = !row.company || selectedCompanies.includes(row.company);

      // If this row has a company, also check that the company's segment is selected
      if (row.company && companyToSegment[row.company]) {
        const companySegment = companyToSegment[row.company];
        if (!selectedSegments.includes(companySegment)) {
          companyMatch = false;
        }
      }

      return segmentMatch && companyMatch;
    }),
    [data, selectedSegments, selectedCompanies, companyToSegment]
  );

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

  const handleExportToExcel = async () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      const preferredColumns = [
        'segment',
        'company',
        'Total_Revenue',
        'Three_Year_Revenue_CAGR',
        'Sales_Current_Year_vs_LY',
        'Return_on_Assets',
        'Gross_Margin_Percentage',
        'Cost_of_Goods_Percentage',
        'SGA_Percentage',
        'Operating_Profit_Margin_Percentage',
        'Net_Profit_Margin_Percentage',
        'Inventory_Turnover',
        'Asset_Turnover',
        'Return_on_Assets',
        'Current_Ratio',
        'Quick_Ratio',
        'Debt_to_Equity',
      ];
      const schemaColumns = new Set(schema.map(col => col.columnName));
      const isBenchmarkReport = reportType === 'segments_and_benchmarks';
      const exportColumns = isBenchmarkReport
        ? preferredColumns.filter(columnName => schemaColumns.has(columnName))
        : schema.map(col => col.columnName);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'FIT Retail Index';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Report', {
        views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }],
        pageSetup: {
          orientation: 'landscape',
          paperSize: 1,
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          horizontalCentered: true,
          margins: {
            left: 0.2,
            right: 0.2,
            top: 0.3,
            bottom: 0.3,
            header: 0.1,
            footer: 0.1,
          },
        },
        properties: { defaultRowHeight: 18 },
      });

      worksheet.headerFooter.oddFooter = '&L FIT Retail Index&C Page &P of &N&R' + year;
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: exportColumns.length },
      };

      const headerRow = worksheet.addRow(exportColumns.map(formatColumnHeader));
      headerRow.height = 44;
      headerRow.eachCell(cell => {
        cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF17365D' } } };
        cell.protection = { locked: false };
      });

      filteredData.forEach((item, index) => {
        const row = worksheet.addRow(exportColumns.map(columnName => {
          const value = item[columnName];
          if (value === null || value === undefined || value === '') return null;
          const numericValue = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
          return typeof numericValue === 'number' && Number.isFinite(numericValue) ? numericValue : value;
        }));
        const isSegmentRow = Boolean(item.segment && !item.company);
        row.height = 17;

        row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
          const columnName = exportColumns[columnNumber - 1];
          cell.font = { name: 'Arial', size: 9, bold: isSegmentRow };
          cell.alignment = {
            vertical: 'middle',
            horizontal: columnNumber <= 2 ? 'left' : 'right',
          };
          cell.protection = { locked: false };
          cell.border = {
            bottom: { style: 'hair', color: { argb: 'FFD9E2F3' } },
          };

          if (isSegmentRow) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAF7' } };
          } else if (index % 2 === 1) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F9FC' } };
          }

          const normalizedColumnName = columnName.toLowerCase();
          if (normalizedColumnName.includes('percentage') || normalizedColumnName.includes('margin') ||
              normalizedColumnName === 'return_on_assets' || normalizedColumnName === 'three_year_revenue_cagr' ||
              normalizedColumnName === 'sales_current_year_vs_ly') {
            cell.numFmt = '0.0"%";[Red]-0.0"%";-';
          } else if (columnName === 'Total_Revenue') {
            cell.numFmt = '$#,##0;[Red]-$#,##0;-';
          } else if (columnNumber > 2) {
            cell.numFmt = '0.0;[Red]-0.0;-';
          }
        });
      });

      exportColumns.forEach((columnName, index) => {
        worksheet.getColumn(index + 1).width = columnName === 'segment'
          ? 22
          : columnName === 'company'
            ? 24
            : 13;
      });
      worksheet.pageSetup.printTitlesRow = '1:1';
      worksheet.pageSetup.printArea = 'A1:' + worksheet.getColumn(exportColumns.length).letter + worksheet.rowCount;

      const output = await workbook.xlsx.writeBuffer();
      const blob = new Blob([output], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = reportType + '_' + year + '.xlsx';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  // Create TanStack Table column definitions
  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    // Check if segment column exists in schema
    const hasSegmentColumn = schema.some(col => col.columnName === 'segment');

    // Find the index of segment and company columns
    const segmentIndex = schema.findIndex(col => col.columnName === 'segment');
    const companyIndex = schema.findIndex(col => col.columnName === 'company');

    return schema.map((col, index) => {
      const isSegment = col.columnName === 'segment';
      const isCompany = col.columnName === 'company';
      const isSubsegment = col.columnName === 'subsegment';

      // Only make segment/company sticky if they are at the beginning of the table
      // Segment should be first (index 0), Company should be first or second (after segment)
      const isSegmentSticky = isSegment && segmentIndex === 0;
      const isCompanySticky = isCompany && (companyIndex === 0 || (hasSegmentColumn && companyIndex === 1));
      const isSticky = isSegmentSticky || isCompanySticky;

      // Position company at 180px only if segment column exists and is first, otherwise at 0
      const companyStickyLeft = (hasSegmentColumn && segmentIndex === 0) ? '180px' : '0';

      const meta: ColumnMeta = {
        isSticky,
        stickyLeft: isSegmentSticky ? '0' : isCompanySticky ? companyStickyLeft : undefined,
        minWidth: isSegment ? '180px' : isCompany ? '200px' : '160px',
        align: (isSticky || isSubsegment) ? 'left' : 'right',
      };

      return {
        id: col.columnName,
        accessorKey: col.columnName,
        header: () => {
          if (isSegment) {
            return (
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
            );
          }

          if (isCompany) {
            return (
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
            );
          }

          return formatColumnHeader(col.columnName);
        },
        cell: ({ getValue }) => {
          const value = getValue();
          if (isSticky || isSubsegment) {
            return value;
          }
          return formatValue(value, col.columnName);
        },
        meta,
      };
    });
  }, [schema, uniqueSegments, uniqueCompanies, segmentFilterOpen, companyFilterOpen, segmentSearch, companySearch, selectedSegments, selectedCompanies, filteredSegments, filteredCompanies]);

  // Create TanStack Table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-2">
      {/* Sticky FIT Header */}
      <div className="sticky top-0 z-20 bg-neutral-50 py-6 shadow-sm">
        <div className="flex items-center justify-center">
          <img src={fitLogo} alt="FIT Retail Index Report" className="h-16" />
        </div>
      </div>

      {/* Export Section - same for all sizes */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleExportToExcel}
          disabled={loading || filteredData.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white border border-purple-600 rounded-lg font-['Geist:Medium',sans-serif] hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="size-4" />
          Export to Excel
        </button>
      </div>

      {/* Mobile Selector Panel - visible only on mobile */}
      <div className="md:hidden bg-white rounded-xl border border-neutral-200 shadow-sm p-4 space-y-4">
        <h3 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950 text-sm">Select Options</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-neutral-500 font-['Geist:Medium',sans-serif]">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-950 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(REPORT_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-neutral-500 font-['Geist:Medium',sans-serif]">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-950 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AVAILABLE_YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop: Controls and Table together (no gap between) */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-200 shadow-sm">
        {/* Desktop Controls Row - Report Type & Year */}
        <div className="sticky top-0 z-10 flex items-center gap-6 bg-neutral-100 px-6 py-4 border-b border-neutral-200 rounded-t-xl">
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

        {/* Desktop Table Container - attached to controls above */}
        <div
          className="bg-white overflow-auto w-full"
          style={{ maxHeight: 'calc(100vh - 320px)' }}
        >
            <table className="border-collapse w-full caption-bottom text-sm" style={{ minWidth: '100%', width: 'max-content' }}>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="bg-neutral-100 hover:bg-neutral-100">
                    {headerGroup.headers.map((header, index) => {
                      const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                      const isSticky = meta?.isSticky;
                      const stickyLeft = meta?.stickyLeft;
                      const minWidth = meta?.minWidth || '160px';
                      const align = meta?.align || 'right';

                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "px-6 py-4 font-['Geist:Medium',sans-serif] text-neutral-950 border-b border-neutral-200 bg-neutral-100 whitespace-nowrap sticky top-0",
                            index > 0 && "border-l",
                            align === 'left' ? "text-left" : "text-right",
                            isSticky ? "z-30 shadow-[2px_0_4px_rgba(0,0,0,0.05)]" : "z-20"
                          )}
                          style={{
                            minWidth,
                            ...(isSticky ? { left: stickyLeft, top: 0 } : {})
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} className="hover:bg-neutral-50 transition-colors">
                    {row.getVisibleCells().map((cell, index) => {
                      const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                      const isSticky = meta?.isSticky;
                      const stickyLeft = meta?.stickyLeft;
                      const align = meta?.align || 'right';

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-6 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200 bg-white whitespace-nowrap",
                            index > 0 && "border-l",
                            align === 'left' ? "text-left" : "text-right",
                            isSticky && "sticky z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)]"
                          )}
                          style={isSticky ? { left: stickyLeft } : {}}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </table>
        </div>
        </div>

      {loading && (
        <div className="text-center py-8 text-neutral-500">Loading data...</div>
      )}

      {!loading && filteredData.length === 0 && (
        <div className="text-center py-8 text-neutral-500 italic">No data available for the selected filters.</div>
      )}

      {!loading && filteredData.length > 0 && (
        <>
        {/* Mobile Table Container */}
        <div
          className="md:hidden bg-white rounded-xl border border-neutral-200 shadow-sm overflow-auto w-full"
          style={{ maxHeight: 'calc(100vh - 320px)' }}
        >
            <table className="border-collapse w-full caption-bottom text-sm" style={{ minWidth: '100%', width: 'max-content' }}>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="bg-neutral-100 hover:bg-neutral-100">
                    {headerGroup.headers.map((header, index) => {
                      const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                      const isSticky = meta?.isSticky;
                      const stickyLeft = meta?.stickyLeft;
                      const minWidth = meta?.minWidth || '160px';
                      const align = meta?.align || 'right';

                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "px-6 py-4 font-['Geist:Medium',sans-serif] text-neutral-950 border-b border-neutral-200 bg-neutral-100 whitespace-nowrap sticky top-0",
                            index > 0 && "border-l",
                            align === 'left' ? "text-left" : "text-right",
                            isSticky ? "z-30 shadow-[2px_0_4px_rgba(0,0,0,0.05)]" : "z-20"
                          )}
                          style={{
                            minWidth,
                            ...(isSticky ? { left: stickyLeft, top: 0 } : {})
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} className="hover:bg-neutral-50 transition-colors">
                    {row.getVisibleCells().map((cell, index) => {
                      const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                      const isSticky = meta?.isSticky;
                      const stickyLeft = meta?.stickyLeft;
                      const align = meta?.align || 'right';

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-6 py-4 font-['Geist:Regular',sans-serif] text-neutral-950 border-b border-neutral-200 bg-white whitespace-nowrap",
                            index > 0 && "border-l",
                            align === 'left' ? "text-left" : "text-right",
                            isSticky && "sticky z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)]"
                          )}
                          style={isSticky ? { left: stickyLeft } : {}}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </table>
        </div>
        </>
      )}

    </div>
  );
}
