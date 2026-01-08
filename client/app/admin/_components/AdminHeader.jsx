'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearSession } from '@/lib/auth-client';
import { useEffect, useState } from 'react';
import { canUsePush, subscribeToPush } from '../_store/push';

const topLinks = [{ href: '/shop', label: 'Shopfront' }];

export default function AdminHeader() {
  const router = useRouter();
  const [pushState, setPushState] = useState('idle');
  const [pushError, setPushError] = useState('');

  const handleLogout = () => {
    clearSession();
    router.replace('/auth/login');
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !canUsePush()) return;
    if (Notification.permission === 'granted') {
      setPushState('enabled');
    }
  }, []);

  const handleEnablePush = async () => {
    if (pushState === 'working') return;
    setPushState('working');
    setPushError('');
    try {
      await subscribeToPush();
      setPushState('enabled');
    } catch (error) {
      setPushState('error');
      setPushError(error?.message || 'Failed to enable notifications');
    }
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
          onClick={handleEnablePush}
          disabled={pushState === 'working' || pushState === 'enabled'}
          className='border border-[#0d0d0d] px-4 py-2 text-xs uppercase tracking-[0.24em] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff] disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:text-[#cbd5e1]'>
          {pushState === 'enabled'
            ? 'Alerts on'
            : pushState === 'working'
              ? 'Enabling…'
              : 'Enable alerts'}
        </button>
        <button
          type='button'
          onClick={handleLogout}
          className='border border-[#0d0d0d] px-4 py-2 text-xs uppercase tracking-[0.24em] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
          Logout
        </button>
      </nav>
      {pushError && (
        <p className='absolute right-10 top-[76px] text-xs uppercase tracking-[0.2em] text-[#b33a3a]'>
          {pushError}
        </p>
      )}
    </header>
  );
}
