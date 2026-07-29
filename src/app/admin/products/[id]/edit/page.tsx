import { notFound } from 'next/navigation';
import AdminProductForm from '@/components/AdminProductForm';
import AdminShell from '@/components/AdminShell';
import { nailSets } from '@/lib/mock-data';

export function generateStaticParams() {
  return nailSets.map((set) => ({ id: set.id }));
}

export default async function EditAdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const set = nailSets.find((item) => item.id === id);

  if (!set) notFound();

  return (
    <AdminShell
      eyebrow="Edit listing"
      title={`Edit ${set.name}`}
      description="Update the set details, photos, pricing and publishing options. In the backend milestone, this form will save to the real database."
    >
      <AdminProductForm mode="edit" initialSet={set} />
    </AdminShell>
  );
}
