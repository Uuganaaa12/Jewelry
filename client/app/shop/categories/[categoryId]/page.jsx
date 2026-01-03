import Link from 'next/link';
import { notFound } from 'next/navigation';
import PriceDisplay from '../../_components/PriceDisplay';
import { getCategoryWithProducts } from '../../_store/shopStore';

export default async function CategoryPage({ params }) {
  const { categoryId } = await params;
  const { category, products = [] } = await getCategoryWithProducts(categoryId);

  if (!category) {
    notFound();
  }

  const hasProducts = products.length > 0;

  return (
    <section className='flex flex-col gap-12 text-[#0d0d0d]'>
      <header className='flex flex-col gap-3'>
        <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
          Live collection
        </span>
        <h1 className='text-3xl font-semibold uppercase tracking-[0.12em] sm:text-4xl'>
          {category.name}
        </h1>
        <p className='max-w-2xl text-sm leading-7 text-[#0d0d0d]/70'>
          {category.description ||
            'Products sync automatically from the atelier. Once merchandised, they surface here.'}
        </p>
      </header>

      {hasProducts ? (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {products.map(product => (
            <Link
              key={product.id}
              href={`/shop/categories/${category.id}/products/${product.id}`}
              className='flex h-full flex-col gap-5 border border-[#0d0d0d] bg-[#ffffff] px-6 py-8 transition-transform hover:-translate-y-1'>
              <div className='flex h-48 items-center justify-center border border-dashed border-[#0d0d0d]/30 bg-[#0d0d0d]/5 text-[11px] uppercase tracking-[0.22em] text-[#0d0d0d]/50'>
                {product.image ? 'View piece' : 'Imagery syncing'}
              </div>
              <div className='flex flex-col gap-2'>
                <h2 className='text-lg font-medium uppercase tracking-[0.14em]'>
                  {product.name}
                </h2>
                <p className='text-sm leading-7 text-[#0d0d0d]/70'>
                  {product.description ||
                    'Description pending from the merchandising team.'}
                </p>
              </div>
              <div className='mt-auto flex items-end justify-between'>
                <span className='text-xs uppercase tracking-[0.16em] text-[#4d5544]'>
                  SKU · {product.sku || '—'}
                </span>
                <PriceDisplay
                  price={product.price}
                  salePrice={product.salePrice}
                  saleActive={product.saleActive}
                />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className='border border-dashed border-[#0d0d0d]/40 bg-[#4d5544]/10 px-6 py-12 text-center text-sm uppercase tracking-[0.22em] text-[#4d5544]'>
          Catalogue sync pending for this category.
        </div>
      )}
    </section>
  );
}
