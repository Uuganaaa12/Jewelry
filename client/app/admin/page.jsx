'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAdminMetrics,
  getProductOverview,
  getRecentOrders,
} from './_store/adminStore';

const quickLinks = [
  {
    href: '/admin/products',
    label: 'Manage products',
    description: 'Add, sync, and publish the current catalogue.',
  },
  {
    href: '/admin/categories',
    label: 'Organize categories',
    description: 'Shape the navigation with clean collection groupings.',
  },
  {
    href: '/admin/orders',
    label: 'Review orders',
    description: 'Audit each purchase and verify payment capture.',
  },
];

const placeholderMetrics = Array.from({ length: 4 });
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productOverview, setProductOverview] = useState({
    total: 0,
    lowStock: 0,
    items: [],
  });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      const [metricData, productData, orderData] = await Promise.all([
        getAdminMetrics(),
        getProductOverview(),
        getRecentOrders(4),
      ]);

      if (!isMounted) return;
      setMetrics(metricData);
      setProductOverview(productData);
      setOrders(orderData);
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
        <h1 className='text-3xl font-semibold uppercase tracking-[0.1em]'>
          Тоон мэдээлэл
        </h1>
      </header>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {(loading ? placeholderMetrics : metrics).map((item, index) => (
          <article
            key={item?.id || `metric-${index}`}
            className={`${
              loading ? 'admin-placeholder' : ''
            } flex flex-col gap-3 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6`}>
            <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
              {loading ? 'Loading' : item.label}
            </span>
            <span className='text-4xl font-medium uppercase tracking-[0.08em]'>
              {loading ? '' : item.value}
            </span>
          </article>
        ))}
      </section>
      <section className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <article className='flex flex-col gap-6 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
          <header className='flex flex-col gap-1'>
            <h2 className='text-lg font-semibold uppercase tracking-[0.18em]'>
              Нөөц дуусах дөхөж буй бараанууд
            </h2>
          </header>
          <div className='grid gap-4'>
            {(loading
              ? placeholderMetrics.slice(0, 3)
              : productOverview.items
            ).map((item, index) => (
              <div
                key={item?.id || `product-${index}`}
                className={`${
                  loading ? 'admin-placeholder' : ''
                } flex items-center justify-between border border-[#0d0d0d] bg-[#ffffff] px-4 py-4`}>
                <div className='flex flex-col gap-1'>
                  <span className='text-sm uppercase tracking-[0.16em] text-[#4d5544]'>
                    {loading ? 'Loading product' : item.name}
                  </span>
                  <span className='text-xs uppercase tracking-[0.16em] text-[#0d0d0d]/70'>
                    {loading
                      ? 'Syncing details'
                      : `${
                          item.category || 'Unassigned'
                        } · ${item.price.toFixed(0)}₮`}
                  </span>
                </div>
                <span className='text-xs uppercase tracking-[0.28em]'>
                  {loading ? '' : `Stock ${item.stock}`}
                </span>
              </div>
            ))}
          </div>
        </article>
        <aside className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
          <div className='flex flex-col gap-1'>
            <h3 className='text-sm font-semibold uppercase tracking-[0.22em]'>
              Quick counts
            </h3>
            <p className='text-xs leading-6 text-[#0d0d0d]/70'>
              Live totals recalculated with every sync cycle.
            </p>
          </div>
          <div className='flex flex-col gap-3 text-sm uppercase tracking-[0.16em]'>
            <span>Catalogue · {loading ? '—' : productOverview.total}</span>
            <span>Low stock · {loading ? '—' : productOverview.lowStock}</span>
            <span>Orders logged · {loading ? '—' : orders.length}</span>
          </div>
        </aside>
      </section>
      <section className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]'>
        <article className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
          <header className='flex items-baseline justify-between uppercase tracking-[0.2em]'>
            <h2 className='text-sm font-semibold'>Recent orders</h2>
            <Link href='/admin/orders' className='text-xs text-[#4d5544]'>
              View all
            </Link>
          </header>
          <div className='flex flex-col divide-y divide-[#0d0d0d] border border-[#0d0d0d]'>
            {(loading ? placeholderMetrics : orders).map((order, index) => (
              <div
                key={order?.id || `placeholder-${index}`}
                className={`${
                  loading ? 'admin-placeholder' : ''
                } grid grid-cols-[minmax(0,1fr)_120px_100px] gap-4 px-4 py-4 text-xs uppercase tracking-[0.16em]`}>
                <div className='flex flex-col gap-1'>
                  <span>{loading ? 'Order syncing' : order.user}</span>
                  {!loading && order?.id && (
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className='text-[10px] uppercase tracking-[0.24em] text-[#0d0d0d] underline underline-offset-4'>
                      View detail
                    </Link>
                  )}
                </div>
                <span className='text-right'>
                  {loading ? '' : `${order.total.toFixed(0)}₮`}
                </span>
                <span className='text-right text-[#4d5544]'>
                  {loading ? '' : order.payment}
                </span>
              </div>
            ))}
          </div>
        </article>
        <aside className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
          <header className='flex flex-col gap-2'>
            <h3 className='text-sm font-semibold uppercase tracking-[0.22em]'>
              Quick actions
            </h3>
            <p className='text-xs leading-6 text-[#0d0d0d]/70'>
              Jump straight into the highest impact areas.
            </p>
          </header>
          <div className='flex flex-col gap-3'>
            {quickLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className='border border-[#0d0d0d] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
                <span>{link.label}</span>
                <p className='mt-1 text-[11px] leading-5 text-[#0d0d0d]/70'>
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </section>
  );
}
