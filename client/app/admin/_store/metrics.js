import { fetchAdmin } from './http.js';

export async function getAdminMetrics() {
  const [products, categories, orders] = await Promise.all([
    fetchAdmin('/api/products'),
    fetchAdmin('/api/categories'),
    fetchAdmin('/api/orders', { auth: true, fallback: [] }),
  ]);
  const totalStock = products.reduce(
    (sum, product) => sum + (Number(product.stock) || 0),
    0
  );
  const uniqueCustomers = new Set(
    orders.map(order => order?.user?._id || order?.user).filter(Boolean)
  );

  return [
    { id: 'products', label: 'Бүртгэлтэй бараа', value: `${products.length}` },
    { id: 'stock', label: 'Нийт барааны тоо', value: `${totalStock}` },
    { id: 'orders', label: 'Бүртгэгдсэн захиалга', value: `${orders.length}` },
    {
      id: 'customers',
      label: 'Захиалга хийсэн хэрэглэгч',
      value: `${uniqueCustomers.size}`,
    },
  ];
}
