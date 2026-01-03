'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AuthShell({
  mode = 'login',
  title,
  subtitle,
  children,
  footer,
  highlight = 'Aurora Jewelry',
  highlightCopy = 'Timeless pieces crafted to elevate every day.',
  highlightCta = 'Browse the collection',
  formType = 'login',
}) {
  const isLoginActive = formType === 'login';
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    setIsAnimating(true);
    const frame = requestAnimationFrame(() => setIsAnimating(false));
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  const alternateContent = isLoginActive
    ? {
        heading: 'Бүртгүүлэх',
        copy: 'Өөрийн дансаа үүсгээд хайртай загваруудаа хадгалж, захиалгаа хянах боломжтой.',
        href: '/auth/signup',
        label: 'Бүртгүүлэх',
      }
    : {
        heading: 'Нэвтрэх',
        copy: 'Данстай хэрэглэгчид манай бүтээгдэхүүн, захиалга, урамшуулалд түрүүлж нэвтэрнэ.',
        href: '/auth/login',
        label: 'Нэвтрэх',
      };

  const renderActiveForm = () => (
    <div className='auth-form-wrapper'>
      <header className='auth-header'>
        <h2 className='auth-title'>{title}</h2>
        {subtitle && <p className='auth-subtitle'>{subtitle}</p>}
      </header>

      <div className='auth-body'>{children}</div>

      {footer && <div className='auth-footer'>{footer}</div>}
    </div>
  );

  const renderPlaceholder = () => (
    <div className='auth-placeholder'>
      <p className='auth-eyebrow'>Jewelry Studio</p>
      <h3 className='auth-placeholder-title'>{alternateContent.heading}</h3>
      <p className='auth-placeholder-copy'>{alternateContent.copy}</p>
      <Link href={alternateContent.href} className='auth-placeholder-link'>
        {alternateContent.label}
      </Link>
    </div>
  );

  return (
    <main className='auth-stage' data-mode={mode}>
      <div
        className='auth-container'
        data-mode={mode}
        data-animating={isAnimating}>
        <section
          className='auth-pane auth-pane--form auth-pane--login'
          data-active={isLoginActive}>
          {isLoginActive ? renderActiveForm() : renderPlaceholder()}
        </section>

        <section className='auth-pane auth-pane--accent'>
          <div className='auth-accent'>
            <p className='auth-accent-eyebrow'>{highlight}</p>
            <h1 className='auth-accent-title'>{highlightCopy}</h1>
          </div>

          <div className='auth-accent-footer'>
            <p>Need assistance picking the right piece?</p>
            <Link href='/shop' className='auth-accent-link'>
              {highlightCta}
            </Link>
          </div>
        </section>

        <section
          className='auth-pane auth-pane--form auth-pane--register'
          data-active={!isLoginActive}>
          {!isLoginActive ? renderActiveForm() : renderPlaceholder()}
        </section>
      </div>
    </main>
  );
}
