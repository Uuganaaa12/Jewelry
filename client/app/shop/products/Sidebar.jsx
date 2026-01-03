'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContext';
import SearchBar from './SearchBar';
import { buildQueryString } from './page';

export default function Sidebar({
  currentSearch,
  currentCategory,
  pageSize,
  baseQuery,
  grouped,
  standalone,
}) {
  const { isOpen, close } = useSidebar();

  return (
    <>
      <aside
        className={cn(
          'fixed inset-0 z-50 flex flex-col gap-6 overflow-y-auto border border-[#0d0d0d] bg-[#ffffff] p-4 transition-transform sm:p-6 lg:static lg:z-auto lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
        {/* Close Button (Mobile) */}
        <button
          onClick={close}
          className='ml-auto flex h-8 w-8 items-center justify-center border border-[#0d0d0d] text-[#0d0d0d] lg:hidden'>
          <svg
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='square'
              strokeLinejoin='miter'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>

        {/* Search */}
        <div className='flex flex-col gap-3'>
          <label className='text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
            Search
          </label>
          <SearchBar
            currentSearch={currentSearch}
            currentCategory={currentCategory}
            pageSize={pageSize}
          />
        </div>

        {/* Categories */}
        <div className='flex flex-col gap-4'>
          <span className='text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
            Categories
          </span>
          <div className='flex flex-col gap-2 text-sm uppercase tracking-[0.16em]'>
            <Link
              href={`/shop/products${buildQueryString(baseQuery, {
                category: undefined,
                page: 1,
              })}`}
              onClick={close}
              className={cn(
                'block border border-[#0d0d0d]/40 bg-[#ffffff] px-3 py-2 text-[#0d0d0d] transition hover:border-[#0d0d0d]',
                !currentCategory &&
                  'border-[#0d0d0d] bg-[#0d0d0d] text-[#ffffff]'
              )}>
              All products
            </Link>

            {grouped.map(({ parent, children }) => (
              <div key={parent.id} className='flex flex-col gap-2'>
                <Link
                  href={`/shop/products${buildQueryString(baseQuery, {
                    category: parent.id,
                    page: 1,
                  })}`}
                  onClick={close}
                  className={cn(
                    'block border border-[#0d0d0d]/40 bg-[#ffffff] px-3 py-2 text-[#0d0d0d] transition hover:border-[#0d0d0d]',
                    currentCategory === parent.id &&
                      'border-[#0d0d0d] bg-[#0d0d0d] text-[#ffffff]'
                  )}>
                  {parent.name}
                </Link>
                {children.length > 0 && (
                  <div className='ml-4 flex flex-col gap-2 border-l border-dashed border-[#0d0d0d]/30 pl-3 text-[11px] tracking-[0.22em] text-[#4d5544]'>
                    {children.map(child => (
                      <Link
                        key={child.id}
                        href={`/shop/products${buildQueryString(baseQuery, {
                          category: child.id,
                          page: 1,
                        })}`}
                        onClick={close}
                        className={cn(
                          'border border-transparent bg-[#ffffff] px-2 py-1 transition hover:border-[#0d0d0d]/60 hover:text-[#0d0d0d]',
                          currentCategory === child.id &&
                            'border-[#0d0d0d] bg-[#0d0d0d] text-[#ffffff]'
                        )}>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {standalone.length > 0 && (
              <div className='flex flex-col gap-2 pt-2'>
                <span className='text-[10px] uppercase tracking-[0.22em] text-[#4d5544]'>
                  Additional
                </span>
                {standalone.map(category => (
                  <Link
                    key={category.id}
                    href={`/shop/products${buildQueryString(baseQuery, {
                      category: category.id,
                      page: 1,
                    })}`}
                    onClick={close}
                    className={cn(
                      'block border border-[#0d0d0d]/40 bg-[#ffffff] px-3 py-2 text-[#0d0d0d] transition hover:border-[#0d0d0d]',
                      currentCategory === category.id &&
                        'border-[#0d0d0d] bg-[#0d0d0d] text-[#ffffff]'
                    )}>
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay (Mobile) */}
      {isOpen && (
        <div
          onClick={close}
          className='fixed inset-0 z-40 bg-[#0d0d0d]/50 lg:hidden'
        />
      )}
    </>
  );
}
