import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getBackgroundStyle,
  getOverlayStyle,
  getOverlayInlineStyle,
  getTextColor,
} from '../banner/bannerUtils';

// Admin товчнууд
export const BannerControls = ({
  isAdmin,
  hasBanners,
  currentBanner,
  onAdd,
  onEdit,
  onDelete,
}) => {
  if (!isAdmin) return null;

  return (
    <div className='absolute top-4 right-4 z-20 flex gap-2'>
      <button
        onClick={onAdd}
        className='flex items-center gap-2 bg-[#0d0d0d] px-4 py-2 text-white transition hover:bg-[#4d5544]'>
        <Plus size={16} />
        <span className='text-xs font-semibold uppercase tracking-wider'>
          Нэмэх
        </span>
      </button>
      {hasBanners && (
        <>
          <button
            onClick={() => onEdit(currentBanner)}
            className='flex items-center gap-2 bg-[#0d0d0d] px-4 py-2 text-white transition hover:bg-[#4d5544]'>
            <Edit size={16} />
            <span className='text-xs font-semibold uppercase tracking-wider'>
              Засах
            </span>
          </button>
          <button
            onClick={() => onDelete(currentBanner.id)}
            className='flex items-center gap-2 bg-[#b33a3a] px-4 py-2 text-white transition hover:bg-[#8b2e2e]'>
            <Trash2 size={16} />
            <span className='text-xs font-semibold uppercase tracking-wider'>
              Устгах
            </span>
          </button>
        </>
      )}
    </div>
  );
};

// Banner контент
export const BannerContent = ({ banner }) => {
  const textColor = getTextColor(banner.textColor);

  return (
    <div
      className='absolute inset-0 transition-all duration-700'
      style={getBackgroundStyle(banner)}>
      <div
        className={`absolute inset-0 ${getOverlayStyle(banner)}`}
        style={getOverlayInlineStyle(banner)}
      />

      <div className='relative flex h-full min-h-[600px] items-center justify-center px-8 py-16 lg:px-16'>
        <div
          className='flex max-w-4xl flex-col items-center gap-8 text-center transition-all duration-500'
          style={{ color: textColor }}>
          {banner.eyebrow && (
            <span className='text-xs font-semibold uppercase tracking-[0.4em] opacity-80'>
              {banner.eyebrow}
            </span>
          )}

          {banner.heading && (
            <h1 className='text-4xl font-bold uppercase leading-tight tracking-[0.08em] lg:text-6xl'>
              {banner.heading}
            </h1>
          )}

          {banner.description && (
            <p className='max-w-2xl text-base leading-8 opacity-90 lg:text-lg'>
              {banner.description}
            </p>
          )}

          {(banner.primaryCta.label || banner.secondaryCta.label) && (
            <div className='flex flex-wrap justify-center gap-4 pt-4'>
              {banner.primaryCta.label && (
                <a
                  href={banner.primaryCta.href}
                  className='border-2 px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] transition-all'
                  style={{
                    borderColor: textColor,
                    backgroundColor: textColor,
                    color:
                      banner.bgImage || banner.bgColor !== '#ffffff'
                        ? textColor === '#ffffff'
                          ? '#0d0d0d'
                          : '#ffffff'
                        : '#0d0d0d',
                  }}>
                  {banner.primaryCta.label}
                </a>
              )}

              {banner.secondaryCta.label && (
                <a
                  href={banner.secondaryCta.href}
                  className='border-2 px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] transition-all'
                  style={{
                    borderColor: textColor,
                    backgroundColor: 'transparent',
                    color: textColor,
                  }}>
                  {banner.secondaryCta.label}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Хажуу товчнууд
export const NavigationButtons = ({ onPrev, onNext }) => {
  return (
    <>
      <button
        onClick={onPrev}
        className='group absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-[#ffffff]/20 p-3 backdrop-blur-sm transition-all lg:left-8 hover:cursor-pointer'>
        <span className='absolute left-0 top-0 h-0 w-0 border-l-2 border-t-2 border-[#ffffff] transition-all duration-500 group-hover:h-full group-hover:w-full'></span>
        <span className='absolute bottom-0 right-0 h-0 w-0 border-b-2 border-r-2 border-[#ffffff] transition-all duration-500 group-hover:h-full group-hover:w-full'></span>
        <ChevronLeft size={24} className='relative z-10 text-[#ffffff]' />
      </button>
      <button
        onClick={onNext}
        className='group absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-[#ffffff]/20 p-3 backdrop-blur-sm transition-all lg:right-8 hover:cursor-pointer'>
        <span className='absolute left-0 top-0 h-0 w-0 border-l-2 border-t-2 border-[#ffffff] transition-all duration-500 group-hover:h-full group-hover:w-full'></span>
        <span className='absolute bottom-0 right-0 h-0 w-0 border-b-2 border-r-2 border-[#ffffff] transition-all duration-500 group-hover:h-full group-hover:w-full'></span>
        <ChevronRight size={24} className='relative z-10 text-[#ffffff]' />
      </button>
    </>
  );
};

// Pagination dots
export const PaginationDots = ({ banners, currentIndex, onGoToSlide }) => {
  return (
    <div className='absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-3'>
      {banners.map((_, index) => (
        <button
          key={index}
          onClick={() => onGoToSlide(index)}
          className={`h-2 transition-all ${
            currentIndex === index
              ? 'w-12 bg-[#ffffff]'
              : 'w-2 bg-[#ffffff]/50 hover:bg-[#ffffff]/75'
          }`}
        />
      ))}
    </div>
  );
};

// Хоосон төлөв
export const EmptyBanner = ({ isAdmin, onAdd }) => {
  return (
    <div className='flex h-[600px] items-center justify-center bg-gradient-to-r from-[#0d0d0d] to-[#4d5544] text-white'>
      <div className='space-y-4 text-center'>
        <p className='text-lg font-semibold'>Одоогоор banner алга.</p>
        {isAdmin && (
          <button
            onClick={onAdd}
            className='inline-flex items-center gap-2 bg-white px-4 py-2 text-sm font-semibold text-[#0d0d0d] shadow hover:bg-gray-100'>
            <Plus size={16} />
            Шинэ banner нэмэх
          </button>
        )}
      </div>
    </div>
  );
};
