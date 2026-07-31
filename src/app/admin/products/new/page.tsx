import AdminProductForm from '@/components/AdminProductForm';
import AdminShell from '@/components/AdminShell';

export default function NewAdminProductPage() {
  return (
    <AdminShell
      eyebrow="Create listing"
      title="Add a new set"
      description="Create a live Supabase product with photos, price, category, length options, shape, finish and product-page copy."
    >
      <AdminProductForm mode="new" />
    </AdminShell>
  );
}