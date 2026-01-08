import { ChevronLeft } from 'lucide-react';

const BANK_NAME = process.env.NEXT_PUBLIC_BANK_NAME || 'KhanBank';
const BANK_ACCOUNT = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '5156215729';
const BANK_HOLDER = process.env.NEXT_PUBLIC_BANK_HOLDER || 'UuganBayar';
import { clearCart } from '@/app/shop/_store/shopActions';

export default function PaymentForm({
  loading,
  onBack,
  onSubmit,
  paymentCode,
}) {
  const handleSubmit = () => {
    onSubmit();
  };
  const handleClear = async () => {
    try {
      await clearCart();
    } catch (err) {
      setError(err.message || 'Failed to clear cart.');
    }
  };
  return (
    <div className='flex flex-col gap-6'>
      <button
        type='button'
        onClick={onBack}
        className='flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#4d5544] hover:text-[#0d0d0d] hover:cursor-pointer'>
        <ChevronLeft size={16} />
        Буцах
      </button>

      <div className='flex flex-col gap-6 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
        <h2 className='text-lg font-semibold uppercase tracking-[0.18em]'>
          Төлбөр шилжүүлэх заавар
        </h2>
        <p className='text-sm leading-6 text-[#0d0d0d]/70'>
          Захиалга баталгаажсаны дараа 5 оронтой код үүснэ. Тэр кодыг гүйлгээний
          утганд бичиж, дэлгүүрийн харилцах данс руу шилжүүлээд "Төлбөр хийсэн"
          товчыг дарна уу.
        </p>
        <div className='grid gap-2 rounded-md border border-[#0d0d0d] bg-[#f7f7f7] px-4 py-3 text-sm uppercase tracking-[0.12em] text-[#0d0d0d]'>
          <span className='font-semibold'>БАНКИНД ШИЛЖҮҮЛЭХ ЗААВАР</span>
          <span className='text-[12px] text-[#4d5544]'>
            Доорх данс руу 5 оронтой кодоо (жишээ: 23686) гүйлгээний утганд
            бичиж шилжүүлнэ үү.
          </span>
          <span>{BANK_NAME}</span>
          <span>{BANK_ACCOUNT}</span>
          <span>{BANK_HOLDER}</span>
          <span className='text-[12px] text-[#4d5544]'>{paymentCode}</span>
        </div>
        <button
          type='button'
          onClick={async () => {
            await handleSubmit();
            await handleClear();
          }}
          disabled={loading}
          className='border border-[#0d0d0d] bg-[#0d0d0d] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffffff] transition-colors hover:bg-[#4d5544] disabled:cursor-not-allowed disabled:opacity-50'>
          {loading ? 'Боловсруулж байна...' : 'Төлбөр хийсэн'}
        </button>
      </div>
    </div>
  );
}
