'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminProductForm from '@/components/AdminProductForm';
import AdminShell from '@/components/AdminShell';
import { getAdminProduct, type AdminProduct } from '@/lib/admin-products';

export default function EditAdminProductPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getAdminProduct(decodeURIComponent(productId)).then((nextProduct) => {
      if (!active) return;
      setProduct(nextProduct);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <AdminShell
        eyebrow="Edit listing"
        title="Loading product..."
        description="Fetching the real Supabase product."
        action={<Link href="/admin/products" className="btn-secondary w-fit">Back to products</Link>}
      >
        <div className="liquid-glass rounded-[2rem] p-8">
          <p className="font-black text-[#34263c]">Loading product details...</p>
        </div>
      </AdminShell>
    );
  }

  if (!product) {
    return (
      <AdminShell
        eyebrow="Edit listing"
        title="Product not found"
        description="This product was not found in Supabase."
        action={<Link href="/admin/products" className="btn-secondary w-fit">Back to products</Link>}
      >
        <div className="liquid-glass rounded-[2rem] p-8">
          <p className="font-black text-[#34263c]">No matching product found.</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      eyebrow="Edit listing"
      title={`Edit ${product.name}`}
      description="Update the live product details, upload more photos and control whether the set appears in the shop."
      action={<Link href="/admin/products" className="btn-secondary w-fit">Back to products</Link>}
    >
      <AdminProductForm mode="edit" initialProduct={product} />
    </AdminShell>
  );
}