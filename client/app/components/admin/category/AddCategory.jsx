'use client';

import { useEffect, useState } from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:5001';

const initialFormState = { name: '', description: '', parent: '' };

export default function CategoryUploadForm({ onSuccess }) {
  const [formData, setFormData] = useState(initialFormState);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      try {
        setLoadingCategories(true);
        const response = await fetch(`${API_BASE}/api/categories`);
        const data = await response.json();
        if (isMounted) setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    }
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Нэр заавал оруулна уу!');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      if (formData.parent) {
        data.append('parent', formData.parent);
      }
      images.forEach(image => data.append('images', image));

      const response = await fetch(`${API_BASE}/api/categories/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert('Категори амжилттай нэмэгдлээ!');
        setFormData(initialFormState);
        setImages([]);
        setPreviews([]);
        setLoadingCategories(true);
        const resync = await fetch(`${API_BASE}/api/categories`);
        const refreshed = await resync.json();
        setCategories(refreshed);
        if (onSuccess) {
          const identifier = result?._id || result?.id || result?.categoryId;
          onSuccess(identifier);
        }
      } else {
        alert('Алдаа: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
      setLoadingCategories(false);
    }
  };

  return (
    <div className='mx-auto max-w-3xl'>
      <div className='grid gap-6'>
        <div className='grid gap-2'>
          <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
            Нэр *
          </label>
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleChange}
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] placeholder:text-[#0d0d0d]/50 focus:outline-none focus:ring-0'
            placeholder='Жишээ: Цагирган зүүлт'
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
            className='border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 text-sm leading-6 text-[#0d0d0d] placeholder:text-[#0d0d0d]/50 focus:outline-none focus:ring-0'
            placeholder='Категорийн талаарх тайлбар...'
          />
        </div>

        <div className='grid gap-2'>
          <label className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
            Үндсэн категори (заавал биш)
          </label>
          <div
            className={`${
              loadingCategories ? 'admin-placeholder' : ''
            } border border-[#0d0d0d] bg-[#ffffff] px-4 py-1`}>
            <select
              name='parent'
              value={formData.parent}
              onChange={handleChange}
              disabled={loadingCategories}
              className='w-full bg-transparent py-2 text-sm uppercase tracking-[0.1em] text-[#0d0d0d] focus:outline-none'>
              <option value=''>-- Дэд категори биш --</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <p className='text-xs uppercase tracking-[0.16em] text-[#0d0d0d]/60'>
            Хэрэв энэ нь дэд категори бол үндсэн категорийг сонгоно уу
          </p>
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

        <button
          onClick={handleSubmit}
          disabled={loading}
          className='border border-[#0d0d0d] bg-[#0d0d0d] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffffff] transition-colors hover:bg-[#4d5544] disabled:border-[#4d5544] disabled:bg-[#4d5544] disabled:opacity-70'>
          {loading ? 'Уншиж байна...' : 'Категори нэмэх'}
        </button>
      </div>
    </div>
  );
}
