'use client';
import { useState } from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:5001';

async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Серверийн алдаа');
  }
  return data;
}

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await postJson('/api/auth/reset-request', { email });
      setMessage(`Код илгээгдлээ: ${res.code} (demo) — 15 минут хүчинтэй`);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await postJson('/api/auth/reset-confirm', { email, code, newPassword });
      setMessage('Нууц үг шинэчлэгдлээ. Одоо нэвтэрнэ үү.');
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-auto flex max-w-xl flex-col gap-6 rounded border border-[#0d0d0d] bg-white px-5 py-6 text-[#0d0d0d] sm:px-8 sm:py-8'>
      <h1 className='text-2xl font-semibold uppercase tracking-[0.14em]'>
        Нууц үг сэргээх
      </h1>
      <p className='text-sm text-[#0d0d0d]/75'>
        И-мэйлээ оруулж сэргээх код аваад, дараагийн алхамд кодоо баталгаажуулж
        шинэ нууц үг тохируулна.
      </p>

      {step === 1 && (
        <form onSubmit={requestCode} className='grid gap-3'>
          <label className='grid gap-2 text-sm'>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              И-мэйл
            </span>
            <input
              type='email'
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
            />
          </label>
          <button
            type='submit'
            disabled={loading}
            className='border border-[#0d0d0d] bg-[#0d0d0d] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white hover:bg-[#4d5544] disabled:opacity-70'>
            {loading ? 'Илгээж байна…' : 'Код авах'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={confirmReset} className='grid gap-3'>
          <label className='grid gap-2 text-sm'>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              Сэргээх код
            </span>
            <input
              type='text'
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
            />
          </label>
          <label className='grid gap-2 text-sm'>
            <span className='text-[11px] uppercase tracking-[0.2em] text-[#4d5544]'>
              Шинэ нууц үг
            </span>
            <input
              type='password'
              required
              minLength={6}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className='border border-[#0d0d0d] px-3 py-2 text-sm focus:outline-none'
            />
          </label>
          <button
            type='submit'
            disabled={loading}
            className='border border-[#0d0d0d] bg-[#0d0d0d] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white hover:bg-[#4d5544] disabled:opacity-70'>
            {loading ? 'Баталгаажуулж байна…' : 'Нууц үг шинэчлэх'}
          </button>
        </form>
      )}

      {message && (
        <div className='border border-[#4d5544] bg-[#4d5544]/10 px-4 py-3 text-sm text-[#0d0d0d]'>
          {message}
        </div>
      )}
      {error && (
        <div className='border border-[#b33a3a] bg-[#b33a3a]/10 px-4 py-3 text-sm text-[#b33a3a]'>
          {error}
        </div>
      )}
    </div>
  );
}
