import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import { adminOrders, adminStatusOptions, getAdminOrder, getAdminOrderSet } from '@/lib/admin-data';
import { formatPrice } from '@/lib/utils';

export function generateStaticParams() {
  return adminOrders.map((order) => ({ id: order.id }));
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getAdminOrder(id);

  if (!order) notFound();

  const set = getAdminOrderSet(order);

  return (
    <AdminShell
      eyebrow="Order detail"
      title={order.id}
      description="Review customer details, ordered set, hand-photo status and production progress. The update controls are visual until the backend is connected."
      action={<Link href="/admin/orders" className="btn-secondary w-fit">Back to orders</Link>}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_.85fr]">
        <div className="grid gap-6">
          <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9a7d9c]">Ordered set</p>
                <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.06em]">{set?.name ?? 'Nail set'}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">{set?.description}</p>
              </div>
              <span className="w-fit rounded-full bg-[#f4eaff] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#6d3fb1]">
                {order.paymentStatus}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Tracking ID', order.trackingId],
                ['Preferred length', order.preferredLength],
                ['Quantity', String(order.quantity)],
                ['Total', formatPrice(order.total)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.35rem] border border-white/55 bg-white/38 p-4">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8d738f]">{label}</p>
                  <p className="mt-2 font-black text-[#34263c]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
            <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Hand photo review</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">
              Real uploaded photos will appear here from private Supabase storage. For now these are placeholders for left hand, right hand and optional length reference.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {['Left hand with coin', 'Right hand with coin', 'Length reference'].map((label) => (
                <div key={label} className="grid min-h-52 place-items-center rounded-[1.6rem] border border-dashed border-[#cbb8ff] bg-white/35 p-4 text-center">
                  <div>
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(135deg,#ffe1ed,#e8dcff)] text-2xl">◎</div>
                    <p className="mt-3 text-sm font-black text-[#3b3040]">{label}</p>
                    <p className="mt-1 text-xs font-semibold text-[#756778]">Private photo preview</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button type="button" className="btn-secondary">Approve photos</button>
              <button type="button" className="btn-secondary">Request new photos</button>
              <button type="button" className="btn-primary">Message customer</button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
            <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Customer</h2>
            <div className="mt-5 grid gap-3">
              {[
                ['Name', order.customer],
                ['Email', order.email],
                ['Phone', order.phone],
                ['City', order.city],
                ['Placed', order.placedAt],
                ['Delivery estimate', order.deliveryEstimate],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.3rem] border border-white/55 bg-white/38 p-4">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8d738f]">{label}</p>
                  <p className="mt-2 font-bold text-[#34263c]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
            <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Update status</h2>
            <label className="mt-5 grid gap-2 text-sm font-black text-[#4b3e51]">
              Production status
              <select className="input-field" defaultValue={order.status}>
                {adminStatusOptions.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="mt-4 grid gap-2 text-sm font-black text-[#4b3e51]">
              Internal note
              <textarea className="input-field min-h-28 resize-y" defaultValue={order.notes} />
            </label>
            <button type="button" className="btn-primary mt-5 w-full">Save status update</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
