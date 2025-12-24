'use client';
import { useState, useEffect } from 'react';

export default function CategoryUploadForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Категориудыг татаж авах (parent сонгохын тулд)
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Зураг сонгох
  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Preview үүсгэх
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  // Input өөрчлөлт
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Form submit
  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Нэр заавал оруулна уу!');
      return;
    }

    setLoading(true);

    try {
      // FormData үүсгэх
      const data = new FormData();

      // Text fields нэмэх
      data.append('name', formData.name);
      data.append('description', formData.description);
      
      // Parent category нэмэх (хэрэв сонгосон бол)
      if (formData.parent) {
        data.append('parent', formData.parent);
      }

      // Зургууд нэмэх
      images.forEach(image => {
        data.append('images', image);
      });

      // Token авах
      const token = sessionStorage.getItem('token'); // эсвэл cookies-оос

      // Backend рүү илгээх
      const response = await fetch(
        'http://localhost:5001/api/categories/upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert('Категори амжилттай нэмэгдлээ!');
        // Form цэвэрлэх
        setFormData({
          name: '',
          description: '',
          parent: '',
        });
        setImages([]);
        setPreviews([]);
        // Категориудыг дахин татах
        fetchCategories();
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
    <div className='max-w-2xl mx-auto p-6'>
      <h2 className='text-2xl font-bold mb-6'>Шинэ категори нэмэх</h2>

      <div className='space-y-4'>
        {/* Нэр */}
        <div>
          <label className='block mb-2 font-medium'>Нэр *</label>
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleChange}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Жишээ: Цагирган зүүлт'
          />
        </div>

        {/* Тайлбар */}
        <div>
          <label className='block mb-2 font-medium'>Тайлбар</label>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleChange}
            rows='4'
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Категорийн талаарх тайлбар...'
          />
        </div>

        {/* Parent категори сонгох */}
        <div>
          <label className='block mb-2 font-medium'>
            Үндсэн категори (заавал биш)
          </label>
          <select
            name='parent'
            value={formData.parent}
            onChange={handleChange}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'>
            <option value=''>-- Дэд категори биш --</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className='text-sm text-gray-500 mt-1'>
            Хэрэв энэ нь дэд категори бол үндсэн категорийг сонгоно уу
          </p>
        </div>

        {/* Зураг upload */}
        <div>
          <label className='block mb-2 font-medium'>
            Зургууд (5 хүртэл)
          </label>
          <input
            type='file'
            accept='image/*'
            multiple
            onChange={handleImageChange}
            className='w-full border border-gray-300 rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
          />
        </div>

        {/* Зургийн preview */}
        {previews.length > 0 && (
          <div className='grid grid-cols-3 gap-4'>
            {previews.map((preview, index) => (
              <div key={index} className='relative'>
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className='w-full h-32 object-cover rounded border-2 border-gray-200'
                />
              </div>
            ))}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className='w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors'>
          {loading ? 'Уншиж байна...' : 'Категори нэмэх'}
        </button>
      </div>
    </div>
  );
}
