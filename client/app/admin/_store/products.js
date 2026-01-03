import { fetchAdmin, authorizedJson, authorizedDelete } from './http.js';
import { pickImage, isSaleCurrentlyActive } from './mappers.js';

export async function getProductOverview(limit = 5) {
  const products = await fetchAdmin('/api/products');
  const sorted = [...products].sort(
    (a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0)
  );
  const lowStock = sorted.filter(item => (Number(item.stock) || 0) < 5);

  return {
    total: products.length,
    lowStock: lowStock.length,
    items: products.slice(0, limit).map(item => ({
      id: item._id,
      name: item.name,
      stock: Number(item.stock) || 0,
      category:
        typeof item.category === 'object' ? item.category?.name : item.category,
      price: Number(item.price) || 0,
    })),
  };
}

export async function getProductsByCategory() {
  const [products, categories] = await Promise.all([
    fetchAdmin('/api/products'),
    fetchAdmin('/api/categories'),
  ]);
  const categoryMap = new Map(
    categories.map(category => [
      category._id,
      {
        id: category._id,
        name: category.name,
        description: category.description,
        image: pickImage(category),
        parentId:
          typeof category.parent === 'object'
            ? category.parent?._id || null
            : category.parent || null,
        parentName:
          typeof category.parent === 'object'
            ? category.parent?.name || null
            : null,
        products: [],
      },
    ])
  );
  const grouped = [...categoryMap.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const unassigned = [];

  products.forEach(product => {
    const categoryId =
      typeof product.category === 'object'
        ? product.category?._id
        : product.category;
    const bucket = categoryId ? categoryMap.get(categoryId) : null;
    const basePrice = Number(product.price) || 0;
    const salePrice =
      product.salePrice !== undefined && product.salePrice !== null
        ? Number(product.salePrice)
        : null;
    const saleActive = isSaleCurrentlyActive(product);
    const entry = {
      id: product._id,
      name: product.name,
      price: basePrice,
      saleActive,
      salePrice: Number.isFinite(salePrice) ? salePrice : null,
      saleStart: product.saleStart || null,
      saleEnd: product.saleEnd || null,
      effectivePrice:
        saleActive && Number.isFinite(salePrice) ? salePrice : basePrice,
      stock: Number(product.stock) || 0,
      sku: product.sku || '—',
      sizes: Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [],
      colors: Array.isArray(product.colors)
        ? product.colors.filter(Boolean)
        : [],
      optionGroups: Array.isArray(product.optionGroups)
        ? product.optionGroups
        : [],
      productType: product.productType || '',
      image: pickImage(product),
      categoryName:
        typeof product.category === 'object'
          ? product.category?.name
          : product.category,
    };
    (bucket ? bucket.products : unassigned).push(entry);
  });

  grouped.forEach(bucket =>
    bucket.products.sort((a, b) => a.name.localeCompare(b.name))
  );

  return {
    categories: grouped,
    unassigned: unassigned.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export async function getProductDetail(id) {
  if (!id) return null;
  return fetchAdmin(`/api/products/${id}`, { fallback: null });
}

export async function updateProduct(id, payload) {
  if (!id) throw new Error('Missing product id');
  return authorizedJson(`/api/products/${id}`, 'PUT', payload);
}

export async function deleteProduct(id) {
  if (!id) throw new Error('Missing product id');
  return authorizedDelete(`/api/products/${id}`);
}
