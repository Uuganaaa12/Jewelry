'use client'
import { useState } from 'react';

export default function ProductUploadForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    tags: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Зураг сонгох
  const handleImageChange = e => {
    const files = Array.from(e.target.files);

    // Зураг хадгалах
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
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      // FormData үүсгэх
      const data = new FormData();

      // Text fields нэмэх
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('category', formData.category);

      // Tags нэмэх (array болгох)
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim());
        data.append('tags', JSON.stringify(tagsArray));
      }

      // Зургууд нэмэх
      images.forEach(image => {
        data.append('images', image);
      });

      // Token авах
      const token = localStorage.getItem('token'); // эсвэл cookies-оос

      // Backend рүү илгээх
      const response = await fetch(
        'http://localhost:5001/api/products/upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type-ыг БИТГИЙ оруул! FormData автоматаар тохируулна
          },
          body: data,
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert('Бүтээгдэхүүн амжилттай нэмэгдлээ!');
        // Form цэвэрлэх
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: '',
          tags: '',
        });
        setImages([]);
        setPreviews([]);
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
      <h2 className='text-2xl font-bold mb-6'>Шинэ бүтээгдэхүүн нэмэх</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Нэр */}
        <div>
          <label className='block mb-2'>Нэр *</label>
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleChange}
            required
            className='w-full border rounded px-3 py-2'
          />
        </div>

        {/* Тайлбар */}
        <div>
          <label className='block mb-2'>Тайлбар</label>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleChange}
            rows='4'
            className='w-full border rounded px-3 py-2'
          />
        </div>

        {/* Үнэ */}
        <div>
          <label className='block mb-2'>Үнэ *</label>
          <input
            type='number'
            name='price'
            value={formData.price}
            onChange={handleChange}
            required
            className='w-full border rounded px-3 py-2'
          />
        </div>

        {/* Нөөц */}
        <div>
          <label className='block mb-2'>Нөөц</label>
          <input
            type='number'
            name='stock'
            value={formData.stock}
            onChange={handleChange}
            className='w-full border rounded px-3 py-2'
          />
        </div>

        {/* Категори */}
        <div>
          <label className='block mb-2'>Категори ID *</label>
          <input
            type='text'
            name='category'
            value={formData.category}
            onChange={handleChange}
            required
            className='w-full border rounded px-3 py-2'
          />
        </div>

        {/* Шошго */}
        <div>
          <label className='block mb-2'>Шошго (таслалаар тусгаарлана)</label>
          <input
            type='text'
            name='tags'
            value={formData.tags}
            onChange={handleChange}
            placeholder='luxury, gold, ring'
            className='w-full border rounded px-3 py-2'
          />
        </div>

        {/* Зураг upload */}
        <div>
          <label className='block mb-2'>Зургууд (5 хүртэл)</label>
          <input
            type='file'
            accept='image/*'
            multiple
            onChange={handleImageChange}
            className='w-full border rounded px-3 py-2'
          />
        </div>

        {/* Зургийн preview */}
        {previews.length > 0 && (
          <div className='grid grid-cols-3 gap-4'>
            {previews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`Preview ${index + 1}`}
                className='w-full h-32 object-cover rounded'
              />
            ))}
          </div>
        )}

        {/* Submit button */}
        <button
          type='submit'
          disabled={loading}
          className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400'>
          {loading ? 'Уншиж байна...' : 'Нэмэх'}
        </button>
      </form>
    </div>
  );
}
