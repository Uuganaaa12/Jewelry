import Link from 'next/link';

const footerLinks = [
  { href: '/shop/products', label: 'Products' },
  { href: '/shop/collections', label: 'Collections' },
  { href: '/shop/wishlist', label: 'Wishlist' },
  { href: '/shop/cart', label: 'Cart' },
];

export default function ShopFooter() {
  return (
    <footer className='border-t border-[#0d0d0d] bg-[#ffffff]'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:items-start md:justify-between'>
        <div className='max-w-md text-[#0d0d0d]'>
          <h2 className='text-sm font-semibold uppercase tracking-[0.26em]'>
            Atelier dispatch
          </h2>
          <p className='mt-3 text-sm leading-7 text-[#0d0d0d]/70'>
            Hand-finished jewelry with a modernist palette. Every drop syncs
            directly from the admin console for true-to-stock visibility.
          </p>
        </div>
        <nav className='flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.24em] text-[#0d0d0d]/70'>
          {footerLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className='border border-[#0d0d0d] px-4 py-2 text-[#0d0d0d] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
