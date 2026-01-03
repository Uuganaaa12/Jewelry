const formatCurrency = value => `${value.toFixed(0)}₮`;

export default function OrderSummary({ cartItems, subtotal, shipping, total }) {
  return (
    <aside className='flex flex-col gap-5 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
      <h2 className='text-base font-semibold uppercase tracking-[0.18em]'>
        Захиалгын дэлгэрэнгүй
      </h2>

      <div className='flex flex-col gap-3 border-b border-[#0d0d0d]/20 pb-4'>
        {cartItems.map(item => (
          <CartItem key={item.id || item._id} item={item} />
        ))}
      </div>

      <div className='flex flex-col gap-2 text-xs'>
        <SummaryRow label='Нийт дүн' value={formatCurrency(subtotal)} />
        <SummaryRow label='Хүргэлт' value={formatCurrency(shipping)} />
      </div>

      <div className='flex items-center justify-between border-t border-[#0d0d0d] pt-4 text-sm font-semibold uppercase tracking-[0.2em]'>
        <span>Нийт төлөх дүн</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </aside>
  );
}

function CartItem({ item }) {
  console.log('item', item);
  return (
    <div className='flex items-center justify-between text-xs'>
      <div className='flex flex-col gap-1'>
        <span className='font-semibold'>{item.product.name}</span>
        <span className='text-[#0d0d0d]/60'>Тоо ширхэг: {item.quantity}</span>
        {item.size && (
          <span className='text-[#0d0d0d]/60'>Хэмжээ: {item.size}</span>
        )}
      </div>
      <span className='font-semibold'>
        {formatCurrency(item.product.price * item.quantity)}
      </span>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className='flex items-center justify-between text-[#4d5544]'>
      <span>{label}</span>
      <span className='text-[#0d0d0d]'>{value}</span>
    </div>
  );
}
