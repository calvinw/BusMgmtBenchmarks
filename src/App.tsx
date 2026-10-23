import { useState, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { FinancialComparisonTable } from './components/FinancialComparisonTable';
import { CompanySegmentComparison } from './components/CompanySegmentComparison';
import { ReportsPage } from './components/ReportsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('company-vs-company');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Desktop sidebar collapsed state, remembered between visits
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      try {
        localStorage.setItem('sidebarCollapsed', String(!prev));
      } catch {
        // Storage unavailable - collapse still works for this visit
      }
      return !prev;
    });
  };

  const isIframe = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('iframe') === 'true';
  }, []);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Mobile menu button - visible only on mobile when menu is closed (or always when in iframe) */}
      {!isMobileMenuOpen && !isIframe && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden fixed top-3 right-2 z-50 p-2 bg-white rounded-lg shadow-md border border-neutral-200"
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

      {/* Main Content Area - full width on mobile, remaining space on desktop */}
      <main className={`flex-1 p-4 pt-16 ${isIframe ? '' : 'md:p-8 md:pt-8 '}min-w-0 overflow-hidden`}>
        {currentPage === 'company-vs-company' && <FinancialComparisonTable />}
        {currentPage === 'company-vs-segment' && <CompanySegmentComparison />}
        {currentPage === 'reports' && <ReportsPage />}
      </main>

      {/* Sidebar (right side) - hidden on mobile unless menu open, always visible on desktop (overlay at all sizes when in iframe) */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 w-[280px] transform transition-all duration-300 ease-in-out
        ${isIframe ? '' : 'md:relative md:translate-x-0 md:shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto md:overflow-x-hidden'}
        ${isIframe ? '' : isCollapsed ? 'md:w-16' : 'md:w-[22%] md:min-w-[220px] md:max-w-[280px]'}
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onClose={() => setIsMobileMenuOpen(false)}
          isIframe={isIframe}
          collapsed={!isIframe && isCollapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </aside>
    </div>
  );
}