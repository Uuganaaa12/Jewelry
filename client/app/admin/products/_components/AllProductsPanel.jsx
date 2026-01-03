'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const PRODUCT_PLACEHOLDERS = Array.from({ length: 12 });
const PAGE_SIZE = 12;

export default function AllProductsPanel({
  loading,
  products,
  onEditProduct,
  onDeleteProduct,
  editingProductId = '',
  deletingProductId = '',
  productEditForm = null,
}) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [products.length]);

  const totalPages = useMemo(
    () => (products.length > 0 ? Math.ceil(products.length / PAGE_SIZE) : 1),
    [products.length]
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [page, products]);

  if (loading) {
    return (
      <div className='flex flex-col gap-6 px-6 py-8 lg:px-8'>
        <div className='admin-placeholder h-14 border border-[#0d0d0d]' />
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {PRODUCT_PLACEHOLDERS.map((_, index) => (
            <div
              key={`product-placeholder-${index}`}
              className='admin-placeholder h-44 border border-[#0d0d0d]'
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 px-6 py-8 lg:px-8'>
      <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='text-lg font-semibold uppercase tracking-[0.18em]'>
            All products
          </h2>
          <p className='mt-1 text-sm leading-7 text-[#0d0d0d]/70'>
            Browse everything without switching categories. Sorted by main →
            subcategory.
          </p>
        </div>
        <div className='text-xs uppercase tracking-[0.2em] text-[#4d5544]'>
          {products.length} items
        </div>
      </div>

      {products.length === 0 ? (
        <div className='border border-[#0d0d0d] px-6 py-10 text-xs uppercase tracking-[0.2em] text-[#4d5544]'>
          No products available yet.
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {visibleProducts.map(product => (
            <article
              key={product.id}
              className='flex flex-col gap-4 border border-[#0d0d0d] p-4'>
              <div
                className={`h-40 border border-[#0d0d0d] ${
                  product.image ? '' : 'admin-placeholder'
                }`}>
                {product.image && (
                  <img
                    src={product.image}
                    alt={`${product.name} visual`}
                    className='h-full w-full object-cover'
                  />
                )}
              </div>
              <div className='flex flex-col gap-1'>
                <h3 className='text-sm font-semibold uppercase tracking-[0.16em]'>
                  {product.name}
                </h3>
                <p className='text-[11px] uppercase tracking-[0.2em] text-[#0d0d0d]/70'>
                  SKU {product.sku}
                </p>
                <p className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
                  {product.categoryPath}
                </p>
              </div>
              <div className='flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#4d5544]'>
                <span>{product.price.toFixed(0)}₮</span>
                <span>Stock {product.stock}</span>
              </div>
              {product.sizes && product.sizes.length > 0 && (
                <p className='text-[10px] uppercase tracking-[0.22em] text-[#0d0d0d]/60'>
                  Sizes {product.sizes.join(', ')}
                </p>
              )}
              <div className='flex gap-2'>
                <Link
                  href={`/admin/products/${product.id}`}
                  className='border border-[#0d0d0d] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
                  View
                </Link>
                <button
                  type='button'
                  onClick={() => onEditProduct(product.id)}
                  disabled={deletingProductId === product.id}
                  className='border border-[#0d0d0d] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:opacity-70'>
                  {editingProductId === product.id ? 'Cancel edit' : 'Edit'}
                </button>
                <button
                  type='button'
                  onClick={() => onDeleteProduct(product.id)}
                  disabled={deletingProductId === product.id}
                  className='border border-[#b80000] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b80000] transition-colors hover:bg-[#b80000] hover:text-[#ffffff] disabled:opacity-70'>
                  {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {products.length > PAGE_SIZE && (
        <div className='flex items-center justify-between gap-3 border border-[#0d0d0d] px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#0d0d0d]'>
          <span>
            Page {page} of {totalPages}
          </span>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setPage(previous => Math.max(1, previous - 1))}
              disabled={page === 1}
              className='border border-[#0d0d0d] px-3 py-2 transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:opacity-50'>
              Prev
            </button>
            <button
              type='button'
              onClick={() =>
                setPage(previous => Math.min(totalPages, previous + 1))
              }
              disabled={page === totalPages}
              className='border border-[#0d0d0d] px-3 py-2 transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:opacity-50'>
              Next
            </button>
          </div>
        </div>
      )}

      {editingProductId && productEditForm}
    </div>
  );
}
