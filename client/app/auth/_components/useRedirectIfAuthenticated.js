'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resolveRedirect } from '@/lib/auth-client';

export default function useRedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) return;

    try {
      const user = JSON.parse(storedUser);
      const target = resolveRedirect(user?.role);
      router.replace(target);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [router]);
}
