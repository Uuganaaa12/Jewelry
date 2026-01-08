'use client';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:5001';

const resolveToken = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  return token && token.length > 0 ? token : null;
};

export class ApiError extends Error {
  constructor(message, duration = 3000) {
    super(message);
    this.name = 'ApiError';
    this.duration = duration;
  }
}

const buildAuthHeaders = token => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

async function authorizedFetch(endpoint, { method = 'GET', body } = {}) {
  const token = resolveToken();
  if (!token) {
    // throw new Error('Authentication required.');
    return <div>Та эхлээд нэвтэрнэ үү.</div>;
  }

  const headers = buildAuthHeaders(token);
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    cache: 'no-store',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export { authorizedFetch };

export async function fetchCart() {
  return authorizedFetch('/api/cart');
}

export async function addCartItem({ productId, quantity = 1, size = null }) {
  if (!productId) {
    throw new ApiError('Product id is required.', 3000);
  }

  const token = resolveToken();
  if (!token) {
    throw new ApiError('Та эхлээд нэвтэрнэ үү.', 3000);
  }

  return authorizedFetch('/api/cart', {
    method: 'POST',
    body: { product: productId, quantity, size },
  });
}

export async function updateCartItem({ productId, quantity = 1, size = null }) {
  if (!productId) throw new Error('Product id is required.');
  return authorizedFetch('/api/cart', {
    method: 'PUT',
    body: { product: productId, quantity, size },
  });
}

export async function removeCartItem(productId, size = null) {
  if (!productId) throw new Error('Product id is required.');
  const search = size ? `?size=${encodeURIComponent(size)}` : '';
  return authorizedFetch(`/api/cart/${productId}${search}`, {
    method: 'DELETE',
  });
}

export async function clearCart() {
  return authorizedFetch('/api/cart', { method: 'DELETE' });
}

export async function fetchWishlist() {
  return authorizedFetch('/api/wishlist');
}

export async function addWishlistItem(productId) {
  if (!productId) {
    throw new ApiError('Product id is required.', 3000);
  }

  const token = resolveToken();
  if (!token) {
    throw new ApiError('Та эхлээд нэвтэрнэ үү....', 3000);
  }

  return authorizedFetch('/api/wishlist', {
    method: 'POST',
    body: { product: productId },
  });
}

export async function removeWishlistItem(productId) {
  if (!productId) throw new Error('Product id is required.');
  return authorizedFetch(`/api/wishlist/${productId}`, {
    method: 'DELETE',
  });
}

export async function clearWishlist() {
  return authorizedFetch('/api/wishlist', { method: 'DELETE' });
}
