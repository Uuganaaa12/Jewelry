'use client';
import { useState } from 'react';
import Link from 'next/link';
import { changePassword } from '@/app/shop/_store/account';

export default function AccountSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Шинэ нууц үг таарахгүй байна');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess('Нууц үг шинэчлэгдлээ');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='grid gap-6'>
      <form onSubmit={handleSubmit} className='grid gap-4'>
        <div className='grid gap-2 sm:grid-cols-2 sm:gap-4'>
          <label className='grid gap-2 text-sm text-[#0d0d0d]'>
            <span className='text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
              Одоогийн нууц үг
            </span>
            <input
              type='password'
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
            />
          </label>
          <label className='grid gap-2 text-sm text-[#0d0d0d]'>
            <span className='text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
              Шинэ нууц үг
            </span>
            <input
              type='password'
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
            />
          </label>
          <label className='grid gap-2 text-sm text-[#0d0d0d]'>
            <span className='text-[11px] uppercase tracking-[0.22em] text-[#4d5544]'>
              Шинэ нууц үг давтах
            </span>
            <input
              type='password'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
            />
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
          disabled={loading}
          className='w-full border border-[#0d0d0d] bg-[#0d0d0d] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#4d5544] disabled:opacity-70 sm:w-auto'>
          {loading ? 'Шинэчилж байна…' : 'Нууц үг солих'}
        </button>
      </form>
    </div>
  );
}
