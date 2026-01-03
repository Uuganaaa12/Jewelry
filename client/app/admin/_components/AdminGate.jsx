'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGate({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.replace('/auth/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user?.role === 'admin') {
        setAllowed(true);
      } else {
        router.replace('/shop');
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/auth/login');
    }
  }, [router]);

  if (!allowed) {
    return null;
  }

  return children;
}
