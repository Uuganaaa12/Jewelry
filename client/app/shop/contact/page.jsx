import Link from 'next/link';

export const metadata = { title: 'Холбогдох — Luna Jewelry' };

export default function ContactPage() {
  return (
    <div className='flex flex-col gap-16'>
      <header className='flex flex-col gap-4'>
        <span className='text-xs font-semibold uppercase tracking-[0.4em] text-[#4d5544]'>
          Бидэнтэй холбогдох
        </span>
        <h1 className='text-4xl font-bold uppercase tracking-[0.12em]'>
          Холбогдох
        </h1>
        <p className='max-w-xl text-base leading-7 text-[#0d0d0d]/70'>
          Асуулт, санал хүсэлт байвал бидэнтэй холбогдоорой.
          Мэргэжилтнүүд маань туслахад бэлэн байна.
        </p>
      </header>

      <div className='grid gap-8 lg:grid-cols-2'>
        {/* Facebook */}
        <a
          href='https://www.facebook.com/profile.php?id=61589657196447'
          target='_blank'
          rel='noopener noreferrer'
          className='group flex flex-col gap-4 border border-[#0d0d0d] p-8 transition-colors hover:bg-[#1877f2] hover:border-[#1877f2] hover:text-white'
        >
          <div className='flex items-center gap-4'>
            <svg width='28' height='28' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z'/>
            </svg>
            <span className='text-lg font-bold uppercase tracking-[0.1em]'>Facebook</span>
          </div>
          <p className='text-sm leading-6 opacity-70 group-hover:opacity-90'>
            Facebook Messenger-ээр бидэнтэй шууд харилцаарай.
            AI туслах бараа хайхад тусална.
          </p>
          <span className='text-xs font-bold uppercase tracking-[0.2em] opacity-60'>
            Luna Jewelry →
          </span>
        </a>

        {/* Instagram */}
        <a
          href='https://www.instagram.com/uuganaaa_12/'
          target='_blank'
          rel='noopener noreferrer'
          className='group flex flex-col gap-4 border border-[#0d0d0d] p-8 transition-colors hover:bg-[#e1306c] hover:border-[#e1306c] hover:text-white'
        >
          <div className='flex items-center gap-4'>
            <svg width='28' height='28' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'/>
            </svg>
            <span className='text-lg font-bold uppercase tracking-[0.1em]'>Instagram</span>
          </div>
          <p className='text-sm leading-6 opacity-70 group-hover:opacity-90'>
            Instagram-д шинэ бүтээгдэхүүн, хямдралын мэдээлэл байдаг.
          </p>
          <span className='text-xs font-bold uppercase tracking-[0.2em] opacity-60'>
            @uuganaaa_12 →
          </span>
        </a>

        {/* Messenger Bot */}
        <div className='flex flex-col gap-4 border border-[#00434D] bg-[#f4fbfc] p-8'>
          <div className='flex items-center gap-4 text-[#00434D]'>
            <svg width='28' height='28' viewBox='0 0 60 60' fill='none'>
              <polygon points='30,4 50,22 30,22 10,22' fill='white' opacity='0.95'/>
              <polygon points='6,22 30,4 10,22' fill='#0097A9'/>
              <polygon points='54,22 30,4 50,22' fill='#00434D'/>
              <polygon points='10,22 30,56 30,22' fill='#0097A9'/>
              <polygon points='50,22 30,56 30,22' fill='#00434D'/>
            </svg>
            <span className='text-lg font-bold uppercase tracking-[0.1em]'>Luna AI Туслах</span>
          </div>
          <p className='text-sm leading-6 text-[#0d0d0d]/70'>
            Вэб сайтын баруун доод буланд байгаа diamond товчийг дарж
            AI туслахтай шууд ярилцаарай.
          </p>
          <div className='flex flex-wrap gap-2'>
            {['Zero-shot', 'Few-shot', 'Chain-of-Thought', 'Role-based'].map(m => (
              <span key={m} className='border border-[#0097A9] px-3 py-1 text-xs font-semibold text-[#00434D]'>{m}</span>
            ))}
          </div>
        </div>

        {/* Ажлын цаг */}
        <div className='flex flex-col gap-4 border border-[#0d0d0d] p-8'>
          <span className='text-lg font-bold uppercase tracking-[0.1em]'>Ажлын цаг</span>
          <div className='flex flex-col gap-2 text-sm text-[#0d0d0d]/70'>
            <div className='flex justify-between'><span>Даваа — Баасан</span><span className='font-semibold'>09:00 – 18:00</span></div>
            <div className='flex justify-between'><span>Бямба</span><span className='font-semibold'>10:00 – 16:00</span></div>
            <div className='flex justify-between'><span>Ням</span><span className='font-semibold text-[#b33a3a]'>Амарна</span></div>
          </div>
        </div>
      </div>

      <div className='flex gap-4'>
        <Link href='/shop' className='border border-[#0d0d0d] px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] transition-colors hover:bg-[#0d0d0d] hover:text-white'>
          Дэлгүүр рүү буцах
        </Link>
      </div>
    </div>
  );
}
