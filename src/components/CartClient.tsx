'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { formatPrice } from '@/lib/utils';

export default function CartClient() {
  const { lines, count, subtotal, isReady, updateQuantity, removeItem, clearCart } = useCart();

  if (!isReady) {
    return (
      <section className="page-shell py-14">
        <span className="pill">Cart</span>
        <div className="mt-8 liquid-glass rounded-[2rem] p-8">
          <p className="font-bold text-[#756778]">Loading your cart...</p>
        </div>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="page-shell py-14">
        <span className="pill">Cart</span>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.7fr] lg:items-center">
          <div>
            <h1 className="font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Your cart is empty.</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#756778]">
              Choose a set from the studio collection, select the preferred length and add it here before checkout.
            </p>
            <Link href="/shop" className="btn-primary mt-7 w-fit">Browse sets</Link>
          </div>
          <div className="liquid-glass rounded-[2.2rem] p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Shopping flow</p>
            <div className="mt-5 grid gap-3 text-sm font-bold text-[#6d5871]">
              {['Choose set', 'Select length', 'Add to cart', 'Upload photos at checkout'].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-[1.2rem] border border-white/60 bg-white/42 p-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f1e9ff] text-xs text-[#6d3fb1]">{index + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell py-14">
      <span className="pill">Cart</span>
      <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Your cart</h1>
          <p className="mt-3 text-sm font-bold text-[#756778]">{count} item{count === 1 ? '' : 's'} ready for checkout.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={clearCart} className="btn-ghost px-4 py-2 text-sm">Clear cart</button>
          <Link href="/shop" className="btn-secondary w-fit">Continue shopping</Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4">
          {lines.map((item) => (
            <article key={item.cartId} className="liquid-glass grid gap-5 rounded-[2rem] p-4 md:grid-cols-[150px_1fr_auto] md:items-center">
              <Link
  href={`/sets/${item.set.id}`}
  className="relative min-h-[130px] overflow-hidden rounded-[1.4rem] border border-white/70 transition hover:scale-[1.015]"
  style={{ background: `linear-gradient(135deg, ${item.set.tone}, #fff, ${item.set.accentTone})` }}
  aria-label={`View ${item.set.name}`}
>
  {item.set.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.set.imageUrl}
      alt={item.set.name}
      className="absolute inset-0 h-full w-full object-cover"
    />
  ) : (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative h-24 w-24">
        <span className="absolute left-3 top-3 h-20 w-7 rounded-full bg-white/64 shadow-[inset_0_0_18px_rgba(255,255,255,.55),0_16px_35px_rgba(120,84,132,.13)]" />
        <span className="absolute left-10 top-0 h-24 w-8 rounded-full bg-white/72 shadow-[inset_0_0_18px_rgba(255,255,255,.7),0_16px_35px_rgba(120,84,132,.15)]" />
        <span className="absolute right-3 top-5 h-16 w-7 rounded-full bg-white/58 shadow-[inset_0_0_18px_rgba(255,255,255,.52),0_16px_35px_rgba(120,84,132,.11)]" />
      </div>
    </div>
  )}
</Link>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">{item.set.code}</p>
                <Link href={`/sets/${item.set.id}`} className="mt-2 block font-display text-3xl font-black tracking-[-0.06em] hover:text-[#7c58d7]">
                  {item.set.name}
                </Link>
                <p className="mt-2 text-sm font-bold text-[#756778]">Preferred length: {item.length} • {item.set.shape}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#4a314e1c] bg-white/50 p-1 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/70 font-black text-[#6d3fb1] transition hover:bg-[#efe8ff]"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm font-black">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/70 font-black text-[#6d3fb1] transition hover:bg-[#efe8ff]"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="font-display text-2xl font-black tracking-[-0.05em]">{formatPrice(item.set.price * item.quantity)}</p>
                <p className="mt-1 text-xs font-bold text-[#8a7a8e]">{formatPrice(item.set.price)} each</p>
                <button
                  type="button"
                  onClick={() => removeItem(item.cartId)}
                  className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#8d738f] hover:text-[#e05d9a]"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="liquid-glass h-fit rounded-[2rem] p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Order summary</h2>
          <div className="mt-6 grid gap-3 text-sm font-bold text-[#6d5871]">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Calculated at checkout</span></div>
            <div className="flex justify-between"><span>Photo sizing</span><span>Included</span></div>
            <div className="flex justify-between border-t border-[#4a314e1c] pt-3 text-[#241a29]"><span>Total preview</span><span>{formatPrice(subtotal)}</span></div>
          </div>
          <Link href="/checkout" className="btn-primary mt-7 w-full">Go to checkout</Link>
          <p className="mt-4 text-xs font-semibold leading-5 text-[#8a7a8e]">
            Hand photos are uploaded during checkout, not on the product page.
          </p>
        </aside>
      </div>
    </section>
  );
}
