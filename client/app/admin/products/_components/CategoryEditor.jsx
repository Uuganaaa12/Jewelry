'use client';

import { useEffect, useMemo, useState } from 'react';
import { updateCategory } from '../../_store/adminStore';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:5001';

const initialState = { name: '', description: '', parent: '' };

export default function CategoryEditor({ category, onCancel, onUpdated }) {
  const [formData, setFormData] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    if (!category) return;
    setFormData({
      name: category.name || '',
      description: category.description || '',
      parent:
        typeof category.parent === 'object'
          ? category.parent?._id || ''
          : category.parent || '',
    });
  }, [category]);

  useEffect(() => {
    if (!category?._id) return;
    let active = true;
    setLoadingOptions(true);

    (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/categories`);
        const data = await response.json();
        if (!active) return;
        const filtered = Array.isArray(data)
          ? data.filter(item => item._id !== category._id)
          : [];
        setOptions(filtered);
      } catch (error) {
        if (active) {
          console.error('Failed to load categories for editor', error);
          setOptions([]);
        }
      } finally {
        if (active) setLoadingOptions(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [category?._id]);

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(previous => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!category?._id) return;
    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parent: formData.parent ? formData.parent : null,
      };

      const updated = await updateCategory(category._id, payload);
      alert('Категори амжилттай шинэчлэгдлээ!');
      if (onUpdated) {
        onUpdated(updated);
      }
    } catch (error) {
      console.error('Failed to update category', error);
      alert('Категори шинэчлэхэд алдаа гарлаа.');
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = useMemo(() => {
    if (!category) return [];
    return options.map(option => ({
      id: option._id,
      label: option.name,
    }));
  }, [options, category]);

  return (
    <form onSubmit={handleSubmit} className='grid gap-4'>
      <header className='flex flex-col gap-1'>
        <h3 className='text-sm font-semibold uppercase tracking-[0.18em]'>
          Edit category
        </h3>
        <p className='text-xs leading-6 text-[#0d0d0d]/70'>
          Текстийн талбаруудыг шинэчлээд хадгална уу. Зураг өөрчлөх бол тусдаа
          upload endpoint ашиглана.
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

      <div className='grid gap-2'>
        <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
          Үндсэн категори
        </label>
        <div
          className={`border border-[#0d0d0d] bg-[#ffffff] px-4 py-1 ${
            loadingOptions ? 'admin-placeholder' : ''
          }`}>
          <select
            name='parent'
            value={formData.parent}
            onChange={handleChange}
            disabled={loadingOptions}
            className='w-full bg-transparent py-2 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] focus:outline-none'>
            <option value=''>-- Үндсэн категори байхгүй --</option>
            {parentOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
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
