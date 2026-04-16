import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChevronDown, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import fitLogo from 'figma:asset/fd6a1765252638a4eb759f6a240b8db3c878408d.png';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type ColumnSizingState,
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
  align?: 'left' | 'right';
}

export function ReportsPage() {
  const [reportType, setReportType] = useState('segments_and_benchmarks');
  const [year, setYear] = useState('2024');
  const [data, setData] = useState<any[]>([]);
  const [schema, setSchema] = useState<Array<{ columnName: string; columnType: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Column resizing
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);

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

  // Auto-size columns to fill the container width when schema changes
  const initializeColumnSizes = useCallback((containerWidth: number, cols: typeof schema) => {
    if (cols.length === 0) return;
    const hasSegment = cols.some(c => c.columnName === 'segment');
    const hasCompany = cols.some(c => c.columnName === 'company');
    const segW = 120, compW = 180, minDataW = 90;
    const fixedW = (hasSegment ? segW : 0) + (hasCompany ? compW : 0);
    const dataCols = cols.filter(c => c.columnName !== 'segment' && c.columnName !== 'company');
    const dataW = dataCols.length > 0
      ? Math.max(minDataW, Math.floor((containerWidth - fixedW) / dataCols.length))
      : minDataW;
    const sizing: ColumnSizingState = {};
    cols.forEach(col => {
      if (col.columnName === 'segment') sizing[col.columnName] = segW;
      else if (col.columnName === 'company') sizing[col.columnName] = compW;
      else sizing[col.columnName] = dataW;
    });
    setColumnSizing(sizing);
  }, []);

  useEffect(() => {
    if (schema.length === 0) return;
    const el = tableContainerRef.current;
    if (!el) {
      initializeColumnSizes(window.innerWidth - 64, schema);
      return;
    }

    // Initial distribution
    initializeColumnSizes(el.clientWidth, schema);

    // Re-distribute whenever the container width changes (window resize, sidebar toggle, etc.)
    let lastWidth = el.clientWidth;
    const ro = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (Math.abs(width - lastWidth) > 40) {
        lastWidth = width;
        initializeColumnSizes(width, schema);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [schema, initializeColumnSizes]);

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
      const isSegmentSticky = isSegment && segmentIndex === 0;
      const isCompanySticky = isCompany && (companyIndex === 0 || (hasSegmentColumn && companyIndex === 1));
      const isSticky = isSegmentSticky || isCompanySticky;

      const meta: ColumnMeta = {
        isSticky,
        align: (isSticky || isSubsegment) ? 'left' : 'right',
      };

      return {
        id: col.columnName,
        accessorKey: col.columnName,
        size: isSegment ? 120 : isCompany ? 180 : 100,
        minSize: isSegment ? 60 : isCompany ? 140 : 80,
        enableResizing: true,
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
        cell: ({ getValue, row: tableRow }) => {
          const value = getValue();

          if (isSegment) {
            // Company rows have no segment value — leave cell empty to let row styling speak
            if (tableRow.original.company) return null;
            return value;
          }

          if (isCompany) {
            if (!value) return null;
            // Align company names flush with the Company column header
            return value;
          }

          if (isSubsegment) return value;

          // Numeric cell — highlight negatives in red
          const rawNum = typeof value === 'number' ? value : Number(value);
          const isNegative = !isNaN(rawNum) && rawNum < 0;
          const formatted = formatValue(value, col.columnName);
          if (isNegative) {
            return <span className="text-red-600">{formatted}</span>;
          }
          return formatted;
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
    columnResizeMode: 'onChange',
    state: { columnSizing },
    onColumnSizingChange: setColumnSizing,
    defaultColumn: { minSize: 60 },
  });

  // Compute cumulative left offset for sticky columns (updates as user resizes)
  const stickyLeftMap = useMemo(() => {
    const map: Record<string, number> = {};
    let left = 0;
    table.getAllLeafColumns().forEach(col => {
      map[col.id] = left;
      left += col.getSize();
    });
    return map;
  }, [columnSizing, schema]);

  return (
    <div className="space-y-2">
      {/* Sticky FIT Header — scales down on mobile */}
      <div className="sticky top-0 z-20 bg-neutral-50 py-3 md:py-6 shadow-sm">
        <div className="flex items-center justify-center">
          <img src={fitLogo} alt="FIT Retail Index Report" className="h-10 md:h-16" />
        </div>
      </div>

      {/* Mobile-only controls — stacked, full-width, 44px touch targets */}
      <div className="md:hidden bg-white rounded-xl border border-neutral-200 shadow-sm p-4 space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-500 font-['Geist:Medium',sans-serif]">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 min-h-[44px] bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-950 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(REPORT_TYPES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-500 font-['Geist:Medium',sans-serif]">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-3 py-2 min-h-[44px] bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-950 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AVAILABLE_YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleExportToExcel}
          disabled={loading || filteredData.length === 0}
          className="w-full flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-purple-500 text-white border border-purple-500 rounded-lg font-['Geist:Medium',sans-serif] text-sm hover:bg-purple-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="size-4" />
          Export to Excel
        </button>
      </div>

      {/* Desktop: Controls and Table together (no gap between) */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-200 shadow-sm">
        {/* Desktop/Tablet Controls Row — Report Type, Year, Export */}
        <div className="sticky top-0 z-10 flex items-center flex-wrap gap-3 lg:gap-6 bg-neutral-100 px-4 lg:px-6 py-3 lg:py-4 border-b border-neutral-200 rounded-t-xl">
          {/* Report Type */}
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="font-['Geist:Medium',sans-serif] text-neutral-950 text-sm lg:text-base whitespace-nowrap">Report Type:</span>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 lg:px-4 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-950 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px] lg:min-w-[320px]"
            >
              {Object.entries(REPORT_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="font-['Geist:Medium',sans-serif] text-neutral-950 text-sm lg:text-base whitespace-nowrap">Year:</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 lg:px-4 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-950 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AVAILABLE_YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Export button — right-aligned */}
          <button
            onClick={handleExportToExcel}
            disabled={loading || filteredData.length === 0}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-purple-500 text-white border border-purple-500 rounded-lg font-['Geist:Medium',sans-serif] text-sm hover:bg-purple-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="size-4" />
            Export to Excel
          </button>
        </div>

        {/* Desktop Table Container - attached to controls above */}
        <div
          ref={tableContainerRef}
          className="bg-white overflow-auto w-full"
          style={{ maxHeight: 'calc(100vh - 210px)' }}
        >
            <table
              className="border-collapse caption-bottom text-sm"
              style={{ tableLayout: 'fixed', width: table.getTotalSize() }}
            >
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="bg-neutral-100 hover:bg-neutral-100">
                    {headerGroup.headers.map((header, index) => {
                      const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                      const isSticky = meta?.isSticky;
                      const align = meta?.align || 'right';

                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "px-3 py-3 text-xs leading-tight font-['Geist:Medium',sans-serif] text-neutral-600 border-b border-neutral-200 bg-neutral-100 sticky top-0 select-none",
                            index > 0 && "border-l",
                            align === 'left' ? "text-left" : "text-right",
                            isSticky ? "z-30 shadow-[2px_0_4px_rgba(0,0,0,0.05)]" : "z-20"
                          )}
                          style={{
                            width: header.getSize(),
                            position: 'relative',
                            ...(isSticky ? { left: stickyLeftMap[header.column.id] ?? 0, top: 0 } : {})
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {/* Drag-to-resize handle */}
                          {header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className="absolute right-0 top-0 h-full w-2 cursor-col-resize touch-none group/resize flex items-center justify-center"
                              style={{ userSelect: 'none' }}
                            >
                              <div className={`w-0.5 h-4/5 rounded-full transition-colors ${
                                header.column.getIsResizing()
                                  ? 'bg-blue-500'
                                  : 'bg-neutral-300 group-hover/resize:bg-blue-400'
                              }`} />
                            </div>
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {(() => {
                  let companyRowIdx = -1;
                  return table.getRowModel().rows.map(row => {
                    const isSegmentRow = !!row.original.segment && !row.original.company;
                    if (!isSegmentRow) companyRowIdx++;
                    const isAltRow = !isSegmentRow && companyRowIdx % 2 === 1;
                    const stickyBg = isSegmentRow ? 'bg-slate-50' : isAltRow ? 'bg-neutral-50' : 'bg-white';

                    return (
                      <TableRow
                        key={row.id}
                        className={cn(
                          "transition-colors",
                          isSegmentRow
                            ? "bg-slate-50 hover:bg-slate-50 border-t-2 border-neutral-200"
                            : isAltRow
                            ? "bg-neutral-50/60 hover:bg-blue-50/30"
                            : "bg-white hover:bg-blue-50/30"
                        )}
                      >
                        {row.getVisibleCells().map((cell, index) => {
                          const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                          const isSticky = meta?.isSticky;
                          const align = meta?.align || 'right';
                          const isTextCol = isSticky || cell.column.id === 'subsegment';

                          return (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                "px-3 py-2.5 font-['Geist:Regular',sans-serif] border-b border-neutral-200",
                                index > 0 && "border-l border-neutral-100",
                                align === 'left' ? "text-left" : "text-right",
                                isSticky && cn("sticky z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)]", stickyBg),
                                isSegmentRow
                                  ? "font-semibold text-neutral-800"
                                  : "text-neutral-950"
                              )}
                              style={{
                                width: cell.column.getSize(),
                                maxWidth: cell.column.getSize(),
                                fontVariantNumeric: !isTextCol ? 'tabular-nums' : undefined,
                                ...(isSticky ? { left: stickyLeftMap[cell.column.id] ?? 0 } : {})
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  });
                })()}
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
        /* Mobile card view (hidden on md+) — one card per row, grouped under segment headings */
        <div className="md:hidden space-y-2 pb-4">
          {(() => {
            // Derive metric columns for the cards (exclude name/grouping columns)
            const metricCols = schema.filter(c =>
              c.columnName !== 'segment' && c.columnName !== 'company' && c.columnName !== 'subsegment'
            );

            return filteredData.map((row, i) => {
              const isSegmentRow = !!row.segment && !row.company;

              if (isSegmentRow) {
                return (
                  <div key={i} className={i === 0 ? '' : 'pt-2'}>
                    {/* Segment group label */}
                    <div className="px-1 pb-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      {row.segment}
                    </div>
                    {/* Segment aggregate card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                        Segment Average
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {metricCols.map(col => {
                          const val = row[col.columnName];
                          const rawNum = typeof val === 'number' ? val : Number(val);
                          const isNeg = !isNaN(rawNum) && rawNum < 0;
                          return (
                            <div key={col.columnName}>
                              <div className="text-[10px] leading-tight text-neutral-400 mb-0.5">
                                {formatColumnHeader(col.columnName)}
                              </div>
                              <div
                                className={cn('text-sm font-semibold', isNeg ? 'text-red-600' : 'text-neutral-800')}
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {formatValue(val, col.columnName)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              // Company card
              return (
                <div key={i} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                  <div className="text-sm font-semibold text-neutral-900 mb-3">
                    {row.company}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {metricCols.map(col => {
                      const val = row[col.columnName];
                      const rawNum = typeof val === 'number' ? val : Number(val);
                      const isNeg = !isNaN(rawNum) && rawNum < 0;
                      return (
                        <div key={col.columnName}>
                          <div className="text-[10px] leading-tight text-neutral-400 mb-0.5">
                            {formatColumnHeader(col.columnName)}
                          </div>
                          <div
                            className={cn('text-sm', isNeg ? 'text-red-600 font-medium' : 'text-neutral-900')}
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {formatValue(val, col.columnName)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

    </div>
  );
}
