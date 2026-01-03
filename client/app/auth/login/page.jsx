'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { completeLoginSession } from '@/lib/auth-client';
import AuthShell from '../_components/AuthShell';
import useRedirectIfAuthenticated from '../_components/useRedirectIfAuthenticated';
import GoogleLoginButton from './googleLogin';
import { Eye, EyeClosed } from 'lucide-react';

export default function Login() {
  useRedirectIfAuthenticated();
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('rememberLogin');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormValues(prev => ({
          ...prev,
          email: parsed.email || '',
          password: parsed.password || '',
        }));
        setRememberLogin(true);
      } catch (error) {
        localStorage.removeItem('rememberLogin');
      }
    }
  }, []);

  const handleChange = event => {
    const { name, value } = event.target;
    setFormValues(current => ({ ...current, [name]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!formValues.email || !formValues.password) {
      setFormError('Имэйл болон нууц үгээ бөглөнө үү.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: formValues.email.trim(),
            password: formValues.password,
          }),
        }
      );

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || 'Нэвтрэхэд алдаа гарлаа.');
      }

      const data = await response.json();
      const next = completeLoginSession(data);

      if (rememberLogin) {
        localStorage.setItem(
          'rememberLogin',
          JSON.stringify({
            email: formValues.email.trim(),
            password: formValues.password,
          })
        );
      } else {
        localStorage.removeItem('rememberLogin');
      }

      window.location.replace(next);
    } catch (error) {
      console.error('Email login failed:', error);
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      mode='login'
      formType='login'
      title='Нэвтрэх'
      subtitle=''
      footer={
        <p>
          Шинэ хэрэглэгч үү?{' '}
          <Link href='/auth/signup' className='auth-link'>
            Бүртгүүлэх
          </Link>
        </p>
      }>
      <Script
        src='https://accounts.google.com/gsi/client'
        strategy='afterInteractive'
      />

      <form onSubmit={handleSubmit} className='auth-form'>
        <div className='auth-form-group'>
          <label className='auth-label'>Gmail</label>
          <input
            type='email'
            name='email'
            value={formValues.email}
            onChange={handleChange}
            autoComplete='email'
            placeholder='you@gmail.com'
            className='auth-input'
          />
        </div>

        <div className='auth-form-group'>
          <label className='auth-label'>Нууц үг</label>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              name='password'
              value={formValues.password}
              onChange={handleChange}
              autoComplete='current-password'
              placeholder='••••••••'
              className='auth-input pr-12'
            />
            <button
              type='button'
              onClick={() => setShowPassword(prev => !prev)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-[0.18em] text-[#0d0d0d]/70 hover:text-[#0d0d0d]'>
              {showPassword ? <Eye /> : <EyeClosed />}
            </button>
          </div>
        </div>

        <div className='flex items-center justify-between text-sm'>
          <label className='flex items-center gap-2 text-[13px] text-[#0d0d0d]'>
            <input
              type='checkbox'
              checked={rememberLogin}
              onChange={e => setRememberLogin(e.target.checked)}
              className='h-4 w-4 accent-[#0d0d0d]'
            />
            Сануулах
          </label>
          <Link href='/auth/reset' className='auth-link'>
            Нууц үгээ мартсан уу?
          </Link>
        </div>

        {formError && <p className='auth-error'>{formError}</p>}

        <button type='submit' disabled={isSubmitting} className='auth-button'>
          {isSubmitting ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
        </button>
      </form>

      <div className='auth-external'>
        <p className='auth-divider'>
          <span>эсвэл</span>
        </p>
        <div className='auth-google'>
          <GoogleLoginButton />
        </div>
      </div>
    </AuthShell>
  );
}
