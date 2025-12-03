import { useState } from 'react';
import { Search, Download, ArrowLeftRight } from 'lucide-react';
import fitLogo from 'figma:asset/fd6a1765252638a4eb759f6a240b8db3c878408d.png';

// Mock data for two companies
const dillardData = {
  company: "Dillard's",
  year: 2024,
  totalRevenue: "$6,482,636",
  costOfGoods: "$3,919,549",
  grossMargin: "$2,563,087",
  sgaExpenses: "$1,731,234",
  operatingProfit: "$729,701",
  netProfit: "$593,476",
  inventory: "$1,172,047",
  totalAssets: "$3,531,054",
  cogsPercent: "60.5%",
  grossMarginPercent: "39.5%",
  sgaPercent: "26.7%",
  operatingProfitMargin: "11.3%",
  netProfitMargin: "9.2%",
  inventoryTurnover: "3.3",
  currentRatio: "2.8",
  quickRatio: "1.4",
  debtToEquity: "1.0",
  assetTurnover: "1.8",
  roa: "16.8%",
  revenueCAGR: "-0.7%"
};

const macysData = {
  company: "Macy's",
  year: 2024,
  totalRevenue: "$22,293,000",
  costOfGoods: "$13,740,000",
  grossMargin: "$8,553,000",
  sgaExpenses: "$8,330,000",
  operatingProfit: "$909,000",
  netProfit: "$582,000",
  inventory: "$4,468,000",
  totalAssets: "$16,402,000",
  cogsPercent: "61.6%",
  grossMarginPercent: "38.4%",
  sgaPercent: "37.4%",
  operatingProfitMargin: "4.1%",
  netProfitMargin: "2.6%",
  inventoryTurnover: "3.1",
  currentRatio: "1.4",
  quickRatio: "0.4",
  debtToEquity: "2.6",
  assetTurnover: "1.4",
  roa: "3.5%",
  revenueCAGR: "-3.0%"
};

export function FinancialComparisonTable() {
  const [company1] = useState(dillardData);
  const [company2] = useState(macysData);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1000');

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
            <select className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>{company1.company}</option>
            </select>
            <select className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>{company1.year}</option>
            </select>
          </div>
          <div className="px-6 py-4 border-l border-neutral-200 space-y-2">
            <select className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Medium',sans-serif] text-neutral-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>{company2.company}</option>
            </select>
            <select className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-['Geist:Regular',sans-serif] text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>{company2.year}</option>
            </select>
          </div>
        </div>

        {/* Financial Numbers Section - removed duplicate header */}
        <TableRow label="Total Revenue" value1={company1.totalRevenue} value2={company2.totalRevenue} />
        <TableRow label="Cost of Goods" value1={company1.costOfGoods} value2={company2.costOfGoods} />
        <TableRow label="Gross Margin" value1={company1.grossMargin} value2={company2.grossMargin} />
        <TableRow label="Selling, General & Administrative Expenses" value1={company1.sgaExpenses} value2={company2.sgaExpenses} />
        <TableRow label="Operating Profit" value1={company1.operatingProfit} value2={company2.operatingProfit} />
        <TableRow label="Net Profit" value1={company1.netProfit} value2={company2.netProfit} />
        <TableRow label="Inventory" value1={company1.inventory} value2={company2.inventory} />
        <TableRow label="Total Assets" value1={company1.totalAssets} value2={company2.totalAssets} />

        {/* Financial Indicators Section */}
        <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200 border-t border-neutral-200">
          <h2 className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">
            Financial Indicators
          </h2>
        </div>

        <TableRow label="Cost of goods percentage (COGS/Net Sales)" value1={company1.cogsPercent} value2={company2.cogsPercent} />
        <TableRow label="Gross margin percentage (GM/Net Sales)" value1={company1.grossMarginPercent} value2={company2.grossMarginPercent} />
        <TableRow label="SG&A expense percentage (SG&A/Net Sales)" value1={company1.sgaPercent} value2={company2.sgaPercent} />
        <TableRow label="Operating profit margin percentage (Op.Profit/Net Sales)" value1={company1.operatingProfitMargin} value2={company2.operatingProfitMargin} />
        <TableRow label="Net profit margin percentage (Net Profit/Net Sales)" value1={company1.netProfitMargin} value2={company2.netProfitMargin} />
        <TableRow label="Inventory turnover (COGS/Inventory)" value1={company1.inventoryTurnover} value2={company2.inventoryTurnover} />
        <TableRow label="Current Ratio (Current Assets/Current Liabilities)" value1={company1.currentRatio} value2={company2.currentRatio} />
        <TableRow label="Quick Ratio ((Cash + AR)/Current Liabilities)" value1={company1.quickRatio} value2={company2.quickRatio} />
        <TableRow label="Debt-to-Equity Ratio (Total Debt/Total Equity)" value1={company1.debtToEquity} value2={company2.debtToEquity} />
        <TableRow label="Asset turnover (Net Sales/Total Assets)" value1={company1.assetTurnover} value2={company2.assetTurnover} />
        <TableRow label="Return on assets (ROA)" value1={company1.roa} value2={company2.roa} />
        <TableRow label="3-Year Revenue CAGR" value1={company1.revenueCAGR} value2={company2.revenueCAGR} isLast />
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