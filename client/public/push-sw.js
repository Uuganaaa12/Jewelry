self.addEventListener('push', event => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (error) {
    payload = { title: 'Notification', body: event.data.text() };
  }

  const title = payload.title || 'Notification';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/order.png',
    badge: payload.badge || '/icons/badge.png',
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const orderId = event.notification?.data?.orderId;
  const target = orderId ? `/admin/orders/${orderId}` : '/admin/orders';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (const client of windowClients) {
          const url = new URL(client.url);
          if (url.pathname === target && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(target);
      })
  );
});
