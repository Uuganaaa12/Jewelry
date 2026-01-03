'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearSession } from '@/lib/auth-client';

const topLinks = [{ href: '/shop', label: 'Shopfront' }];

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.replace('/auth/login');
  };

  return (
    <header className='flex items-center justify-between border-b border-[#0d0d0d] bg-[#ffffff] px-10 py-6 text-[#0d0d0d]'>
      <div>
        <p className='text-[11px] uppercase tracking-[0.28em] text-[#4d5544]'>
          Admin
        </p>
        <h1 className='text-xl font-semibold leading-tight'>Control Center</h1>
      </div>

      <nav className='flex items-center gap-6 text-sm font-semibold'>
        {topLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className='transition-colors hover:text-[#4d5544]'>
            {link.label}
          </Link>
        ))}
        <button
          type='button'
          onClick={handleLogout}
          className='border border-[#0d0d0d] px-4 py-2 text-xs uppercase tracking-[0.24em] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
          Logout
        </button>
      </nav>
    </header>
  );
}
