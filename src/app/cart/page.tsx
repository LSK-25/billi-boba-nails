import Link from 'next/link';
import { nailSets } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const cartItems = nailSets.slice(0, 2);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <section className="page-shell py-14">
      <span className="pill">Cart</span>
      <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h1 className="font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Your cart</h1>
        <Link href="/shop" className="btn-secondary w-fit">Continue shopping</Link>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4">
          {cartItems.map((item) => (
            <article key={item.id} className="liquid-glass grid gap-5 rounded-[2rem] p-4 md:grid-cols-[150px_1fr_auto] md:items-center">
              <div className="min-h-[130px] rounded-[1.4rem] border border-white/70" style={{ background: `linear-gradient(135deg, ${item.tone}, #fff, ${item.accentTone})` }} />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">{item.code}</p>
                <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.06em]">{item.name}</h2>
                <p className="mt-2 text-sm font-bold text-[#756778]">Preferred length: {item.length} • {item.shape}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="font-display text-2xl font-black tracking-[-0.05em]">{formatPrice(item.price)}</p>
                <button className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-[#8d738f]">Remove</button>
              </div>
            </article>
          ))}
        </div>
        <aside className="liquid-glass h-fit rounded-[2rem] p-6">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Order summary</h2>
          <div className="mt-6 grid gap-3 text-sm font-bold text-[#6d5871]">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Calculated later</span></div>
            <div className="border-t border-[#4a314e1c] pt-3 flex justify-between text-[#241a29]"><span>Total preview</span><span>{formatPrice(subtotal)}</span></div>
          </div>
          <Link href="/checkout" className="btn-primary mt-7 w-full">Go to checkout</Link>
          <p className="mt-4 text-xs font-semibold leading-5 text-[#8a7a8e]">This is a frontend preview. Real cart state will be added later.</p>
        </aside>
      </div>
    </section>
  );
}
