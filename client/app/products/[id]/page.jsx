import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import AddToCartForm from '@/app/shop/_components/AddToCartForm';
import AddToWishlistButton from '@/app/shop/_components/AddToWishlistButton';
import PriceDisplay from '@/app/shop/_components/PriceDisplay';
import ProductGallery from '@/app/shop/_components/ProductGallery';
import { getProductDetail } from '@/app/shop/_store/shopStore';

const formatCurrency = v => {
  const n = Number(v);
  return Number.isFinite(n) ? `${n.toLocaleString('mn-MN')}₮` : '0₮';
};

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProductDetail(id);

  if (!product) notFound();

  // Category байгаа бол тэр хуудас руу redirect
  if (product.category?.id) {
    redirect(`/shop/categories/${product.category.id}/products/${id}`);
  }

  const basePrice    = Number.isFinite(Number(product.price)) ? Number(product.price) : 0;
  const saleActive   = Boolean(product.saleActive) && Number.isFinite(Number(product.salePrice));
  const salePrice    = saleActive ? Number(product.salePrice) : null;
  const savings      = saleActive ? Math.max(basePrice - salePrice, 0) : 0;
  const savingsPct   = saleActive && basePrice > 0 ? Math.round((savings / basePrice) * 100) : null;
  const galleryImages = Array.isArray(product.images) ? product.images.filter(Boolean) : product.image ? [product.image] : [];

  return (
    <section className='flex flex-col gap-12 text-[#0d0d0d]'>
      <nav className='text-[11px] uppercase tracking-[0.24em] text-[#0d0d0d]/60'>
        <Link href='/shop' className='hover:text-[#0d0d0d]'>Нүүр</Link>
        <span className='mx-2'>/</span>
        <Link href='/shop/products' className='hover:text-[#0d0d0d]'>Бүтээгдэхүүн</Link>
        <span className='mx-2'>/</span>
        <span className='text-[#0d0d0d]'>{product.name}</span>
      </nav>

      <div className='grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'>
        <div className='flex flex-col gap-6'>
          <ProductGallery images={galleryImages} name={product.name} />
          <article className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
            <header className='flex flex-col gap-2'>
              <h1 className='text-3xl font-semibold uppercase tracking-[0.12em] sm:text-4xl'>
                {product.name}
              </h1>
              {saleActive && (
                <span className='inline-flex w-fit items-center gap-2 border border-[#b33a3a] bg-[#b33a3a]/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#b33a3a]'>
                  Хямдрал {savingsPct !== null && <span>{savingsPct}% хямд</span>}
                </span>
              )}
            </header>
            <p className='text-sm leading-7 text-[#0d0d0d]/75'>
              {product.description || 'Тайлбар нэмэгдээгүй байна'}
            </p>
            <dl className='grid gap-4 text-xs uppercase tracking-[0.2em] text-[#4d5544] sm:grid-cols-2'>
              <div className='flex flex-col gap-1'>
                <dt className='text-[#0d0d0d]/60'>Барааны код</dt>
                <dd className='text-[#0d0d0d]'>{product.sku || 'Оноогоогүй'}</dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-[#0d0d0d]/60'>Үлдэгдэл</dt>
                <dd className={product.stock > 0 ? 'text-[#4d5544]' : 'text-[#b33a3a]'}>
                  {product.stock > 0 ? `${product.stock} ширхэг` : 'Дууссан'}
                </dd>
              </div>
              {product.sizes?.length > 0 && (
                <div className='flex flex-col gap-1'>
                  <dt className='text-[#0d0d0d]/60'>Хэмжээ</dt>
                  <dd className='text-[#0d0d0d]'>{product.sizes.join(' · ')}</dd>
                </div>
              )}
              {product.tags?.length > 0 && (
                <div className='flex flex-col gap-1'>
                  <dt className='text-[#0d0d0d]/60'>Шошго</dt>
                  <dd className='text-[#0d0d0d]'>{product.tags.join(' · ')}</dd>
                </div>
              )}
            </dl>
          </article>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='border border-[#0d0d0d] bg-[#ffffff] p-6'>
            {saleActive && savings > 0 && (
              <div className='mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#b33a3a]'>
                <span className='border border-[#b33a3a] px-3 py-1'>Онцгой хямдрал</span>
                <span>Хэмнэлт: {formatCurrency(savings)}{savingsPct !== null ? ` (${savingsPct}%)` : ''}</span>
              </div>
            )}
            <PriceDisplay align='start' price={product.price} salePrice={salePrice} saleActive={saleActive} />
            <p className='mt-6 text-sm leading-7 text-[#0d0d0d]/70'>
              Захиалга бүр систем дээр бүртгэгдэж, хүргэлтийн явцыг хянах боломжтой.
            </p>
          </div>

          <AddToCartForm productId={product.id} sizes={product.sizes || []} stock={product.stock || 0} />

          <div className='border border-[#0d0d0d] bg-[#ffffff] p-6'>
            <span className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>Хойш үлдээх</span>
            <p className='mt-2 text-sm leading-7 text-[#0d0d0d]/70'>
              Таалагдсан бүтээгдэхүүнээ хадгалж, дараа нь үзэх боломжтой.
            </p>
            <div className='mt-4'>
              <AddToWishlistButton productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
