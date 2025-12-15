import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { FinancialComparisonTable } from './components/FinancialComparisonTable';
import { CompanySegmentComparison } from './components/CompanySegmentComparison';
import { ReportsPage } from './components/ReportsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('company-vs-company');

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar - approximately 22-25% width */}
      <aside className="w-[22%] min-w-[220px] max-w-[280px] shrink-0 sticky top-0 h-screen overflow-y-auto">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      </aside>
      
      {/* Main Content Area - remaining space */}
      <main className="flex-1 p-8">
        {currentPage === 'company-vs-company' && <FinancialComparisonTable />}
        {currentPage === 'company-vs-segment' && <CompanySegmentComparison />}
        {currentPage === 'reports' && <ReportsPage />}
      </main>
    </div>
  );
}