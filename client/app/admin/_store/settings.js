import { fetchAdmin } from './http.js';

export async function getSettingsSnapshot() {
  const products = await fetchAdmin('/api/products');
  const categories = await fetchAdmin('/api/categories');

  return {
    catalogConnected: products.length > 0,
    categoriesSynced: categories.length > 0,
    lastSync: new Date().toISOString(),
  };
}
