import { fetchAdmin, authorizedJson, authorizedDelete } from './http.js';

export async function getCategoryOverview(limit = 6) {
  const categories = await fetchAdmin('/api/categories');
  return {
    total: categories.length,
    items: categories.slice(0, limit).map(({ _id, name, description }) => ({
      id: _id,
      name,
      description,
    })),
  };
}

export async function getCategoryDetail(id) {
  if (!id) return null;
  return fetchAdmin(`/api/categories/${id}`, { fallback: null });
}

export async function updateCategory(id, payload) {
  if (!id) throw new Error('Missing category id');
  return authorizedJson(`/api/categories/${id}`, 'PUT', payload);
}

export async function deleteCategory(id) {
  if (!id) throw new Error('Missing category id');
  return authorizedDelete(`/api/categories/${id}`);
}
