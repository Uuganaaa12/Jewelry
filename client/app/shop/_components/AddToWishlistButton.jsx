'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { addWishlistItem } from '../_store/shopActions';

export default function AddToWishlistButton({ productId }) {
  const [state, setState] = useState({ status: 'idle', message: '' });

  const handleClick = async () => {
    try {
      setState({ status: 'loading', message: '' });
      await addWishlistItem(productId);
      setState({ status: 'success', message: 'Хадгалсан' });
      setTimeout(() => setState({ status: 'idle', message: '' }), 2500);
    } catch (err) {
      setState({
        status: 'error',
        message: err.message || 'Алдаа гарлаа',
      });

      const duration = err.duration || 3000;
      setTimeout(() => {
        setState({ status: 'idle', message: '' });
      }, duration);
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      <button
        type='button'
        onClick={handleClick}
        disabled={state.status === 'loading'}
        className='flex items-center justify-center gap-2 border border-[#0d0d0d] px-6 py-4 text-xs font-bold uppercase tracking-[0.24em] text-[#0d0d0d] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:cursor-not-allowed disabled:opacity-50'>
        <Heart size={16} />
        {state.status === 'loading' ? 'Хадгалж байна...' : 'Хадгалах'}
      </button>
      {state.message && (
        <span
          className={`text-center text-xs uppercase tracking-[0.18em] ${
            state.status === 'error' ? 'text-[#b33a3a]' : 'text-[#4d5544]'
          }`}>
          {state.message}
        </span>
      )}
    </div>
  );
}
