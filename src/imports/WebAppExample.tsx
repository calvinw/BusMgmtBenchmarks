import svgPaths from "./svg-jmdr8vfty4";

function DecorationLeft() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Decoration left">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Decoration left">
          <g id="1"></g>
          <path d={svgPaths.p131f4c00} fill="var(--fill-0, #737373)" id="Pixel override hack" />
        </g>
      </svg>
    </div>
  );
}

function Al() {
  return (
    <div className="basis-0 content-stretch flex gap-px grow items-center min-h-px min-w-px relative shrink-0" data-name="AL">
      <p className="font-['Geist:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[14px] text-neutral-500 text-nowrap tracking-[0.07px] whitespace-pre">Search by name</p>
    </div>
  );
}

function Al1() {
  return (
    <div className="basis-0 content-stretch flex gap-[8px] grow h-[21px] items-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="AL">
      <DecorationLeft />
      <Al />
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white min-h-[36px] relative rounded-[8px] shrink-0 w-[320px]" data-name="Input">
      <div className="box-border content-stretch flex gap-[8px] items-center min-h-inherit overflow-clip px-[12px] py-[7.5px] relative rounded-[inherit] w-[320px]">
        <Al1 />
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-[-1px] pointer-events-none rounded-[9px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Tab() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[6px] items-center justify-center min-h-[29px] min-w-[29px] px-[8px] py-[4px] relative rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] shrink-0" data-name="Tab">
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">Favorited</p>
      </div>
    </div>
  );
}

function Tab1() {
  return (
    <div className="box-border content-stretch flex gap-[6px] items-center justify-center min-h-[29px] min-w-[29px] px-[8px] py-[4px] relative rounded-[10px] shrink-0" data-name="Tab">
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">All</p>
      </div>
    </div>
  );
}

function Tabs() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center p-[3px] relative rounded-[10px] shrink-0" data-name="Tabs">
      <Tab />
      <Tab1 />
    </div>
  );
}

function LeftIconWrapper() {
  return (
    <div className="relative shrink-0 size-[13.25px]" data-name="Left icon wrapper">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Left icon wrapper">
          <path d={svgPaths.p295fcd80} fill="var(--fill-0, #0A0A0A)" id="Left icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] box-border content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[7.5px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-300 border-solid inset-[-1px] pointer-events-none rounded-[9px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <LeftIconWrapper />
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-950 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">Filters</p>
      </div>
    </div>
  );
}

function Al2() {
  return (
    <div className="content-stretch flex gap-[26px] items-center relative shrink-0" data-name="AL">
      <Input />
      <Tabs />
      <Button />
    </div>
  );
}

function LeftIconWrapper1() {
  return (
    <div className="relative shrink-0 size-[13.25px]" data-name="Left icon wrapper">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Left icon wrapper">
          <path d={svgPaths.p295fcd80} fill="var(--fill-0, #0A0A0A)" id="Left icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] box-border content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[7.5px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-300 border-solid inset-[-1px] pointer-events-none rounded-[9px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <LeftIconWrapper1 />
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-950 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">Download CSV</p>
      </div>
    </div>
  );
}

function Al3() {
  return (
    <div className="content-stretch flex gap-[237px] items-center relative shrink-0" data-name="AL">
      <Al2 />
      <Button1 />
    </div>
  );
}

function IconArrowUpDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon / arrow-up-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon / arrow-up-down" opacity="0.5">
          <path d={svgPaths.pcaa3f40} id="Vector" stroke="var(--stroke-0, #525252)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M11.3333 13.3333V2.66667" id="Vector_2" stroke="var(--stroke-0, #525252)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p216cf1e0} id="Vector_3" stroke="var(--stroke-0, #525252)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M4.66667 2.66667V13.3333" id="Vector_4" stroke="var(--stroke-0, #525252)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="[grid-area:1_/_1] bg-neutral-50 box-border content-stretch flex gap-[8px] items-center ml-[33.09px] mt-0 px-[8px] py-[7.5px] relative w-[206.825px]" data-name="Table Header">
      <p className="font-['Geist:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[0.07px] whitespace-pre">Table heading</p>
      <IconArrowUpDown />
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function IconArrowUpDown1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon / arrow-up-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon / arrow-up-down" opacity="0.5">
          <path d={svgPaths.pcaa3f40} id="Vector" stroke="var(--stroke-0, #525252)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M11.3333 13.3333V2.66667" id="Vector_2" stroke="var(--stroke-0, #525252)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p216cf1e0} id="Vector_3" stroke="var(--stroke-0, #525252)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M4.66667 2.66667V13.3333" id="Vector_4" stroke="var(--stroke-0, #525252)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function TableHeader1() {
  return (
    <div className="[grid-area:1_/_1] bg-neutral-50 box-border content-stretch flex gap-[8px] items-center ml-[239.92px] mt-0 px-[8px] py-[7.5px] relative w-[206.825px]" data-name="Table Header">
      <p className="font-['Geist:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[0.07px] whitespace-pre">Table heading</p>
      <IconArrowUpDown1 />
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableHeader2() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[8px] items-center justify-end ml-[446.74px] mt-0 px-[8px] py-[7.5px] relative w-[206.825px]" data-name="Table Header">
      <p className="font-['Geist:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[0.07px] whitespace-pre">Table heading</p>
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableHeader3() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[8px] items-center justify-end ml-[653.57px] mt-0 px-[8px] py-[7.5px] relative w-[206.825px]" data-name="Table Header">
      <p className="font-['Geist:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[0.07px] whitespace-pre">Table heading</p>
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableHeader4() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[8px] items-center ml-[860.39px] mt-0 px-[8px] py-[7.5px] relative w-[139.607px]" data-name="Table Header">
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.39px]" data-name="Line" />
    </div>
  );
}

function Checkbox() {
  return (
    <div className="absolute left-[8px] size-[16px] top-1/2 translate-y-[-50%]" data-name="Checkbox">
      <div className="absolute bg-white left-px rounded-[4px] size-[14px] top-px" data-name="Background">
        <div aria-hidden="true" className="absolute border border-neutral-300 border-solid inset-[-1px] pointer-events-none rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      </div>
    </div>
  );
}

function TableHeader5() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[8px] items-center ml-0 mt-0 px-[8px] py-[10px] relative w-[33.092px]" data-name="Table Header">
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[0.09px]" data-name="Line" />
      <Checkbox />
    </div>
  );
}

function HeadingRow() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Heading row">
      <TableHeader />
      <TableHeader1 />
      <TableHeader2 />
      <TableHeader3 />
      <TableHeader4 />
      <TableHeader5 />
    </div>
  );
}

function LeftIconWrapper2() {
  return (
    <div className="relative shrink-0 size-[13.25px]" data-name="Left icon wrapper">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <g id="Left icon wrapper">
          <path d={svgPaths.pe28600} fill="var(--fill-0, #0A0A0A)" id="Left icon" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper() {
  return (
    <div className="relative shrink-0 size-[16.25px]" data-name="Icon wrapper">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
        <g id="Icon wrapper">
          <path d={svgPaths.p26df80} fill="var(--fill-0, #0A0A0A)" id="Pixel color override hack" />
        </g>
      </svg>
    </div>
  );
}

function Al4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="AL">
      <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex items-center justify-center min-h-[36px] min-w-[36px] overflow-clip p-[8px] relative rounded-[8px] shrink-0" data-name="Icon 1">
        <IconWrapper />
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="Avatar">
      <div className="absolute inset-0" style={{ "--fill-0": "rgba(245, 245, 245, 1)" } as React.CSSProperties}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <circle cx="16" cy="16" fill="var(--fill-0, #F5F5F5)" id="Background" r="16" />
        </svg>
      </div>
      <div className="absolute flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] size-[32px] text-[14px] text-center text-neutral-950 top-[16px] tracking-[0.07px] translate-x-[-50%] translate-y-[-50%]">
        <p className="leading-[1.5]">CN</p>
      </div>
    </div>
  );
}

function TableCell() {
  return (
    <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center left-[3.31%] px-[8px] py-[2px] right-[76.01%] top-0" data-name="Table Cell">
      <Avatar />
      <p className="font-['Geist:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[0.07px] whitespace-pre">Name</p>
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableCell1() {
  return (
    <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center left-[23.99%] px-[8px] py-[7.5px] right-[55.33%] top-0" data-name="Table Cell">
      <p className="basis-0 font-['Geist:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950 tracking-[0.07px]">Table cell</p>
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableCell2() {
  return (
    <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center justify-end left-[44.67%] px-[8px] py-[7.5px] right-[34.64%] top-0" data-name="Table Cell">
      <p className="basis-0 font-['Geist:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950 text-right tracking-[0.07px]">Table cell</p>
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableCell3() {
  return (
    <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center justify-end left-[65.36%] px-[8px] py-[7.5px] right-[13.96%] top-0" data-name="Table Cell">
      <p className="basis-0 font-['Geist:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950 text-right tracking-[0.07px]">Table cell</p>
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function LeftIconWrapper3() {
  return (
    <div className="relative shrink-0 size-[13.25px]" data-name="Left icon wrapper">
      <div className="absolute inset-[-5.98%_-5.97%_-5.97%_-5.98%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
          <g id="Left icon wrapper">
            <path d={svgPaths.p3a5c3180} fill="var(--fill-0, #0A0A0A)" id="Left icon" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex gap-[6px] items-center justify-center min-h-[32px] px-[12px] py-[5.5px] relative rounded-[8px] shrink-0" data-name="Button">
      <LeftIconWrapper3 />
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-950 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">Edit</p>
      </div>
    </div>
  );
}

function TableCell4() {
  return (
    <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center left-[86.04%] px-[8px] py-[2px] right-[5.69%] top-0" data-name="Table Cell">
      <Button2 />
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.27px]" data-name="Line" />
    </div>
  );
}

function IconWrapper1() {
  return (
    <div className="relative shrink-0 size-[16.25px]" data-name="Icon wrapper">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
        <g id="Icon wrapper">
          <path d={svgPaths.p26df80} fill="var(--fill-0, #0A0A0A)" id="Pixel color override hack" />
        </g>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex items-center justify-center min-h-[36px] min-w-[36px] overflow-clip p-[8px] relative rounded-[8px] shrink-0" data-name="Icon 1">
      <IconWrapper1 />
    </div>
  );
}

function Al5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="AL">
      <Icon1 />
    </div>
  );
}

function TableCell5() {
  return (
    <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center justify-end left-[94.31%] px-[8px] py-0 right-0 top-0" data-name="Table Cell">
      <Al5 />
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.12px]" data-name="Line" />
    </div>
  );
}

function Checkbox1() {
  return (
    <div className="absolute left-[8px] size-[16px] top-1/2 translate-y-[-50%]" data-name="Checkbox">
      <div className="absolute bg-white left-px rounded-[4px] size-[14px] top-px" data-name="Background">
        <div aria-hidden="true" className="absolute border border-neutral-300 border-solid inset-[-1px] pointer-events-none rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      </div>
    </div>
  );
}

function TableCell6() {
  return (
    <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center left-0 px-[8px] py-[10px] right-[96.69%] top-0" data-name="Table Cell">
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[0.09px]" data-name="Line" />
      <Checkbox1 />
    </div>
  );
}

function Row() {
  return (
    <div className="h-[44px] relative shrink-0 w-[1000px]" data-name=".Row">
      <TableCell />
      <TableCell1 />
      <TableCell2 />
      <TableCell3 />
      <TableCell4 />
      <TableCell5 />
      <TableCell6 />
    </div>
  );
}

function Avatar1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="Avatar">
      <div className="absolute inset-0" style={{ "--fill-0": "rgba(245, 245, 245, 1)" } as React.CSSProperties}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <circle cx="16" cy="16" fill="var(--fill-0, #F5F5F5)" id="Background" r="16" />
        </svg>
      </div>
      <div className="absolute flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] size-[32px] text-[14px] text-center text-neutral-950 top-[16px] tracking-[0.07px] translate-x-[-50%] translate-y-[-50%]">
        <p className="leading-[1.5]">CN</p>
      </div>
    </div>
  );
}

function TableCell7() {
  return (
    <div className="[grid-area:1_/_1] bg-neutral-200 box-border content-stretch flex gap-[8px] h-[44px] items-center ml-[33.09px] mt-0 px-[8px] py-[2px] relative w-[206.825px]" data-name="Table Cell">
      <Avatar1 />
      <p className="font-['Geist:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[0.07px] whitespace-pre">Name</p>
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableCell8() {
  return (
    <div className="[grid-area:1_/_1] bg-neutral-200 box-border content-stretch flex gap-[8px] h-[44px] items-center ml-[239.92px] mt-0 px-[8px] py-[7.5px] relative w-[206.825px]" data-name="Table Cell">
      <p className="basis-0 font-['Geist:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950 tracking-[0.07px]">Table cell</p>
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableCell9() {
  return (
    <div className="[grid-area:1_/_1] bg-neutral-200 box-border content-stretch flex gap-[8px] h-[44px] items-center justify-end ml-[446.74px] mt-0 px-[8px] py-[7.5px] relative w-[206.825px]" data-name="Table Cell">
      <p className="basis-0 font-['Geist:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950 text-right tracking-[0.07px]">Table cell</p>
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableCell10() {
  return (
    <div className="[grid-area:1_/_1] bg-neutral-200 box-border content-stretch flex gap-[8px] h-[44px] items-center justify-end ml-[653.57px] mt-0 px-[8px] py-[7.5px] relative w-[206.825px]" data-name="Table Cell">
      <p className="basis-0 font-['Geist:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950 text-right tracking-[0.07px]">Table cell</p>
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function LeftIconWrapper4() {
  return (
    <div className="relative shrink-0 size-[13.25px]" data-name="Left icon wrapper">
      <div className="absolute bottom-[-71.69%] left-0 right-[-71.7%] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 23">
          <g id="Left icon wrapper">
            <path d={svgPaths.p39acf400} fill="var(--fill-0, #0A0A0A)" id="Left icon" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex gap-[6px] items-center justify-center min-h-[32px] px-[12px] py-[5.5px] relative rounded-[8px] shrink-0" data-name="Button">
      <LeftIconWrapper4 />
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-950 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">Edit</p>
      </div>
    </div>
  );
}

function TableCell11() {
  return (
    <div className="[grid-area:1_/_1] bg-neutral-200 box-border content-stretch flex gap-[8px] h-[44px] items-center ml-[860.39px] mt-0 px-[8px] py-[2px] relative w-[82.73px]" data-name="Table Cell">
      <Button3 />
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.27px]" data-name="Line" />
    </div>
  );
}

function IconWrapper2() {
  return (
    <div className="relative shrink-0 size-[16.25px]" data-name="Icon wrapper">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
        <g id="Icon wrapper">
          <path d={svgPaths.p26df80} fill="var(--fill-0, #0A0A0A)" id="Pixel color override hack" />
        </g>
      </svg>
    </div>
  );
}

function Icon2() {
  return (
    <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex items-center justify-center min-h-[36px] min-w-[36px] overflow-clip p-[8px] relative rounded-[8px] shrink-0" data-name="Icon 1">
      <IconWrapper2 />
    </div>
  );
}

function Al6() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="AL">
      <Icon2 />
    </div>
  );
}

function TableCell12() {
  return (
    <div className="[grid-area:1_/_1] bg-neutral-200 box-border content-stretch flex gap-[8px] h-[44px] items-center justify-end ml-[943.12px] mt-0 px-[8px] py-0 relative w-[56.877px]" data-name="Table Cell">
      <Al6 />
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[-0.12px]" data-name="Line" />
    </div>
  );
}

function IconCheck() {
  return (
    <div className="absolute left-px size-[14px] top-px" data-name="Icon / check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon / check">
          <path d={svgPaths.p3de7e600} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox2() {
  return (
    <div className="absolute left-[8px] size-[16px] top-1/2 translate-y-[-50%]" data-name="Checkbox">
      <div className="absolute bg-black left-0 rounded-[4px] size-[16px] top-0" data-name="Background">
        <div aria-hidden="true" className="absolute border border-black border-solid inset-[-1px] pointer-events-none rounded-[5px]" />
      </div>
      <IconCheck />
    </div>
  );
}

function TableCell13() {
  return (
    <div className="[grid-area:1_/_1] bg-neutral-200 box-border content-stretch flex gap-[8px] h-[44px] items-center ml-0 mt-0 px-[8px] py-[10px] relative w-[33.092px]" data-name="Table Cell">
      <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-[0.09px]" data-name="Line" />
      <Checkbox2 />
    </div>
  );
}

function Row1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Row">
      <TableCell7 />
      <TableCell8 />
      <TableCell9 />
      <TableCell10 />
      <TableCell11 />
      <TableCell12 />
      <TableCell13 />
    </div>
  );
}

function Avatar2() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="Avatar">
      <div className="absolute inset-0" style={{ "--fill-0": "rgba(245, 245, 245, 1)" } as React.CSSProperties}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <circle cx="16" cy="16" fill="var(--fill-0, #F5F5F5)" id="Background" r="16" />
        </svg>
      </div>
      <div className="absolute flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] size-[32px] text-[14px] text-center text-neutral-950 top-[16px] tracking-[0.07px] translate-x-[-50%] translate-y-[-50%]">
        <p className="leading-[1.5]">CN</p>
      </div>
    </div>
  );
}

function TableCell14() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[8px] h-[44px] items-center ml-[33.09px] mt-0 px-[8px] py-[2px] relative w-[206.825px]" data-name="Table Cell">
      <Avatar2 />
      <p className="font-['Geist:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[0.07px] whitespace-pre">Name</p>
    </div>
  );
}

function TableCell15() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[8px] h-[44px] items-center ml-[239.92px] mt-0 px-[8px] py-[7.5px] relative w-[206.825px]" data-name="Table Cell">
      <p className="basis-0 font-['Geist:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950 tracking-[0.07px]">Table cell</p>
    </div>
  );
}

function TableCell16() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[8px] h-[44px] items-center justify-end ml-[446.74px] mt-0 px-[8px] py-[7.5px] relative w-[206.825px]" data-name="Table Cell">
      <p className="basis-0 font-['Geist:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950 text-right tracking-[0.07px]">Table cell</p>
    </div>
  );
}

function TableCell17() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[8px] h-[44px] items-center justify-end ml-[653.57px] mt-0 px-[8px] py-[7.5px] relative w-[206.825px]" data-name="Table Cell">
      <p className="basis-0 font-['Geist:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950 text-right tracking-[0.07px]">Table cell</p>
    </div>
  );
}

function LeftIconWrapper5() {
  return (
    <div className="relative shrink-0 size-[13.25px]" data-name="Left icon wrapper">
      <div className="absolute inset-[-5.98%_-5.97%_-5.97%_-5.98%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
          <g id="Left icon wrapper">
            <path d={svgPaths.p3a5c3180} fill="var(--fill-0, #0A0A0A)" id="Left icon" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex gap-[6px] items-center justify-center min-h-[32px] px-[12px] py-[5.5px] relative rounded-[8px] shrink-0" data-name="Button">
      <LeftIconWrapper5 />
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-950 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">Edit</p>
      </div>
    </div>
  );
}

function TableCell18() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[8px] h-[44px] items-center ml-[860.39px] mt-0 px-[8px] py-[2px] relative w-[82.73px]" data-name="Table Cell">
      <Button4 />
    </div>
  );
}

function IconWrapper3() {
  return (
    <div className="relative shrink-0 size-[16.25px]" data-name="Icon wrapper">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
        <g id="Icon wrapper">
          <path d={svgPaths.p26df80} fill="var(--fill-0, #0A0A0A)" id="Pixel color override hack" />
        </g>
      </svg>
    </div>
  );
}

function Icon3() {
  return (
    <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex items-center justify-center min-h-[36px] min-w-[36px] overflow-clip p-[8px] relative rounded-[8px] shrink-0" data-name="Icon 1">
      <IconWrapper3 />
    </div>
  );
}

function Al7() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="AL">
      <Icon3 />
    </div>
  );
}

function TableCell19() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[8px] h-[44px] items-center justify-end ml-[943.12px] mt-0 px-[8px] py-0 relative w-[56.877px]" data-name="Table Cell">
      <Al7 />
    </div>
  );
}

function Checkbox3() {
  return (
    <div className="absolute left-[8px] size-[16px] top-1/2 translate-y-[-50%]" data-name="Checkbox">
      <div className="absolute bg-white left-px rounded-[4px] size-[14px] top-px" data-name="Background">
        <div aria-hidden="true" className="absolute border border-neutral-300 border-solid inset-[-1px] pointer-events-none rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      </div>
    </div>
  );
}

function TableCell20() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[8px] h-[44px] items-center ml-0 mt-0 px-[8px] py-[10px] relative w-[33.092px]" data-name="Table Cell">
      <Checkbox3 />
    </div>
  );
}

function Row2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Row">
      <TableCell14 />
      <TableCell15 />
      <TableCell16 />
      <TableCell17 />
      <TableCell18 />
      <TableCell19 />
      <TableCell20 />
    </div>
  );
}

function Table() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Table">
      <HeadingRow />
      <div className="h-[44px] relative shrink-0 w-[1000px]" data-name=".Row">
        <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center left-[3.31%] px-[8px] py-[2px] right-[76.01%] top-0" data-name="Table Cell">
          <div className="overflow-clip relative shrink-0 size-[32px]" data-name="Avatar">
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(245, 245, 245, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
                <circle cx="16" cy="16" fill="var(--fill-0, #F5F5F5)" id="Background" r="16" />
              </svg>
            </div>
            <div className="absolute flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] size-[32px] text-[14px] text-center text-neutral-950 top-[16px] tracking-[0.07px] translate-x-[-50%] translate-y-[-50%]">
              <p className="leading-[1.5]">CN</p>
            </div>
          </div>
          <p className="font-['Geist:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[0.07px] whitespace-pre">Name</p>
          <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-0" data-name="Line" />
        </div>
        <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center left-[23.99%] px-[8px] py-[7.5px] right-[55.33%] top-0" data-name="Table Cell">
          <p className="basis-0 font-['Geist:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950 tracking-[0.07px]">Table cell</p>
          <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-0" data-name="Line" />
        </div>
        <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center justify-end left-[44.67%] px-[8px] py-[7.5px] right-[34.64%] top-0" data-name="Table Cell">
          <p className="basis-0 font-['Geist:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950 text-right tracking-[0.07px]">Table cell</p>
          <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-0" data-name="Line" />
        </div>
        <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center justify-end left-[65.36%] px-[8px] py-[7.5px] right-[13.96%] top-0" data-name="Table Cell">
          <p className="basis-0 font-['Geist:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950 text-right tracking-[0.07px]">Table cell</p>
          <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-0" data-name="Line" />
        </div>
        <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center left-[86.04%] px-[8px] py-[2px] right-[5.69%] top-0" data-name="Table Cell">
          <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex gap-[6px] items-center justify-center min-h-[32px] px-[12px] py-[5.5px] relative rounded-[8px] shrink-0" data-name="Button">
            <LeftIconWrapper2 />
            <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-950 text-nowrap tracking-[0.07px]">
              <p className="leading-[1.5] whitespace-pre">Edit</p>
            </div>
          </div>
          <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-0" data-name="Line" />
        </div>
        <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center justify-end left-[94.31%] px-[8px] py-0 right-0 top-0" data-name="Table Cell">
          <Al4 />
          <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-0" data-name="Line" />
        </div>
        <div className="absolute bottom-0 box-border content-stretch flex gap-[8px] items-center left-0 px-[8px] py-[10px] right-[96.69%] top-0" data-name="Table Cell">
          <div className="absolute bg-neutral-200 bottom-0 h-px left-0 right-0" data-name="Line" />
          <div className="absolute left-[8px] size-[16px] top-1/2 translate-y-[-50%]" data-name="Checkbox">
            <div className="absolute bg-white left-px rounded-[4px] size-[14px] top-px" data-name="Background">
              <div aria-hidden="true" className="absolute border border-neutral-300 border-solid inset-[-1px] pointer-events-none rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
            </div>
          </div>
        </div>
      </div>
      {[...Array(8).keys()].map((_, i) => (
        <Row key={i} />
      ))}
      <Row1 />
      <Row2 />
    </div>
  );
}

function LeftIconWrapper6() {
  return (
    <div className="relative shrink-0 size-[13.25px]" data-name="Left icon wrapper">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Left icon wrapper">
          <path d={svgPaths.p80b8a00} fill="var(--fill-0, #0A0A0A)" id="Left icon" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[7.5px] relative rounded-[8px] shrink-0" data-name="Button">
      <LeftIconWrapper6 />
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-700 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">Previous</p>
      </div>
    </div>
  );
}

function Pagination() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination">
      <Button5 />
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] box-border content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[7.5px] relative rounded-[8px] shrink-0 w-[34px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-300 border-solid inset-[-1px] pointer-events-none rounded-[9px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-950 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function PaginationButton() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination Button">
      <Button6 />
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[7.5px] relative rounded-[8px] shrink-0 w-[34px]" data-name="Button">
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-700 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function PaginationButton1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination Button">
      <Button7 />
    </div>
  );
}

function Button8() {
  return (
    <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[7.5px] relative rounded-[8px] shrink-0 w-[34px]" data-name="Button">
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-700 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function PaginationButton2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination Button">
      <Button8 />
    </div>
  );
}

function Button9() {
  return (
    <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[7.5px] relative rounded-[8px] shrink-0 w-[34px]" data-name="Button">
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-700 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">4</p>
      </div>
    </div>
  );
}

function PaginationButton3() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination Button">
      <Button9 />
    </div>
  );
}

function IconWrapper4() {
  return (
    <div className="relative shrink-0 size-[16.25px]" data-name="Icon wrapper">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
        <g id="Icon wrapper">
          <path d={svgPaths.p228f2d80} fill="var(--fill-0, #0A0A0A)" id="Pixel color override hack" />
        </g>
      </svg>
    </div>
  );
}

function IconButton() {
  return (
    <div className="box-border content-stretch flex items-center justify-center min-h-[36px] min-w-[36px] overflow-clip p-[8px] relative rounded-[8px] shrink-0" data-name="Icon Button">
      <IconWrapper4 />
    </div>
  );
}

function PaginationEllipsis() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination Ellipsis">
      <IconButton />
    </div>
  );
}

function Button10() {
  return (
    <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[7.5px] relative rounded-[8px] shrink-0 w-[34px]" data-name="Button">
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-700 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">10</p>
      </div>
    </div>
  );
}

function PaginationButton4() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination Button">
      <Button10 />
    </div>
  );
}

function RightIconWrapper() {
  return (
    <div className="relative shrink-0 size-[13.25px]" data-name="Right icon wrapper">
      <div className="absolute bottom-0 left-[-10.38%] right-0 top-[-10.38%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
          <g id="Right icon wrapper">
            <path d={svgPaths.p1c32c00} fill="var(--fill-0, #0A0A0A)" id="Right icon" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Button11() {
  return (
    <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[7.5px] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-700 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">Next</p>
      </div>
      <RightIconWrapper />
    </div>
  );
}

function Pagination1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination">
      <Button11 />
    </div>
  );
}

function Pagination2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Pagination">
      <Pagination />
      <PaginationButton />
      <PaginationButton1 />
      <PaginationButton2 />
      <PaginationButton3 />
      <PaginationEllipsis />
      <PaginationButton4 />
      <Pagination1 />
    </div>
  );
}

function Al8() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="AL">
      <p className="font-['Geist:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[14px] text-neutral-500 text-nowrap tracking-[0.07px] whitespace-pre">Showing 1-10 of 100 products</p>
      <Pagination2 />
    </div>
  );
}

function Card() {
  return (
    <div className="bg-white relative rounded-[9px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-[-1px] pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start p-[16px] relative w-full">
          <Al3 />
          <Table />
          <Al8 />
        </div>
      </div>
    </div>
  );
}

function Al9() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[8px] h-[685px] items-start left-[216px] p-[16px] top-[115px] w-[1064px]" data-name="AL">
      <Card />
    </div>
  );
}

function GalleryVerticalEnd() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="gallery-vertical-end">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="gallery-vertical-end">
          <path d={svgPaths.p2deac700} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Icon() {
  return (
    <div className="bg-[#0054a6] content-stretch flex gap-[10px] items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="Icon">
      <GalleryVerticalEnd />
    </div>
  );
}

function Wrapper() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px relative shrink-0" data-name="Wrapper">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-950 w-full">FIT Retail Index</p>
    </div>
  );
}

function Header() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] items-center p-[8px] relative w-full">
          <Icon />
          <Wrapper />
        </div>
      </div>
    </div>
  );
}

function Header1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start p-[8px] relative w-full">
          <Header />
        </div>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="h-[32px] opacity-70 relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[32px] items-center px-[8px] py-0 relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-neutral-950 text-nowrap whitespace-pre">Pages</p>
        </div>
      </div>
    </div>
  );
}

function SquareTerminal() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="square-terminal">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="square-terminal">
          <path d={svgPaths.p27a7a900} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Wrapper1() {
  return <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-end min-h-px min-w-px shrink-0" data-name="Wrapper" />;
}

function MenuButton() {
  return (
    <div className="h-[32px] relative rounded-[6px] shrink-0 w-full" data-name="Menu_button">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[32px] items-center p-[8px] relative w-full">
          <SquareTerminal />
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-950 text-nowrap whitespace-pre">Company vs Company</p>
          <Wrapper1 />
        </div>
      </div>
    </div>
  );
}

function MenuItem() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Menu_item">
      <MenuButton />
    </div>
  );
}

function Bot() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="bot">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="bot">
          <path d={svgPaths.p30c73800} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="chevron-right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="chevron-right"></g>
      </svg>
    </div>
  );
}

function Wrapper2() {
  return (
    <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-end min-h-px min-w-px relative shrink-0" data-name="Wrapper">
      <ChevronRight />
    </div>
  );
}

function MenuButton1() {
  return (
    <div className="h-[32px] relative rounded-[6px] shrink-0 w-full" data-name="Menu_button">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[32px] items-center p-[8px] relative w-full">
          <Bot />
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-950 text-nowrap whitespace-pre">Company vs Segment</p>
          <Wrapper2 />
        </div>
      </div>
    </div>
  );
}

function BookOpen() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="book-open">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="book-open">
          <path d={svgPaths.p33c82600} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function ChevronRight1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="chevron-right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="chevron-right"></g>
      </svg>
    </div>
  );
}

function Wrapper3() {
  return (
    <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-end min-h-px min-w-px relative shrink-0" data-name="Wrapper">
      <ChevronRight1 />
    </div>
  );
}

function MenuButton2() {
  return (
    <div className="h-[32px] relative rounded-[6px] shrink-0 w-full" data-name="Menu_button">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[32px] items-center p-[8px] relative w-full">
          <BookOpen />
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-950 text-nowrap whitespace-pre">Reports</p>
          <Wrapper3 />
        </div>
      </div>
    </div>
  );
}

function Menu() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Menu">
      <MenuItem />
      <MenuButton1 />
      <MenuButton2 />
    </div>
  );
}

function Sidebar() {
  return (
    <div className="relative shrink-0 w-full" data-name="Sidebar">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start p-[8px] relative w-full">
          <Label />
          <Menu />
        </div>
      </div>
    </div>
  );
}

function Sidebar1() {
  return (
    <div className="aspect-[255/252] bg-neutral-50 content-stretch flex flex-col items-start relative rounded-[8px] shrink-0 w-full" data-name="Sidebar">
      <div aria-hidden="true" className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Header1 />
      <Sidebar />
    </div>
  );
}

function Al10() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="AL">
      <Sidebar1 />
    </div>
  );
}

function Al11() {
  return <div className="h-[32px] shrink-0 w-full" data-name="AL" />;
}

function Al12() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[800px] items-start justify-between left-0 px-[16px] py-[12px] top-0 w-[216px]" data-name="AL">
      <div aria-hidden="true" className="absolute border-[0px_1px_0px_0px] border-neutral-200 border-solid inset-0 pointer-events-none" />
      <Al10 />
      <Al11 />
    </div>
  );
}

function Al13() {
  return <div className="basis-0 grow h-[36px] min-h-px min-w-px shrink-0" data-name="AL" />;
}

function DecorationLeft1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Decoration left">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Decoration left">
          <g id="1"></g>
          <path d={svgPaths.p131f4c00} fill="var(--fill-0, #737373)" id="Pixel override hack" />
        </g>
      </svg>
    </div>
  );
}

function Al14() {
  return (
    <div className="basis-0 content-stretch flex gap-px grow items-center min-h-px min-w-px relative shrink-0" data-name="AL">
      <p className="font-['Geist:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[14px] text-neutral-500 text-nowrap tracking-[0.07px] whitespace-pre">Search for something...</p>
    </div>
  );
}

function Al15() {
  return (
    <div className="basis-0 content-stretch flex gap-[6px] grow h-[21px] items-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="AL">
      <DecorationLeft1 />
      <Al14 />
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-white min-h-[32px] relative rounded-[8px] shrink-0 w-[209px]" data-name="Input">
      <div className="box-border content-stretch flex gap-[6px] items-center min-h-inherit overflow-clip px-[8px] py-[5.5px] relative rounded-[inherit] w-[209px]">
        <Al15 />
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-[-1px] pointer-events-none rounded-[9px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Al16() {
  return (
    <div className="absolute bg-white box-border content-stretch flex gap-[8px] items-center left-[216px] px-[16px] py-[12px] top-0 w-[1064px]" data-name="AL">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-200 border-solid inset-0 pointer-events-none" />
      <Al13 />
      <Input1 />
    </div>
  );
}

function LeftIconWrapper7() {
  return (
    <div className="relative shrink-0 size-[13.25px]" data-name="Left icon wrapper">
      <div className="absolute bottom-[-53.77%] left-0 right-[-53.77%] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 21">
          <g id="Left icon wrapper">
            <path d={svgPaths.p3efc00} fill="var(--fill-0, #0A0A0A)" id="Left icon" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function RightIconWrapper1() {
  return (
    <div className="relative shrink-0 size-[13.25px]" data-name="Right icon wrapper">
      <div className="absolute bottom-[-8.49%] left-0 right-[-31.13%] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 15">
          <g id="Right icon wrapper">
            <path d={svgPaths.p13edcf80} fill="var(--fill-0, #0A0A0A)" id="Right icon" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Button12() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] box-border content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[7.5px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-300 border-solid inset-[-1px] pointer-events-none rounded-[9px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <LeftIconWrapper7 />
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-950 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">Customize Columns</p>
      </div>
      <RightIconWrapper1 />
    </div>
  );
}

function LeftIconWrapper8() {
  return (
    <div className="relative shrink-0 size-[13.25px]" data-name="Left icon wrapper">
      <div className="absolute bottom-[-38.68%] left-0 right-[-38.68%] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
          <g id="Left icon wrapper">
            <path d={svgPaths.p2ec8e000} fill="var(--fill-0, #0A0A0A)" id="Left icon" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Button13() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] box-border content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[7.5px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-300 border-solid inset-[-1px] pointer-events-none rounded-[9px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <LeftIconWrapper8 />
      <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-neutral-950 text-nowrap tracking-[0.07px]">
        <p className="leading-[1.5] whitespace-pre">Add Section</p>
      </div>
    </div>
  );
}

function Al17() {
  return (
    <div className="absolute bg-white box-border content-stretch flex gap-[8px] items-center left-[216px] px-[16px] py-[12px] top-[57px] w-[1064px]" data-name="AL">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-200 border-solid inset-0 pointer-events-none" />
      <Button12 />
      <Button13 />
    </div>
  );
}

export default function WebAppExample() {
  return (
    <div className="bg-white relative size-full" data-name="Web app example">
      <Al9 />
      <Al12 />
      <Al16 />
      <Al17 />
    </div>
  );
}