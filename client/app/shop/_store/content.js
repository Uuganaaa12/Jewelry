import { fetchJson } from './http.js';
import { getCategories } from './categories.js';
import { getProducts } from './products.js';

export function getHeroContent() {
  return {
    eyebrow: 'Итал загвар, орчин үе',
    heading: 'Уламжлалт хийц ба орчин үеийн дизайн',
    description:
      'Эрэлхийлсэн өнгө, хэмжээ, материалтай үнэт эдлэлүүдийг шууд нөөцийн мэдээллээр үзээрэй.',
    primaryCta: { label: 'Каталог үзэх', href: '/shop/products' },
    secondaryCta: { label: 'Коллекцууд', href: '/shop/collections' },
  };
}

export async function getFeaturedCategories(limit = 4) {
  const categories = await getCategories();
  return categories.slice(0, limit);
}

export async function getFeaturedProducts(limit = 6) {
  const products = await getProducts({ limit });
  return products.slice(0, limit);
}

export async function getShopMetrics() {
  try {
    const [products, categories] = await Promise.all([
      fetchJson('/api/products', { fallback: [] }),
      fetchJson('/api/categories', { fallback: [] }),
    ]);

    return [
      {
        id: 'catalogue',
        value: `${products.length}`,
        label: 'Бүртгэлтэй бүтээгдэхүүн',
      },
      {
        id: 'categories',
        value: `${categories.length}`,
        label: 'Категорийн тоо',
      },
      {
        id: 'inventory',
        value: products
          .reduce((sum, item) => sum + (Number(item.stock) || 0), 0)
          .toString(),
        label: 'Нөөцийн нийлбэр',
      },
    ];
  } catch (error) {
    console.warn('shopStore metrics fallback:', error.message);
    return [];
  }
}
