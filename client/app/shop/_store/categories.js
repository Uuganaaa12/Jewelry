import { fetchJson } from './http.js';
import { mapCategory } from './mappers.js';

export async function getCategories() {
  const categories = await fetchJson('/api/categories', { fallback: [] });
  const items = Array.isArray(categories) ? categories : [];
  return items.map(mapCategory).filter(Boolean);
}

export async function getCategoryDetail(id) {
  if (!id) return null;
  const category = await fetchJson(`/api/categories/${id}`, { fallback: null });
  return mapCategory(category);
}

export async function getFeaturedCategories(limit = 4) {
  const categories = await getCategories();
  return categories.slice(0, limit);
}
