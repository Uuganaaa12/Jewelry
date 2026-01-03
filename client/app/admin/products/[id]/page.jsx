'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getProductDetail } from '../../_store/adminStore';

const PLACEHOLDER_IMAGES = Array.from({ length: 4 });

const resolveSaleState = product => {
  if (!product) {
    return {
      active: false,
      label: 'Scheduled',
    };
  }
  const saleActive = Boolean(product.saleActive);
  const salePrice = Number(product.salePrice);
  const hasSalePrice = Number.isFinite(salePrice);
  const now = Date.now();
  const startTime = product.saleStart
    ? new Date(product.saleStart).getTime()
    : null;
  const endTime = product.saleEnd ? new Date(product.saleEnd).getTime() : null;
  const currentlyRunning =
    saleActive &&
    hasSalePrice &&
    (!startTime || startTime <= now) &&
    (!endTime || endTime >= now);
  let label = 'Inactive';
  if (currentlyRunning) {
    label = 'Active';
  } else if (saleActive && hasSalePrice && startTime && startTime > now) {
    label = 'Scheduled';
  } else if (saleActive && hasSalePrice && endTime && endTime < now) {
    label = 'Expired';
  }
  return {
    active: currentlyRunning,
    label,
    price: hasSalePrice ? salePrice : null,
    start: product.saleStart || null,
    end: product.saleEnd || null,
  };
};

const formatDateTime = value => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return '—';
  }
};

export default function AdminProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productIdRaw = params?.id;
  const productId = Array.isArray(productIdRaw)
    ? productIdRaw[0]
    : productIdRaw || '';
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productId) return;
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await getProductDetail(productId);
        if (!active) return;
        if (!response) {
          setError('Бүтээгдэхүүн олдсонгүй.');
          setDetail(null);
        } else {
          setDetail(response);
        }
      } catch (err) {
        if (!active) return;
        console.error('Failed to load product detail', err);
        setError('Бүтээгдэхүүний мэдээлэл татахад алдаа гарлаа.');
        setDetail(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [productId]);

  const sale = useMemo(() => resolveSaleState(detail), [detail]);
  const images = detail?.images || [];
  const categoryName =
    typeof detail?.category === 'object'
      ? detail?.category?.name || 'Unassigned'
      : detail?.category || 'Unassigned';

  return (
    <section className='flex flex-col gap-10 text-[#0d0d0d]'>
      <header className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-2xl font-semibold uppercase tracking-[0.14em]'>
              Product detail
            </h1>
            <p className='text-xs uppercase tracking-[0.18em] text-[#0d0d0d]/70'>
              {productId
                ? `Reference #${productId.slice(-6)}`
                : 'Reference pending'}
            </p>
          </div>
          <div className='flex gap-3'>
            <button
              type='button'
              onClick={() => router.back()}
              className='border border-[#0d0d0d] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
              Go back
            </button>
            <Link
              href='/admin/products'
              className='border border-dashed border-[#0d0d0d] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors hover:border-solid hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
              Product console
            </Link>
          </div>
        </div>
        {!loading && error && (
          <div className='border border-[#b80000] bg-[#b80000]/10 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-[#b80000]'>
            {error}
          </div>
        )}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } border border-[#0d0d0d] bg-[#ffffff] px-4 py-4`}>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              Name
            </span>
            <p className='mt-2 text-lg uppercase tracking-[0.16em]'>
              {loading ? '' : detail?.name || 'Unnamed product'}
            </p>
          </div>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } border border-[#0d0d0d] bg-[#ffffff] px-4 py-4`}>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              SKU
            </span>
            <p className='mt-2 text-lg uppercase tracking-[0.16em]'>
              {loading ? '' : detail?.sku || '—'}
            </p>
          </div>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } border border-[#0d0d0d] bg-[#ffffff] px-4 py-4`}>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              Price
            </span>
            <p className='mt-2 text-lg uppercase tracking-[0.16em]'>
              {loading ? '' : `${(detail?.price || 0).toFixed(0)}₮`}
            </p>
          </div>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } border border-[#0d0d0d] bg-[#ffffff] px-4 py-4`}>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              Stock
            </span>
            <p className='mt-2 text-lg uppercase tracking-[0.16em]'>
              {loading ? '' : detail?.stock ?? 0}
            </p>
          </div>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } border border-[#0d0d0d] bg-[#ffffff] px-4 py-4`}>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              Category
            </span>
            <p className='mt-2 text-lg uppercase tracking-[0.16em]'>
              {loading ? '' : categoryName}
            </p>
          </div>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } border border-[#0d0d0d] bg-[#ffffff] px-4 py-4`}>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              Size options
            </span>
            <p className='mt-2 text-lg uppercase tracking-[0.16em]'>
              {loading
                ? ''
                : detail?.sizes && detail.sizes.length > 0
                ? detail.sizes.join(', ')
                : '—'}
            </p>
          </div>
        </div>
      </header>

      <section className='grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]'>
        <article className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff]'>
          <header className='flex items-center justify-between border-b border-[#0d0d0d] px-6 py-5 uppercase tracking-[0.2em]'>
            <span className='text-sm font-semibold'>Imagery</span>
            <span className='text-xs text-[#4d5544]'>Primary assets</span>
          </header>
          <div className='grid gap-4 p-6 sm:grid-cols-2'>
            {(loading ? PLACEHOLDER_IMAGES : images).map((image, index) => (
              <div
                key={image || `image-${index}`}
                className={`${
                  loading ? 'admin-placeholder' : ''
                } h-52 border border-[#0d0d0d] bg-[#ffffff]`}>
                {!loading && image && (
                  <img
                    src={image}
                    alt={`${detail?.name || 'Product'} visual ${index + 1}`}
                    className='h-full w-full object-cover'
                  />
                )}
              </div>
            ))}
            {!loading && images.length === 0 && (
              <div className='border border-dashed border-[#0d0d0d] px-4 py-12 text-center text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d]/60'>
                No imagery uploaded yet.
              </div>
            )}
          </div>
        </article>

        <aside className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff]'>
          <header className='border-b border-[#0d0d0d] px-6 py-5 uppercase tracking-[0.2em]'>
            <span className='text-sm font-semibold'>Sale state</span>
          </header>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } flex flex-col gap-3 px-6 py-5`}>
            <span className='text-sm uppercase tracking-[0.18em] text-[#4d5544]'>
              {loading ? 'Loading sale status' : sale.label}
            </span>
            {!loading && sale.price !== null && (
              <span className='text-[11px] uppercase tracking-[0.16em] text-[#0d0d0d]/70'>
                Sale price · {sale.price.toFixed(0)}₮
              </span>
            )}
            {!loading && sale.start && (
              <span className='text-[11px] uppercase tracking-[0.16em] text-[#0d0d0d]/70'>
                Starts · {formatDateTime(sale.start)}
              </span>
            )}
            {!loading && sale.end && (
              <span className='text-[11px] uppercase tracking-[0.16em] text-[#0d0d0d]/70'>
                Ends · {formatDateTime(sale.end)}
              </span>
            )}
            {!loading && sale.price === null && (
              <span className='text-[11px] uppercase tracking-[0.16em] text-[#0d0d0d]/50'>
                No sale pricing configured.
              </span>
            )}
          </div>
          <header className='border-y border-[#0d0d0d] px-6 py-5 uppercase tracking-[0.2em]'>
            <span className='text-sm font-semibold'>Metadata</span>
          </header>
          <div
            className={`${
              loading ? 'admin-placeholder' : ''
            } flex flex-col gap-3 px-6 py-5 text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d]/70`}>
            <span>
              Created · {loading ? '' : formatDateTime(detail?.createdAt)}
            </span>
            <span>
              Updated · {loading ? '' : formatDateTime(detail?.updatedAt)}
            </span>
            {!loading &&
              Array.isArray(detail?.tags) &&
              detail.tags.length > 0 && (
                <span>Tags · {detail.tags.join(', ')}</span>
              )}
          </div>
        </aside>
      </section>

      <article className='border border-[#0d0d0d] bg-[#ffffff]'>
        <header className='border-b border-[#0d0d0d] px-6 py-5 uppercase tracking-[0.2em]'>
          <span className='text-sm font-semibold'>Description</span>
        </header>
        <div
          className={`${
            loading ? 'admin-placeholder' : ''
          } px-6 py-6 text-sm leading-7 text-[#0d0d0d]/80`}>
          {loading
            ? ''
            : detail?.description || 'No description has been provided yet.'}
        </div>
      </article>
    </section>
  );
}
