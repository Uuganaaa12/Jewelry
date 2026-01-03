'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getOrdersPage, updateOrderStatus } from '../_store/adminStore';

const PAGE_SIZE = 10;
const placeholderRows = Array.from({ length: PAGE_SIZE });
const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];
const statusLabelMap = statusOptions.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});
const adminStatusTargets = ['shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: PAGE_SIZE,
  });
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalValue: 0,
    openCount: 0,
  });
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    (async () => {
      try {
        const response = await getOrdersPage({ page, limit: PAGE_SIZE });
        if (!active) return;

        const nextPagination = response?.pagination || {};
        const totalOrders = nextPagination.total ?? 0;
        const receivedPage = nextPagination.page ?? page;
        const totalPages = Math.max(nextPagination.pages ?? 1, 1);

        if (receivedPage !== page) {
          setPage(receivedPage);
          return;
        }

        if (totalPages > 0 && page > totalPages) {
          setPage(totalPages);
          return;
        }

        setOrders(response?.items || []);
        setPagination({
          page: receivedPage,
          pages: totalPages,
          total: totalOrders,
          limit: nextPagination.limit ?? PAGE_SIZE,
        });
        setSummary({
          totalOrders,
          totalValue: response?.summary?.totalValue ?? 0,
          openCount: response?.summary?.openCount ?? 0,
        });
      } catch (error) {
        if (!active) return;
        console.error('Failed to load admin orders feed', error);
        setOrders([]);
        setPagination({
          page,
          pages: 1,
          total: 0,
          limit: PAGE_SIZE,
        });
        setSummary({
          totalOrders: 0,
          totalValue: 0,
          openCount: 0,
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [page, refreshToken]);

  const handleStatusChange = async (orderId, nextStatus) => {
    if (!orderId || !nextStatus) return;
    const currentStatus = orders.find(order => order.id === orderId)?.status;
    if (!currentStatus || currentStatus === nextStatus) return;
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, nextStatus);
      alert('Захиалгын төлөв шинэчлэгдлээ.');
      setRefreshToken(token => token + 1);
    } catch (error) {
      console.error('Failed to update order status', error);
      alert('Төлөв шинэчлэхэд алдаа гарлаа.');
    } finally {
      setUpdating(null);
    }
  };

  const currentPage = pagination.page || page;
  const totalPages = Math.max(pagination.pages || 1, 1);
  const canPrev = !loading && currentPage > 1;
  const canNext = !loading && currentPage < totalPages;

  const handlePrev = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };

  return (
    <section className='flex flex-col gap-12 text-[#0d0d0d]'>
      <header className='flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold uppercase tracking-[0.16em]'>
          Order console
        </h1>
        <p className='max-w-2xl text-sm leading-7 text-[#0d0d0d]/70'>
          Review incoming purchases, payment capture methods, and customer reach
          straight from the REST service.
        </p>
      </header>

      <aside className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div
          className={`${
            loading ? 'admin-placeholder' : ''
          } flex flex-col gap-2 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6`}>
          <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
            Orders logged
          </span>
          <span className='text-3xl font-semibold uppercase tracking-[0.1em]'>
            {loading ? '' : summary.totalOrders}
          </span>
        </div>
        <div
          className={`${
            loading ? 'admin-placeholder' : ''
          } flex flex-col gap-2 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6`}>
          <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
            Captured value
          </span>
          <span className='text-3xl font-semibold uppercase tracking-[0.1em]'>
            {loading ? '' : `${summary.totalValue.toFixed(0)}₮`}
          </span>
        </div>
        <div
          className={`${
            loading ? 'admin-placeholder' : ''
          } flex flex-col gap-2 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6`}>
          <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
            Open fulfilment
          </span>
          <span className='text-3xl font-semibold uppercase tracking-[0.1em]'>
            {loading ? '' : summary.openCount}
          </span>
        </div>
        <div className='flex flex-col gap-2 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
          <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
            Sync cadence
          </span>
          <span className='text-sm uppercase tracking-[0.18em] text-[#0d0d0d]/70'>
            Continuous
          </span>
        </div>
      </aside>

      <section className='border border-[#0d0d0d] bg-[#ffffff]'>
        <header className='flex items-center justify-between border-b border-[#0d0d0d] px-6 py-5 uppercase tracking-[0.2em]'>
          <span className='text-sm font-semibold'>Order register</span>
          <span className='text-xs text-[#4d5544]'>Streaming</span>
        </header>
        <div className='grid divide-y divide-[#0d0d0d]'>
          {(loading ? placeholderRows : orders).map((order, index) => {
            const key = order?.id || `order-row-${index}`;
            const isSkeleton = loading || !order;
            const formattedTotal = !isSkeleton
              ? `${(order.total || 0).toFixed(0)}₮`
              : '';

            return (
              <div
                key={key}
                className={`${
                  loading ? 'admin-placeholder' : ''
                } grid grid-cols-[minmax(0,1.8fr)_110px_110px_1fr_160px] items-center gap-4 px-6 py-5 text-xs uppercase tracking-[0.16em]`}>
                <div className='flex flex-col gap-1'>
                  <span className='text-sm tracking-[0.18em] text-[#4d5544]'>
                    {isSkeleton ? 'Syncing order' : order.user}
                  </span>
                  <span className='text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d]/70'>
                    {isSkeleton
                      ? 'Awaiting timestamp'
                      : order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : 'Scheduled'}
                  </span>
                  {!isSkeleton && order?.id && (
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className='text-[10px] uppercase tracking-[0.24em] text-[#0d0d0d] underline underline-offset-4'>
                      View detail
                    </Link>
                  )}
                </div>
                <span className='text-right text-[#0d0d0d]/70'>
                  {isSkeleton ? '' : order?.id ? `#${order.id.slice(-6)}` : '—'}
                </span>
                <span className='text-right'>{formattedTotal}</span>
                <span className='text-right text-[#4d5544]'>
                  {isSkeleton ? '' : order.payment}
                </span>
                <div className='flex justify-end'>
                  {isSkeleton ? (
                    <span className='text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d]/50'>
                      Updating status
                    </span>
                  ) : (
                    <select
                      name='status'
                      value={order.status}
                      onChange={event =>
                        handleStatusChange(order.id, event.target.value)
                      }
                      disabled={
                        updating === order.id ||
                        ['delivered', 'cancelled'].includes(order.status)
                      }
                      className='border border-[#0d0d0d] bg-[#ffffff] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d] focus:outline-none disabled:bg-[#0d0d0d]/10 disabled:text-[#0d0d0d]/60'>
                      <option value={order.status} disabled>
                        {statusLabelMap[order.status] || order.status}
                      </option>
                      {adminStatusTargets
                        .filter(target => target !== order.status)
                        .map(value => (
                          <option key={value} value={value}>
                            {statusLabelMap[value] || value}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              </div>
            );
          })}
          {!loading && orders.length === 0 && (
            <div className='px-6 py-10 text-center text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d]/60'>
              Paid orders will appear here once captured.
            </div>
          )}
        </div>
        <footer className='flex items-center justify-between border-t border-[#0d0d0d] px-6 py-4 text-[11px] uppercase tracking-[0.18em]'>
          <button
            type='button'
            onClick={handlePrev}
            disabled={!canPrev}
            className='border border-[#0d0d0d] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0d0d0d] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:cursor-not-allowed disabled:border-[#4d5544] disabled:text-[#0d0d0d]/40'>
            Previous
          </button>
          <span className='text-xs tracking-[0.22em] text-[#0d0d0d]/70'>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type='button'
            onClick={handleNext}
            disabled={!canNext}
            className='border border-[#0d0d0d] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0d0d0d] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:cursor-not-allowed disabled:border-[#4d5544] disabled:text-[#0d0d0d]/40'>
            Next
          </button>
        </footer>
      </section>
    </section>
  );
}
