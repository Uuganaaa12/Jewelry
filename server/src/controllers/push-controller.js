import PushSubscription from '../models/PushSubscription.js';
import { pushReady } from '../utils/push.js';

export const subscribePush = async (req, res) => {
  if (!pushReady) {
    return res.status(503).json({ message: 'Push not configured' });
  }

  const subscription = req.body;
  if (
    !subscription?.endpoint ||
    !subscription?.keys?.p256dh ||
    !subscription?.keys?.auth
  ) {
    return res.status(400).json({ message: 'Invalid subscription' });
  }

  const userId = req.user?.id || null;

  const saved = await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    { endpoint: subscription.endpoint, keys: subscription.keys, user: userId },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ id: saved._id });
};
