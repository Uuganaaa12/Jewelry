'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Menu,
  X,
  ShoppingCart,
  Heart,
  Package,
  User,
  LogOut,
} from 'lucide-react';
import { clearSession } from '@/lib/auth-client';

const navLinks = [
  { href: '/shop', label: 'Дэлгүүр' },
  { href: '/shop/products', label: 'Бүтээгдэхүүн' },
  { href: '/shop/collections', label: 'Коллекц' },
  { href: '/shop/cart', label: 'Сагс', icon: ShoppingCart },
  { href: '/shop/wishlist', label: 'Хүслийн жагсаалт', icon: Heart },
  { href: '/shop/orders', label: 'Захиалга', icon: Package },
];

export default function ShopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAccountActive = pathname.startsWith('/shop/account');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setMe(JSON.parse(user));
    }
  }, []);

  function handleLogout() {
    clearSession();
    setMe(null);
    setMobileMenuOpen(false);
    router.push('/shop');
  }

  return (
    <header className='bg-white shadow-sm sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link href='/shop' className='text-xl font-bold text-gray-900'>
            Luna Jewelry
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden lg:flex items-center space-x-8'>
            {navLinks.slice(0, 3).map(link => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/shop' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative text-sm font-medium
                    transition-all duration-300 ease-out
                    hover:text-gray-900
                    ${isActive ? 'text-gray-900' : 'text-gray-600'}
                  `}>
                  {link.label}
                  {/* Animated underline */}
                  <span
                    className={`
                      absolute left-0 bottom-0 h-0.5 bg-[#4d5544]
                      transition-all duration-300 ease-out
                      ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0'}
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop Icons & Auth */}
          <div className='hidden lg:flex items-center space-x-6'>
            {navLinks.slice(3).map(link => {
              const isActive =
                pathname === link.href || pathname.startsWith(link.href);

              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    p-2 rounded-md
                    transition-all duration-300 ease-in-out
                    transform hover:scale-110
                    ${
                      isActive
                        ? 'bg-[#4d5544] text-white shadow-md scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                  title={link.label}>
                  <Icon
                    className={`
                      w-5 h-5
                      transition-all duration-300
                      ${isActive ? 'scale-110' : ''}
                    `}
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                </Link>
              );
            })}

            {me ? (
              <div className='flex items-center space-x-4'>
                <Link
                  href='/shop/account'
                  className={`
                    w-8 h-8 flex items-center justify-center
                    text-sm font-medium
                    transition-all duration-300 ease-in-out
                    rounded-full border border-[#4d5544]
                    transform hover:scale-110
                    ${
                      isAccountActive
                        ? 'bg-[#4d5544] text-white shadow-md scale-105'
                        : 'text-[#4d5544] hover:bg-[#4d5544]/10'
                    }
                  `}>
                  {me?.name ? me.name.charAt(0).toUpperCase() : 'У'}
                </Link>

                <button
                  onClick={handleLogout}
                  className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200'>
                  Гарах
                </button>
              </div>
            ) : (
              <Link
                href='/auth/login'
                className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200'>
                Нэвтрэх
              </Link>
            )}
          </div>

          {/* Mobile Icons & Menu Button */}
          <div className='flex lg:hidden items-center space-x-4'>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='text-gray-600 hover:text-gray-900 transition-all duration-200'>
              {mobileMenuOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className='lg:hidden bg-white border-t border-gray-200 animate-in slide-in-from-top duration-300'>
          <nav className='px-4 py-4 space-y-1'>
            {navLinks.map(link => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/shop' && pathname.startsWith(link.href));
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-md
                    text-sm font-medium
                    transition-all duration-300 ease-in-out
                    transform hover:translate-x-1
                    ${
                      isActive
                        ? 'bg-[#4d5544] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}>
                  {Icon && <Icon className='w-5 h-5' />}
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className='pt-4 mt-4 border-t border-gray-200'>
              {me ? (
                <>
                  <Link
                    href='/shop/account'
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-md
                      text-sm font-medium
                      transition-all duration-300 ease-in-out
                      transform hover:translate-x-1
                      ${
                        isAccountActive
                          ? 'bg-[#4d5544] text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}>
                    <User className='w-5 h-5' />
                    <span>{me.name || 'Профайл'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className='w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-left transition-all duration-200 transform hover:translate-x-1'>
                    <LogOut className='w-5 h-5' />
                    <span>Гарах</span>
                  </button>
                </>
              ) : (
                <Link
                  href='/auth/login'
                  onClick={() => setMobileMenuOpen(false)}
                  className='flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 transform hover:translate-x-1'>
                  <User className='w-5 h-5' />
                  <span>Нэвтрэх</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
