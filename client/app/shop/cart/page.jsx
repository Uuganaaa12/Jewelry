'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PriceDisplay from '@/app/shop/_components/PriceDisplay';
import { useRouter } from 'next/navigation';
import {
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
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

const getProductId = product => product?._id || product?.id;

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

export default function ShopCartPage() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mutatingId, setMutatingId] = useState('');
  const router = useRouter();

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCart();
      setCart(data && data.items ? data : { items: [] });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load cart.');
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = async (item, quantity) => {
    const parsed = Number(quantity);
    if (!Number.isFinite(parsed) || parsed <= 0) return;

    try {
      setMutatingId(item._id);
      const updated = await updateCartItem({
        productId: getProductId(item.product),
        quantity: parsed,
        size: item.size || null,
      });
      setCart(updated && updated.items ? updated : { items: [] });
    } catch (err) {
      setError(err.message || 'Failed to update cart.');
    } finally {
      setMutatingId('');
    }
  };

  const handleRemove = async item => {
    try {
      setMutatingId(item._id);
      const updated = await removeCartItem(
        getProductId(item.product),
        item.size || null
      );
      setCart(updated && updated.items ? updated : { items: [] });
    } catch (err) {
      setError(err.message || 'Failed to remove cart item.');
    } finally {
      setMutatingId('');
    }
  };

  const handleClear = async () => {
    try {
      setMutatingId('clear');
      await clearCart();
      setCart({ items: [] });
    } catch (err) {
      setError(err.message || 'Failed to clear cart.');
    } finally {
      setMutatingId('');
    }
  };
  const handleCheckout = () => {
    if (cart.items.length > 0) {
      router.push('/shop/checkout');
    }
  };

  const summary = useMemo(() => {
    const items = cart.items || [];
    const lines = items.map(item => {
      const product = item.product || {};
      const pricing = resolvePricing(product);
      return {
        id: item._id,
        quantity: item.quantity,
        unitPrice: pricing.unitPrice,
        total: pricing.unitPrice * item.quantity,
      };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    return {
      subtotal,
      lines,
    };
  }, [cart.items]);

  return (
    <section className='flex flex-col gap-12 text-[#0d0d0d]'>
      <header className='flex flex-col gap-3'>
        <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
          Захиалга хийх
        </span>
        <h1 className='text-3xl font-semibold uppercase tracking-[0.12em] sm:text-4xl'>
          Сагс
        </h1>
      </header>

      {error && (
        <div className='border border-[#b33a3a] bg-[#b33a3a]/10 px-6 py-4 text-sm uppercase tracking-[0.18em] text-[#b33a3a]'>
          {error}
        </div>
      )}

      <div className='grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]'>
        <div className='flex flex-col gap-4'>
          {loading ? (
            <div className='border border-[#0d0d0d] bg-[#4d5544]/10 px-6 py-10 text-center text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
              Loading cart…
            </div>
          ) : cart.items.length === 0 ? (
            <div className='border border-[#0d0d0d] bg-[#4d5544]/10 px-6 py-10 text-center text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
              Таны сагс хоосон байна.{' '}
              <Link href='/shop/products' className='underline'>
                Бүтээгдэхүүн үзэх
              </Link>
            </div>
          ) : (
            cart.items.map(item => {
              const product = item.product || {};
              const pricing = resolvePricing(product);
              return (
                <article
                  key={item._id}
                  className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff] px-6 py-5 text-xs uppercase tracking-[0.2em] text-[#0d0d0d]'>
                  <div className='flex flex-col gap-1 text-left'>
                    <span className='text-sm font-semibold uppercase tracking-[0.18em]'>
                      {product.name || 'Product removed'}
                    </span>
                    <span className='text-[11px] text-[#0d0d0d]/70'>
                      Quantity
                      <select
                        value={item.quantity}
                        onChange={event =>
                          handleQuantityChange(item, event.target.value)
                        }
                        disabled={mutatingId === item._id}
                        className='ml-2 border border-[#0d0d0d] bg-transparent px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d]'>
                        {Array.from(
                          { length: 10 },
                          (_, index) => index + 1
                        ).map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {item.size && (
                        <span className='ml-3 text-[11px] text-[#0d0d0d]/60'>
                          Size · {item.size}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className='flex items-center justify-between gap-4'>
                    <PriceDisplay
                      price={pricing.basePrice}
                      salePrice={pricing.salePrice}
                      saleActive={pricing.saleActive}
                      align='start'
                    />
                    <span className='text-sm font-semibold text-[#0d0d0d]'>
                      {formatCurrency(
                        summary.lines.find(line => line.id === item._id)
                          ?.total || 0
                      )}
                    </span>
                  </div>

                  <div className='flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#4d5544]'>
                    <button
                      type='button'
                      onClick={() => handleRemove(item)}
                      disabled={mutatingId === item._id}
                      className='underline hover:text-[#0d0d0d] disabled:opacity-50'>
                      Remove
                    </button>
                    {product.category?.id && (
                      <Link
                        href={`/shop/categories/${
                          product.category.id
                        }/products/${getProductId(product)}`}
                        className='hover:text-[#0d0d0d]'>
                        View detail
                      </Link>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        <aside className='flex flex-col gap-5 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
          <div className='flex flex-col gap-2'>
            <h2 className='text-base font-semibold uppercase tracking-[0.18em]'>
              Summary
            </h2>
            <p className='text-[11px] leading-6 text-[#0d0d0d]/70'>
              Төлбөр төлөх хэсэгт хүргэлтийн үнэ нэмэгдэнэ.
            </p>
          </div>
          <div className='flex items-center justify-between border-t border-[#0d0d0d] pt-4 text-xs uppercase tracking-[0.2em] text-[#4d5544]'>
            <span>Дүн</span>
            <span className='text-[#0d0d0d]'>
              {formatCurrency(summary.subtotal)}
            </span>
          </div>
          <div className='flex flex-col gap-3'>
            <button
              type='button'
              disabled={cart.items.length === 0 || mutatingId === 'clear'}
              onClick={handleClear}
              className='border border-[#0d0d0d] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0d0d0d] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:opacity-50'>
              Сагс хоосон болгох
            </button>
            <button
              type='button'
              onClick={handleCheckout}
              disabled={cart.items.length === 0}
              className='border border-[#0d0d0d] bg-[#0d0d0d] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffffff] transition-colors hover:bg-[#4d5544] disabled:cursor-not-allowed disabled:opacity-50'>
              Төлбөр төлөх
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
