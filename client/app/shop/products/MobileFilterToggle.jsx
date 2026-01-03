'use client';

import { useSidebar } from './SidebarContext';

export default function MobileFilterToggle() {
  const { toggle } = useSidebar();

  return (
    <button
      onClick={toggle}
      className='flex items-center justify-center gap-2 border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#0d0d0d] transition hover:bg-[#0d0d0d] hover:text-[#ffffff] lg:hidden'>
      <svg
        className='h-4 w-4'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'>
        <path
          strokeLinecap='square'
          strokeLinejoin='miter'
          strokeWidth={2}
          d='M3 4h18M3 12h18M3 20h18'
        />
      </svg>
      Filters & Categories
    </button>
  );
}
