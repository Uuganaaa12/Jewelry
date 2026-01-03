const API_BASE =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:5001';

async function fetchJson(endpoint, { fallback = null, query } = {}) {
  try {
    const search = query
      ? `?${new URLSearchParams(
          Object.fromEntries(
            Object.entries(query).filter(
              ([, value]) =>
                value !== undefined && value !== null && value !== ''
            )
          )
        )}`
      : '';

    const response = await fetch(`${API_BASE}${endpoint}${search}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`shopStore ${endpoint} fallback:`, error.message);
    return fallback;
  }
}

export { API_BASE, fetchJson };
