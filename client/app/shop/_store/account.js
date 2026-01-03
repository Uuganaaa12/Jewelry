import { authorizedFetch } from './shopActions.js';

export async function fetchProfile() {
  return authorizedFetch('/api/users/me');
}

export async function updateProfile(payload) {
  return authorizedFetch('/api/users/me', {
    method: 'PUT',
    body: payload,
  });
}

export async function changePassword({ currentPassword, newPassword }) {
  return authorizedFetch('/api/users/me/password', {
    method: 'PUT',
    body: { currentPassword, newPassword },
  });
}

export async function fetchMyOrders() {
  return authorizedFetch('/api/orders/my');
}
