import { useId, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { CompanyFinancials } from '@/lib/api';
import { formatValueOrDash, getCurrencySymbol } from '@/lib/formatters';

export interface ChartSelection {
  company: string;
  year: string;
  data: CompanyFinancials | null;
}

interface Metric {
  label: string;
  field: keyof CompanyFinancials;
}

const COLORS = ['#2563eb', '#0d9488', '#9333ea'];
const FINANCIAL_METRICS: Metric[] = [
  { label: 'Revenue', field: 'Net Revenue' },
  { label: 'Total assets', field: 'Total Assets' },
  { label: 'Net profit', field: 'Net Profit' },
];
const MARGIN_METRICS: Metric[] = [
  { label: 'Gross margin', field: 'Gross Margin %' },
  { label: 'Operating margin', field: 'Operating Profit Margin %' },
  { label: 'Net margin', field: 'Net Profit Margin %' },
];
const TURNOVER_METRICS: Metric[] = [
  { label: 'Inventory turnover', field: 'Inventory Turnover' },
  { label: 'Asset turnover', field: 'Asset Turnover' },
];

// Missing values stay missing; they must not become zero-height bars.
export function numericMetric(data: CompanyFinancials | null, field: keyof CompanyFinancials): number | null {
  const value = data?.[field];
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function MetricChart({ selections, metrics, unit }: {
  selections: Array<ChartSelection & { index: number }>;
  metrics: Metric[];
  unit: 'currency' | 'percentage' | 'turnover';
}) {
  const rows = metrics.map(metric => ({
    metric: metric.label,
    field: metric.field,
    ...Object.fromEntries(selections.map(selection => [
      `company${selection.index}`, numericMetric(selection.data, metric.field),
    ])),
  }));
  const hasData = selections.some(selection => metrics.some(metric => numericMetric(selection.data, metric.field) !== null));
  const compact = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });
  const tick = (value: number) => unit === 'percentage' ? `${value}%` : unit === 'turnover' ? `${value}×` : compact.format(value);

  return (
    <>
      {hasData ? (
        <div className="h-[280px] w-full min-w-0" role="img" aria-label={`${metrics.map(metric => metric.label).join(' and ')} comparison; exact values are in the data table below.`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 12, right: 20, bottom: 8, left: 0 }} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={tick} tick={{ fontSize: 11 }} />
              <YAxis dataKey="metric" type="category" width={115} tick={{ fontSize: 12 }} tickLine={false} />
              <ReferenceLine x={0} stroke="#9ca3af" />
              <Tooltip
                cursor={{ fill: '#f5f5f5' }}
                formatter={(value, name, item) => [
                  formatValueOrDash(value as number, item.payload.field, selections.find(selection => `${selection.company} (${selection.year}) · ${selection.index + 1}` === name)?.company),
                  name,
                ]}
              />
              {selections.map(selection => (
                <Bar
                  key={selection.index}
                  dataKey={`company${selection.index}`}
                  name={`${selection.company} (${selection.year}) · ${selection.index + 1}`}
                  fill={COLORS[selection.index]}
                  maxBarSize={24}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="py-8 text-sm text-neutral-500">No data available for these metrics and selections.</p>}
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-blue-600 hover:underline">View exact values</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{unit === 'currency' ? 'Financial values in thousands' : unit === 'percentage' ? 'Profit margins in percent' : 'Turnover in times per year'}</caption>
            <thead><tr><th scope="col" className="p-2">Metric</th>{selections.map(selection => <th key={selection.index} scope="col" className="p-2">{selection.company} ({selection.year}) · {selection.index + 1}</th>)}</tr></thead>
            <tbody>{metrics.map(metric => <tr key={metric.field} className="border-t border-neutral-200"><th scope="row" className="p-2 font-normal">{metric.label}</th>{selections.map(selection => <td key={selection.index} className="p-2">{formatValueOrDash(numericMetric(selection.data, metric.field), metric.field, selection.company)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </details>
    </>
  );
}

export function CompanyComparisonCharts({ selections }: { selections: ChartSelection[] }) {
  const [financialField, setFinancialField] = useState<keyof CompanyFinancials>('Net Revenue');
  const metricId = useId();
  const indexed = selections.map((selection, index) => ({ ...selection, index }));
  const currencies = Array.from(new Set(indexed.map(selection => getCurrencySymbol(selection.company))));
  const financialMetric = FINANCIAL_METRICS.find(metric => metric.field === financialField)!;

  return (
    <section aria-labelledby="company-charts-title" className="pt-6 pb-4">
      <h2 id="company-charts-title" className="text-lg font-medium text-neutral-950">Compare the selected companies</h2>
      <p className="mt-1 text-sm text-neutral-600">Charts use the same company and fiscal-year selections as the table.</p>
      <ul className="my-4 flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Company chart legend">
        {indexed.map(selection => <li key={selection.index} className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-sm" style={{ backgroundColor: COLORS[selection.index] }} /><span>{selection.company} ({selection.year}) · {selection.index + 1}{!selection.data && ' — No data'}</span></li>)}
      </ul>
      <div className="flex gap-4 overflow-x-auto pb-2">
        <article className="min-w-[320px] flex-1 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-medium text-neutral-950">Financial scale</h3>
            <div className="flex items-center gap-2 text-sm"><label htmlFor={metricId}>Metric</label><select id={metricId} value={financialField} onChange={event => setFinancialField(event.target.value as keyof CompanyFinancials)} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">{FINANCIAL_METRICS.map(metric => <option key={metric.field} value={metric.field}>{metric.label}</option>)}</select></div>
          </div>
          <p className="text-xs text-neutral-500">Amounts in thousands of each company’s reporting currency.</p>
          {currencies.length > 1 && <p className="mt-2 text-sm text-neutral-600">Reporting currencies differ, so monetary amounts are shown in separate charts. No currency conversion is applied.</p>}
          {currencies.map(currency => <div key={currency}>{currencies.length > 1 && <h4 className="mt-4 text-sm font-medium">{currency} (thousands)</h4>}<MetricChart selections={indexed.filter(selection => getCurrencySymbol(selection.company) === currency)} metrics={[financialMetric]} unit="currency" /></div>)}
        </article>
        <article className="min-w-[320px] flex-1 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="font-medium text-neutral-950">Profit margins</h3>
          <p className="mt-2 text-xs text-neutral-500">Percent of revenue. Negative margins indicate a loss.</p>
          <MetricChart selections={indexed} metrics={MARGIN_METRICS} unit="percentage" />
        </article>
        <article className="min-w-[320px] flex-1 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="font-medium text-neutral-950">Operating efficiency</h3>
          <p className="mt-2 text-xs text-neutral-500">Inventory and asset turnover, in times per year. Interpret these ratios within each retail segment.</p>
          <MetricChart selections={indexed} metrics={TURNOVER_METRICS} unit="turnover" />
        </article>
      </div>
    </section>
  );
}
