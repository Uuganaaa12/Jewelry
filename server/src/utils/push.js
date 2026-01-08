import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

const pushEnabled = Boolean(publicKey && privateKey);
console.log('medegdel shalgalt');
if (pushEnabled) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
  console.log('[push] enabled with VAPID public key present');
} else {
  console.warn('[push] disabled: missing VAPID keys');
}

const buildNotificationPayload = order => {
  const title = 'Шинэ захиалга';
  const amount = Number(order?.totalAmount) || 0;
  const paymentCode = order?.paymentCode || 'Код';
  const body = `${amount.toFixed(0)}₮ · Код: ${paymentCode}`;

  return {
    title,
    body,
    data: { orderId: order?._id?.toString?.() || order?.id },
    icon: '/icons/order.png',
    badge: '/icons/badge.png',
  };
};

export const sendOrderPush = async order => {
  if (!pushEnabled) return;

  const payload = JSON.stringify(buildNotificationPayload(order));
  const subs = await PushSubscription.find({});

  console.log('[push] sending to', subs.length, 'subscriptions');
  if (subs.length === 0) return;

  const sendJobs = subs.map(async sub => {
    try {
      await webpush.sendNotification(sub, payload);
      console.log('[push] sent to', sub.endpoint);
    } catch (error) {
      const status = error?.statusCode;
      if (status === 404 || status === 410) {
        await PushSubscription.deleteOne({ _id: sub._id });
      } else {
        console.warn('Push send failed', status || '', error?.message || error);
      }
    }
  });

  await Promise.allSettled(sendJobs);
};

export const pushReady = pushEnabled;
