'use client';
import { useEffect, useState } from 'react';
import { completeLoginSession } from '@/lib/auth-client';

export default function GoogleLoginButton() {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkGoogle = setInterval(() => {
      if (typeof window !== 'undefined' && window.google) {
        clearInterval(checkGoogle);
        setIsGoogleLoaded(true);
      }
    }, 100);

    return () => clearInterval(checkGoogle);
  }, []);

  useEffect(() => {
    if (!isGoogleLoaded) return;

    const handleCredentialResponse = async response => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ tokenId: response.credential }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${res.status}`
          );
        }

        const data = await res.json();

        const nextDestination = completeLoginSession(data);

        window.location.href = nextDestination;
      } catch (error) {
        console.error('Login failed:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-signin'),
      { theme: 'outline', size: 'large' }
    );
  }, [isGoogleLoaded]);

  return (
    <div>
      <div id='google-signin'></div>
      {loading && <p>Logging in...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
