import { useState, useEffect, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Customized
} from 'recharts';
import { fetchYearSnapshot, type CompanySnapshot } from '@/lib/api';
import { AVAILABLE_YEARS } from '@/lib/constants';
import { formatValue } from '@/lib/formatters';

// Ratios and percentages only: they compare fairly across companies of any size or currency
const MEASURES: Array<[string, string]> = [
  ['Gross Margin %', 'Gross Margin %'],
  ['Cost of Goods %', 'Cost of Goods %'],
  ['SG&A %', 'SGA %'],
  ['Operating Profit Margin %', 'Operating Profit Margin %'],
  ['Net Profit Margin %', 'Net Profit Margin %'],
  ['Inventory Turnover', 'Inventory Turnover'],
  ['Asset Turnover', 'Asset Turnover'],
  ['Return on Assets (ROA)', 'Return on Assets'],
  ['Current Ratio', 'Current Ratio'],
  ['Quick Ratio', 'Quick Ratio'],
  ['Debt-to-Equity Ratio', 'Debt to Equity'],
  ['3-Year Revenue CAGR', 'Three Year Revenue CAGR']
];
const MEASURE_LABELS = new Map(MEASURES.map(([label, field]) => [field, label]));

// Classic retail comparisons, one click away
const QUICK_VIEWS: Array<{ label: string; x: string; y: string; note: string }> = [
  {
    label: 'Margin vs. Turnover',
    x: 'Inventory Turnover',
    y: 'Gross Margin %',
    note: 'The classic retail trade-off: high-margin retailers usually sell their inventory more slowly, while low-margin retailers make it up on volume.'
  },
  {
    label: 'Profitability vs. Efficiency',
    x: 'Asset Turnover',
    y: 'Net Profit Margin %',
    note: 'Return on Assets = Net Profit Margin × Asset Turnover. Companies can earn a good ROA by being very profitable per sale, by selling a lot per dollar of assets, or both.'
  },
  {
    label: 'Growth vs. Profitability',
    x: 'Three Year Revenue CAGR',
    y: 'Operating Profit Margin %',
    note: 'Is the company growing, profitable, both, or neither? Top-right is the place to be.'
  },
  {
    label: 'Liquidity vs. Leverage',
    x: 'Debt to Equity',
    y: 'Current Ratio',
    note: 'How easily a company can pay its short-term bills (Current Ratio) compared with how much it relies on borrowed money (Debt-to-Equity).'
  }
];

// Spotlight colors: highlighted segment, highlighted company, everyone else
const SEGMENT_COLOR = '#2a78d6';
const COMPANY_COLOR = '#eb6834';
const CONTEXT_COLOR = '#b5b5b5';
const MAX_SEGMENT_LABELS = 8;

interface Point {
  company: string;
  segment: string;
  x: number;
  y: number;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Values far outside the pack (3× the interquartile range) would squash everyone else into a corner
function outlierBounds(values: number[]): [number, number] {
  const sorted = [...values].sort((a, b) => a - b);
  const q = (p: number) => sorted[Math.floor((sorted.length - 1) * p)];
  const iqr = q(0.75) - q(0.25);
  return [q(0.25) - 3 * iqr, q(0.75) + 3 * iqr];
}

export function PositioningMapPage() {
  const [year, setYear] = useState('2025');
  const [xField, setXField] = useState(QUICK_VIEWS[0].x);
  const [yField, setYField] = useState(QUICK_VIEWS[0].y);
  const [segment, setSegment] = useState('Department Store');
  const [company, setCompany] = useState('');
  const [rows, setRows] = useState<CompanySnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchYearSnapshot(year).then(result => {
      if (!cancelled) {
        setRows(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [year]);

  const segments = useMemo(
    () => [...new Set(rows.map(r => r.segment).filter((s): s is string => !!s))].sort(),
    [rows]
  );
  // Keep the highlighted segment valid if a year doesn't include it
  useEffect(() => {
    if (segments.length && !segments.includes(segment)) setSegment(segments[0]);
  }, [segments, segment]);

  const companies = useMemo(() => rows.map(r => r.company).sort((a, b) => a.localeCompare(b)), [rows]);

  // Split companies into: plotted, missing data, and extreme values left off the chart
  const { points, missing, offChart, xMedian, yMedian } = useMemo(() => {
    const withValues: Point[] = [];
    const missing: string[] = [];
    rows.forEach(r => {
      const x = toNumber(r[xField as keyof CompanySnapshot]);
      const y = toNumber(r[yField as keyof CompanySnapshot]);
      if (x === null || y === null) missing.push(r.company);
      else withValues.push({ company: r.company, segment: r.segment ?? 'Other', x, y });
    });
    if (withValues.length < 4) {
      return { points: withValues, missing, offChart: [] as string[], xMedian: null, yMedian: null };
    }
    const [xLo, xHi] = outlierBounds(withValues.map(p => p.x));
    const [yLo, yHi] = outlierBounds(withValues.map(p => p.y));
    const points = withValues.filter(p => p.x >= xLo && p.x <= xHi && p.y >= yLo && p.y <= yHi);
    const offChart = withValues.filter(p => !points.includes(p)).map(p => p.company);
    return {
      points,
      missing,
      offChart,
      xMedian: median(withValues.map(p => p.x)),
      yMedian: median(withValues.map(p => p.y))
    };
  }, [rows, xField, yField]);

  // Draw order matters: gray context first, then the segment, then the single company on top
  const contextPoints = points.filter(p => p.segment !== segment && p.company !== company);
  const segmentPoints = points.filter(p => p.segment === segment && p.company !== company);
  const companyPoints = points.filter(p => p.company === company);
  const labelSegment = segmentPoints.length <= MAX_SEGMENT_LABELS;

  const segmentRows = rows
    .filter(r => r.segment === segment)
    .sort((a, b) => a.company.localeCompare(b.company));

  const activeView = QUICK_VIEWS.find(v => v.x === xField && v.y === yField);
  const xLabel = MEASURE_LABELS.get(xField) ?? xField;
  const yLabel = MEASURE_LABELS.get(yField) ?? yField;
  const fmt = (value: number | null | undefined, field: string) => formatValue(value ?? null, field);

  const selectClass =
    "w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block font-['Geist:Medium',sans-serif] text-neutral-700 text-xs uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="font-['Geist:SemiBold',sans-serif] font-semibold text-neutral-950 text-2xl">
          Positioning Map
        </h1>
        <p className="font-['Geist:Regular',sans-serif] text-neutral-600 text-sm mt-1">
          Every retailer as a dot. See where a segment sits compared with the whole market on any two measures.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-4">
        <div>
          <span className={labelClass}>Quick views</span>
          <div className="flex flex-wrap gap-2">
            {QUICK_VIEWS.map(view => {
              const active = view === activeView;
              return (
                <button
                  key={view.label}
                  onClick={() => { setXField(view.x); setYField(view.y); }}
                  className={`px-3 py-1.5 rounded-full border text-sm font-['Geist:Medium',sans-serif] transition-colors ${
                    active
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className={labelClass}>Year</label>
            <select className={selectClass} value={year} onChange={e => setYear(e.target.value)}>
              {AVAILABLE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Across (→)</label>
            <select className={selectClass} value={xField} onChange={e => setXField(e.target.value)}>
              {MEASURES.map(([label, field]) => <option key={field} value={field}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Up (↑)</label>
            <select className={selectClass} value={yField} onChange={e => setYField(e.target.value)}>
              {MEASURES.map(([label, field]) => <option key={field} value={field}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Highlight segment</label>
            <select className={selectClass} value={segment} onChange={e => setSegment(e.target.value)}>
              {segments.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Highlight company</label>
            <select className={selectClass} value={company} onChange={e => setCompany(e.target.value)}>
              <option value="">None</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {activeView && (
          <p className="text-sm text-neutral-600 font-['Geist:Regular',sans-serif]">{activeView.note}</p>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
            {yLabel} vs. {xLabel}, {year}
          </h2>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-700 font-['Geist:Regular',sans-serif]">
            <LegendDot color={SEGMENT_COLOR} label={segment} />
            {company && <LegendDot color={COMPANY_COLOR} label={company} />}
            <LegendDot color={CONTEXT_COLOR} label="All other retailers" />
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="w-4 border-t border-dashed border-neutral-500" />
              Median of all retailers
            </span>
          </div>
        </div>

        {loading ? (
          <div className="h-[460px] flex items-center justify-center text-neutral-500 text-sm">Loading data…</div>
        ) : points.length === 0 ? (
          <div className="h-[460px] flex items-center justify-center text-neutral-500 text-sm">
            No data available for these measures in {year}.
          </div>
        ) : (
          <div className="h-[460px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 12, right: 24, bottom: 28, left: 12 }}>
                <CartesianGrid stroke="#ececec" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={xLabel}
                  domain={['auto', 'auto']}
                  tickLine={false}
                  axisLine={{ stroke: '#d4d4d4' }}
                  tick={{ fill: '#525252', fontSize: 12 }}
                  tickFormatter={v => fmt(Number(v), xField)}
                  label={{ value: `${xLabel} →`, position: 'insideBottom', offset: -18, fill: '#404040', fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={yLabel}
                  domain={['auto', 'auto']}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#525252', fontSize: 12 }}
                  width={56}
                  tickFormatter={v => fmt(Number(v), yField)}
                  label={{ value: `${yLabel} →`, angle: -90, position: 'insideLeft', offset: 4, fill: '#404040', fontSize: 12, style: { textAnchor: 'middle' } }}
                />
                {xMedian !== null && <ReferenceLine x={xMedian} stroke="#737373" strokeDasharray="4 4" />}
                {yMedian !== null && <ReferenceLine y={yMedian} stroke="#737373" strokeDasharray="4 4" />}
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    const p = payload?.[0]?.payload as Point | undefined;
                    if (!active || !p) return null;
                    return (
                      <div className="bg-white border border-neutral-200 rounded-md shadow-md px-3 py-2 text-xs space-y-1">
                        <div className="font-['Geist:Medium',sans-serif] text-neutral-950">{p.company}</div>
                        <div className="text-neutral-500">{p.segment}</div>
                        <div className="flex justify-between gap-4">
                          <span className="text-neutral-600">{xLabel}</span>
                          <span className="text-neutral-950 tabular-nums">{fmt(p.x, xField)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-neutral-600">{yLabel}</span>
                          <span className="text-neutral-950 tabular-nums">{fmt(p.y, yField)}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={contextPoints}
                  fill={CONTEXT_COLOR}
                  stroke="#fff"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Scatter
                  data={segmentPoints}
                  fill={SEGMENT_COLOR}
                  stroke="#fff"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Scatter
                  data={companyPoints}
                  fill={COMPANY_COLOR}
                  stroke="#fff"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                {/* Company names, spread apart so clustered dots stay readable */}
                <Customized
                  component={(props: any) => (
                    <DotLabels
                      {...props}
                      points={[...(labelSegment ? segmentPoints : []), ...companyPoints]}
                      bold={company}
                    />
                  )}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && (
          <div className="mt-2 space-y-1 text-[11px] text-neutral-500 font-['Geist:Regular',sans-serif]">
            <p>Hover over any dot to see the company and its numbers. Dashed lines mark the typical (median) retailer.</p>
            {!labelSegment && <p>{segment} has {segmentPoints.length} companies, so names are hidden to avoid clutter. See the table below.</p>}
            {(xField === 'Debt to Equity' || yField === 'Debt to Equity') && points.some(p => (xField === 'Debt to Equity' ? p.x : p.y) < 0) && (
              <p>A negative Debt-to-Equity ratio means the company has negative shareholder equity (often from buying back lots of its own stock), not that it has no debt.</p>
            )}
            {offChart.length > 0 && <p>Not shown because their values are far outside the rest: {offChart.join(', ')}.</p>}
            {missing.length > 0 && <p>Not shown because data is missing: {missing.join(', ')}.</p>}
          </div>
        )}
      </div>

      {/* Table view for the highlighted segment */}
      {!loading && segmentRows.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm font-['Geist:Regular',sans-serif]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-['Geist:Medium',sans-serif] font-medium text-neutral-950">{segment}</th>
                <th className="text-right px-4 py-3 font-['Geist:Medium',sans-serif] font-medium text-neutral-950">{xLabel}</th>
                <th className="text-right px-4 py-3 font-['Geist:Medium',sans-serif] font-medium text-neutral-950">{yLabel}</th>
              </tr>
            </thead>
            <tbody>
              {segmentRows.map(r => (
                <tr key={r.company} className="border-b border-neutral-200">
                  <td className="px-4 py-3 text-neutral-950 whitespace-nowrap">{r.company}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(toNumber(r[xField as keyof CompanySnapshot]), xField)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(toNumber(r[yField as keyof CompanySnapshot]), yField)}</td>
                </tr>
              ))}
              {xMedian !== null && yMedian !== null && (
                <tr className="bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-600 italic whitespace-nowrap">Median of all retailers</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-600">{fmt(xMedian, xField)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-600">{fmt(yMedian, yField)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

// Places each label to the right of its dot, nudging labels down when they would overlap,
// and draws a thin leader line back to the dot when a label has moved.
function DotLabels({
  xAxisMap,
  yAxisMap,
  offset,
  points,
  bold
}: {
  xAxisMap?: Record<string, { scale: (v: number) => number }>;
  yAxisMap?: Record<string, { scale: (v: number) => number }>;
  offset?: { left: number; width: number };
  points: Point[];
  bold: string;
}) {
  const xScale = xAxisMap && Object.values(xAxisMap)[0]?.scale;
  const yScale = yAxisMap && Object.values(yAxisMap)[0]?.scale;
  if (!xScale || !yScale) return null;

  const LINE_HEIGHT = 13;
  const CHAR_WIDTH = 6.2;
  const rightEdge = offset ? offset.left + offset.width : Infinity;

  type Placed = { p: Point; dotX: number; dotY: number; x: number; y: number; w: number; anchor: 'start' | 'end' };
  const placed: Placed[] = [];
  const overlaps = (a: Placed, b: Placed) => {
    const aLeft = a.anchor === 'start' ? a.x : a.x - a.w;
    const bLeft = b.anchor === 'start' ? b.x : b.x - b.w;
    return Math.abs(a.y - b.y) < LINE_HEIGHT && aLeft < bLeft + b.w && bLeft < aLeft + a.w;
  };

  [...points]
    .map(p => ({ p, dotX: xScale(p.x), dotY: yScale(p.y) }))
    .sort((a, b) => a.dotY - b.dotY)
    .forEach(({ p, dotX, dotY }) => {
      const w = p.company.length * CHAR_WIDTH;
      // Flip labels to the left of the dot near the right edge of the chart
      const anchor = dotX + 10 + w > rightEdge ? 'end' : 'start';
      const label: Placed = { p, dotX, dotY, x: anchor === 'start' ? dotX + 10 : dotX - 10, y: dotY, w, anchor };
      while (placed.some(other => overlaps(label, other))) label.y += LINE_HEIGHT;
      placed.push(label);
    });

  return (
    <g>
      {placed.map(({ p, dotX, dotY, x, y, anchor }) => (
        <g key={p.company}>
          {Math.abs(y - dotY) > 2 && (
            <line x1={dotX} y1={dotY} x2={anchor === 'start' ? x - 2 : x + 2} y2={y} stroke="#a3a3a3" strokeWidth={1} />
          )}
          <text
            x={x}
            y={y}
            dy="0.35em"
            textAnchor={anchor}
            fontSize={11}
            fontWeight={p.company === bold ? 600 : 400}
            fill="#262626"
            stroke="#fff"
            strokeWidth={3}
            paintOrder="stroke"
          >
            {p.company}
          </text>
        </g>
      ))}
    </g>
  );
}
