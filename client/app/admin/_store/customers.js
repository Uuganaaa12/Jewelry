import { fetchAdmin } from './http.js';

export async function getCustomerSnapshot() {
  const orders = await fetchAdmin('/api/orders', { auth: true, fallback: [] });
  const customers = new Map();

  orders.forEach(order => {
    const id = order?.user?._id || order?.user || 'anonymous';
    const existing = customers.get(id) || {
      id,
      name: order?.user?.name || order?.user?.email || 'Customer',
      email: order?.user?.email || 'N/A',
      orders: 0,
      spend: 0,
    };
    existing.orders += 1;
    existing.spend += Number(order.totalAmount) || 0;
    customers.set(id, existing);
  });

  return [...customers.values()].sort((a, b) => b.spend - a.spend).slice(0, 6);
}
