import { API_BASE, resolveToken } from './http';

// Must be prefixed with NEXT_PUBLIC_ to be exposed on the client bundle
const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const urlBase64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const canUsePush = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window;

export async function subscribeToPush() {
  if (!canUsePush()) throw new Error('Push not supported');
  if (!PUBLIC_KEY) throw new Error('Missing VAPID public key');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted')
    throw new Error('Notification permission denied');

  // Ensure a service worker is active before subscribing
  const existing = await navigator.serviceWorker.getRegistration('/push-sw.js');
  const registration =
    existing || (await navigator.serviceWorker.register('/push-sw.js'));

  const activeRegistration = registration.active
    ? registration
    : await navigator.serviceWorker.ready;

  const subscription = await activeRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
  });

  const token = resolveToken();
  if (!token) throw new Error('Missing admin token');

  const response = await fetch(`${API_BASE}/api/push/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(msg || 'Failed to save subscription');
  }

  return true;
}
