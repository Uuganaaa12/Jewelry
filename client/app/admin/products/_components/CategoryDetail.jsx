'use client';

import Link from 'next/link';

const PRODUCT_PLACEHOLDERS = Array.from({ length: 6 });

export default function CategoryDetail({
  loading,
  category,
  products,
  onEditCategory,
  onDeleteCategory = () => {},
  onEditProduct,
  onDeleteProduct = () => {},
  onToggleAddProduct = () => {},
  showAddProduct = false,
  addProductForm = null,
  editingCategory = false,
  editingProductId = '',
  categoryEditForm = null,
  productEditForm = null,
  deletingCategory = false,
  deletingProductId = '',
}) {
  if (loading) {
    return (
      <div className='flex flex-col gap-6 px-6 py-8 lg:px-8'>
        <div className='admin-placeholder h-14 border border-[#0d0d0d]' />
        <div className='admin-placeholder h-40 border border-[#0d0d0d]' />
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

  const isUnassigned = category?.type === 'unassigned';
  const title = isUnassigned ? 'Unassigned catalogue' : category?.name;
  const description = isUnassigned
    ? 'Products without a category mapping appear here until assigned.'
    : category?.description || 'Awaiting category narrative.';

  return (
    <div className='flex flex-col gap-6 px-6 py-8 lg:px-8'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div className='flex-1'>
          <h2 className='text-lg font-semibold uppercase tracking-[0.18em]'>
            {title}
          </h2>
          <p className='mt-2 text-sm leading-7 text-[#0d0d0d]/70'>
            {description}
          </p>
        </div>
        {!isUnassigned && category?.id && (
          <div className='flex gap-3'>
            <button
              type='button'
              onClick={() => onEditCategory(category.id)}
              disabled={deletingCategory}
              className='border border-[#0d0d0d] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
              {deletingCategory
                ? 'Processing...'
                : editingCategory
                ? 'Close editor'
                : 'Edit category'}
            </button>
            <button
              type='button'
              onClick={() => onDeleteCategory(category.id)}
              disabled={deletingCategory}
              className='border border-[#b80000] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b80000] transition-colors hover:bg-[#b80000] hover:text-[#ffffff] disabled:opacity-70'>
              {deletingCategory ? 'Deleting...' : 'Delete category'}
            </button>
            <button
              type='button'
              onClick={onToggleAddProduct}
              className='border border-dashed border-[#0d0d0d] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors hover:border-solid hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
              {showAddProduct ? 'Close form' : 'New product'}
            </button>
          </div>
        )}
      </div>

      {/* <div
        className={`h-44 border border-[#0d0d0d] ${
          category?.image ? '' : 'admin-placeholder'
        }`}>
        {category?.image && (
          <img
            src={category.image}
            alt={`${category.name} visual`}
            className='h-full w-full object-cover'
          />
        )}
      </div> */}

      {editingCategory && categoryEditForm}
      {showAddProduct && addProductForm}

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {products.length > 0 ? (
          products.map(product => (
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
          ))
        ) : (
          <div className='border border-[#0d0d0d] px-6 py-10 text-xs uppercase tracking-[0.2em] text-[#4d5544]'>
            No products mapped yet.
          </div>
        )}
      </div>

      {editingProductId && productEditForm}
    </div>
  );
}
