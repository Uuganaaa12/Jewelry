import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartForm from '@/app/shop/_components/AddToCartForm';
import AddToWishlistButton from '@/app/shop/_components/AddToWishlistButton';
import PriceDisplay from '@/app/shop/_components/PriceDisplay';
import ProductGallery from '@/app/shop/_components/ProductGallery';
import {
  getCategoryDetail,
  getProductDetail,
} from '@/app/shop/_store/shopStore';

const formatDate = value => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('mn-MN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatCurrency = value => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0₮';
  return `${numeric.toLocaleString('mn-MN')}₮`;
};

export default async function ProductDetailPage({ params }) {
  const { categoryId, productId } = await params;
  const [product, category] = await Promise.all([
    getProductDetail(productId),
    getCategoryDetail(categoryId),
  ]);

  if (!product || !category) {
    notFound();
  }

  if (product.category?.id && product.category.id !== categoryId) {
    notFound();
  }

  const saleWindowStart = formatDate(product.saleStart);
  const saleWindowEnd = formatDate(product.saleEnd);
  const galleryImages = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : product.image
    ? [product.image]
    : [];
  const parsedPrice = Number(product.price);
  const basePrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;
  const parsedSalePrice = Number(product.salePrice);
  const saleActive =
    Boolean(product.saleActive) && Number.isFinite(parsedSalePrice);
  const effectiveSalePrice = saleActive ? parsedSalePrice : null;
  const savingsValue = saleActive
    ? Math.max(basePrice - parsedSalePrice, 0)
    : 0;
  const savingsPercent =
    saleActive && basePrice > 0
      ? Math.round(((basePrice - parsedSalePrice) / basePrice) * 100)
      : null;

  return (
    <section className='flex flex-col gap-12 text-[#0d0d0d]'>
      <nav className='text-[11px] uppercase tracking-[0.24em] text-[#0d0d0d]/60'>
        <Link href='/shop' className='hover:text-[#0d0d0d]'>
          Нүүр
        </Link>
        <span className='mx-2'>/</span>
        <Link href='/shop/collections' className='hover:text-[#0d0d0d]'>
          Цуглуулга
        </Link>
        <span className='mx-2'>/</span>
        <Link
          href={`/shop/categories/${category.id}`}
          className='hover:text-[#0d0d0d]'>
          {category.name}
        </Link>
        <span className='mx-2'>/</span>
        <span className='text-[#0d0d0d]'>{product.name}</span>
      </nav>

      <div className='grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'>
        <div className='flex flex-col gap-6'>
          <ProductGallery images={galleryImages} name={product.name} />
          <article className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
            <header className='flex flex-col gap-2'>
              <span className='text-xs uppercase tracking-[0.24em] text-[#4d5544]'>
                {category.name}
              </span>
              <h1 className='text-3xl font-semibold uppercase tracking-[0.12em] sm:text-4xl'>
                {product.name}
              </h1>
              {saleActive && (
                <span className='inline-flex w-fit items-center gap-2 border border-[#b33a3a] bg-[#b33a3a]/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#b33a3a]'>
                  Хямдрал
                  {savingsPercent !== null && (
                    <span className='text-[#b33a3a]/80'>
                      {savingsPercent}% хямд
                    </span>
                  )}
                </span>
              )}
            </header>
            <p className='text-sm leading-7 text-[#0d0d0d]/75'>
              {product.description || 'Тайлбар нэмэгдээгүй байна'}
            </p>
            <dl className='grid gap-4 text-xs uppercase tracking-[0.2em] text-[#4d5544] sm:grid-cols-2'>
              <div className='flex flex-col gap-1'>
                <dt className='text-[#0d0d0d]/60'>Барааны код</dt>
                <dd className='text-[#0d0d0d]'>
                  {product.sku || 'Оноогоогүй'}
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-[#0d0d0d]/60'>Үлдэгдэл</dt>
                <dd
                  className={
                    product.stock > 0 ? 'text-[#4d5544]' : 'text-[#b33a3a]'
                  }>
                  {product.stock > 0 ? `${product.stock} ширхэг` : 'Дууссан'}
                </dd>
              </div>
              {product.sizes?.length > 0 && (
                <div className='flex flex-col gap-1'>
                  <dt className='text-[#0d0d0d]/60'>Хэмжээ</dt>
                  <dd className='text-[#0d0d0d]'>
                    {product.sizes.join(' · ')}
                  </dd>
                </div>
              )}
              {saleActive && (
                <div className='flex flex-col gap-1 text-[#b33a3a]'>
                  <dt className='uppercase tracking-[0.24em]'>
                    Хямдралын хугацаа
                  </dt>
                  <dd>
                    {saleWindowStart || 'Одоо'}
                    {saleWindowEnd ? ` → ${saleWindowEnd}` : ''}
                  </dd>
                </div>
              )}
            </dl>
          </article>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='border border-[#0d0d0d] bg-[#ffffff] p-6'>
            {saleActive && savingsValue > 0 && (
              <div className='mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#b33a3a]'>
                <span className='border border-[#b33a3a] px-3 py-1'>
                  Онцгой хямдрал
                </span>
                <span>
                  Таны хэмнэлт: {formatCurrency(savingsValue)}
                  {savingsPercent !== null ? ` (${savingsPercent}%)` : ''}
                </span>
              </div>
            )}
            <PriceDisplay
              align='start'
              price={product.price}
              salePrice={effectiveSalePrice}
              saleActive={saleActive}
            />
            {saleActive && (
              <p className='mt-3 text-xs uppercase tracking-[0.2em] text-[#b33a3a]'>
                Хямдрал автоматаар тооцогдоно
              </p>
            )}
            <p className='mt-6 text-sm leading-7 text-[#0d0d0d]/70'>
              Захиалга бүр систем дээр бүртгэгдэж, хүргэлтийн явцыг хянах
              боломжтой.
            </p>
          </div>

          <AddToCartForm
            productId={product.id}
            sizes={product.sizes || []}
            stock={product.stock || 0}
          />

          <div className='border border-[#0d0d0d] bg-[#ffffff] p-6'>
            <span className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
              Хойш үлдээх
            </span>
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
