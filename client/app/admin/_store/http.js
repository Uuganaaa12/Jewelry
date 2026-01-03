const API_BASE =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:5001';

const resolveToken = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  return token && token.length > 0 ? token : null;
};

async function fetchAdmin(endpoint, { auth = false, fallback = [] } = {}) {
  try {
    const headers = {};

    if (auth) {
      const token = resolveToken();
      if (!token) {
        throw new Error('Missing admin token');
      }
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      cache: 'no-store',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`adminStore ${endpoint} fallback:`, error.message);
    return fallback;
  }
}

async function authorizedJson(endpoint, method, payload) {
  const token = resolveToken();
  if (!token) {
    throw new Error('Missing admin token');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

async function authorizedDelete(endpoint) {
  const token = resolveToken();
  if (!token) {
    throw new Error('Missing admin token');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

export { API_BASE, resolveToken, fetchAdmin, authorizedJson, authorizedDelete };
