import { Sidebar } from './components/Sidebar';
import { FinancialComparisonTable } from './components/FinancialComparisonTable';

export default function App() {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar - approximately 22-25% width */}
      <aside className="w-[22%] min-w-[220px] max-w-[280px] shrink-0 sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </aside>
      
      {/* Main Content Area - remaining space */}
      <main className="flex-1 p-8">
        <FinancialComparisonTable />
      </main>
    </div>
  );
}