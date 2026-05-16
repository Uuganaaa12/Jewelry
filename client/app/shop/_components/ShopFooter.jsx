import Link from 'next/link';

export default function ShopFooter() {
  return (
    <footer className='border-t border-[#0d0d0d] bg-[#ffffff]'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:justify-between sm:px-10'>

        {/* Зүүн — Тайлбар */}
        <div className='max-w-xs'>
          <h2 className='text-sm font-bold uppercase tracking-[0.3em] text-[#0d0d0d]'>Luna Jewelry</h2>
          <p className='mt-3 text-sm leading-7 text-[#0d0d0d]/60'>
            Өвөрмөц загвар, өндөр чанарын үнэт эдлэлийн дэлгүүр. Алт, мөнгө, эрдэнэ чулуугаар гоёоорой.
          </p>
        </div>

        {/* Голд — Холбоо барих */}
        <div className='flex flex-col gap-4'>
          <p className='text-[10px] font-bold uppercase tracking-[0.3em] text-[#0d0d0d]/40'>Холбоо барих</p>
          <a href='tel:99332470' className='flex items-center gap-3 text-sm text-[#0d0d0d] transition-colors hover:text-[#4d5544]'>
            <svg width='15' height='15' viewBox='0 0 24 24' fill='currentColor' className='text-[#0d0d0d]/50'>
              <path d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'/>
            </svg>
            99332470
          </a>
          <Link
            href='https://www.google.com/maps?q=47.9213333,106.9593028'
            target='_blank' rel='noopener noreferrer'
            className='flex items-start gap-3 text-sm text-[#0d0d0d] transition-colors hover:text-[#4d5544]'>
            <svg width='15' height='15' viewBox='0 0 24 24' fill='currentColor' className='mt-0.5 text-[#0d0d0d]/50' style={{flexShrink:0}}>
              <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/>
            </svg>
            <span>Баянзүрх дүүрэг 5-р хороо<br/><span className='text-[#0d0d0d]/50'>Google Maps-д харах →</span></span>
          </Link>
        </div>

        {/* Баруун — Сошиал */}
        <div className='flex flex-col gap-4'>
          <p className='text-[10px] font-bold uppercase tracking-[0.3em] text-[#0d0d0d]/40'>Сошиал</p>
          <div className='flex gap-3'>
            <Link href='https://www.facebook.com/profile.php?id=61589657196447' target='_blank' rel='noopener noreferrer'
              title='Facebook'
              className='flex h-10 w-10 items-center justify-center border border-[#0d0d0d] bg-[#0d0d0d] text-white transition-colors hover:bg-[#1877f2] hover:border-[#1877f2]'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z'/>
              </svg>
            </Link>
            <Link href='https://www.instagram.com/uuganaaa_12/' target='_blank' rel='noopener noreferrer'
              title='Instagram'
              className='flex h-10 w-10 items-center justify-center border border-[#0d0d0d] bg-[#0d0d0d] text-white transition-colors hover:bg-[#e1306c] hover:border-[#e1306c]'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'/>
              </svg>
            </Link>
          </div>
          <p className='text-xs text-[#0d0d0d]/40'>© 2025 Luna Jewelry</p>
        </div>

      </div>
    </footer>
  );
}
