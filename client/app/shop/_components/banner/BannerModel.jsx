import { uploadBannerImage } from '@/app/admin/_store/banner';
import { getTextColor } from './bannerUtils';

// Banner засах Modal
export const BannerModal = ({
  show,
  banner,
  onBannerChange,
  onSave,
  onClose,
  isUploading,
  setIsUploading,
  uploadError,
  setUploadError,
  banners,
}) => {
  if (!show || !banner) return null;

  const isEditing = banners.some(b => b.id === banner.id);

  const handleImageUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadError('');
      setIsUploading(true);
      const url = await uploadBannerImage(file);
      onBannerChange({ ...banner, bgImage: url || '' });
    } catch (error) {
      setUploadError(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-8'>
        <h2 className='mb-6 text-2xl font-bold uppercase'>
          {isEditing ? 'Banner засах' : 'Шинэ banner нэмэх'}
        </h2>

        <div className='space-y-4'>
          {/* Үндсэн талбарууд */}
          <div>
            <label className='mb-1 block text-sm font-semibold'>Eyebrow</label>
            <input
              type='text'
              value={banner.eyebrow}
              onChange={e =>
                onBannerChange({ ...banner, eyebrow: e.target.value })
              }
              className='w-full border border-gray-300 px-3 py-2'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-semibold'>Гарчиг</label>
            <input
              type='text'
              value={banner.heading}
              onChange={e =>
                onBannerChange({ ...banner, heading: e.target.value })
              }
              className='w-full border border-gray-300 px-3 py-2'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-semibold'>Тайлбар</label>
            <textarea
              value={banner.description}
              onChange={e =>
                onBannerChange({ ...banner, description: e.target.value })
              }
              rows={3}
              className='w-full border border-gray-300 px-3 py-2'
            />
          </div>

          {/* CTA товчнууд */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1 block text-sm font-semibold'>
                Primary Button
              </label>
              <input
                type='text'
                placeholder='Текст'
                value={banner.primaryCta.label}
                onChange={e =>
                  onBannerChange({
                    ...banner,
                    primaryCta: {
                      ...banner.primaryCta,
                      label: e.target.value,
                    },
                  })
                }
                className='mb-2 w-full border border-gray-300 px-3 py-2'
              />
              <input
                type='text'
                placeholder='Link'
                value={banner.primaryCta.href}
                onChange={e =>
                  onBannerChange({
                    ...banner,
                    primaryCta: {
                      ...banner.primaryCta,
                      href: e.target.value,
                    },
                  })
                }
                className='w-full border border-gray-300 px-3 py-2'
              />
            </div>

            <div>
              <label className='mb-1 block text-sm font-semibold'>
                Secondary Button
              </label>
              <input
                type='text'
                placeholder='Текст'
                value={banner.secondaryCta.label}
                onChange={e =>
                  onBannerChange({
                    ...banner,
                    secondaryCta: {
                      ...banner.secondaryCta,
                      label: e.target.value,
                    },
                  })
                }
                className='mb-2 w-full border border-gray-300 px-3 py-2'
              />
              <input
                type='text'
                placeholder='Link'
                value={banner.secondaryCta.href}
                onChange={e =>
                  onBannerChange({
                    ...banner,
                    secondaryCta: {
                      ...banner.secondaryCta,
                      href: e.target.value,
                    },
                  })
                }
                className='w-full border border-gray-300 px-3 py-2'
              />
            </div>
          </div>

          {/* Өнгө болон зураг */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1 block text-sm font-semibold'>
                Background Color
              </label>
              <input
                type='color'
                value={
                  banner.bgColor?.startsWith('#') ? banner.bgColor : '#0d0d0d'
                }
                onChange={e =>
                  onBannerChange({ ...banner, bgColor: e.target.value })
                }
                className='h-10 w-full cursor-pointer border border-gray-300 bg-white'
              />
              <p className='mt-1 text-xs text-gray-500'>
                Зураг байхгүй үед энэ өнгийг ашиглана
              </p>
            </div>

            <div>
              <label className='mb-1 block text-sm font-semibold'>
                Background Image
              </label>
              <input
                type='file'
                accept='image/*'
                onChange={handleImageUpload}
                className='w-full text-sm'
                disabled={isUploading}
              />
              {isUploading && (
                <p className='mt-1 text-xs text-gray-500'>Uploading...</p>
              )}
              {uploadError && (
                <p className='mt-1 text-xs text-red-600'>{uploadError}</p>
              )}
              {banner.bgImage && !isUploading && !uploadError && (
                <p className='mt-1 text-xs text-green-600'>
                  Зураг амжилттай хуулагдлаа
                </p>
              )}
            </div>

            <div>
              <label className='mb-1 block text-sm font-semibold'>
                Text Color
              </label>
              <input
                type='color'
                value={getTextColor(banner.textColor)}
                onChange={e =>
                  onBannerChange({ ...banner, textColor: e.target.value })
                }
                className='h-10 w-full cursor-pointer border border-gray-300 bg-white'
              />
              <p className='mt-1 text-xs text-gray-500'>Текстийн өнгө сонгох</p>
            </div>
          </div>
        </div>

        {/* Footer товчнууд */}
        <div className='mt-8 flex justify-end gap-4'>
          <button
            onClick={onClose}
            className='border-2 border-gray-300 px-6 py-2 text-sm font-semibold uppercase hover:bg-gray-100'>
            Болих
          </button>
          <button
            onClick={onSave}
            className='bg-[#0d0d0d] px-6 py-2 text-sm font-semibold uppercase text-white hover:bg-[#4d5544]'>
            Хадгалах
          </button>
        </div>
      </div>
    </div>
  );
};
