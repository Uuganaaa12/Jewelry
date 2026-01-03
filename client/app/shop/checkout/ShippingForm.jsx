import { useState } from 'react';

export default function ShippingForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState(initialData);

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isValid = () => {
    return (
      formData.phone.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.city.trim() !== ''
    );
  };

  const handleSubmit = () => {
    if (isValid()) {
      onSubmit(formData);
    }
  };

  return (
    <div className='flex flex-col gap-6 border border-[#0d0d0d] bg-[#ffffff] px-6 py-6'>
      <h2 className='text-lg font-semibold uppercase tracking-[0.18em]'>
        Хүргэлтийн мэдээлэл
      </h2>

      <div className='flex flex-col gap-4'>
        <InputField
          label='Хүлээн авах хүний утасны дугаар *'
          name='phone'
          type='tel'
          value={formData.phone}
          onChange={handleChange}
          placeholder='99119911'
        />

        <InputField
          label='Хаяг *'
          name='address'
          value={formData.address}
          onChange={handleChange}
          placeholder='Байр, тоот, хороолол'
        />

        <div className='grid gap-4 sm:grid-cols-2'>
          <InputField
            label='Хот/Аймаг *'
            name='city'
            value={formData.city}
            onChange={handleChange}
            placeholder='Улаанбаатар'
          />

          <InputField
            label='Дүүрэг'
            name='district'
            value={formData.district}
            onChange={handleChange}
            placeholder='Сүхбаатар'
          />
        </div>
      </div>

      <button
        type='button'
        onClick={handleSubmit}
        disabled={!isValid()}
        className='border border-[#0d0d0d] bg-[#0d0d0d] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffffff] transition-colors hover:bg-[#4d5544] disabled:cursor-not-allowed disabled:opacity-50'>
        Дараагийн алхам
      </button>
    </div>
  );
}

function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className='flex flex-col gap-2'>
      <label className='text-xs uppercase tracking-[0.2em] text-[#4d5544]'>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className='border border-[#0d0d0d] bg-transparent px-4 py-3 text-sm text-[#0d0d0d] focus:outline-none focus:ring-1 focus:ring-[#0d0d0d]'
        placeholder={placeholder}
      />
    </div>
  );
}
