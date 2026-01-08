import Link from 'next/link';
import {
  getHeroContent,
  getFeaturedCategories,
  getFeaturedProducts,
} from './_store/shopStore';
import PriceDisplay from './_components/PriceDisplay';
import CategoryCard from './_components/CategoryCard';
import HeroBanners from './_components/HeroBanners';
import { Button } from '@/components/ui/button';

export default async function ShopHome() {
  const hero = getHeroContent();
  const [categories, products] = await Promise.all([
    getFeaturedCategories(),
    getFeaturedProducts(),
  ]);
  return (
    <div className='flex flex-col gap-0 text-[#0d0d0d]'>
      {/* Hero Banner Slider */}
      <HeroBanners />

      {/* Коллекцийн хэсэг */}
      <section className='flex flex-col gap-12 border-y border-[#0d0d0d] bg-[#ffffff] p-12 lg:p-16'>
        <header className='flex flex-col gap-4'>
          <h2 className='text-3xl font-bold uppercase tracking-[0.16em]'>
            Цуглуулга
          </h2>
          <p className='max-w-2xl text-sm leading-7 text-[#0d0d0d]/70'>
            Өвөрмөц загвар, өндөр чанарын үнэт эдлэлүүдийн цуглуулга
          </p>
        </header>

        {categories.length > 0 ? (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className='border border-[#0d0d0d] bg-[#f5f5f5] px-8 py-12 text-center'>
            <span className='text-xs uppercase tracking-[0.24em] text-[#4d5544]'>
              Коллекциуд уншиж байна...
            </span>
          </div>
        )}
      </section>

      {/* Онцлох бүтээгдэхүүн */}
      <section className='flex flex-col gap-12 bg-[#ffffff] p-12 lg:p-16 border-b border-[#0d0d0d]'>
        <header className='flex flex-col gap-4'>
          <div className='flex'>
            <h2 className='text-3xl font-bold uppercase tracking-[0.16em]'>
              Онцлох бүтээгдэхүүнүүд
            </h2>
          </div>

          <p className='max-w-2xl text-sm leading-7 text-[#0d0d0d]/70'>
            Манай хамгийн алдартай, шилдэг чанарын үнэт эдлэлүүд
          </p>
        </header>

        {products.length > 0 ? (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {products.map(product => {
              const hasCategory = Boolean(product.category?.id);
              const cardClass =
                'group flex flex-col gap-0 border border-[#0d0d0d] bg-[#ffffff] transition-all hover:shadow-lg';

              const content = (
                <>
                  {/* Бүтээгдэхүүний зураг */}
                  <div className='relative h-64 overflow-hidden border-b border-[#0d0d0d] bg-[#f5f5f5]'>
                    {product.image || product.images?.[0] ? (
                      <img
                        src={product.image || product.images[0]}
                        alt={product.name}
                        className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                      />
                    ) : (
                      <div className='flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-[#0d0d0d]/40'>
                        Зураг байхгүй
                      </div>
                    )}
                    {product.saleActive && (
                      <div className='absolute right-3 top-3 border border-[#b33a3a] bg-[#b33a3a] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffffff]'>
                        Хямдрал
                      </div>
                    )}
                  </div>

                  {/* Мэдээлэл */}
                  <div className='flex flex-col gap-4 p-6'>
                    <div className='flex flex-col gap-2'>
                      <span className='text-[10px] uppercase tracking-[0.24em] text-[#4d5544]'>
                        {product.category?.name || 'Ангилал байхгүй'}
                      </span>
                      <h3 className='text-lg font-bold uppercase tracking-[0.14em] transition-colors group-hover:text-[#4d5544]'>
                        {product.name}
                      </h3>
                      <p className='line-clamp-2 text-sm leading-6 text-[#0d0d0d]/70'>
                        {product.description || 'Тайлбар нэмэгдээгүй'}
                      </p>
                    </div>
                    <div className='mt-auto'>
                      <PriceDisplay
                        align='start'
                        price={product.price}
                        salePrice={product.salePrice}
                        saleActive={product.saleActive}
                      />
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
          </div>
        ) : (
          <div className='border border-[#0d0d0d] bg-[#f5f5f5] px-8 py-12 text-center'>
            <span className='text-xs uppercase tracking-[0.24em] text-[#4d5544]'>
              Бүтээгдэхүүн уншиж байна...
            </span>
          </div>
        )}
      </section>

      {/* Сүүлчийн CTA banner */}
      <section className='border-t border-[#0d0d0d] bg-[#ffffff]'>
        <div className='grid lg:grid-cols-2'>
          {/* Зүүн тал */}
          <div className='flex flex-col justify-center gap-6 border-r border-[#0d0d0d] p-12 lg:p-16'>
            <span className='text-xs font-semibold uppercase tracking-[0.4em] text-[#4d5544]'>
              Бидэнтэй холбогдох
            </span>
            <h3 className='text-3xl font-bold uppercase tracking-[0.12em]'>
              Асуулт байна уу?
            </h3>
            <p className='text-base leading-7 text-[#0d0d0d]/75'>
              Манай мэргэжилтнүүд танд туслахад бэлэн байна
            </p>
            <Link
              href='/contact'
              className='mt-4 w-fit border border-[#0d0d0d] bg-[#0d0d0d] px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] text-[#ffffff] transition-colors hover:bg-[#4d5544]'>
              Холбогдох
            </Link>
          </div>

          {/* Баруун тал */}
          <div className='flex flex-col justify-center gap-6 p-12 lg:p-16'>
            <span className='text-xs font-semibold uppercase tracking-[0.4em] text-[#4d5544]'>
              Мэдээлэл авах
            </span>
            <h3 className='text-3xl font-bold uppercase tracking-[0.12em]'>
              Шинэ бүтээгдэхүүний мэдээлэл
            </h3>
            <p className='text-base leading-7 text-[#0d0d0d]/75'>
              И-мэйл хаягаа үлдээж, хямдралын мэдээлэл авах
            </p>
            <div className='mt-4 flex gap-3'>
              <input
                type='email'
                placeholder='И-мэйл хаяг'
                className='flex-1 border border-[#0d0d0d] bg-transparent px-4 py-3 text-sm uppercase tracking-[0.14em] text-[#0d0d0d] placeholder:text-[#0d0d0d]/40 focus:outline-none focus:ring-2 focus:ring-[#4d5544]'
              />
              <button className='border border-[#0d0d0d] bg-[#0d0d0d] px-6 py-3 text-xs font-bold uppercase tracking-[0.24em] text-[#ffffff] transition-colors hover:bg-[#4d5544]'>
                Илгээх
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
