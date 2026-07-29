import AdminProductForm from '@/components/AdminProductForm';
import AdminShell from '@/components/AdminShell';

export default function NewAdminProductPage() {
  return (
    <AdminShell
      eyebrow="Create listing"
      title="Add a new set"
      description="Use this layout to create a future nail set listing with photos, price, category, length, shape, finish and product-page copy."
    >
      <AdminProductForm mode="new" />
    </AdminShell>
  );
}
