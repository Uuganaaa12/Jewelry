'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({
  currentSearch,
  currentCategory,
  pageSize,
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchValue.trim()) params.set('search', searchValue.trim());
      if (currentCategory) params.set('category', currentCategory);
      if (pageSize !== 12) params.set('limit', String(pageSize));
      params.set('page', '1');

      const query = params.toString();
      router.push(`/shop/products${query ? `?${query}` : ''}`);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchValue, currentCategory, pageSize, router]);

  return (
    <div className='relative'>
      <input
        type='text'
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        placeholder='Бүтээгдэхүүн хайх...'
        className='h-12 w-full border-2 border-[#0d0d0d]/20 bg-[#ffffff] px-4 pr-12 text-sm text-[#0d0d0d] outline-none transition placeholder:text-[#4d5544]/50 focus:border-[#0d0d0d]'
      />
      <svg
        className='absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4d5544]'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'>
        <path
          strokeLinecap='square'
          strokeLinejoin='miter'
          strokeWidth={2}
          d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
        />
      </svg>
    </div>
  );
}
