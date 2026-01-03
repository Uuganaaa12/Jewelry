import ShopFooter from './_components/ShopFooter';
import ShopHeader from './_components/ShopHeader';

export default function ShopLayout({ children }) {
  return (
    <div className='flex min-h-screen flex-col bg-[#ffffff] text-[#0d0d0d]'>
      <ShopHeader />
      <main className='flex-1'>
        <div className='mx-auto w-full max-w-6xl px-6 py-16 sm:px-10'>
          {children}
        </div>
      </main>
      <ShopFooter />
    </div>
  );
}
