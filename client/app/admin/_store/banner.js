import { fetchAdmin, authorizedJson, authorizedDelete } from './http.js';
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:5001';

const resolveToken = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  return token && token.length > 0 ? token : null;
};
const unwrapList = (data, fallback = []) => {
  if (!data) return fallback;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.banners)) return data.banners;
  if (data?.banner) return [data.banner];
  return fallback;
};

const unwrapSingle = (data, fallback = null) => {
  if (!data) return fallback;
  if (data?.banner) return data.banner;
  if (Array.isArray(data?.banners) && data.banners.length > 0) {
    return data.banners[0];
  }
  return data;
};

export async function getBanners({ includeInactive = true } = {}) {
  const data = await fetchAdmin('/api/banners', { fallback: [] });
  const banners = unwrapList(data, []);
  return includeInactive
    ? banners
    : banners.filter(item => item?.isActive !== false);
}

export async function getBannerDetail(id) {
  if (!id) return null;
  const data = await fetchAdmin(`/api/banners/${id}`, { fallback: null });
  return unwrapSingle(data, null);
}

export async function createBanner(payload) {
  return authorizedJson('/api/banners', 'POST', payload);
}

export async function updateBanner(id, payload) {
  if (!id) throw new Error('Missing banner id');
  return authorizedJson(`/api/banners/${id}`, 'PUT', payload);
}

export async function deleteBanner(id) {
  if (!id) throw new Error('Missing banner id');
  return authorizedDelete(`/api/banners/${id}`);
}

export async function uploadBannerImage(file) {
  const token = resolveToken();
  if (!token) throw new Error('Missing admin token');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/banners/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Banner image upload failed');
  }

  const data = await response.json();
  return data.url || data.secure_url || data.banner?.bgImage || null;
}
