'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import PriceDisplay from '@/app/shop/_components/PriceDisplay';
import {
  addCartItem,
  clearWishlist,
  fetchWishlist,
  removeWishlistItem,
} from '@/app/shop/_store/shopActions';

const formatCurrency = value => `${value.toFixed(0)}₮`;

const isSaleActive = product => {
  if (!product?.saleActive) return false;
  const price = Number(product.salePrice);
  if (!Number.isFinite(price)) return false;
  const now = Date.now();
  const start = product.saleStart
    ? new Date(product.saleStart).getTime()
    : null;
  const end = product.saleEnd ? new Date(product.saleEnd).getTime() : null;
  if (start && start > now) return false;
  if (end && end < now) return false;
  return true;
};

const resolvePricing = product => {
  const basePrice = Number(product?.price) || 0;
  const rawSale = Number(product?.salePrice);
  const saleEligible = isSaleActive(product) && Number.isFinite(rawSale);
  return {
    basePrice,
    salePrice: saleEligible ? rawSale : null,
    saleActive: saleEligible,
    unitPrice: saleEligible ? rawSale : basePrice,
  };
};

export default function ShopWishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mutating, setMutating] = useState('');

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWishlist();
      setItems(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load wishlist.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async productId => {
    try {
      setMutating(productId);
      const data = await removeWishlistItem(productId);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to update wishlist.');
    } finally {
      setMutating('');
    }
  };

  const handleMoveToCart = async (productId, sizeOptions = []) => {
    try {
      setMutating(productId);
      setError(null);

      await addCartItem({
        productId,
        quantity: 1,
        size: sizeOptions[0] || null,
      });

      const data = await removeWishlistItem(productId);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      const duration = err.duration || 3000;
      setTimeout(() => {
        setError(null);
      }, duration);
    }
  };

  const handleClear = async () => {
    try {
      setMutating('clear');
      const cleared = await clearWishlist();
      setItems(Array.isArray(cleared) ? cleared : []);
    } catch (err) {
      setError(err.message || 'Failed to clear wishlist.');
    } finally {
      setMutating('');
    }
  };

  const total = items.reduce((sum, product) => {
    const pricing = resolvePricing(product);
    return sum + pricing.unitPrice;
  }, 0);

  return (
    <section className='flex flex-col gap-12 text-[#0d0d0d]'>
      <header className='flex flex-col gap-3'>
        <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
          Saved edits
        </span>
        <h1 className='text-3xl font-semibold uppercase tracking-[0.12em] sm:text-4xl'>
          Wishlist
        </h1>
        <p className='max-w-2xl text-sm leading-7 text-[#0d0d0d]/70'>
          These favourites stay synced with the admin console for marketing
          follow-up. Add them to the cart when you are ready to secure the
          piece.
        </p>
      </header>

      {error && (
        <div className='border border-[#b33a3a] bg-[#b33a3a]/10 px-6 py-4 text-sm uppercase tracking-[0.18em] text-[#b33a3a]'>
          {error}
        </div>
      )}

      <div className='grid gap-6 sm:grid-cols-2'>
        {loading ? (
          <div className='border border-[#0d0d0d] bg-[#4d5544]/10 px-6 py-10 text-center text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
            Loading wishlist…
          </div>
        ) : items.length === 0 ? (
          <div className='border border-[#0d0d0d] bg-[#4d5544]/10 px-6 py-10 text-center text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
            Wishlist is empty.{' '}
            <Link href='/shop/products' className='underline'>
              Бүтээгдэхүүн үзэх
            </Link>
          </div>
        ) : (
          items.map(product => {
            const pricing = resolvePricing(product);
            const productId = product._id || product.id;
            return (
              <article
                key={productId}
                className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff] px-6 py-8'>
                <div className='flex flex-col gap-2'>
                  <h2 className='text-lg font-semibold uppercase tracking-[0.16em]'>
                    {product.name}
                  </h2>
                  <p className='text-sm leading-7 text-[#0d0d0d]/70'>
                    {product.description ||
                      'Awaiting narrative from the atelier archives.'}
                  </p>
                </div>
                <PriceDisplay
                  price={pricing.basePrice}
                  salePrice={pricing.salePrice}
                  saleActive={pricing.saleActive}
                  align='start'
                />
                <div className='mt-auto flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
                  <button
                    type='button'
                    onClick={() => handleRemove(productId)}
                    disabled={mutating === productId}
                    className='underline hover:text-[#0d0d0d] disabled:opacity-50'>
                    Remove
                  </button>
                  <button
                    type='button'
                    onClick={() =>
                      handleMoveToCart(productId, product.sizes || [])
                    }
                    disabled={mutating === productId}
                    className='border border-[#0d0d0d] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0d0d0d] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:opacity-50'>
                    Move to cart
                  </button>
                </div>
                {product.category?.id && (
                  <Link
                    href={`/shop/categories/${product.category.id}/products/${productId}`}
                    className='text-[11px] uppercase tracking-[0.2em] text-[#0d0d0d]/60 hover:text-[#0d0d0d]'>
                    View detail
                  </Link>
                )}
              </article>
            );
          })
        )}
      </div>

      <aside className='flex max-w-md flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
        <div className='flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#4d5544]'>
          <span>Wishlist value</span>
          <span className='text-[#0d0d0d]'>{formatCurrency(total)}</span>
        </div>
        <button
          type='button'
          onClick={handleClear}
          disabled={items.length === 0 || mutating === 'clear'}
          className='border border-[#0d0d0d] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0d0d0d] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:opacity-50'>
          Clear wishlist
        </button>
      </aside>
    </section>
  );
}
