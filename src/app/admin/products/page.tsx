'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { deleteAdminProduct, getAdminProducts, type AdminProduct } from '@/lib/admin-products';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function loadProducts() {
    setLoading(true);
    const nextProducts = await getAdminProducts();
    setProducts(nextProducts);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    getAdminProducts().then((nextProducts) => {
      if (!active) return;
      setProducts(nextProducts);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(product: AdminProduct) {
    const confirmed = window.confirm(
      `Delete "${product.name}" permanently?\n\nOnly delete products that have no orders. For products with orders, use Archive instead.`
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    setMessage('');

    try {
      await deleteAdminProduct(product);
      setMessage('Product deleted.');
      await loadProducts();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : 'Could not delete product.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminShell
      eyebrow="Collection manager"
      title="Product management"
      description="Add, edit, feature, archive, price and upload photos for real Supabase products."
      action={<Link href="/admin/products/new" className="btn-primary w-fit">Add new set</Link>}
    >
      <div className="liquid-glass rounded-[2rem] p-4 md:p-6">
        {message && (
          <div className="mb-4 rounded-[1.35rem] border border-white/60 bg-white/55 p-4 text-sm font-bold leading-6 text-[#6d5871]">
            {message}
          </div>
        )}

        <div className="grid gap-3 rounded-[1.4rem] border border-white/55 bg-white/35 p-4 text-xs font-black uppercase tracking-[0.16em] text-[#8c6d96] md:grid-cols-[1fr_.55fr_.5fr_.45fr_.7fr] md:items-center">
          <span>Set</span>
          <span>Category</span>
          <span>Status</span>
          <span>Price</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="mt-4 rounded-[1.65rem] border border-white/55 bg-white/40 p-6">
            <p className="font-black text-[#34263c]">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-4 rounded-[1.65rem] border border-white/55 bg-white/40 p-6">
            <p className="font-black text-[#34263c]">No products yet.</p>
            <p className="mt-1 text-sm font-semibold text-[#8a728d]">Create your first nail set listing.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {products.map((set) => (
              <div
                key={set.id}
                className="grid gap-4 rounded-[1.65rem] border border-white/55 bg-white/40 p-4 transition hover:bg-white/62 md:grid-cols-[1fr_.55fr_.5fr_.45fr_.7fr] md:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(135deg,#ffe1ed,#e8dcff)]">
                    {set.images[0]?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={set.images[0].imageUrl} alt={set.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-black text-[#34263c]">{set.name}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#8a728d]">
                      {set.designCode} • {set.lengthOptions.join(', ')} • {set.shape}
                    </p>
                  </div>
                </div>

                <span className="text-sm font-black text-[#5f5263]">{set.category}</span>
                <span className="w-fit rounded-full bg-[#f4eaff] px-3 py-1 text-xs font-black text-[#6d3fb1]">{set.status}</span>
                <span className="font-black">{formatPrice(set.priceInr)}</span>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/products/${set.slug}/edit`} className="btn-secondary px-4 py-2 text-sm">
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(set)}
                    disabled={deletingId === set.id}
                    className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === set.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}