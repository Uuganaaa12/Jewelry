'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getOrderDetail } from '../../_store/adminStore';

const PLACEHOLDER_ITEMS = Array.from({ length: 3 });

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderIdRaw = params?.id;
  const orderId = Array.isArray(orderIdRaw) ? orderIdRaw[0] : orderIdRaw || '';
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await getOrderDetail(orderId);
        if (!active) return;
        if (!response) {
          setError('Захиалга олдсонгүй.');
          setDetail(null);
        } else {
          setDetail(response);
        }
      } catch (err) {
        if (!active) return;
        console.error('Failed to load order detail', err);
        setError('Захиалгын мэдээлэл татахад алдаа гарлаа.');
        setDetail(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  const customer = detail?.user;
  const items = detail?.items || [];
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    return {
      subtotal,
      total: detail?.totalAmount || subtotal,
    };
  }, [items, detail?.totalAmount]);

  const createdAt = detail?.createdAt
    ? new Date(detail.createdAt).toLocaleString()
    : '—';
  const paidAt = detail?.paidAt
    ? new Date(detail.paidAt).toLocaleString()
    : null;

  return (
    <section className='flex flex-col gap-10 text-[#0d0d0d]'>
      <header className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-2xl font-semibold uppercase tracking-[0.14em]'>
              Order detail
            </h1>
            <p className='text-xs uppercase tracking-[0.18em] text-[#0d0d0d]/70'>
              {orderId
                ? `Reference #${orderId.slice(-6)}`
                : 'Reference pending'}
            </p>
          </div>
          <div className='flex gap-3'>
            <button
              type='button'
              onClick={() => router.back()}
              className='border border-[#0d0d0d] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
              Go back
            </button>
            <Link
              href='/admin/orders'
              className='border border-dashed border-[#0d0d0d] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors hover:border-solid hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
              Orders list
            </Link>
          </div>
        </div>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } border border-[#0d0d0d] bg-[#ffffff] px-4 py-4`}>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              Status
            </span>
            <p className='mt-2 text-lg uppercase tracking-[0.16em]'>
              {loading ? '' : detail?.status || 'Unknown'}
            </p>
          </div>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } border border-[#0d0d0d] bg-[#ffffff] px-4 py-4`}>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              Total amount
            </span>
            <p className='mt-2 text-lg uppercase tracking-[0.16em]'>
              {loading ? '' : `${(detail?.totalAmount || 0).toFixed(0)}₮`}
            </p>
          </div>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } border border-[#0d0d0d] bg-[#ffffff] px-4 py-4`}>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              Payment method
            </span>
            <p className='mt-2 text-lg uppercase tracking-[0.16em]'>
              {loading ? '' : detail?.paymentMethod || 'Unknown'}
            </p>
          </div>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } border border-[#0d0d0d] bg-[#ffffff] px-4 py-4`}>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              Created at
            </span>
            <p className='mt-2 text-lg uppercase tracking-[0.16em]'>
              {loading ? '' : createdAt}
            </p>
          </div>
        </div>
        {!loading && paidAt && (
          <div className='text-xs uppercase tracking-[0.18em] text-[#0d0d0d]/70'>
            Paid at · {paidAt}
          </div>
        )}
        {!loading && error && (
          <div className='border border-[#b80000] bg-[#b80000]/10 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-[#b80000]'>
            {error}
          </div>
        )}
      </header>

      <section className='grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]'>
        <article className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff]'>
          <header className='flex items-center justify-between border-b border-[#0d0d0d] px-6 py-5 uppercase tracking-[0.2em]'>
            <span className='text-sm font-semibold'>Line items</span>
            <span className='text-xs text-[#4d5544]'>Inventory snapshot</span>
          </header>
          <div className='divide-y divide-[#0d0d0d]'>
            {(loading ? PLACEHOLDER_ITEMS : items).map((item, index) => {
              const key = item?.productId || `order-item-${index}`;
              const skeleton = loading || !item;
              const subtotal = skeleton
                ? ''
                : `${(item.subtotal || 0).toFixed(0)}₮`;
              return (
                <div
                  key={key}
                  className={`${
                    loading ? 'admin-placeholder' : ''
                  } grid gap-4 px-6 py-5 text-xs uppercase tracking-[0.16em] lg:grid-cols-[96px_minmax(0,1fr)_120px_90px]`}>
                  <div className='h-20 border border-[#0d0d0d]'>
                    {!skeleton && item.image && (
                      <img
                        src={item.image}
                        alt={`${item.name} visual`}
                        className='h-full w-full object-cover'
                      />
                    )}
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm tracking-[0.18em] text-[#4d5544]'>
                      {skeleton ? 'Syncing product' : item.name}
                    </span>
                    <span className='text-[11px] text-[#0d0d0d]/70'>
                      {skeleton ? 'Awaiting SKU' : `SKU ${item.sku}`}
                    </span>
                    {!skeleton && item.size && (
                      <span className='text-[11px] text-[#0d0d0d]/70'>
                        Size {item.size}
                      </span>
                    )}
                    {!skeleton && item.productId && (
                      <Link
                        href={`/admin/products/${item.productId}`}
                        className='text-[10px] uppercase tracking-[0.24em] text-[#0d0d0d] underline underline-offset-4'>
                        View product
                      </Link>
                    )}
                  </div>
                  <div className='text-right text-[#0d0d0d]/80'>
                    {skeleton
                      ? ''
                      : `${(item.unitPrice || 0).toFixed(0)} × ${
                          item.quantity
                        }₮`}
                  </div>
                  <div className='text-right text-[#4d5544]'>{subtotal}</div>
                </div>
              );
            })}
            {!loading && items.length === 0 && (
              <div className='px-6 py-10 text-center text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d]/60'>
                No products recorded for this order.
              </div>
            )}
          </div>
          <footer className='flex flex-col gap-3 border-t border-[#0d0d0d] px-6 py-5 text-xs uppercase tracking-[0.18em]'>
            <div className='flex justify-between'>
              <span>Subtotal</span>
              <span>{totals.subtotal.toFixed(0)}₮</span>
            </div>
            <div className='flex justify-between text-sm font-semibold'>
              <span>Total captured</span>
              <span>{totals.total.toFixed(0)}₮</span>
            </div>
          </footer>
        </article>

        <aside className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff]'>
          <header className='border-b border-[#0d0d0d] px-6 py-5 uppercase tracking-[0.2em]'>
            <span className='text-sm font-semibold'>Customer</span>
          </header>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } flex flex-col gap-3 px-6 py-5`}>
            <span className='text-sm uppercase tracking-[0.18em] text-[#4d5544]'>
              {loading ? 'Loading customer' : customer?.name || 'Customer'}
            </span>
            <span className='text-[11px] uppercase tracking-[0.16em] text-[#0d0d0d]/70'>
              {loading
                ? 'Awaiting email'
                : customer?.email || 'Email unavailable'}
            </span>
            {!loading && customer?.phone && (
              <span className='text-[11px] uppercase tracking-[0.16em] text-[#0d0d0d]/70'>
                Phone · {customer.phone}
              </span>
            )}
          </div>
          <div className='border-t border-[#0d0d0d] px-6 py-5 text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d]/70'>
            {loading
              ? 'Syncing timeline'
              : `Updated ${
                  detail?.updatedAt
                    ? new Date(detail.updatedAt).toLocaleString()
                    : '—'
                }`}
          </div>
        </aside>
      </section>
    </section>
  );
}
