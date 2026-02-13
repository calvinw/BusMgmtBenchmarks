import { useState, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { FinancialComparisonTable } from './components/FinancialComparisonTable';
import { CompanySegmentComparison } from './components/CompanySegmentComparison';
import { ReportsPage } from './components/ReportsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('company-vs-company');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isIframe = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('iframe') === 'true';
  }, []);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Mobile menu button - visible only on mobile when menu is closed (or always when in iframe) */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`${isIframe ? '' : 'md:hidden '}fixed top-3 left-2 z-50 p-2 bg-white rounded-lg shadow-md border border-neutral-200`}
          aria-label="Open menu"
        >
          <Menu className="size-5 text-neutral-600" />
        </button>
      )}

      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className={`fixed inset-0 bg-black/50 z-30${isIframe ? '' : ' md:hidden'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless menu open, always visible on desktop (overlay at all sizes when in iframe) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-[280px] transform transition-transform duration-300 ease-in-out
        ${isIframe ? '' : 'md:relative md:w-[22%] md:min-w-[220px] md:max-w-[280px] md:translate-x-0 md:shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onClose={() => setIsMobileMenuOpen(false)}
          isIframe={isIframe}
        />
      </aside>

      {/* Main Content Area - full width on mobile, remaining space on desktop */}
      <main className={`flex-1 p-4 pt-16 ${isIframe ? '' : 'md:p-8 md:pt-8 '}min-w-0 overflow-hidden`}>
        {currentPage === 'company-vs-company' && <FinancialComparisonTable />}
        {currentPage === 'company-vs-segment' && <CompanySegmentComparison />}
        {currentPage === 'reports' && <ReportsPage />}
      </main>
    </div>
  );
}