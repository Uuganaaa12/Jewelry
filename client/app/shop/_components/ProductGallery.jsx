'use client';

import { useEffect, useMemo, useState } from 'react';

const normaliseImages = images =>
  Array.isArray(images) ? images.filter(Boolean) : [];

export default function ProductGallery({ images = [], name = 'Бүтээгдэхүүн' }) {
  const gallery = useMemo(() => normaliseImages(images), [images]);
  const fallback = gallery.length === 0;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [gallery.length]);

  const total = fallback ? 1 : gallery.length;
  const currentSrc = fallback ? null : gallery[index];

  return (
    <div className='flex flex-col gap-4'>
      {/* Том зураг */}
      <div className='relative overflow-hidden border border-[#0d0d0d] bg-[#ffffff]'>
        {currentSrc ? (
          <img
            src={currentSrc}
            alt={`${name} зураг ${index + 1}`}
            className='h-96 w-full object-cover'
          />
        ) : (
          <div className='flex h-96 items-center justify-center border border-dashed border-[#0d0d0d]/40 bg-[#0d0d0d]/5 text-[11px] uppercase tracking-[0.22em] text-[#0d0d0d]/50'>
            Зураг байхгүй
          </div>
        )}

        {total > 1 && (
          <div className='pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-2'>
            <span className='bg-[#ffffff]/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0d0d0d]'>
              {index + 1} / {total}
            </span>
          </div>
        )}
      </div>

      {/* Жижиг зургууд (thumbnails) */}
      {total > 1 && (
        <div className='flex gap-3 overflow-x-auto pb-1'>
          {gallery.map((src, thumbIndex) => (
            <button
              key={src || thumbIndex}
              type='button'
              onClick={() => setIndex(thumbIndex)}
              className={`flex h-20 w-20 flex-shrink-0 items-center justify-center border bg-[#ffffff] transition-all ${
                index === thumbIndex
                  ? 'border-2 border-[#0d0d0d]'
                  : 'border border-[#0d0d0d]/40 hover:border-[#0d0d0d]'
              }`}>
              {src ? (
                <img
                  src={src}
                  alt={`${name} жижиг зураг ${thumbIndex + 1}`}
                  className='h-full w-full object-cover'
                />
              ) : (
                <span className='text-[10px] uppercase tracking-[0.2em] text-[#0d0d0d]/60'>
                  Байхгүй
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
