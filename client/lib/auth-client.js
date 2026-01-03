'use client';

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

const fallbackRole = role => (role ? role : 'user');

export function persistSession({ token, user }) {
  if (typeof window === 'undefined') {
    return 'user';
  }

  const role = fallbackRole(user?.role);
  const normalizedUser = { ...user, role };

  if (token) {
    document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  }

  localStorage.setItem('token', token || '');
  localStorage.setItem('user', JSON.stringify(normalizedUser));

  return role;
}

export function resolveRedirect(role) {
  return role === 'admin' ? '/admin' : '/shop';
}

export function completeLoginSession(data) {
  const role = persistSession({ token: data?.token, user: data?.user });
  return resolveRedirect(role);
}

export function clearSession() {
  if (typeof window === 'undefined') {
    return;
  }

  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
