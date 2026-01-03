'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function CategoryCard({ category }) {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = category.image || category.images?.[0];

  return (
    <Link
      href={`/shop/categories/${category.id}`}
      className='group relative overflow-hidden border border-[#0d0d0d] bg-[#ffffff] transition-transform hover:-translate-y-1'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Image Container */}
      <div className='relative aspect-square w-full overflow-hidden'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={category.name}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-[#4d5544]/10'>
            <span className='text-xs uppercase tracking-[0.2em] text-[#4d5544]'>
              No Image
            </span>
          </div>
        )}

        {/* Overlay with gradient on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/90 via-[#0d0d0d]/50 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Description overlay at bottom */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-300 ${
            isHovered
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0'
          }`}>
          <p className='text-sm leading-7 text-[#ffffff]'>
            {category.description || 'Explore this collection'}
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className='relative flex flex-col gap-3 p-6'>
        <h3 className='text-lg font-medium uppercase tracking-[0.14em]'>
          {category.name}
        </h3>

        {/* Browse indicator */}
        <div className='flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#4d5544]'>
          <span>Browse</span>
          <svg
            className={`h-4 w-4 transition-transform duration-300 ${
              isHovered ? 'translate-x-1' : ''
            }`}
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
