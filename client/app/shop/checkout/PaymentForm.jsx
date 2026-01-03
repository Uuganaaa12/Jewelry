import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const PAYMENT_METHODS = [
  {
    value: 'card',
    title: 'Карт',
    description: 'Visa, Mastercard, American Express',
  },
  {
    value: 'qpay',
    title: 'QPay',
    description: 'Гар утасны апп ашиглан',
  },
];

export default function PaymentForm({
  paymentMethod,
  loading,
  onBack,
  onSubmit,
}) {
  const [selectedMethod, setSelectedMethod] = useState(paymentMethod);

  const handleSubmit = () => {
    if (selectedMethod) {
      onSubmit(selectedMethod);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <button
        type='button'
        onClick={onBack}
        className='flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#4d5544] hover:text-[#0d0d0d]'>
        <ChevronLeft size={16} />
        Буцах
      </button>

      <div className='flex flex-col gap-6 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
        <h2 className='text-lg font-semibold uppercase tracking-[0.18em]'>
          Төлбөрийн хэрэгсэл
        </h2>

        <div className='flex flex-col gap-4'>
          {PAYMENT_METHODS.map(method => (
            <PaymentOption
              key={method.value}
              value={method.value}
              title={method.title}
              description={method.description}
              selected={selectedMethod === method.value}
              onSelect={setSelectedMethod}
            />
          ))}
        </div>

        <button
          type='button'
          onClick={handleSubmit}
          disabled={!selectedMethod || loading}
          className='border border-[#0d0d0d] bg-[#0d0d0d] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffffff] transition-colors hover:bg-[#4d5544] disabled:cursor-not-allowed disabled:opacity-50'>
          {loading ? 'Боловсруулж байна...' : 'Төлбөр хийх'}
        </button>
      </div>
    </div>
  );
}

function PaymentOption({ value, title, description, selected, onSelect }) {
  return (
    <label className='flex cursor-pointer items-center gap-4 border border-[#0d0d0d] p-4 transition-colors hover:bg-[#4d5544]/5'>
      <input
        type='radio'
        name='payment'
        value={value}
        checked={selected}
        onChange={e => onSelect(e.target.value)}
        className='h-4 w-4'
      />
      <div className='flex flex-col gap-1'>
        <span className='text-sm font-semibold uppercase tracking-[0.18em]'>
          {title}
        </span>
        <span className='text-xs text-[#0d0d0d]/70'>{description}</span>
      </div>
    </label>
  );
}
