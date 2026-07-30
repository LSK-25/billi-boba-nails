'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { useAuth } from '@/components/AuthProvider';
import { formatPreviewDate, readOrdersForCustomer, type StoredOrder } from '@/lib/preview-orders';
import { formatPrice } from '@/lib/utils';

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    setOrders(readOrdersForCustomer(user?.email));
  }, [user?.email]);

  return (
    <section className="page-shell py-14">
      <span className="pill">My orders</span>
      <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Your order studio.</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#756778]">
            This preview page now filters local test orders by the signed-in customer email. Later it will read from the real Supabase account database.
          </p>
        </div>
        <Link href="/shop" className="btn-primary w-fit">Browse sets</Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 liquid-glass rounded-[2rem] p-8">
          <h2 className="font-display text-4xl font-black tracking-[-0.06em]">No orders yet.</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#756778]">
            Add a nail set to cart and complete the checkout preview. Your confirmed order will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5">
          {orders.map((order) => (
            <article key={order.orderId} className="liquid-glass overflow-hidden rounded-[2rem] p-6 md:p-7">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/65 bg-white/48 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#8d738f]">
                      {order.status}
                    </span>
                    <span className="rounded-full border border-white/65 bg-white/48 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#8d738f]">
                      {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-4xl font-black tracking-[-0.06em]">{order.orderId}</h2>
                  <p className="mt-2 text-sm font-bold text-[#6f6372]">Tracking ID: {order.trackingId}</p>
                  <p className="mt-1 text-sm font-semibold text-[#8a7a8e]">Placed on {formatPreviewDate(order.createdAt)}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/65 bg-white/48 px-5 py-4 text-right backdrop-blur-xl">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Total</p>
                  <p className="mt-1 text-2xl font-black text-[#2b2130]">{formatPrice(order.subtotal)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {order.items.map((item) => (
                  <div key={item.cartId} className="flex flex-col justify-between gap-2 rounded-[1.4rem] border border-[#4a314e1c] bg-white/42 p-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8d738f]">{item.code}</p>
                      <p className="mt-1 font-black text-[#2c2131]">{item.name}</p>
                      <p className="mt-1 text-sm font-semibold text-[#8a7a8e]">{item.length} • Qty {item.quantity}</p>
                    </div>
                    <p className="font-black text-[#2c2131]">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href={`/track-order?order=${encodeURIComponent(order.orderId)}`} className="btn-secondary">Track order</Link>
                <Link href="/photo-guide" className="btn-secondary">Photo guide</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function MyOrdersPage() {
  return (
    <AuthGate requiredRole="customer" title="Login to see your orders." description="Your BILLi&BoBA orders are connected to your customer account.">
      <OrdersContent />
    </AuthGate>
  );
}
