import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[#4a314e1c] bg-white/35 py-10 backdrop-blur">
      <div className="page-shell grid gap-8 md:grid-cols-[1.25fr_.75fr_.75fr_.75fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="liquid-glass grid h-11 w-11 place-items-center rounded-2xl">
              <span className="font-display text-sm font-black tracking-[-0.08em]">B&amp;B</span>
            </div>
            <div>
              <div className="font-display text-2xl font-black tracking-[-0.06em]">BILLi&amp;BoBA</div>
              <div className="text-[0.58rem] font-black uppercase tracking-[0.32em] text-[#8f7492]">NAILS</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#756778]">
            Curated handmade press-on nail sets, designed by us and fitted using guided hand photos.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#8d738f]">Studio</h3>
          <div className="mt-4 grid gap-3 text-sm font-semibold text-[#4f4254]">
            <Link href="/shop">Shop sets</Link>
            <Link href="/how-to-order">How it works</Link>
            <Link href="/photo-guide">Photo guide</Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#8d738f]">Account</h3>
          <div className="mt-4 grid gap-3 text-sm font-semibold text-[#4f4254]">
            <Link href="/login">Login</Link>
            <Link href="/account">My account</Link>
            <Link href="/cart">Cart</Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#8d738f]">Support</h3>
          <div className="mt-4 grid gap-3 text-sm font-semibold text-[#4f4254]">
            <Link href="/contact">Contact</Link>
            <Link href="/track-order">Track order</Link>
            <Link href="/policies">Policies</Link>
            <Link href="/admin">Admin preview</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
