import { fetchJson } from './http.js';
import { mapProduct } from './mappers.js';
import { getCategoryDetail } from './categories.js';

export async function getProducts({
  category,
  onSale,
  search,
  limit,
  page,
  pageSize,
  withMeta,
} = {}) {
  const query = {};
  if (category) query.category = category;
  if (onSale) query.onSale = 'true';
  if (search) query.search = search;
  if (page) query.page = String(page);

  const effectiveLimit = pageSize ?? limit;
  if (effectiveLimit) {
    query.limit = String(effectiveLimit);
  }

  const fallback = withMeta
    ? {
        items: [],
        total: 0,
        page: Number(page) || 1,
        pageSize: Number(effectiveLimit) || 0,
        totalPages: 1,
      }
    : [];

  const response = await fetchJson('/api/products', {
    fallback,
    query,
  });

  const rawItems = Array.isArray(response)
    ? response
    : Array.isArray(response?.items)
    ? response.items
    : [];
  const mappedItems = rawItems.map(mapProduct).filter(Boolean);

  if (!withMeta && Array.isArray(response)) {
    return mappedItems;
  }

  if (withMeta) {
    const total = Number(response?.total);
    const currentPage = Number(response?.page) || Number(page) || 1;
    const size =
      Number(response?.pageSize) ||
      Number(effectiveLimit) ||
      mappedItems.length ||
      1;
    const totalPages =
      Number(response?.totalPages) ||
      Math.max(
        1,
        Math.ceil((Number.isFinite(total) ? total : mappedItems.length) / size)
      );

    return {
      items: mappedItems,
      total: Number.isFinite(total) ? total : mappedItems.length,
      page: currentPage,
      pageSize: size,
      totalPages,
    };
  }

  return mappedItems;
}

export async function getProductDetail(id) {
  if (!id) return null;
  const product = await fetchJson(`/api/products/${id}`, { fallback: null });
  return mapProduct(product);
}

export async function getCategoryWithProducts(categoryId) {
  const [category, products] = await Promise.all([
    getCategoryDetail(categoryId),
    getProducts({ category: categoryId }),
  ]);

  return {
    category,
    products,
  };
}
