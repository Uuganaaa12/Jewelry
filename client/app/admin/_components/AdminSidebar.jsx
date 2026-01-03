'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className='h-full w-full overflow-y-auto border-r border-[#0d0d0d] bg-[#ffffff] px-6 py-8'>
      <div className='mb-10 text-sm uppercase tracking-[0.22em] text-[#4d5544]'>
        Jewelry Back Office
      </div>
      <nav className='flex flex-col gap-[6px] text-sm font-semibold text-[#0d0d0d]'>
        {navItems.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block border px-4 py-2 tracking-[0.08em] uppercase transition-colors ${
                isActive
                  ? 'border-[#0d0d0d] bg-[#0d0d0d] text-[#ffffff]'
                  : 'border-transparent hover:border-[#4d5544] hover:bg-[#4d5544] hover:text-[#ffffff]'
              }`}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
