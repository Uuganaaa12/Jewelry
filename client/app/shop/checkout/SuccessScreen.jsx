import { Check, Copy } from 'lucide-react';

const BANK_NAME = process.env.NEXT_PUBLIC_BANK_NAME || 'Хүлээн авах банк';
const BANK_ACCOUNT =
  process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0000000000 (дансны дугаар)';
const BANK_HOLDER =
  process.env.NEXT_PUBLIC_BANK_HOLDER || 'Хүлээн авагчийн нэр /Дансны нэр/';

export default function SuccessScreen({ paymentCode, total }) {
  const copyCode = () => {
    if (!paymentCode) return;
    navigator.clipboard?.writeText?.(paymentCode).catch(() => {});
  };

  return (
    <div className='flex flex-col items-center gap-6 border border-[#0d0d0d] bg-[#ffffff] px-6 py-12 text-center'>
      <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white'>
        <Check size={32} />
      </div>

      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-semibold uppercase tracking-[0.18em] text-[#0d0d0d]'>
          Амжилттай
        </h2>
        <p className='text-sm text-[#0d0d0d]/70'>Захиалга амжилттай хийгдлээ</p>
      </div>

      <div className='w-full border-t border-[#0d0d0d] pt-6'>
        <div className='flex flex-col gap-3 text-left'>
          {paymentCode && (
            <OrderDetailRow
              label='Төлбөрийн код:'
              value={
                <span className='inline-flex items-center gap-2'>
                  <span>{paymentCode}</span>
                  <button
                    type='button'
                    onClick={copyCode}
                    className='text-[10px] uppercase tracking-[0.24em] text-[#4d5544] underline underline-offset-4 hover:cursor-pointer'>
                    <Copy size={12} />
                  </button>
                </span>
              }
            />
          )}
        </div>
      </div>

      {paymentCode && (
        <div className='w-full border-t border-[#0d0d0d] pt-6 text-left'>
          <div className='flex flex-col gap-3 text-sm uppercase tracking-[0.16em] text-[#0d0d0d]'>
            <p className='font-semibold'>БАНКИНД ШИЛЖҮҮЛЭХ ЗААВАР</p>
            <p className='text-[12px] text-[#4d5544]'>
              Доорх данс руу {paymentCode} кодыг гүйлгээний утганд бичиж
              шилжүүлнэ үү.
            </p>
            <div className='grid gap-2 rounded-md border border-[#0d0d0d] bg-[#f7f7f7] px-4 py-3'>
              <span>{BANK_NAME}</span>
              <span>{BANK_ACCOUNT}</span>
              <span>{BANK_HOLDER}</span>
              <span className='text-[12px] text-[#4d5544]'>
                Утга: {paymentCode}
              </span>
              <span className='text-[12px] text-[#4d5544]'>Дүн: {total}₮</span>
            </div>
          </div>
        </div>
      )}

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
