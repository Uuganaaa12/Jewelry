'use client';

import Script from 'next/script';
import GoogleLoginButton from './googleLogin';

export default function Login() {
  return (
    <>
      <h1>Login</h1>

      <Script
        src='https://accounts.google.com/gsi/client'
        strategy='afterInteractive'
      />

      <GoogleLoginButton />
    </>
  );
}
