const formatCurrency = value => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0₮';
  return `${numeric.toLocaleString('mn-MN')}₮`;
};

export default function PriceDisplay({
  price,
  salePrice,
  saleActive,
  align = 'end',
}) {
  const isOnSale = saleActive && salePrice !== null && salePrice !== undefined;
  const base = formatCurrency(price);
  const sale = isOnSale ? formatCurrency(salePrice) : null;

  return (
    <div
      className={`flex flex-col text-xs uppercase tracking-[0.16em] text-[#4d5544] ${
        align === 'start' ? 'items-start' : 'items-end'
      }`}>
      <span className='text-[11px] text-[#4d5544]/70'>Үнэ</span>
      {isOnSale ? (
        <div className='flex items-baseline gap-2'>
          <span className='text-2xl font-bold text-[#b33a3a]'>{sale}</span>
          <span className='text-sm text-[#0d0d0d]/40 line-through'>{base}</span>
        </div>
      ) : (
        <span className='text-2xl font-bold text-[#0d0d0d]'>{base}</span>
      )}
    </div>
  );
}
