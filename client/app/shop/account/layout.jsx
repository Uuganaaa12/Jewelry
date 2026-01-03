'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/shop/account', label: 'Профайл' },
  { href: '/shop/account/security', label: 'Нууцлал' },
];

export default function AccountLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className='flex flex-col gap-6 py-8 text-[#0d0d0d]'>
      <header className='flex flex-col gap-2 border border-[#0d0d0d] bg-[#ffffff] px-4 py-4 sm:px-6 sm:py-5'>
        <span className='text-[10px] uppercase tracking-[0.26em] text-[#4d5544] sm:text-xs'>
          Миний бүртгэл
        </span>
        <h1 className='text-2xl font-semibold uppercase tracking-[0.12em] sm:text-3xl'>
          Худалдан авагчийн төв
        </h1>
      </header>

      <nav className='flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] sm:gap-3 sm:text-[11px]'>
        {links.map(link => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                'border px-3 py-2 transition sm:px-4 ' +
                (active
                  ? 'border-[#0d0d0d] bg-[#0d0d0d] text-[#ffffff]'
                  : 'border-[#0d0d0d] bg-[#ffffff] text-[#0d0d0d] hover:bg-[#0d0d0d] hover:text-[#ffffff]')
              }>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className='border border-[#0d0d0d] bg-[#ffffff] p-4 sm:p-6'>
        {children}
      </div>
    </div>
  );
}
