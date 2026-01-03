'use client';

import { useEffect, useState } from 'react';
import { getSettingsSnapshot } from '../_store/adminStore';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState({
    catalogConnected: false,
    categoriesSynced: false,
    lastSync: '',
  });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      const data = await getSettingsSnapshot();
      if (!isMounted) return;
      setSnapshot(data);
      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className='flex flex-col gap-12 text-[#0d0d0d]'>
      <header className='flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold uppercase tracking-[0.16em]'>
          Settings console
        </h1>
      </header>

      <section className='grid gap-6 lg:grid-cols-2'>
        <h1>Одоогоор хоосон</h1>
      </section>
    </section>
  );
}
