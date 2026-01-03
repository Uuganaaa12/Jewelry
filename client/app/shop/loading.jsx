export default function Loading() {
  return (
    <div className='flex flex-col gap-20 text-[#0d0d0d]'>
      <section className='grid gap-10 border border-[#0d0d0d] bg-[#ffffff] p-12 md:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='flex flex-col gap-6'>
          <div className='h-3 w-40 bg-[#4d5544]/40' />
          <div className='h-14 w-3/4 bg-[#0d0d0d]/30' />
          <div className='h-24 w-full max-w-xl bg-[#0d0d0d]/15' />
          <div className='flex gap-3 pt-4'>
            <div className='h-10 w-48 bg-[#0d0d0d]/30' />
            <div className='h-10 w-48 bg-[#4d5544]/30' />
          </div>
        </div>
        <div className='flex flex-col justify-between border border-[#4d5544] bg-[#4d5544]/10 p-6'>
          <div className='h-48 border border-dashed border-[#4d5544]/40 bg-[#4d5544]/20' />
          <div className='mt-6 h-10 bg-[#0d0d0d]/15' />
        </div>
      </section>

      <section className='flex flex-col gap-8'>
        <div className='h-6 w-52 bg-[#0d0d0d]/20' />
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#4d5544]/10 px-6 py-8'>
              <div className='h-4 w-32 bg-[#4d5544]/40' />
              <div className='h-20 bg-[#0d0d0d]/10' />
              <div className='h-3 w-20 bg-[#0d0d0d]/20' />
            </div>
          ))}
        </div>
      </section>

      <section className='flex flex-col gap-8'>
        <div className='h-6 w-56 bg-[#0d0d0d]/20' />
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className='flex flex-col gap-4 border border-[#0d0d0d] bg-[#4d5544]/10 px-6 py-8'>
              <div className='h-5 w-48 bg-[#0d0d0d]/25' />
              <div className='h-20 bg-[#0d0d0d]/15' />
              <div className='h-4 w-full bg-[#4d5544]/30' />
            </div>
          ))}
        </div>
      </section>

      <section className='flex flex-col gap-8'>
        <div className='h-6 w-64 bg-[#0d0d0d]/20' />
        <div className='grid gap-6 sm:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className='flex flex-col gap-2 border border-[#0d0d0d] bg-[#4d5544]/10 px-6 py-6'>
              <div className='h-3 w-24 bg-[#4d5544]/40' />
              <div className='h-8 w-32 bg-[#0d0d0d]/25' />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
