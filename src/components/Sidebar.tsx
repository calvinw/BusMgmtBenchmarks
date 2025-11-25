import { useState } from 'react';
import { BarChart3, GitCompare, Building2, FileText } from 'lucide-react';

interface SidebarProps {
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export function Sidebar({ currentPage = 'Company vs Company', onPageChange }: SidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const navigationItems = [
    {
      id: 'company-vs-company',
      label: 'Company vs Company',
      icon: GitCompare,
    },
    {
      id: 'company-vs-segment',
      label: 'Company vs Segment',
      icon: Building2,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
    },
  ];

  const handlePageSelect = (pageId: string, pageLabel: string) => {
    onPageChange?.(pageLabel);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`bg-white border-r border-[#E5E5E5] transition-all duration-200 ${isMinimized ? 'w-[56px]' : 'w-[200px]'}`}>
        {/* Minimized sidebar buttons */}
        {isMinimized && (
          <div className="flex flex-col p-2 gap-1">
            <button 
              onClick={() => setIsMinimized(false)}
              className="flex items-center justify-center w-10 h-10 rounded-[6px] bg-[#0A0A0A] text-white hover:bg-[#262626] transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-[6px] hover:bg-[#F5F5F5] transition-colors">
              <GitCompare className="w-5 h-5 text-[#737373]" />
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-[6px] hover:bg-[#F5F5F5] transition-colors">
              <Building2 className="w-5 h-5 text-[#737373]" />
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-[6px] hover:bg-[#F5F5F5] transition-colors">
              <FileText className="w-5 h-5 text-[#737373]" />
            </button>
          </div>
        )}

        {/* Full sidebar */}
        {!isMinimized && (
          <div className="p-3">
            {/* Header with logo/title */}
            <div className="flex items-center gap-2 mb-6 p-2">
              <button 
                onClick={() => setIsMinimized(true)}
                className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-[#0A0A0A] text-white hover:bg-[#262626] transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <span 
                className="text-[14px] font-semibold text-[#0A0A0A]"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                FIT Retail Index
              </span>
            </div>

            {/* Pages section */}
            <div className="mb-4">
              <div 
                className="text-[12px] font-normal text-[#737373] mb-2 px-2"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                Pages
              </div>
              
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = currentPage === item.label;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePageSelect(item.id, item.label)}
                      className={`
                        flex items-center gap-2 w-full px-2 py-1.5 rounded-[6px] text-left
                        transition-colors
                        ${isSelected 
                          ? 'bg-[#E5E5E5] text-[#0A0A0A]' 
                          : 'text-[#737373] hover:bg-[#F5F5F5] hover:text-[#0A0A0A]'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span 
                        className="text-[14px] font-normal"
                        style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}