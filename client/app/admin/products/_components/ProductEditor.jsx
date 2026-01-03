'use client';

import { useEffect, useMemo, useState } from 'react';
import { updateProduct } from '../../_store/adminStore';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:5001';

const formatDateForInput = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = input => String(input).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const initialState = {
  name: '',
  description: '',
  sku: '',
  price: '',
  stock: '',
  category: '',
  tags: '',
  sizes: '',
  saleActive: false,
  salePrice: '',
  saleStart: '',
  saleEnd: '',
};

export default function ProductEditor({ product, onCancel, onUpdated }) {
  const [formData, setFormData] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (!product) return;
    const tags = Array.isArray(product.tags) ? product.tags.join(', ') : '';
    setFormData({
      name: product.name || '',
      description: product.description || '',
      sku: product.sku || '',
      price: product.price != null ? String(product.price) : '',
      stock: product.stock != null ? String(product.stock) : '',
      category:
        typeof product.category === 'object'
          ? product.category?._id || ''
          : product.category || '',
      tags,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      saleActive: Boolean(product.saleActive),
      salePrice:
        product.salePrice !== undefined && product.salePrice !== null
          ? String(product.salePrice)
          : '',
      saleStart: formatDateForInput(product.saleStart),
      saleEnd: formatDateForInput(product.saleEnd),
    });
  }, [product]);

  useEffect(() => {
    if (!product?._id) return;
    let active = true;
    setLoadingCategories(true);

    (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/categories`);
        const data = await response.json();
        if (!active) return;
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        if (active) {
          console.error('Failed to load categories for product editor', error);
          setCategories([]);
        }
      } finally {
        if (active) setLoadingCategories(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [product?._id]);

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(previous => ({ ...previous, [name]: value }));
  };

  const handleSaleToggle = event => {
    const { checked } = event.target;
    setFormData(previous => ({
      ...previous,
      saleActive: checked,
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!product?._id) return;
    setSaving(true);

    if (formData.saleActive && !formData.salePrice) {
      alert('Хямдралын үнийг оруулна уу.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        sku: formData.sku.trim(),
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        category: formData.category || null,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        sizes: formData.sizes
          .split(',')
          .map(size => size.trim())
          .filter(Boolean),
      };

      if (formData.saleActive) {
        payload.saleActive = true;
        payload.salePrice = Number(formData.salePrice) || 0;
        payload.saleStart = formData.saleStart || '';
        payload.saleEnd = formData.saleEnd || '';
      } else {
        payload.saleActive = false;
        payload.salePrice = '';
        payload.saleStart = '';
        payload.saleEnd = '';
      }

      const updated = await updateProduct(product._id, payload);
      alert('Бүтээгдэхүүн амжилттай шинэчлэгдлээ!');
      if (onUpdated) {
        onUpdated(updated);
      }
    } catch (error) {
      console.error('Failed to update product', error);
      alert('Бүтээгдэхүүн шинэчлэхэд алдаа гарлаа.');
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = useMemo(() => {
    return categories.map(item => ({ id: item._id, label: item.name }));
  }, [categories]);

  return (
    <form onSubmit={handleSubmit} className='grid gap-4'>
      <header className='flex flex-col gap-1'>
        <h3 className='text-sm font-semibold uppercase tracking-[0.18em]'>
          Edit product
        </h3>
        <p className='text-xs leading-6 text-[#0d0d0d]/70'>
          Үндсэн мэдээллүүдийг шинэчлээд хадгална уу. Зураг солих бол upload
          endpoint-г ашиглана.
        </p>
      </header>

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
          rows={4}
          className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm leading-6 text-[#0d0d0d] focus:outline-none focus:ring-0'
        />
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
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

      <div className='grid gap-4 sm:grid-cols-2'>
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
            Size options (comma)
          </label>
          <input
            type='text'
            name='sizes'
            value={formData.sizes}
            onChange={handleChange}
            placeholder='6, 7, 8'
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] placeholder:text-[#0d0d0d]/50 focus:outline-none focus:ring-0'
          />
        </div>
      </div>

      <div className='grid gap-2'>
        <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
          Категори
        </label>
        <div
          className={`border border-[#0d0d0d] bg-[#ffffff] px-4 py-1 ${
            loadingCategories ? 'admin-placeholder' : ''
          }`}>
          <select
            name='category'
            value={formData.category}
            onChange={handleChange}
            disabled={loadingCategories}
            className='w-full bg-transparent py-2 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] focus:outline-none'>
            <option value=''>-- Категори сонгоогүй --</option>
            {categoryOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='grid gap-2'>
        <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
          Шошго (таслалаар тусгаарлана)
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

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
        <button
          type='button'
          onClick={onCancel}
          className='border border-[#0d0d0d] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0d0d0d] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
          Cancel
        </button>
        <button
          type='submit'
          disabled={saving}
          className='border border-[#0d0d0d] bg-[#0d0d0d] px-6 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#ffffff] transition-colors hover:bg-[#4d5544] disabled:border-[#4d5544] disabled:bg-[#4d5544] disabled:opacity-70'>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
