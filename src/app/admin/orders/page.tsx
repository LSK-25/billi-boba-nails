'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { getAdminOrders, type AdminOrder } from '@/lib/admin-orders';
import { formatPrice } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getAdminOrders().then((nextOrders) => {
      if (!active) return;
      setOrders(nextOrders);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    return [
      ['Needs photo review', orders.filter((order) => order.photoStatusLabel !== 'Approved').length],
      ['In production queue', orders.filter((order) => order.status === 'in_production').length],
      ['Pending payment', orders.filter((order) => order.paymentStatus === 'pending').length],
    ];
  }, [orders]);

  return (
    <AdminShell
      eyebrow="Order control"
      title="Order management"
      description="Review real customer orders, uploaded hand photos, production status and payment status from Supabase."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="liquid-glass rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9a7d9c]">{label}</p>
            <p className="mt-3 font-display text-4xl font-black tracking-[-0.06em]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 liquid-glass rounded-[2rem] p-4 md:p-6">
        <div className="grid gap-3 rounded-[1.4rem] border border-white/55 bg-white/35 p-4 text-xs font-black uppercase tracking-[0.16em] text-[#8c6d96] lg:grid-cols-[1fr_.9fr_.72fr_.72fr_.72fr_.45fr] lg:items-center">
          <span>Order</span>
          <span>Customer</span>
          <span>Placed</span>
          <span>Photo status</span>
          <span>Production</span>
          <span>Total</span>
        </div>

        {loading ? (
          <div className="mt-4 rounded-[1.65rem] border border-white/55 bg-white/40 p-6">
            <p className="font-black text-[#34263c]">Loading real orders...</p>
            <p className="mt-1 text-sm font-semibold text-[#8a728d]">Checking Supabase orders.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-4 rounded-[1.65rem] border border-white/55 bg-white/40 p-6">
            <p className="font-black text-[#34263c]">No orders yet.</p>
            <p className="mt-1 text-sm font-semibold text-[#8a728d]">Complete a customer checkout first.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {orders.map((order) => {
              const firstItem = order.items[0];
              const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.orderNumber}`}
                  className="grid gap-4 rounded-[1.65rem] border border-white/55 bg-white/40 p-4 transition hover:bg-white/62 lg:grid-cols-[1fr_.9fr_.72fr_.72fr_.72fr_.45fr] lg:items-center"
                >
                  <div>
                    <p className="font-black text-[#34263c]">{order.orderNumber}</p>
                    <p className="mt-1 text-xs font-bold text-[#8a728d]">
                      {firstItem?.name ?? 'Nail set'} • Qty {quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#4b3e51]">{order.customer.name}</p>
                    <p className="mt-1 text-xs font-bold text-[#8a728d]">{order.shipping.city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#4b3e51]">{order.placedAt}</p>
                    <p className="mt-1 text-xs font-bold text-[#8a728d]">{order.paymentStatusLabel}</p>
                  </div>
                  <span className="w-fit rounded-full bg-[#fff0f7] px-3 py-1 text-xs font-black text-[#b04e79]">
                    {order.photoStatusLabel}
                  </span>
                  <span className="w-fit rounded-full bg-[#f4eaff] px-3 py-1 text-xs font-black text-[#6d3fb1]">
                    {order.statusLabel}
                  </span>
                  <span className="font-black">{formatPrice(order.totals.total)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}