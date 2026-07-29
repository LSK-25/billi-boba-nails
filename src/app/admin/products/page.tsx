import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import { productSummary } from '@/lib/admin-data';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  return (
    <AdminShell
      eyebrow="Collection manager"
      title="Product management"
      description="Add, edit, feature, archive and price your nail sets from one place. Real images and live database saving will be connected in the backend milestone."
      action={<Link href="/admin/products/new" className="btn-primary w-fit">Add new set</Link>}
    >
      <div className="liquid-glass rounded-[2rem] p-4 md:p-6">
        <div className="grid gap-3 md:grid-cols-[1fr_.55fr_.5fr_.45fr_.42fr] md:items-center rounded-[1.4rem] border border-white/55 bg-white/35 p-4 text-xs font-black uppercase tracking-[0.16em] text-[#8c6d96]">
          <span>Set</span>
          <span>Category</span>
          <span>Status</span>
          <span>Price</span>
          <span>Action</span>
        </div>

        <div className="mt-4 grid gap-3">
          {productSummary.map((set) => (
            <div
              key={set.id}
              className="grid gap-4 rounded-[1.65rem] border border-white/55 bg-white/40 p-4 transition hover:bg-white/62 md:grid-cols-[1fr_.55fr_.5fr_.45fr_.42fr] md:items-center"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-16 w-16 shrink-0 rounded-2xl border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_14px_30px_rgba(120,84,132,.12)]"
                  style={{ background: `linear-gradient(135deg, ${set.tone}, #ffffff 58%, ${set.accentTone})` }}
                />
                <div>
                  <p className="font-black text-[#34263c]">{set.name}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#8a728d]">{set.code} • {set.length} • {set.shape}</p>
                </div>
              </div>
              <span className="text-sm font-black text-[#5f5263]">{set.category}</span>
              <span className="w-fit rounded-full bg-[#f4eaff] px-3 py-1 text-xs font-black text-[#6d3fb1]">{set.status}</span>
              <span className="font-black">{formatPrice(set.price)}</span>
              <Link href={`/admin/products/${set.id}/edit`} className="btn-secondary px-4 py-2 text-sm">Edit</Link>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
