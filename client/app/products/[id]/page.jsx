import { redirect } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default async function ProductRedirectPage({ params }) {
  const { id } = await params;

  try {
    const res = await fetch(`${API}/api/products/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const product = await res.json();
      const categoryId = product.category?._id || product.category;
      if (categoryId) {
        redirect(`/shop/categories/${categoryId}/products/${id}`);
      }
    }
  } catch {}

  // Category байхгүй бол бүтээгдэхүүний жагсаалт руу явна
  redirect('/shop/products');
}
