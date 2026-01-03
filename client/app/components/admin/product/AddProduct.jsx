'use client';
import { useEffect, useState } from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:5001';

const buildInitialFormState = category => ({
  name: '',
  description: '',
  sku: '',
  price: '',
  stock: '',
  category,
  tags: '',
  sizes: '',
  colors: '',
  productType: '',
  optionGroupsText: '',
  saleActive: false,
  salePrice: '',
  saleStart: '',
  saleEnd: '',
});

const SIZE_PRESETS = {
  ring: '5, 6, 7, 8, 9',
  bracelet: '15cm, 16cm, 17cm, 18cm',
  necklace: '40cm, 45cm, 50cm, 55cm',
};

const presetOptions = [
  { value: 'ring', label: 'Бөгж' },
  { value: 'bracelet', label: 'Бугуйвч' },
  { value: 'necklace', label: 'Зүүлт' },
];

export default function ProductUploadForm({ defaultCategory = '', onSuccess }) {
  const [formData, setFormData] = useState(() =>
    buildInitialFormState(defaultCategory)
  );
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const categoryLocked = Boolean(defaultCategory);

  useEffect(() => {
    setFormData(prev => ({ ...prev, category: defaultCategory }));
  }, [defaultCategory]);

  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductTypeChange = e => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      productType: value,
      sizes: SIZE_PRESETS[value] || prev.sizes,
    }));
  };

  const handleSaleToggle = e => {
    setFormData(prev => ({ ...prev, saleActive: e.target.checked }));
  };

  const parseOptionGroups = text => {
    if (!text) return [];
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [rawKey, rawValues] = line.split(':');
        if (!rawKey || !rawValues) return null;
        return {
          key: rawKey.trim(),
          label: rawKey.trim(),
          values: rawValues
            .split(',')
            .map(item => item.trim())
            .filter(Boolean),
          required: false,
        };
      })
      .filter(Boolean);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('sku', formData.sku.trim());
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('category', formData.category);
      if (formData.productType) {
        data.append('productType', formData.productType);
      }
      data.append('saleActive', formData.saleActive ? 'true' : 'false');
      if (formData.salePrice) {
        data.append('salePrice', formData.salePrice);
      }
      if (formData.saleStart) {
        data.append('saleStart', formData.saleStart);
      }
      if (formData.saleEnd) {
        data.append('saleEnd', formData.saleEnd);
      }

      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim());
        data.append('tags', JSON.stringify(tagsArray));
      }

      if (formData.sizes) {
        const sizesArray = formData.sizes
          .split(',')
          .map(size => size.trim())
          .filter(Boolean);
        data.append('sizes', JSON.stringify(sizesArray));
      }

      if (formData.colors) {
        const colorsArray = formData.colors
          .split(',')
          .map(color => color.trim())
          .filter(Boolean);
        data.append('colors', JSON.stringify(colorsArray));
      }

      const optionGroups = parseOptionGroups(formData.optionGroupsText);
      if (optionGroups.length > 0) {
        data.append('optionGroups', JSON.stringify(optionGroups));
      }

      images.forEach(image => data.append('images', image));

      const response = await fetch(`${API_BASE}/api/products/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert('Бүтээгдэхүүн амжилттай нэмэгдлээ!');
        setFormData(buildInitialFormState(defaultCategory));
        setImages([]);
        setPreviews([]);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert('Алдаа: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='mx-auto grid max-w-3xl gap-6'>
      <div className='grid gap-2'>
        <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
          Нэр *
        </label>
        <input
          type='text'
          name='name'
          value={formData.name}
          onChange={handleChange}
          required
          className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] focus:outline-none focus:ring-0'
        />
      </div>

      <div className='grid gap-2'>
        <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
          Тайлбар
        </label>
        <textarea
          name='description'
          value={formData.description}
          onChange={handleChange}
          rows='4'
          className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm leading-6 text-[#0d0d0d] focus:outline-none focus:ring-0'
        />
      </div>

      <div className='grid gap-2 sm:grid-cols-2 sm:gap-6'>
        <div className='grid gap-2'>
          <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
            Үнэ *
          </label>
          <input
            type='number'
            name='price'
            value={formData.price}
            onChange={handleChange}
            required
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] focus:outline-none focus:ring-0'
          />
        </div>
        <div className='grid gap-2'>
          <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
            Нөөц
          </label>
          <input
            type='number'
            name='stock'
            value={formData.stock}
            onChange={handleChange}
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] focus:outline-none focus:ring-0'
          />
        </div>
      </div>

      <div className='grid gap-2 sm:grid-cols-3 sm:gap-6'>
        <div className='grid gap-2'>
          <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
            SKU
          </label>
          <input
            type='text'
            name='sku'
            value={formData.sku}
            onChange={handleChange}
            placeholder='SKU-0001'
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] placeholder:text-[#0d0d0d]/50 focus:outline-none focus:ring-0'
          />
        </div>
        <div className='grid gap-2'>
          <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
            Бүтээгдэхүүний төрөл
          </label>
          <select
            name='productType'
            value={formData.productType}
            onChange={handleProductTypeChange}
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] focus:outline-none focus:ring-0'
          >
            <option value=''>Төрлөө сонгох</option>
            {presetOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className='grid gap-2'>
          <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
            Хэмжээний сонголт (таслалаар)
          </label>
          <input
            type='text'
            name='sizes'
            value={formData.sizes}
            onChange={handleChange}
            placeholder='5, 6, 7, 8'
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] placeholder:text-[#0d0d0d]/50 focus:outline-none focus:ring-0'
          />
        </div>
      </div>

      <div className='grid gap-2 sm:grid-cols-[2fr_1fr_1fr] sm:gap-6'>
        <div className='grid gap-2'>
          <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
            Категори ID *
          </label>
          <input
            type='text'
            name='category'
            value={formData.category}
            onChange={handleChange}
            required
            disabled={categoryLocked}
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] focus:outline-none focus:ring-0 disabled:bg-[#0d0d0d]/10 disabled:text-[#0d0d0d]'
          />
        </div>
        <div className='grid gap-2'>
          <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
            Өнгөний сонголт (таслалаар)
          </label>
          <input
            type='text'
            name='colors'
            value={formData.colors}
            onChange={handleChange}
            placeholder='мөнгөлөг, алтлаг, rose gold'
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] placeholder:text-[#0d0d0d]/50 focus:outline-none focus:ring-0'
          />
        </div>
        <div className='grid gap-2'>
          <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
            Шошго (таслалаар)
          </label>
          <input
            type='text'
            name='tags'
            value={formData.tags}
            onChange={handleChange}
            placeholder='luxury, gold, ring'
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] placeholder:text-[#0d0d0d]/50 focus:outline-none focus:ring-0'
          />
        </div>
      </div>
      <div className='grid gap-2'>
        <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
          Зургууд (5 хүртэл)
        </label>
        <input
          type='file'
          accept='image/*'
          multiple
          onChange={handleImageChange}
          className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] file:mr-4 file:border-0 file:bg-[#0d0d0d] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.22em] file:text-[#ffffff] hover:file:bg-[#4d5544]'
        />
      </div>

      {previews.length > 0 && (
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
          {previews.map((preview, index) => (
            <img
              key={index}
              src={preview}
              alt={`Preview ${index + 1}`}
              className='h-32 w-full border border-[#0d0d0d] object-cover'
            />
          ))}
        </div>
      )}
      <div className='grid gap-2'>
        <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
          Нэмэлт сонголт ( мөр бүр "key: утга, утга" )
        </label>
        <textarea
          name='optionGroupsText'
          value={formData.optionGroupsText}
          onChange={handleChange}
          rows='3'
          placeholder={'жин: 2гр, 2.5гр\nурт: 40см, 45см'}
          className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm leading-6 text-[#0d0d0d] placeholder:text-[#0d0d0d]/50 focus:outline-none focus:ring-0'
        />
        <p className='text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d]/70'>
          Жишээ: "жин: 2гр, 2.5гр" болон "урт: 40см, 45см" зэрэг сонголт нэмнэ.
        </p>
      </div>
      <div className='grid gap-3 border border-[#0d0d0d] bg-[#ffffff] px-4 py-4'>
        <label className='flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
          <span>Хямдрал идэвхжүүлэх</span>
          <input
            type='checkbox'
            name='saleActive'
            checked={formData.saleActive}
            onChange={handleSaleToggle}
            className='h-4 w-4 border border-[#0d0d0d] accent-[#0d0d0d]'
          />
        </label>
        <div className='grid gap-3 sm:grid-cols-3 sm:gap-4'>
          <input
            type='number'
            name='salePrice'
            value={formData.salePrice}
            onChange={handleChange}
            placeholder='Sale price'
            disabled={!formData.saleActive}
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-2 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] disabled:bg-[#0d0d0d]/10 disabled:text-[#0d0d0d]/60 focus:outline-none focus:ring-0'
          />
          <input
            type='datetime-local'
            name='saleStart'
            value={formData.saleStart}
            onChange={handleChange}
            disabled={!formData.saleActive}
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-2 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] disabled:bg-[#0d0d0d]/10 disabled:text-[#0d0d0d]/60 focus:outline-none focus:ring-0'
          />
          <input
            type='datetime-local'
            name='saleEnd'
            value={formData.saleEnd}
            onChange={handleChange}
            disabled={!formData.saleActive}
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-2 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] disabled:bg-[#0d0d0d]/10 disabled:text-[#0d0d0d]/60 focus:outline-none focus:ring-0'
          />
        </div>
        <p className='text-[10px] uppercase tracking-[0.22em] text-[#0d0d0d]/60'>
          Хямдрал идэвхтэй үед sale price болон хугацаа хэрэглэгчдэд харагдана.
        </p>
      </div>

      <button
        type='submit'
        disabled={loading}
        className='border border-[#0d0d0d] bg-[#0d0d0d] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffffff] transition-colors hover:bg-[#4d5544] disabled:border-[#4d5544] disabled:bg-[#4d5544] disabled:opacity-70'>
        {loading ? 'Уншиж байна...' : 'Нэмэх'}
      </button>
    </form>
  );
}
