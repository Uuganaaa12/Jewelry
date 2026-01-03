import Link from 'next/link';
import {
  getHeroContent,
  getFeaturedCategories,
  getFeaturedProducts,
} from './_store/shopStore';
import PriceDisplay from './_components/PriceDisplay';
import CategoryCard from './_components/CategoryCard';

export default async function ShopHome() {
  const hero = getHeroContent();
  const [categories, products] = await Promise.all([
    getFeaturedCategories(),
    getFeaturedProducts(),
  ]);

  const categoryImages = categories
    .map(cat => cat.image || cat.images?.[0])
    .filter(Boolean);

  const ringImages =
    categoryImages.length < 5
      ? [...categoryImages, ...categoryImages, ...categoryImages].slice(0, 10)
      : categoryImages;

  return (
    <div className='flex flex-col gap-20 text-[#0d0d0d]'>
      <section className='grid gap-10 border border-[#0d0d0d] bg-[#ffffff] p-12 md:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='flex flex-col gap-6'>
          <p className='tracking-[0.4em] text-xs uppercase text-[#4d5544]'>
            {hero.eyebrow}
          </p>
          <h1 className='text-4xl font-medium uppercase tracking-[0.08em] sm:text-5xl'>
            {hero.heading}
          </h1>
          <p className='max-w-xl text-base leading-8 text-[#0d0d0d]/80'>
            {hero.description}
          </p>
          <div className='flex flex-wrap gap-3 pt-4'>
            <Link
              href={hero.primaryCta.href}
              className='border border-[#0d0d0d] bg-[#0d0d0d] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#ffffff]'>
              {hero.primaryCta.label}
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className='border border-[#0d0d0d] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#0d0d0d]'>
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className='flex flex-col justify-between border border-[#4d5544] bg-[#4d5544]/10 p-6 text-xs uppercase tracking-[0.2em] text-[#4d5544]'>
          <div className='flex flex-1 items-center justify-center border border-dashed border-[#4d5544]/40 bg-[#4d5544]/10 text-center text-[0.7rem] text-[#4d5544]'>
            Catalogue syncing across ateliers
          </div>
          <div className='mt-6 flex flex-col gap-1 text-[#0d0d0d]/70'>
            <span>Inventory feed: connected</span>
            <span>Next refresh in 03:00</span>
          </div>
        </div>
      </section>

      <section className='flex flex-col gap-10'>
        <header className='flex flex-col gap-2'>
          <h2 className='text-2xl font-medium uppercase tracking-[0.16em]'>
            Collections
          </h2>
          <p className='max-w-2xl text-sm leading-7 text-[#0d0d0d]/70'>
            Browse live categories sourced directly from the API
          </p>
        </header>

        {categoryImages.length > 0 ? (
          <>
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {categories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </>
        ) : (
          <div className='border border-[#0d0d0d] bg-[#4d5544]/10 px-6 py-8 text-sm uppercase tracking-[0.2em] text-[#4d5544]'>
            Categories syncing from server…
          </div>
        )}
      </section>

      <section className='flex flex-col gap-10'>
        <header className='flex flex-col gap-2'>
          <h2 className='text-2xl font-medium uppercase tracking-[0.16em]'>
            Featured pieces
          </h2>
          <p className='max-w-2xl text-sm leading-7 text-[#0d0d0d]/70'>
            These products stream from the Express backend via the REST
            endpoints inside the repository.
          </p>
        </header>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {products.map(product => {
            const hasCategory = Boolean(product.category?.id);
            const cardClass =
              'flex flex-col gap-5 border border-[#0d0d0d] bg-[#ffffff] px-6 py-8 transition-transform hover:-translate-y-1';

            const content = (
              <>
                <header className='flex flex-col gap-2'>
                  <h3 className='text-lg font-medium uppercase tracking-[0.14em]'>
                    {product.name}
                  </h3>
                  <p className='text-sm leading-7 text-[#0d0d0d]/70'>
                    {product.description ||
                      'Awaiting atelier copy. Please check back after the next sync.'}
                  </p>
                </header>
                <div className='mt-auto flex items-end justify-between'>
                  <span className='text-xs uppercase tracking-[0.14em] text-[#4d5544]'>
                    {product.category?.name || 'Unassigned'}
                  </span>
                  <PriceDisplay
                    price={product.price}
                    salePrice={product.salePrice}
                    saleActive={product.saleActive}
                  />
                </div>
                {product.saleActive && (
                  <span className='mt-2 text-[11px] uppercase tracking-[0.18em] text-[#b33a3a]'>
                    Sale live now
                  </span>
                )}
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
          {products.length === 0 && (
            <div className='border border-[#0d0d0d] bg-[#4d5544]/10 px-6 py-12 text-center text-sm uppercase tracking-[0.22em] text-[#4d5544]'>
              Products syncing from backend…
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
