import { fetchAdmin, authorizedJson } from './http.js';

export async function getRecentOrders(limit = 5) {
  const orders = await fetchAdmin('/api/orders', { auth: true, fallback: [] });
  return orders
    .map(order => ({
      id: order._id,
      total: Number(order.totalAmount) || 0,
      payment: order.paymentMethod || 'unknown',
      user:
        order?.user?.email || order?.user?.name || order?.user || 'Customer',
      createdAt: order.createdAt || null,
      status: order.status || 'pending',
    }))
    .filter(order => order.status !== 'pending')
    .sort(
      (a, b) =>
        (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
        (a.createdAt ? new Date(a.createdAt).getTime() : 0)
    )
    .slice(0, limit);
}

export async function updateOrderStatus(id, status) {
  if (!id) throw new Error('Missing order id');
  if (!status) throw new Error('Missing order status');
  return authorizedJson(`/api/orders/${id}/status`, 'PUT', { status });
}

export async function getOrdersPage({ page = 1, limit = 10 } = {}) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
  const endpoint = `/api/orders/feed?page=${safePage}&limit=${safeLimit}`;
  return fetchAdmin(endpoint, {
    auth: true,
    fallback: {
      items: [],
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: 0,
        pages: 1,
      },
      summary: {
        totalValue: 0,
        openCount: 0,
      },
    },
  });
}

export async function getOrderDetail(id) {
  if (!id) return null;
  return fetchAdmin(`/api/orders/${id}`, { auth: true, fallback: null });
}
