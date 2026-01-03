'use client';

import { useState } from 'react';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';
import { addCartItem } from '../_store/shopActions';

export default function AddToCartForm({ productId, sizes = [], stock = 0 }) {
  const [selectedSize, setSelectedSize] = useState(
    sizes.length > 0 ? sizes[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState({ status: 'idle', message: '' });

  const requiresSize = sizes.length > 0;
  const maxQuantity = Math.min(stock || 99, 99);

  const handleSubmit = async () => {
    if (requiresSize && !selectedSize) {
      setState({ status: 'error', message: 'Хэмжээ сонгоно уу' });
      return;
    }

    if (quantity > stock) {
      setState({
        status: 'error',
        message: `Үлдэгдэл хангалтгүй (${stock} ширхэг)`,
      });
      return;
    }

    if (stock === 0) {
      setState({ status: 'error', message: 'Бараа дууссан байна' });
      return;
    }

    try {
      setState({ status: 'loading', message: '' });
      await addCartItem({
        productId,
        quantity,
        size: requiresSize ? selectedSize : null,
      });
      setState({ status: 'success', message: 'Сагсанд нэмэгдлээ' });
      setTimeout(() => setState({ status: 'idle', message: '' }), 3000);
    } catch (error) {
      setState({
        status: 'error',
        message: error.message || 'Алдаа гарлаа',
      });
    }
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(q => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <div className='flex flex-col gap-6 border border-[#0d0d0d] bg-[#ffffff] p-6'>
      {/* Хэмжээ сонгох */}
      {requiresSize ? (
        <div className='flex flex-col gap-3'>
          <label className='text-xs font-semibold uppercase tracking-[0.2em] text-[#4d5544]'>
            Хэмжээ
          </label>
          <div className='flex flex-wrap gap-2'>
            {sizes.map(size => (
              <button
                key={size}
                type='button'
                onClick={() => setSelectedSize(size)}
                className={`min-w-[60px] border px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] transition-all ${
                  selectedSize === size
                    ? 'border-[#0d0d0d] bg-[#0d0d0d] text-[#ffffff]'
                    : 'border-[#0d0d0d] bg-[#ffffff] text-[#0d0d0d] hover:bg-[#0d0d0d]/5'
                }`}>
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          <span className='text-xs font-semibold uppercase tracking-[0.2em] text-[#4d5544]'>
            Тохиргоо
          </span>
          <p className='text-xs leading-6 text-[#0d0d0d]/70'>
            Энэ бараа нэг хэмжээтэй
          </p>
        </div>
      )}

      {/* Тоо ширхэг */}
      <div className='flex flex-col gap-3'>
        <label className='text-xs font-semibold uppercase tracking-[0.2em] text-[#4d5544]'>
          Тоо ширхэг
        </label>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className='border border-[#0d0d0d] bg-[#ffffff] px-5 py-3 text-lg font-bold text-[#0d0d0d] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-[#ffffff] disabled:hover:text-[#0d0d0d]'>
            −
          </button>
          <span className='min-w-[60px] border border-[#0d0d0d] bg-[#ffffff] px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-[#0d0d0d]'>
            {quantity}
          </span>
          <button
            type='button'
            onClick={incrementQuantity}
            disabled={quantity >= maxQuantity}
            className='border border-[#0d0d0d] bg-[#ffffff] px-5 py-3 text-lg font-bold text-[#0d0d0d] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-[#ffffff] disabled:hover:text-[#0d0d0d]'>
            +
          </button>
          {stock > 0 && (
            <span className='ml-2 text-xs uppercase tracking-[0.18em] text-[#4d5544]'>
              (Үлдэгдэл: {stock})
            </span>
          )}
        </div>
      </div>

      {/* Мэдэгдэл мессеж */}
      {state.message && (
        <div
          className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.18em] ${
            state.status === 'error'
              ? 'bg-[#b33a3a]/10 text-[#b33a3a]'
              : 'bg-[#4d5544]/10 text-[#4d5544]'
          }`}>
          {state.status === 'success' && <CheckCircle2 size={14} />}
          {state.message}
        </div>
      )}

      {/* Сагсанд нэмэх товч */}
      <button
        type='button'
        onClick={handleSubmit}
        disabled={state.status === 'loading' || stock === 0}
        className='flex items-center justify-center gap-2 border border-[#0d0d0d] bg-[#0d0d0d] px-6 py-4 text-xs font-bold uppercase tracking-[0.24em] text-[#ffffff] transition-colors hover:bg-[#4d5544] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#0d0d0d]'>
        <ShoppingCart size={16} />
        {state.status === 'loading'
          ? 'Нэмж байна...'
          : stock === 0
          ? 'Дууссан'
          : 'Сагсанд нэмэх'}
      </button>
    </div>
  );
}
