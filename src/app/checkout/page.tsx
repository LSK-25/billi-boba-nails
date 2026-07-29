import Link from 'next/link';
import { nailSets } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const item = nailSets[0];

  return (
    <section className="page-shell py-14">
      <span className="pill">Checkout</span>
      <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Confirm your set</h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[#756778]">This page keeps the normal shopping flow: address, hand photos, payment, and instant order confirmation.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <form className="liquid-glass grid gap-5 rounded-[2rem] p-6 md:p-7">
          <div className="grid gap-4 md:grid-cols-2">
            <input className="input-field" placeholder="Full name" />
            <input className="input-field" placeholder="Phone number" />
          </div>
          <input className="input-field" placeholder="Email address" />
          <textarea className="input-field min-h-28" placeholder="Full delivery address" />
          <select className="input-field"><option>Preferred length</option><option>Short</option><option>Medium</option><option>Long</option><option>Same as shown</option></select>
          <div className="rounded-[1.6rem] border border-[#4a314e1c] bg-white/42 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Hand photos</p>
            <p className="mt-2 text-sm leading-6 text-[#756778]">Upload clear left and right hand photos. Later these files will be stored privately.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="input-field cursor-pointer text-sm font-bold">Upload left hand photo<input type="file" accept="image/*" className="hidden" /></label>
              <label className="input-field cursor-pointer text-sm font-bold">Upload right hand photo<input type="file" accept="image/*" className="hidden" /></label>
            </div>
          </div>
          <label className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#6f6372]"><input className="mt-1" type="checkbox" /> I confirm my hand photos are clear and taken using the guide.</label>
          <button type="button" className="btn-primary">Continue to payment</button>
        </form>
        <aside className="liquid-glass h-fit rounded-[2rem] p-6 md:p-7">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Order summary</h2>
          <div className="mt-5 rounded-[1.5rem] border border-white/60 p-4" style={{ background: `linear-gradient(135deg, ${item.tone}, #fff, ${item.accentTone})` }}>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6e5971]">{item.code}</p>
            <h3 className="mt-2 font-display text-3xl font-black tracking-[-0.06em]">{item.name}</h3>
            <p className="mt-2 text-sm font-bold text-[#6d5871]">{item.length} • {item.shape} • {item.finish}</p>
          </div>
          <div className="mt-6 grid gap-3 text-sm font-bold text-[#6d5871]">
            <div className="flex justify-between"><span>Set price</span><span>{formatPrice(item.price)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Calculated later</span></div>
            <div className="border-t border-[#4a314e1c] pt-3 flex justify-between text-[#241a29]"><span>Total preview</span><span>{formatPrice(item.price)}</span></div>
          </div>
          <Link href="/photo-guide" className="btn-secondary mt-7 w-full">Review photo guide</Link>
        </aside>
      </div>
    </section>
  );
}
