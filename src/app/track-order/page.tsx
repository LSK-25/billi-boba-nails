'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { findTrackedOrder } from '@/lib/commerce-orders';
import { formatPreviewDate, readLatestOrder, type StoredOrder } from '@/lib/preview-orders';
import { formatPrice } from '@/lib/utils';

const statuses = ['Order confirmed', 'Photos under review', 'In production', 'Quality check', 'Ready to dispatch', 'Dispatched', 'Delivered'];

function getStatusIndex(status?: string) {
  const index = statuses.findIndex((item) => item.toLowerCase() === status?.toLowerCase());
  return index >= 0 ? index : 0;
}

export default function TrackOrderPage() {
  const [identifier, setIdentifier] = useState('');
  const [contact, setContact] = useState('');
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [message, setMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const orderParam = params.get('order') ?? '';
      const latestOrder = readLatestOrder();

      if (!orderParam) return;

      setIdentifier(orderParam);

      if (latestOrder?.orderId === orderParam || latestOrder?.trackingId === orderParam) {
        setOrder(latestOrder);
        setContact(latestOrder.customer?.email || latestOrder.customer?.phone || '');
        setHasSearched(true);
        setMessage('');
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const activeIndex = useMemo(() => getStatusIndex(order?.status), [order]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSearched(true);
    setIsSearching(true);
    setMessage('');

    try {
      const foundOrder = await findTrackedOrder(identifier, contact);

      if (!foundOrder) {
        setOrder(null);
        setMessage('No order found for those details. Enter the exact Order ID or Tracking ID and the matching email or phone number.');
        return;
      }

      setOrder(foundOrder);
    } catch (caughtError) {
      const errorMessage = caughtError instanceof Error ? caughtError.message : 'Could not search order right now.';
      setOrder(null);
      setMessage(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="page-shell py-14">
      <span className="pill">Track order</span>
      <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Track your set</h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[#756778]">
        Enter the Order ID or Tracking ID from your confirmation page. This now checks the Supabase order database.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <div className="liquid-glass h-fit rounded-[2rem] p-6">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Find order</h2>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <input
              className="input-field"
              placeholder="Order ID or Tracking ID"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
            />
            <input
              className="input-field"
              placeholder="Email or phone used at checkout"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Track order'}
            </button>
          </form>

          {message && (
            <div className="mt-5 rounded-[1.4rem] border border-[#ee77a640] bg-white/50 p-4 text-sm font-semibold leading-6 text-[#80647d] backdrop-blur-xl">
              {message}
            </div>
          )}

          <div className="mt-5 rounded-[1.4rem] border border-white/65 bg-white/42 p-4 text-xs font-semibold leading-5 text-[#8a7a8e] backdrop-blur-xl">
            Tip: after checkout, open <strong>My orders</strong> to copy your Order ID or Tracking ID.
          </div>
        </div>

        <div className="liquid-glass rounded-[2rem] p-6">
          {order ? (
            <>
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Current status</p>
                  <h2 className="mt-3 font-display text-4xl font-black tracking-[-0.06em]">{order.status}</h2>
                  <p className="mt-2 text-sm font-semibold text-[#8a7a8e]">Placed on {formatPreviewDate(order.createdAt)}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/65 bg-white/48 px-5 py-4 text-right backdrop-blur-xl">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Total</p>
                  <p className="mt-1 text-2xl font-black text-[#2b2130]">{formatPrice(order.subtotal)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 rounded-[1.8rem] border border-white/60 bg-white/42 p-5 backdrop-blur-2xl">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Order ID</span>
                  <strong className="font-mono text-sm text-[#2b2130]">{order.orderId}</strong>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Tracking ID</span>
                  <strong className="font-mono text-sm text-[#6d3fb1]">{order.trackingId}</strong>
                </div>
                {order.customer?.email && (
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Email</span>
                    <strong className="text-sm text-[#2b2130]">{order.customer.email}</strong>
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-4">
                {statuses.map((status, index) => {
                  const isDone = index <= activeIndex;
                  const isCurrent = index === activeIndex;

                  return (
                    <div key={status} className="flex gap-4 rounded-[1.4rem] border border-[#4a314e1c] bg-white/46 p-4">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${isDone ? 'bg-gradient-to-br from-[#ee77a6] to-[#8c6fe8] text-white' : 'bg-white/70 text-[#8d738f]'}`}>
                        {isDone ? '✓' : index + 1}
                      </span>
                      <div>
                        <p className="font-black text-[#3b3040]">{status}</p>
                        <p className="mt-1 text-sm text-[#756778]">
                          {isCurrent ? 'Current step for this order.' : isDone ? 'Completed.' : 'Upcoming step.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
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
            </>
          ) : (
            <div className="grid min-h-[460px] place-items-center text-center">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] border border-white/70 bg-white/45 text-2xl shadow-[0_20px_55px_rgba(137,104,180,.18)] backdrop-blur-2xl">
                  🧾
                </div>
                <h2 className="mt-5 font-display text-4xl font-black tracking-[-0.06em]">
                  {hasSearched ? 'Order not found.' : 'Status will appear here.'}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-[#8a7a8e]">
                  Complete checkout first, then use the generated Order ID or Tracking ID to see the timeline here.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/account/orders" className="btn-secondary">My orders</Link>
                  <Link href="/shop" className="btn-primary">Browse sets</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}