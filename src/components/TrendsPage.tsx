import { useState, useEffect, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Customized,
  ReferenceLine
} from 'recharts';
import { fetchCompanyHistory, fetchCompanyNames, type CompanyFinancials } from '@/lib/api';
import { CURRENCY_FIELDS, PERCENTAGE_FIELDS } from '@/lib/constants';
import { formatValueOrDash, getCurrencySymbol } from '@/lib/formatters';

// Measures students can chart, grouped the same way as the comparison table
const METRIC_GROUPS: Array<{ group: string; metrics: Array<[string, string]> }> = [
  {
    group: 'Financial Numbers',
    metrics: [
      ['Total Revenue', 'Net Revenue'],
      ['Cost of Goods', 'Cost of Goods'],
      ['Gross Margin', 'Gross Margin'],
      ['Selling, General & Administrative Expenses', 'SGA'],
      ['Operating Profit', 'Operating Profit'],
      ['Net Profit', 'Net Profit'],
      ['Inventory', 'Inventory'],
      ['Total Assets', 'Total Assets']
    ]
  },
  {
    group: 'Financial Indicators',
    metrics: [
      ['Cost of Goods %', 'Cost of Goods %'],
      ['Gross Margin %', 'Gross Margin %'],
      ['SG&A %', 'SGA %'],
      ['Operating Profit Margin %', 'Operating Profit Margin %'],
      ['Net Profit Margin %', 'Net Profit Margin %'],
      ['Inventory Turnover', 'Inventory Turnover'],
      ['Current Ratio', 'Current Ratio'],
      ['Quick Ratio', 'Quick Ratio'],
      ['Debt-to-Equity Ratio', 'Debt to Equity'],
      ['Asset Turnover', 'Asset Turnover'],
      ['Return on Assets (ROA)', 'Return on Assets'],
      ['3-Year Revenue CAGR', 'Three Year Revenue CAGR']
    ]
  }
];

const METRIC_LABELS = new Map(METRIC_GROUPS.flatMap(g => g.metrics.map(([label, field]) => [field, label])));

// Validated categorical palette (colorblind-safe for up to 4 lines).
// Each company slot keeps its color, so removing one company never repaints the others.
const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'];
const MAX_COMPANIES = SERIES_COLORS.length;

interface Slot {
  company: string;
  color: number; // index into SERIES_COLORS
}

// Chart-friendly short form. Database currency values are in thousands.
function formatCompact(value: number, field: string, company?: string): string {
  if (CURRENCY_FIELDS.has(field)) {
    const dollars = value * 1000;
    const abs = Math.abs(dollars);
    const symbol = getCurrencySymbol(company);
    const sign = dollars < 0 ? '-' : '';
    if (abs >= 1e9) return `${sign}${symbol}${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${sign}${symbol}${(abs / 1e6).toFixed(1)}M`;
    return `${sign}${symbol}${abs.toLocaleString()}`;
  }
  if (PERCENTAGE_FIELDS.has(field)) return `${value.toFixed(1)}%`;
  return value.toFixed(1);
}

function toChartNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function TrendsPage() {
  const [companies, setCompanies] = useState<string[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [metric, setMetric] = useState('Net Revenue');
  const [history, setHistory] = useState<Record<string, CompanyFinancials[]>>({});
  const [loading, setLoading] = useState(true);

  // Load the company list once, defaulting to Dillard's and Macy's like the other pages
  useEffect(() => {
    fetchCompanyNames().then(list => {
      setCompanies(list);
      const defaults = ["Dillard's", "Macy's"].filter(c => list.includes(c));
      const initial = defaults.length ? defaults : list.slice(0, 2);
      setSlots(initial.map((company, i) => ({ company, color: i })));
      if (!initial.length) setLoading(false);
    });
  }, []);

  // Fetch every year for the selected companies whenever the selection changes
  const selectedCompanies = useMemo(() => [...new Set(slots.map(s => s.company))], [slots]);
  const selectionKey = selectedCompanies.join('|');
  useEffect(() => {
    if (!selectedCompanies.length) return;
    let cancelled = false;
    setLoading(true);
    fetchCompanyHistory(selectedCompanies).then(result => {
      if (!cancelled) {
        setHistory(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey]);

  // One row per year, one column per slot: { year: 2024, s0: 22293000, s1: ... }
  const chartData = useMemo(() => {
    const years = new Set<number>();
    slots.forEach(s => history[s.company]?.forEach(row => years.add(row.year)));
    return [...years].sort((a, b) => a - b).map(year => {
      const point: Record<string, number | null> = { year };
      slots.forEach((s, i) => {
        const row = history[s.company]?.find(r => r.year === year);
        point[`s${i}`] = row ? toChartNumber(row[metric as keyof CompanyFinancials]) : null;
      });
      return point;
    });
  }, [history, slots, metric]);

  const hasData = chartData.some(point => slots.some((_, i) => point[`s${i}`] !== null));
  const hasNegative = chartData.some(point => slots.some((_, i) => (point[`s${i}`] ?? 0) < 0));
  const mixedCurrencies =
    CURRENCY_FIELDS.has(metric) && new Set(slots.map(s => getCurrencySymbol(s.company))).size > 1;

  const updateSlot = (index: number, company: string) =>
    setSlots(prev => prev.map((s, i) => (i === index ? { ...s, company } : s)));

  const removeSlot = (index: number) => setSlots(prev => prev.filter((_, i) => i !== index));

  const addSlot = () => {
    const usedColors = new Set(slots.map(s => s.color));
    const color = SERIES_COLORS.findIndex((_, i) => !usedColors.has(i));
    const company = companies.find(c => !selectedCompanies.includes(c)) ?? companies[0];
    if (color === -1 || !company) return;
    setSlots(prev => [...prev, { company, color }]);
  };

  const metricLabel = METRIC_LABELS.get(metric) ?? metric;
  const selectClass =
    "w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="font-['Geist:SemiBold',sans-serif] font-semibold text-neutral-950 text-2xl">
          Trends Over Time
        </h1>
        <p className="font-['Geist:Regular',sans-serif] text-neutral-600 text-sm mt-1">
          See how a measure changes year by year, and compare up to {MAX_COMPANIES} companies on the same chart.
        </p>
      </div>

      {/* Controls: one row of filters above the chart */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-4">
        <div className="max-w-md">
          <label className="block font-['Geist:Medium',sans-serif] text-neutral-700 text-xs uppercase tracking-wider mb-1">
            Measure
          </label>
          <select className={selectClass} value={metric} onChange={e => setMetric(e.target.value)}>
            {METRIC_GROUPS.map(({ group, metrics }) => (
              <optgroup key={group} label={group}>
                {metrics.map(([label, field]) => (
                  <option key={field} value={field}>{label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <span className="block font-['Geist:Medium',sans-serif] text-neutral-700 text-xs uppercase tracking-wider mb-1">
            Companies
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {slots.map((slot, i) => (
              <div key={slot.color} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="shrink-0 w-4 h-1 rounded-full"
                  style={{ backgroundColor: SERIES_COLORS[slot.color] }}
                />
                <select
                  className={selectClass}
                  value={slot.company}
                  onChange={e => updateSlot(i, e.target.value)}
                  aria-label={`Company ${i + 1}`}
                >
                  {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {slots.length > 1 && (
                  <button
                    onClick={() => removeSlot(i)}
                    className="shrink-0 p-1.5 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                    aria-label={`Remove ${slot.company}`}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}
            {slots.length < MAX_COMPANIES && companies.length > 0 && (
              <button
                onClick={addSlot}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 font-['Geist:Medium',sans-serif]"
              >
                <Plus className="size-4" /> Add company
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
            {metricLabel}, {chartData[0]?.year ?? ''}–{chartData[chartData.length - 1]?.year ?? ''}
          </h2>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {slots.map(slot => (
              <span key={slot.color} className="flex items-center gap-1.5 text-xs text-neutral-700 font-['Geist:Regular',sans-serif]">
                <span aria-hidden className="w-3 h-0.5 rounded-full" style={{ backgroundColor: SERIES_COLORS[slot.color] }} />
                {slot.company}
              </span>
            ))}
          </div>
        </div>

        {mixedCurrencies && (
          <p className="mb-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            Heads up: these companies report in different currencies, so their dollar amounts aren't directly comparable.
            Percentages and ratios compare fairly across currencies.
          </p>
        )}

        {loading ? (
          <div className="h-[360px] flex items-center justify-center text-neutral-500 text-sm">Loading data…</div>
        ) : !hasData ? (
          <div className="h-[360px] flex items-center justify-center text-neutral-500 text-sm">
            No data available for this measure.
          </div>
        ) : (
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 136, bottom: 0, left: 8 }}>
                <CartesianGrid vertical={false} stroke="#e5e5e5" />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={{ stroke: '#d4d4d4' }}
                  tick={{ fill: '#525252', fontSize: 12 }}
                  padding={{ left: 12, right: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#525252', fontSize: 12 }}
                  width={64}
                  tickFormatter={v => formatCompact(Number(v), metric, slots[0]?.company)}
                />
                {hasNegative && <ReferenceLine y={0} stroke="#a3a3a3" />}
                <Tooltip
                  cursor={{ stroke: '#a3a3a3', strokeWidth: 1 }}
                  content={({ active, label, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white border border-neutral-200 rounded-md shadow-md px-3 py-2 text-xs space-y-1">
                        <div className="font-['Geist:Medium',sans-serif] text-neutral-950">{label}</div>
                        {slots.map((slot, i) => {
                          const value = payload[0]?.payload?.[`s${i}`];
                          return (
                            <div key={slot.color} className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SERIES_COLORS[slot.color] }} />
                              <span className="text-neutral-600">{slot.company}</span>
                              <span className="ml-auto pl-4 text-neutral-950 tabular-nums">
                                {value === null || value === undefined ? 'No data' : formatCompact(value, metric, slot.company)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                />
                {slots.map((slot, i) => (
                  <Line
                    key={slot.color}
                    type="linear"
                    dataKey={`s${i}`}
                    name={slot.company}
                    stroke={SERIES_COLORS[slot.color]}
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: SERIES_COLORS[slot.color] }}
                    activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                ))}
                {/* Direct labels at the end of each line, nudged apart so they don't overlap */}
                <Customized
                  component={(props: any) => <EndLabels {...props} slots={slots} data={chartData} />}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {CURRENCY_FIELDS.has(metric) && (
          <p className="mt-2 text-[11px] text-neutral-500">B = billions, M = millions.</p>
        )}
      </div>

      {/* Table view of the same numbers */}
      {!loading && hasData && (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm font-['Geist:Regular',sans-serif]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="sticky left-0 bg-neutral-50 text-left px-4 py-3 font-['Geist:Medium',sans-serif] font-medium text-neutral-950 whitespace-nowrap">
                  {metricLabel}{CURRENCY_FIELDS.has(metric) ? ' (in thousands)' : ''}
                </th>
                {chartData.map(point => (
                  <th key={point.year} className="text-right px-4 py-3 font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
                    {point.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, i) => (
                <tr key={slot.color} className="border-b border-neutral-200 last:border-b-0">
                  <td className="sticky left-0 bg-white px-4 py-3 text-neutral-950 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden className="w-3 h-0.5 rounded-full" style={{ backgroundColor: SERIES_COLORS[slot.color] }} />
                      {slot.company}
                    </span>
                  </td>
                  {chartData.map(point => (
                    <td key={point.year} className="px-4 py-3 text-right text-neutral-950 tabular-nums whitespace-nowrap">
                      {formatValueOrDash(point[`s${i}`], metric, slot.company)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Draws each company's name just right of its last data point.
function EndLabels({
  xAxisMap,
  yAxisMap,
  slots,
  data
}: {
  xAxisMap?: Record<string, { scale: (v: number) => number }>;
  yAxisMap?: Record<string, { scale: (v: number) => number }>;
  slots: Slot[];
  data: Array<Record<string, number | null>>;
}) {
  const xScale = xAxisMap && Object.values(xAxisMap)[0]?.scale;
  const yScale = yAxisMap && Object.values(yAxisMap)[0]?.scale;
  if (!xScale || !yScale) return null;

  const MIN_GAP = 14;
  const labels = slots
    .map((slot, i) => {
      const last = [...data].reverse().find(point => point[`s${i}`] !== null);
      if (!last) return null;
      return {
        slot,
        x: xScale(last.year as number),
        y: yScale(last[`s${i}`] as number)
      };
    })
    .filter((l): l is { slot: Slot; x: number; y: number } => l !== null)
    .sort((a, b) => a.y - b.y);

  // Push labels down until each is at least MIN_GAP below the one above it
  for (let i = 1; i < labels.length; i++) {
    if (labels[i].y - labels[i - 1].y < MIN_GAP) labels[i].y = labels[i - 1].y + MIN_GAP;
  }

  return (
    <g>
      {labels.map(({ slot, x, y }) => (
        <text
          key={slot.color}
          x={x + 18}
          y={y}
          dy="0.35em"
          fontSize={11}
          fill="#404040"
        >
          {slot.company.length > 20 ? `${slot.company.slice(0, 19)}…` : slot.company}
        </text>
      ))}
    </g>
  );
}
