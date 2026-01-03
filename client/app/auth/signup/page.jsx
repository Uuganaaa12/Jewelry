'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useState } from 'react';
import { completeLoginSession } from '@/lib/auth-client';
import AuthShell from '../_components/AuthShell';
import useRedirectIfAuthenticated from '../_components/useRedirectIfAuthenticated';
import GoogleLoginButton from '../login/googleLogin';

export default function Signup() {
  useRedirectIfAuthenticated();

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = event => {
    const { name, value } = event.target;
    setFormValues(current => ({ ...current, [name]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!formValues.name || !formValues.email || !formValues.password) {
      setFormError('Шаардлагатай бүх талбарыг бөглөнө үү.');
      return;
    }

    if (formValues.password.length < 6) {
      setFormError('Нууц үг хамгийн багадаа 6 тэмдэгт байна.');
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      setFormError('Нууц үгнүүд хоорондоо тохирохгүй байна.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: formValues.name.trim(),
            email: formValues.email.trim(),
            password: formValues.password,
          }),
        }
      );

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || 'Бүртгүүлэхэд алдаа гарлаа.');
      }

      const data = await response.json();
      const next = completeLoginSession(data);
      window.location.replace(next);
    } catch (error) {
      console.error('Signup failed:', error);
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      mode='signup'
      formType='register'
      title='Бүртгүүлэх'
      subtitle=''
      footer={
        <p>
          Танд бүртгэл байгаа юу?{' '}
          <Link href='/auth/login' className='auth-link'>
            Нэвтрэх
          </Link>
        </p>
      }>
      <form onSubmit={handleSubmit} className='auth-form'>
        <div className='auth-form-group'>
          <label className='auth-label'>Нэр</label>
          <input
            type='text'
            name='name'
            value={formValues.name}
            onChange={handleChange}
            autoComplete='name'
            placeholder='Таны нэр'
            className='auth-input'
          />
        </div>

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
          <input
            type='password'
            name='password'
            value={formValues.password}
            onChange={handleChange}
            autoComplete='new-password'
            placeholder='••••••••'
            className='auth-input'
          />
        </div>

        <div className='auth-form-group'>
          <label className='auth-label'>Нууц үг баталгаажуулах</label>
          <input
            type='password'
            name='confirmPassword'
            value={formValues.confirmPassword}
            onChange={handleChange}
            autoComplete='new-password'
            placeholder='••••••••'
            className='auth-input'
          />
        </div>

        {formError && <p className='auth-error'>{formError}</p>}

        <button type='submit' disabled={isSubmitting} className='auth-button'>
          {isSubmitting ? 'Илгээж байна...' : 'Бүртгүүлэх'}
        </button>
      </form>

      <div className='auth-external'>
        <p className='auth-divider'>
          <span>эсвэл</span>
        </p>
        <Script
          src='https://accounts.google.com/gsi/client'
          strategy='afterInteractive'
        />
        <div className='auth-google'>
          <GoogleLoginButton />
        </div>
      </div>
    </AuthShell>
  );
}
