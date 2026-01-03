'use client';

import { useEffect, useState } from 'react';
import CategoryUploadForm from '@/app/components/admin/category/AddCategory';
import { getCategoryOverview } from '../_store/adminStore';

const placeholderRows = Array.from({ length: 6 });

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ total: 0, items: [] });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      const data = await getCategoryOverview(8);
      if (!isMounted) return;
      setOverview(data);
      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className='flex flex-col gap-12 text-[#0d0d0d]'>
      <header className='flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold uppercase tracking-[0.16em]'>
          Category console
        </h1>
        <p className='max-w-2xl text-sm leading-7 text-[#0d0d0d]/70'>
          Curate navigational groupings, align parent hierarchies, and stage new
          collections before they go live.
        </p>
      </header>

      <section className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
        <article className='flex flex-col border border-[#0d0d0d] bg-[#ffffff]'>
          <header className='flex items-center justify-between border-b border-[#0d0d0d] px-6 py-5 uppercase tracking-[0.2em]'>
            <span className='text-sm font-semibold'>Collection map</span>
            <span className='text-xs text-[#4d5544]'>Live feed</span>
          </header>
          <div className='grid divide-y divide-[#0d0d0d]'>
            {(loading ? placeholderRows : overview.items).map((item, index) => (
              <div
                key={item?.id || `category-row-${index}`}
                className={`${
                  loading ? 'admin-placeholder' : ''
                } flex flex-col gap-2 px-6 py-5 uppercase tracking-[0.16em]`}>
                <span className='text-sm tracking-[0.18em] text-[#4d5544]'>
                  {loading ? 'Syncing category' : item.name}
                </span>
                <span className='text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d]/70'>
                  {loading
                    ? 'Awaiting description'
                    : item.description || 'Narrative coming soon.'}
                </span>
              </div>
            ))}
          </div>
        </article>

        <aside className='flex flex-col gap-6 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
          <div className='flex flex-col gap-2'>
            <h2 className='text-sm font-semibold uppercase tracking-[0.2em]'>
              Totals
            </h2>
            <p className='text-xs leading-6 text-[#0d0d0d]/70'>
              Counts update as soon as the API responds.
            </p>
          </div>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } flex justify-between border border-[#0d0d0d] px-4 py-3 text-sm uppercase tracking-[0.18em]`}>
            <span>Categories synced</span>
            <span>{loading ? '' : overview.total}</span>
          </div>
          <div className='flex flex-col gap-2 border border-[#0d0d0d] px-4 py-4 text-xs uppercase tracking-[0.18em] text-[#0d0d0d]/70'>
            <span>Tip</span>
            <p>
              Group related products into evocative parallels to keep the
              browsing narrative consistent.
            </p>
          </div>
        </aside>
      </section>

      <section className='border border-[#0d0d0d] bg-[#ffffff] p-8'>
        <header className='mb-8 flex flex-col gap-2'>
          <h2 className='text-lg font-semibold uppercase tracking-[0.18em]'>
            Add new category
          </h2>
          <p className='text-sm leading-7 text-[#0d0d0d]/70'>
            Anchor the taxonomy before your next capsule goes into the
            storefront feed.
          </p>
        </header>
        <CategoryUploadForm />
      </section>
    </section>
  );
}
