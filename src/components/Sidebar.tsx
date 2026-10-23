import { BarChart3, Building2, FileText, PanelRightClose, PanelRightOpen, X } from 'lucide-react';

function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-6 py-6 ${collapsed ? 'md:hidden' : ''}`}>
      <div className="bg-blue-600 rounded-lg flex items-center justify-center size-[40px] shrink-0">
        <BarChart3 className="size-5 text-white" />
      </div>
      <span className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950 whitespace-nowrap">FIT Retail Index</span>
    </div>
  );
}

function NavItem({ icon, label, active = false, collapsed = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; collapsed?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors ${
      collapsed ? 'md:justify-center md:px-0' : ''
    } ${
      active ? 'bg-neutral-100 border-l-2 border-blue-600' : 'hover:bg-neutral-50'
    }`}>
      <div className={`size-5 shrink-0 ${active ? 'text-blue-600' : 'text-neutral-600'}`}>
        {icon}
      </div>
      <span className={`font-['Geist:Regular',sans-serif] whitespace-nowrap ${collapsed ? 'md:hidden' : ''} ${
        active ? 'font-medium text-neutral-950' : 'text-neutral-600'
      }`}>
        {label}
      </span>
    </div>
  );
}

export function Sidebar({
  currentPage,
  onNavigate,
  onClose,
  isIframe = false,
  collapsed = false,
  onToggleCollapse
}: {
  currentPage: string;
  onNavigate: (page: string) => void;
  onClose?: () => void;
  isIframe?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const handleNavClick = (page: string) => {
    onNavigate(page);
    onClose?.();
  };

  return (
    <div className="h-full bg-white border-l border-neutral-200 flex flex-col">
      <div className={`flex items-center justify-between ${collapsed ? 'md:justify-center md:py-6' : ''}`}>
        <Logo collapsed={collapsed} />
        {/* Collapse/expand button - desktop only (not shown in iframe, where the sidebar is an overlay) */}
        {!isIframe && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`hidden md:flex p-2 hover:bg-neutral-100 rounded-lg ${collapsed ? '' : 'mr-4'}`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <PanelRightOpen className="size-5 text-neutral-600" />
              : <PanelRightClose className="size-5 text-neutral-600" />}
          </button>
        )}
        {/* Close button - visible only on mobile (or always when in iframe) */}
        <button
          onClick={onClose}
          className={`${isIframe ? '' : 'md:hidden '}mr-4 p-2 hover:bg-neutral-100 rounded-lg`}
          aria-label="Close menu"
        >
          <X className="size-5 text-neutral-600" />
        </button>
      </div>

      <div className={`px-4 py-2 ${collapsed ? 'md:hidden' : ''}`}>
        <p className="px-2 font-['Geist:Medium',sans-serif] text-neutral-500 text-xs uppercase tracking-wider">
          Pages
        </p>
      </div>

      <nav className="flex-1">
        <NavItem
          icon={<Building2 />}
          label="Company vs Company"
          active={currentPage === 'company-vs-company'}
          collapsed={collapsed}
          onClick={() => handleNavClick('company-vs-company')}
        />
        <NavItem
          icon={<Building2 />}
          label="Company vs Segment"
          active={currentPage === 'company-vs-segment'}
          collapsed={collapsed}
          onClick={() => handleNavClick('company-vs-segment')}
        />
        <NavItem
          icon={<FileText />}
          label="Reports"
          active={currentPage === 'reports'}
          collapsed={collapsed}
          onClick={() => handleNavClick('reports')}
        />
      </nav>
    </div>
  );
}
