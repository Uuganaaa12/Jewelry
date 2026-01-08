import Image from 'next/image';
import Link from 'next/link';
import PriceDisplay from '@/app/shop/_components/PriceDisplay';
import { getCategories, getProducts } from '@/app/shop/_store/shopStore';
import { cn } from '@/lib/utils';
import { SidebarProvider } from './SidebarContext';
import MobileFilterToggle from './MobileFilterToggle';
import Sidebar from './Sidebar';

const PAGE_SIZE = 12;

export const buildQueryString = (base, overrides = {}) => {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };

  Object.entries(merged).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    if (typeof value === 'number' && Number.isNaN(value)) return;
    params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

export const groupCategories = categories => {
  const parents = categories
    .filter(category => !category.parent?.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  const childrenByParent = categories.reduce((map, category) => {
    if (category.parent?.id) {
      if (!map.has(category.parent.id)) {
        map.set(category.parent.id, []);
      }
      map.get(category.parent.id).push(category);
    }
    return map;
  }, new Map());

  const grouped = parents.map(parent => {
    const children = childrenByParent.get(parent.id) ?? [];
    children.sort((a, b) => a.name.localeCompare(b.name));
    return { parent, children };
  });

  const groupedChildIds = new Set(
    grouped.flatMap(entry => entry.children.map(child => child.id))
  );

  const standalone = categories
    .filter(
      category => category.parent?.id && !groupedChildIds.has(category.id)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return { grouped, standalone };
};

const computeRange = (page, size, total) => {
  if (!total) {
    return { start: 0, end: 0 };
  }
  const start = (page - 1) * size + 1;
  const end = Math.min(total, page * size);
  return { start, end };
};

export default async function ShopProductsPage({ searchParams }) {
  const params = await searchParams;
  const currentSearch = params?.search?.toString() ?? '';
  const currentCategory = params?.category?.toString() ?? '';
  const resolvedPage = Math.max(Number(params?.page) || 1, 1);
  const requestedLimit = Number(params?.limit) || PAGE_SIZE;

  const [productResult, categories] = await Promise.all([
    getProducts({
      category: currentCategory || undefined,
      search: currentSearch || undefined,
      page: resolvedPage,
      pageSize: requestedLimit,
      withMeta: true,
    }),
    getCategories(),
  ]);

  const items = Array.isArray(productResult)
    ? productResult
    : productResult?.items ?? [];

  const total = !Array.isArray(productResult)
    ? productResult?.total ?? items.length
    : items.length;
  const page = !Array.isArray(productResult)
    ? productResult?.page ?? resolvedPage
    : resolvedPage;
  const pageSize = !Array.isArray(productResult)
    ? productResult?.pageSize ?? requestedLimit
    : requestedLimit;
  const totalPages = !Array.isArray(productResult)
    ? productResult?.totalPages ??
      Math.max(1, Math.ceil((total || items.length || 1) / pageSize))
    : 1;

  const activeCategory = categories.find(
    category => category.id === currentCategory
  );
  const { grouped, standalone } = groupCategories(categories);
  const range = computeRange(page, pageSize, total);

  const baseQuery = {
    search: currentSearch || undefined,
    category: currentCategory || undefined,
    limit: pageSize,
  };

  return (
    <SidebarProvider>
      <section className='flex flex-col gap-8 px-4 py-6 text-[#0d0d0d] sm:gap-10 sm:px-6 md:gap-12 md:py-8'>
        {/* Header */}
        <header className='flex flex-col gap-3'>
          <span className='text-[10px] uppercase tracking-[0.28em] text-[#4d5544] sm:text-xs'>
            Catalogue explorer
          </span>
          <h1 className='text-2xl font-semibold uppercase tracking-[0.12em] sm:text-3xl md:text-4xl'>
            Бүтээгдэхүүнүүд
          </h1>

          {/* Active Filters */}
          {(currentCategory || currentSearch) && (
            <div className='flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#4d5544] sm:gap-3 sm:text-[11px]'>
              {currentCategory && (
                <span className='border border-[#0d0d0d] bg-[#ffffff] px-2 py-1 sm:px-3'>
                  Category: {activeCategory?.name || 'Unknown'}
                </span>
              )}
              {currentSearch && (
                <span className='border border-[#0d0d0d] bg-[#ffffff] px-2 py-1 sm:px-3'>
                  Search: "{currentSearch}"
                </span>
              )}
              <Link
                href={`/shop/products${buildQueryString({}, {})}`}
                className='ml-auto border border-[#0d0d0d] bg-[#ffffff] px-2 py-1 text-[#0d0d0d] transition hover:bg-[#0d0d0d] hover:text-[#ffffff] sm:px-3'>
                Clear filters
              </Link>
            </div>
          )}
        </header>

        {/* Mobile Filter Toggle */}
        <MobileFilterToggle />

        <div className='grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-10'>
          {/* Sidebar */}
          <Sidebar
            currentSearch={currentSearch}
            currentCategory={currentCategory}
            pageSize={pageSize}
            baseQuery={baseQuery}
            grouped={grouped}
            standalone={standalone}
          />

          {/* Main Content */}
          <div className='flex flex-col gap-6 sm:gap-8'>
            {/* Results Info */}
            <div className='flex flex-col gap-2 border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-[#4d5544] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 sm:text-[11px]'>
              <span>
                Showing {range.start}-{range.end} of {total} items
              </span>
              <span>
                Page {page} of {totalPages}
              </span>
            </div>

            {/* Product Grid */}
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {items.map(product => {
                const hasCategory = Boolean(product.category?.id);
                const cardClass =
                  'group flex h-full flex-col overflow-hidden border-1 border-[#0d0d0d] bg-[#ffffff] transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(200,200,200,1)]';

                const content = (
                  <>
                    <div className='relative aspect-[4/3] w-full overflow-hidden bg-[#ffffff]'>
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={`${product.name} preview`}
                          fill
                          sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                          className='object-cover transition-transform duration-500 group-hover:scale-110'
                        />
                      ) : (
                        <div className='flex h-full items-center justify-center bg-[#0d0d0d]/5'>
                          <span className='px-6 text-center text-[10px] uppercase tracking-[0.28em] text-[#4d5544]/60 sm:text-xs'>
                            No Image
                          </span>
                        </div>
                      )}
                    </div>

                    <div className='flex flex-1 flex-col p-5 sm:p-6'>
                      <div className='mb-0 flex flex-col gap-0'>
                        <h2 className='line-clamp-2 min-h-[2.5rem] text-base font-bold uppercase leading-tight tracking-[0.12em] text-[#0d0d0d] sm:text-lg'>
                          {product.name}
                        </h2>
                        <p className='truncate text-xs leading-relaxed text-[#4d5544] sm:text-sm'>
                          {product.description ||
                            'Description pending from merchandising team.'}
                        </p>
                      </div>

                      <div className='mt-auto space-y-3 border-t-2 border-[#0d0d0d]/10 pt-4'>
                        <div className='flex items-baseline justify-between gap-3'>
                          <span className='text-[9px] font-semibold uppercase tracking-[0.28em] text-[#4d5544] sm:text-[10px]'>
                            {product.category?.name || 'Unassigned'}
                          </span>
                        </div>
                        <div className='flex items-center justify-end'>
                          <PriceDisplay
                            price={product.price}
                            salePrice={product.salePrice}
                            saleActive={product.saleActive}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                );

                return hasCategory ? (
                  <Link
                    key={product.id}
                    href={`/shop/categories/${product.category.id}/products/${product.id}`}
                    className={cardClass}>
                    {content}
                  </Link>
                ) : (
                  <article key={product.id} className={cardClass}>
                    {content}
                  </article>
                );
              })}

              {items.length === 0 && (
                <div className='col-span-full border-2 border-dashed border-[#0d0d0d]/30 bg-[#0d0d0d]/5 px-8 py-16 text-center'>
                  <p className='text-sm font-semibold uppercase tracking-[0.28em] text-[#4d5544]'>
                    No products match the current filters.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-[#4d5544] sm:px-6 sm:py-4 sm:text-[11px]'>
                <div className='flex items-center justify-between gap-2'>
                  <PaginationLink
                    label='Previous'
                    href={`/shop/products${buildQueryString(baseQuery, {
                      page: Math.max(1, page - 1),
                    })}`}
                    disabled={page === 1}
                  />
                  <span className='text-[#0d0d0d]'>
                    {page} / {totalPages}
                  </span>
                  <PaginationLink
                    label='Next'
                    href={`/shop/products${buildQueryString(baseQuery, {
                      page: Math.min(totalPages, page + 1),
                    })}`}
                    disabled={page === totalPages}
                  />
                </div>

                {/* Page Numbers */}
                <div className='flex flex-wrap justify-center gap-1 sm:gap-2'>
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    const showPage =
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      Math.abs(pageNumber - page) <= 1;

                    if (!showPage && pageNumber === 2 && page > 3) {
                      return (
                        <span key={pageNumber} className='px-2'>
                          ...
                        </span>
                      );
                    }
                    if (
                      !showPage &&
                      pageNumber === totalPages - 1 &&
                      page < totalPages - 2
                    ) {
                      return (
                        <span key={pageNumber} className='px-2'>
                          ...
                        </span>
                      );
                    }
                    if (!showPage) return null;

                    return (
                      <Link
                        key={pageNumber}
                        href={`/shop/products${buildQueryString(baseQuery, {
                          page: pageNumber,
                        })}`}
                        className={cn(
                          'border border-[#0d0d0d]/40 bg-[#ffffff] px-2 py-1 text-[#0d0d0d] transition hover:border-[#0d0d0d] sm:px-3',
                          pageNumber === page &&
                            'border-[#0d0d0d] bg-[#0d0d0d] text-[#ffffff]'
                        )}>
                        {pageNumber}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            )}
          </div>
        </div>
      </section>
    </SidebarProvider>
  );
}

function PaginationLink({ label, href, disabled }) {
  const className = cn(
    'border border-[#0d0d0d]/40 bg-[#ffffff] px-3 py-1 text-[#0d0d0d] transition hover:border-[#0d0d0d] sm:px-4',
    disabled && 'pointer-events-none border-dashed text-[#0d0d0d]/40'
  );

  if (disabled) {
    return <span className={className}>{label}</span>;
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
