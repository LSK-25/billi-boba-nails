import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import { adminMetrics, adminOrders, getAdminOrderSet, productSummary } from '@/lib/admin-data';
import { formatPrice } from '@/lib/utils';

const quickActions = [
  { href: '/admin/products/new', label: 'Add new nail set', note: 'Create a product listing with photos and pricing.' },
  { href: '/admin/orders', label: 'Review orders', note: 'Check photos, payments and production status.' },
  { href: '/admin/products', label: 'Manage collection', note: 'Edit prices, categories, featured sets and archive status.' },
];

export default function AdminPage() {
  return (
    <AdminShell
      title="Studio dashboard"
      description="A clean owner workspace for managing BILLi&BoBA sets, customer orders, photo review, production and tracking. Backend connection comes next; this milestone locks the admin experience first."
      action={<Link href="/admin/products/new" className="btn-primary w-fit">Add new set</Link>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        {adminMetrics.map((card) => (
          <div key={card.label} className="liquid-glass rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9a7d9c]">{card.label}</p>
            <p className="mt-3 font-display text-4xl font-black tracking-[-0.06em]">{card.value}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Recent orders</h2>
              <p className="mt-1 text-sm font-semibold text-[#756778]">Photo review and production queue.</p>
            </div>
            <Link href="/admin/orders" className="btn-secondary px-4 py-2 text-sm">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {adminOrders.slice(0, 4).map((order) => {
              const set = getAdminOrderSet(order);

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="grid gap-3 rounded-[1.45rem] border border-white/55 bg-white/40 p-4 transition hover:-translate-y-0.5 hover:bg-white/62 md:grid-cols-[1fr_1fr_.9fr_.45fr] md:items-center"
                >
                  <div>
                    <p className="font-black text-[#3b3040]">{order.id}</p>
                    <p className="mt-1 text-xs font-bold text-[#8a728d]">{order.customer} • {order.city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#4b3e51]">{set?.name ?? 'Custom set'}</p>
                    <p className="mt-1 text-xs font-bold text-[#8a728d]">{order.preferredLength} • Qty {order.quantity}</p>
                  </div>
                  <span className="w-fit rounded-full bg-[#ede5ff] px-3 py-1 text-xs font-black text-[#60498f]">{order.status}</span>
                  <span className="font-black">{formatPrice(order.total)}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
            <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Quick actions</h2>
            <div className="mt-5 grid gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} className="rounded-[1.45rem] border border-white/55 bg-white/38 p-4 transition hover:bg-white/62">
                  <p className="font-black text-[#34263c]">{action.label}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#756778]">{action.note}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Collection health</h2>
              <Link href="/admin/products" className="text-sm font-black text-[#6d3fb1]">Open →</Link>
            </div>
            <div className="mt-5 grid gap-3">
              {productSummary.slice(0, 3).map((set) => (
                <div key={set.id} className="flex items-center justify-between gap-3 rounded-[1.35rem] border border-white/55 bg-white/38 p-4">
                  <div>
                    <p className="font-black text-[#34263c]">{set.name}</p>
                    <p className="text-xs font-bold text-[#8a728d]">{set.code} • {set.status}</p>
                  </div>
                  <p className="font-black text-[#6d3fb1]">{formatPrice(set.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
