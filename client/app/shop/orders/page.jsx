'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyOrders } from '@/app/shop/_store/account';

const statusColor = status => {
  switch (status) {
    case 'paid':
      return 'border-[#2c7a4b] bg-[#2c7a4b]/10 text-[#2c7a4b]';
    case 'shipped':
      return 'border-[#1d4ed8] bg-[#1d4ed8]/10 text-[#1d4ed8]';
    case 'delivered':
      return 'border-[#0d9488] bg-[#0d9488]/10 text-[#0d9488]';
    case 'cancelled':
      return 'border-[#b33a3a] bg-[#b33a3a]/10 text-[#b33a3a]';
    default:
      return 'border-[#4d5544] bg-[#4d5544]/10 text-[#4d5544]';
  }
};

const formatDate = value => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('mn-MN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyOrders()
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className='text-sm uppercase tracking-[0.2em] text-[#4d5544]'>
        Захиалгуудыг ачаалж байна…
      </div>
    );
  if (error)
    return (
      <div className='border border-[#b33a3a] bg-[#b33a3a]/10 px-4 py-3 text-sm text-[#b33a3a]'>
        {error}
      </div>
    );

  if (!orders.length) {
    return (
      <div className='flex flex-col gap-3 text-sm'>
        <p className='text-[#0d0d0d]'>Одоогоор захиалга алга байна.</p>
        <Link href='/shop/products' className='underline'>
          Бүтээгдэхүүн үзэх
        </Link>
      </div>
    );
  }

  return (
    <div className='grid gap-4'>
      {orders.map(order => (
        <article
          key={order.id}
          className='grid gap-4 border border-[#0d0d0d] bg-[#ffffff] p-4 sm:grid-cols-[1fr_2fr] sm:gap-6'>
          <div className='flex flex-col gap-2 text-sm'>
            <div
              className={`inline-flex w-fit items-center gap-2 border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${statusColor(
                order.status
              )}`}>
              Статус: {order.status || 'pending'}
            </div>
            <span className='text-[#0d0d0d]'>
              Нийт дүн: {order.totalAmount?.toLocaleString()} ₮
            </span>
            <span className='text-[#4d5544] text-xs uppercase tracking-[0.18em]'>
              Төлбөр: {order.paymentMethod}
            </span>
            <span className='text-[#4d5544] text-xs uppercase tracking-[0.18em]'>
              Огноо: {formatDate(order.createdAt)}
            </span>
          </div>
          <div className='grid gap-3'>
            {order.items?.map(item => (
              <div
                key={`${item.productId}-${item.sku}-${item.size}`}
                className='flex flex-col gap-1 rounded border border-[#0d0d0d]/40 bg-[#f9f9f9] px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex flex-col gap-1'>
                  <span className='font-semibold uppercase tracking-[0.14em]'>
                    {item.name}
                  </span>
                  <span className='text-[11px] uppercase tracking-[0.18em] text-[#4d5544]'>
                    SKU: {item.sku}
                  </span>
                  {item.size && (
                    <span className='text-[11px] uppercase tracking-[0.18em] text-[#4d5544]'>
                      Хэмжээ: {item.size}
                    </span>
                  )}
                </div>
                <div className='flex flex-col items-start gap-1 text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d] sm:items-end'>
                  <span>Тоо: {item.quantity}</span>
                  <span>Нэгж: {item.unitPrice?.toLocaleString()} ₮</span>
                  {item.saleActive && item.salePrice && (
                    <span className='text-[#b33a3a]'>
                      Хямдрал: {item.salePrice.toLocaleString()} ₮
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
