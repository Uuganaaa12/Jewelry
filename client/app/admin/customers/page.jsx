'use client';

import { useEffect, useMemo, useState } from 'react';
import { getCustomerSnapshot } from '../_store/adminStore';

const placeholderRows = Array.from({ length: 6 });

export default function AdminCustomersPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      const data = await getCustomerSnapshot();
      if (!isMounted) return;
      setCustomers(data);
      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const aggregates = useMemo(() => {
    const total = customers.length;
    const spend = customers.reduce((sum, item) => sum + (item.spend || 0), 0);
    return { total, spend };
  }, [customers]);

  return (
    <section className='flex flex-col gap-12 text-[#0d0d0d]'>
      <header className='flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold uppercase tracking-[0.16em]'>
          Customer console
        </h1>
      </header>

      <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div
          className={`${
            loading ? 'admin-placeholder' : ''
          } flex flex-col gap-2 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6`}>
          <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
            Profiles captured
          </span>
          <span className='text-3xl font-semibold uppercase tracking-[0.1em]'>
            {loading ? '' : aggregates.total}
          </span>
        </div>
        <div
          className={`${
            loading ? 'admin-placeholder' : ''
          } flex flex-col gap-2 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6`}>
          <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
            Lifetime value
          </span>
          <span className='text-3xl font-semibold uppercase tracking-[0.1em]'>
            {loading ? '' : `${aggregates.spend.toFixed(0)}₮`}
          </span>
        </div>
        <div className='flex flex-col gap-2 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
          <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
            CRM status
          </span>
          <span className='text-sm uppercase tracking-[0.18em] text-[#0d0d0d]/70'>
            Integration pending
          </span>
        </div>
        <div className='flex flex-col gap-2 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
          <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
            Segmentation
          </span>
          <span className='text-sm uppercase tracking-[0.18em] text-[#0d0d0d]/70'>
            Manual grouping
          </span>
        </div>
      </section>

      <section className='border border-[#0d0d0d] bg-[#ffffff]'>
        <header className='flex items-center justify-between border-b border-[#0d0d0d] px-6 py-5 uppercase tracking-[0.2em]'>
          <span className='text-sm font-semibold'>Top patrons</span>
          <span className='text-xs text-[#4d5544]'>Derived from orders</span>
        </header>
        <div className='grid divide-y divide-[#0d0d0d]'>
          {(loading ? placeholderRows : customers).map((customer, index) => (
            <div
              key={customer?.id || `customer-row-${index}`}
              className={`${
                loading ? 'admin-placeholder' : ''
              } grid grid-cols-[minmax(0,1.6fr)_1fr_120px] items-center gap-4 px-6 py-5 text-xs uppercase tracking-[0.16em]`}>
              <div className='flex flex-col gap-1'>
                <span className='text-sm tracking-[0.18em] text-[#4d5544]'>
                  {loading ? 'Syncing customer' : customer.name}
                </span>
                <span className='text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d]/70'>
                  {loading ? 'Awaiting email' : customer.email}
                </span>
              </div>
              <span className='text-right'>
                {loading ? '' : `${customer.orders} orders`}
              </span>
              <span className='text-right text-[#4d5544]'>
                {loading ? '' : `${(customer.spend || 0).toFixed(0)}₮`}
              </span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
