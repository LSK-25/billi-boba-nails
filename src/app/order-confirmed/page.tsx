'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getOrderByNumberForCurrentUser } from '@/lib/commerce-orders';
import { formatPreviewDate, readLatestOrder, type StoredOrder } from '@/lib/preview-orders';
import { formatPrice } from '@/lib/utils';

const timeline = ['Order confirmed', 'Photos under review', 'In production', 'Quality check', 'Ready to dispatch', 'Dispatched'];

export default function OrderConfirmedPage() {
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      const params = new URLSearchParams(window.location.search);
      const orderParam = params.get('order') ?? '';

      const databaseOrder = orderParam ? await getOrderByNumberForCurrentUser(orderParam) : null;
      setOrder(databaseOrder ?? readLatestOrder());
      setLoading(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const placedAt = useMemo(() => formatPreviewDate(order?.createdAt), [order]);

  return (
    <section className="page-shell py-14">
      <div className="liquid-glass overflow-hidden rounded-[2.6rem] p-7 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <span className="pill">Order confirmed</span>
            <h1 className="mt-6 font-display text-5xl font-black leading-[0.94] tracking-[-0.07em] md:text-7xl">
              Your set request is in.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#756778]">
              {loading
                ? 'Loading your order details...'
                : 'Your order is saved in the BILLi&BoBA database. Payment status stays pending until Razorpay is connected.'}
            </p>

            <div className="mt-7 grid gap-3 rounded-[1.8rem] border border-white/60 bg-white/48 p-5 backdrop-blur-2xl">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Order ID</span>
                <strong className="font-mono text-sm text-[#2b2130]">{order?.orderId ?? 'Loading...'}</strong>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Tracking ID</span>
                <strong className="font-mono text-sm text-[#6d3fb1]">{order?.trackingId ?? 'Loading...'}</strong>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Placed</span>
                <strong className="text-sm text-[#2b2130]">{placedAt}</strong>
              </div>
              {order && (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Total</span>
                  <strong className="text-sm text-[#2b2130]">{formatPrice(order.subtotal)}</strong>
                </div>
              )}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={order ? `/track-order?order=${encodeURIComponent(order.orderId)}` : '/track-order'} className="btn-primary">Track order</Link>
              <Link href="/account/orders" className="btn-secondary">My orders</Link>
              <Link href="/shop" className="btn-secondary">Continue shopping</Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/65 bg-white/45 p-5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Status timeline</p>
            <div className="mt-5 grid gap-3">
              {timeline.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-[1.3rem] border border-[#4a314e1c] bg-white/45 p-3">
                  <span className={`grid h-9 w-9 place-items-center rounded-full text-xs font-black ${index === 0 ? 'bg-gradient-to-br from-[#ee77a6] to-[#8c6fe8] text-white' : 'bg-[#f1e9ff] text-[#6d3fb1]'}`}>
                    {index === 0 ? '✓' : index + 1}
                  </span>
                  <div>
                    <p className="font-black text-[#2c2131]">{step}</p>
                    <p className="text-xs font-semibold text-[#8a7a8e]">{index === 0 ? 'Completed' : 'Coming next'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}