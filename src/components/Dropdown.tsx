import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function Dropdown({ label, options, value, onChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Dropdown Button - Exact Figma specs */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-[240px] h-[32px] px-2 py-[5.5px] gap-1.5
                   bg-white border border-[#D4D4D4] rounded-[9px]
                   text-[14px] leading-[1.5em] tracking-[0.005em] text-[#0A0A0A]
                   shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]
                   hover:border-[#A3A3A3] transition-colors"
        style={{ fontFamily: 'Geist, system-ui, -apple-system, sans-serif', fontWeight: 400 }}
      >
        <span>{value || label}</span>
        <ChevronDown
          className="w-4 h-4 text-[#737373] flex-shrink-0"
          strokeWidth={1.5}
        />
      </button>

      {/* Menu Popup - Exact Figma specs */}
      {isOpen && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 z-50
                     w-[240px] p-[2px] bg-white border border-[#E5E5E5] rounded-[8px]
                     shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1),0px_4px_6px_-1px_rgba(0,0,0,0.1)]"
        >
          <div className="flex flex-col">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center px-2 py-[5.5px] rounded-[6px]
                  text-[14px] leading-[1.5em] text-[#0A0A0A] text-left
                  transition-colors
                  ${value === option
                    ? 'bg-[#E5E5E5]'
                    : 'hover:bg-[#F5F5F5]'
                  }
                `}
                style={{ fontFamily: 'Geist, system-ui, -apple-system, sans-serif', fontWeight: 400 }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
