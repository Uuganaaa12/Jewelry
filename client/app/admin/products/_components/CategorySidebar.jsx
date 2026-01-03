'use client';

const PLACEHOLDERS = Array.from({ length: 5 });

export default function CategorySidebar({
  loading,
  categories,
  activeId,
  onSelect,
  onCreateCategory,
  creating = false,
}) {
  return (
    <aside className='border-b border-[#0d0d0d] p-6 lg:border-b-0 lg:border-r'>
      <div className='mb-4 text-xs uppercase tracking-[0.24em] text-[#4d5544]'>
        Categories
      </div>
      <button
        type='button'
        onClick={() => onCreateCategory && onCreateCategory()}
        className='mb-4 border border-dashed border-[#0d0d0d] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#0d0d0d] transition-colors hover:border-solid hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:opacity-60'
        disabled={loading}
        aria-pressed={creating}>
        {creating ? 'Close form' : 'New Category'}
      </button>
      <div className='flex flex-col gap-3'>
        {loading
          ? PLACEHOLDERS.map((_, index) => (
              <div
                key={`category-placeholder-${index}`}
                className='admin-placeholder h-20 border border-[#0d0d0d]'
              />
            ))
          : categories.map(item => {
              const isActive = activeId === item.id;
              const countClass = isActive
                ? 'text-[#ffffff]/80'
                : 'text-[#0d0d0d]/70';
              const isChild = Boolean(item.parentId);

              return (
                <button
                  key={item.id}
                  type='button'
                  onClick={() => onSelect(item.id)}
                  className={`group relative flex items-center gap-4 border border-[#0d0d0d] px-4 py-4 text-left uppercase tracking-[0.14em] transition-colors ${
                    isActive
                      ? 'bg-[#0d0d0d] text-[#ffffff]'
                      : 'hover:bg-[#4d5544] hover:text-[#ffffff]'
                  } ${isChild ? 'pl-10' : ''}`}>
                  {isChild && (
                    <span
                      className='absolute left-4 h-6 border-l border-[#0d0d0d]/60'
                      aria-hidden='true'
                    />
                  )}
                  <div
                    className={`h-12 w-12 border border-[#0d0d0d] ${
                      item.image ? '' : 'admin-placeholder'
                    }`}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={`${item.name} visual`}
                        className='h-full w-full object-cover'
                      />
                    )}
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm'>{item.name}</span>
                    {item.parentName && (
                      <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
                        {item.parentName} →
                      </span>
                    )}
                    <span className={`text-[11px] ${countClass}`}>
                      {item.count} products
                    </span>
                  </div>
                </button>
              );
            })}
      </div>
    </aside>
  );
}
