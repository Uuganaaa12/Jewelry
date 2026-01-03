import Link from 'next/link';

const sections = [
  {
    title: 'Дэлгүүр',
    href: '/shop',
    description: 'Бүтээгдэхүүн, коллекц, сагс, хүслийн жагсаалтыг үзэх.',
  },
  {
    title: 'Админ самбар',
    href: '/admin',
    description: 'Бараа, категори, захиалгыг удирдах самбар руу орох.',
  },
  {
    title: 'Нэвтрэх',
    href: '/auth/login',
    description: 'Нэвтэрч худалдан авалтын урсгал руу орно.',
  },
];

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-16 text-white'>
      <div className='w-full max-w-3xl space-y-10 text-center'>
        <h1 className='text-4xl font-semibold md:text-5xl'>
          Үнэт эдлэлийн платформ
        </h1>
        <p className='text-base text-slate-300'>
          Эндээс админ удирдлага, дэлгүүр, нэвтрэлтийн урсгалаа сонгоод шууд
          ажиллаарай.
        </p>

        <div className='grid gap-4 sm:grid-cols-3'>
          {sections.map(section => (
            <Link
              key={section.href}
              href={section.href}
              className='rounded-2xl border border-white/10 bg-white/5 px-4 py-6 transition hover:border-white/20 hover:bg-white/10'>
              <span className='text-lg font-semibold text-white'>
                {section.title}
              </span>
              <p className='mt-2 text-sm text-slate-300'>
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
