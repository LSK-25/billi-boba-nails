import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import { adminOrders, getAdminOrderSet } from '@/lib/admin-data';
import { formatPrice } from '@/lib/utils';

export default function AdminOrdersPage() {
  return (
    <AdminShell
      eyebrow="Order control"
      title="Order management"
      description="Review paid orders, check hand-photo status, monitor production and update tracking. This will later connect to real customer orders."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Needs photo review', adminOrders.filter((order) => order.photoStatus !== 'Approved').length],
          ['In production queue', adminOrders.filter((order) => order.status === 'In production').length],
          ['Paid orders', adminOrders.filter((order) => order.paymentStatus === 'Paid').length],
        ].map(([label, value]) => (
          <div key={label} className="liquid-glass rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9a7d9c]">{label}</p>
            <p className="mt-3 font-display text-4xl font-black tracking-[-0.06em]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 liquid-glass rounded-[2rem] p-4 md:p-6">
        <div className="grid gap-3 rounded-[1.4rem] border border-white/55 bg-white/35 p-4 text-xs font-black uppercase tracking-[0.16em] text-[#8c6d96] lg:grid-cols-[1fr_.9fr_.75fr_.75fr_.45fr] lg:items-center">
          <span>Order</span>
          <span>Customer</span>
          <span>Photo status</span>
          <span>Production</span>
          <span>Total</span>
        </div>
        <div className="mt-4 grid gap-3">
          {adminOrders.map((order) => {
            const set = getAdminOrderSet(order);

            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid gap-4 rounded-[1.65rem] border border-white/55 bg-white/40 p-4 transition hover:bg-white/62 lg:grid-cols-[1fr_.9fr_.75fr_.75fr_.45fr] lg:items-center"
              >
                <div>
                  <p className="font-black text-[#34263c]">{order.id}</p>
                  <p className="mt-1 text-xs font-bold text-[#8a728d]">{set?.name ?? 'Nail set'} • {order.preferredLength}</p>
                </div>
                <div>
                  <p className="text-sm font-black text-[#4b3e51]">{order.customer}</p>
                  <p className="mt-1 text-xs font-bold text-[#8a728d]">{order.city}</p>
                </div>
                <span className="w-fit rounded-full bg-[#fff0f7] px-3 py-1 text-xs font-black text-[#b04e79]">{order.photoStatus}</span>
                <span className="w-fit rounded-full bg-[#f4eaff] px-3 py-1 text-xs font-black text-[#6d3fb1]">{order.status}</span>
                <span className="font-black">{formatPrice(order.total)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
