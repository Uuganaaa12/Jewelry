import Link from 'next/link';
import { getCategories } from '@/app/shop/_store/shopStore';

export default async function ShopCollectionsPage() {
  const categories = await getCategories();

  return (
    <section className='flex flex-col gap-12 text-[#0d0d0d]'>
      <header className='flex flex-col gap-3'>
        <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
          Curated edits
        </span>
        <h1 className='text-3xl font-semibold uppercase tracking-[0.12em] sm:text-4xl'>
          Collections
        </h1>
      </header>

      <div className='grid gap-6 md:grid-cols-2'>
        {categories.map(category => (
          <Link
            key={category.id}
            href={`/shop/categories/${category.id}`}
            className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff] px-6 py-8 transition-transform hover:-translate-y-1'>
            <span className='text-sm uppercase tracking-[0.22em] text-[#4d5544]'>
              {category.name}
            </span>
            <p className='text-sm leading-7 text-[#0d0d0d]/70'>
              {category.description ||
                'Awaiting narrative from the atelier archives.'}
            </p>
            <span className='text-[11px] uppercase tracking-[0.24em] text-[#0d0d0d]/70'>
              Explore live edit
            </span>
          </Link>
        ))}
        {categories.length === 0 && (
          <div className='border border-dashed border-[#0d0d0d]/40 bg-[#4d5544]/10 px-6 py-12 text-center text-sm uppercase tracking-[0.22em] text-[#4d5544]'>
            Categories syncing from backend…
          </div>
        )}
      </div>
    </section>
  );
}
