import { Check } from 'lucide-react';

export default function SuccessScreen({ orderId, paymentMethod }) {
  const displayOrderId = orderId || `ORD-${Math.floor(Math.random() * 10000)}`;

  return (
    <div className='flex flex-col items-center gap-6 border border-[#0d0d0d] bg-[#ffffff] px-6 py-12 text-center'>
      <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white'>
        <Check size={32} />
      </div>

      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-semibold uppercase tracking-[0.18em] text-[#0d0d0d]'>
          Амжилттай
        </h2>
        <p className='text-sm text-[#0d0d0d]/70'>
          Таны захиалга амжилттай баталгаажлаа
        </p>
      </div>

      <div className='w-full border-t border-[#0d0d0d] pt-6'>
        <div className='flex flex-col gap-3 text-left'>
          <OrderDetailRow
            label='Статус:'
            value='Paid'
            valueClass='font-semibold uppercase tracking-[0.18em] text-green-600'
          />
          <OrderDetailRow
            label='Захиалгын дугаар:'
            value={`#${displayOrderId}`}
          />
          <OrderDetailRow
            label='Төлбөрийн хэрэгсэл:'
            value={paymentMethod}
            valueClass='uppercase'
          />
        </div>
      </div>

      <button
        type='button'
        onClick={() => (window.location.href = '/shop/products')}
        className='mt-4 border border-[#0d0d0d] bg-[#0d0d0d] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffffff] transition-colors hover:bg-[#4d5544]'>
        Үргэлжлүүлэн худалдаж авах
      </button>
    </div>
  );
}

function OrderDetailRow({ label, value, valueClass = 'font-semibold' }) {
  return (
    <div className='flex items-center justify-between text-sm'>
      <span className='text-[#4d5544]'>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
