'use client';
import { useEffect, useState } from 'react';
import { fetchProfile, updateProfile } from '@/app/shop/_store/account';

const emptyAddress = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  zip: '',
  country: '',
};

export default function AccountProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    fetchProfile()
      .then(data => {
        if (mounted) {
          setProfile({
            ...data,
            address: { ...emptyAddress, ...(data?.address || {}) },
            preferences: {
              language: data?.preferences?.language || 'mn',
              newsletter: Boolean(data?.preferences?.newsletter),
            },
          });
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleToggleNewsletter = () => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        newsletter: !prev.preferences.newsletter,
      },
    }));
  };

  const submit = async e => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateProfile({
        name: profile.name,
        phone: profile.phone,
        profilePic: profile.profilePic,
        address: profile.address,
        preferences: profile.preferences,
      });
      setProfile({
        ...updated,
        address: { ...emptyAddress, ...(updated?.address || {}) },
      });
      setSuccess('Профайл амжилттай хадгалагдлаа');
    } catch (err) {
      setError(err.message || 'Алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='text-sm uppercase tracking-[0.2em] text-[#4d5544]'>
        Ачааллаж байна…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='text-sm uppercase tracking-[0.2em] text-[#b33a3a]'>
        Профайл олдсонгүй
      </div>
    );
  }

  return (
    <form onSubmit={submit} className='grid gap-6'>
      <div className='grid gap-1'>
        <span className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
          Ерөнхий мэдээлэл
        </span>
        <div className='grid gap-4 sm:grid-cols-2 sm:gap-6'>
          <label className='grid gap-2 text-sm text-[#0d0d0d]'>
            <span className='text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
              Нэр
            </span>
            <input
              type='text'
              value={profile.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
              required
            />
          </label>
          <label className='grid gap-2 text-sm text-[#0d0d0d]'>
            <span className='text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
              Имэйл
            </span>
            <input
              type='email'
              value={profile.email || ''}
              disabled
              className='border border-[#0d0d0d] bg-[#f5f5f5] px-3 py-2 text-sm text-[#0d0d0d]/70 focus:outline-none'
            />
          </label>
          <label className='grid gap-2 text-sm text-[#0d0d0d]'>
            <span className='text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
              Утас
            </span>
            <input
              type='tel'
              value={profile.phone || ''}
              onChange={e => handleChange('phone', e.target.value)}
              className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
            />
          </label>
          <label className='grid gap-2 text-sm text-[#0d0d0d]'>
            <span className='text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
              Профайл зураг (URL)
            </span>
            <input
              type='url'
              value={profile.profilePic || ''}
              onChange={e => handleChange('profilePic', e.target.value)}
              className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
              placeholder='https://...'
            />
          </label>
        </div>
      </div>

      <div className='grid gap-2'>
        <span className='text-xs uppercase tracking-[0.22em] text-[#4d5544]'>
          Хүргэлтийн хаяг
        </span>
        <div className='grid gap-4 sm:grid-cols-2 sm:gap-6'>
          <input
            type='text'
            placeholder='Байр, гудамж'
            value={profile.address?.line1 || ''}
            onChange={e => handleAddressChange('line1', e.target.value)}
            className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
          />
          <input
            type='text'
            placeholder='Орц, давхар (нэмэлт)'
            value={profile.address?.line2 || ''}
            onChange={e => handleAddressChange('line2', e.target.value)}
            className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
          />
          <input
            type='text'
            placeholder='Хот'
            value={profile.address?.city || ''}
            onChange={e => handleAddressChange('city', e.target.value)}
            className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
          />
          <input
            type='text'
            placeholder='Аймаг / Дүүрэг'
            value={profile.address?.state || ''}
            onChange={e => handleAddressChange('state', e.target.value)}
            className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
          />
          <input
            type='text'
            placeholder='ZIP / Шуудангийн код'
            value={profile.address?.zip || ''}
            onChange={e => handleAddressChange('zip', e.target.value)}
            className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
          />
          <input
            type='text'
            placeholder='Улс'
            value={profile.address?.country || ''}
            onChange={e => handleAddressChange('country', e.target.value)}
            className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
          />
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-3 border border-[#0d0d0d] bg-[#f8f8f8] px-3 py-3 text-sm sm:px-4'>
        <label className='flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#0d0d0d]'>
          <input
            type='checkbox'
            checked={Boolean(profile.preferences?.newsletter)}
            onChange={handleToggleNewsletter}
            className='h-4 w-4 border-[#0d0d0d] accent-[#0d0d0d]'
          />
          Мэдээлэл хүлээн авах
        </label>
      </div>

      {error && (
        <div className='border border-[#b33a3a] bg-[#b33a3a]/10 px-4 py-3 text-sm text-[#b33a3a]'>
          {error}
        </div>
      )}
      {success && (
        <div className='border border-[#4d5544] bg-[#4d5544]/10 px-4 py-3 text-sm text-[#0d0d0d]'>
          {success}
        </div>
      )}

      <button
        type='submit'
        disabled={saving}
        className='w-full border border-[#0d0d0d] bg-[#0d0d0d] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#4d5544] disabled:opacity-70 sm:w-auto'>
        {saving ? 'Хадгалж байна…' : 'Хадгалах'}
      </button>
    </form>
  );
}
