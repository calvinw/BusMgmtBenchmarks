import { BarChart3, Building2, FileText, Users, X } from 'lucide-react';

function Logo() {
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <div className="bg-blue-600 rounded-lg flex items-center justify-center size-[40px]">
        <BarChart3 className="size-5 text-white" />
      </div>
      <span className="font-['Geist:Medium',sans-serif] font-medium text-neutral-950">FIT Retail Index</span>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors ${
      active ? 'bg-neutral-100 border-l-2 border-blue-600' : 'hover:bg-neutral-50'
    }`}>
      <div className={`size-5 ${active ? 'text-blue-600' : 'text-neutral-600'}`}>
        {icon}
      </div>
      <span className={`font-['Geist:Regular',sans-serif] ${
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
  isIframe = false
}: {
  currentPage: string;
  onNavigate: (page: string) => void;
  onClose?: () => void;
  isIframe?: boolean;
}) {
  const handleNavClick = (page: string) => {
    onNavigate(page);
    onClose?.();
  };

  return (
    <div className="h-full bg-white border-r border-neutral-200 flex flex-col">
      <div className="flex items-center justify-between">
        <Logo />
        {/* Close button - visible only on mobile (or always when in iframe) */}
        <button
          onClick={onClose}
          className={`${isIframe ? '' : 'md:hidden '}mr-4 p-2 hover:bg-neutral-100 rounded-lg`}
          aria-label="Close menu"
        >
          <X className="size-5 text-neutral-600" />
        </button>
      </div>
      
      <div className="px-4 py-2">
        <p className="px-2 font-['Geist:Medium',sans-serif] text-neutral-500 text-xs uppercase tracking-wider">
          Pages
        </p>
      </div>
      
      <nav className="flex-1">
        <NavItem
          icon={<Building2 />}
          label="Company vs Company"
          active={currentPage === 'company-vs-company'}
          onClick={() => handleNavClick('company-vs-company')}
        />
        <NavItem
          icon={<Building2 />}
          label="Company vs Segment"
          active={currentPage === 'company-vs-segment'}
          onClick={() => handleNavClick('company-vs-segment')}
        />
        <NavItem
          icon={<FileText />}
          label="Reports"
          active={currentPage === 'reports'}
          onClick={() => handleNavClick('reports')}
        />
        <NavItem
          icon={<Users />}
          label="Contributors"
          active={currentPage === 'contributors'}
          onClick={() => handleNavClick('contributors')}
        />
      </nav>
    </div>
  );
}