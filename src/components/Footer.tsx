import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer mt-20 py-8 md:mt-24 md:py-10">
      <div className="page-shell">
        <div className="overflow-hidden rounded-[2.2rem] border border-white/30 bg-[linear-gradient(135deg,rgba(44,27,55,.94),rgba(111,72,128,.88)_48%,rgba(238,134,181,.72))] p-6 text-white shadow-[0_28px_100px_rgba(60,35,71,.28)] backdrop-blur-3xl md:p-8">
          <div className="grid gap-8 md:grid-cols-[1.25fr_.75fr_.75fr_.75fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/30 bg-white/16 shadow-[inset_0_1px_0_rgba(255,255,255,.45)] backdrop-blur-2xl">
                  <span className="font-display text-sm font-black tracking-[-0.08em]">B&amp;B</span>
                </div>
                <div>
                  <div className="font-display text-2xl font-black tracking-[-0.06em]">BILLi&amp;BoBA</div>
                  <div className="text-[0.58rem] font-black uppercase tracking-[0.32em] text-white/70">NAILS</div>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/74">
                Curated handmade press-on nail sets, designed by us and fitted using guided hand photos.
              </p>
              <p className="mt-5 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl">
                Made to order • photo fitted
              </p>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white/66">Studio</h3>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-white/86">
                <Link href="/shop">Shop sets</Link>
                <Link href="/how-to-order">How it works</Link>
                <Link href="/photo-guide">Photo guide</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white/66">Account</h3>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-white/86">
                <Link href="/login">Login</Link>
                <Link href="/account">My account</Link>
                <Link href="/cart">Cart</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white/66">Support</h3>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-white/86">
                <Link href="/contact">Contact</Link>
                <Link href="/track-order">Track order</Link>
                <Link href="/policies">Refunds & policies</Link>
                <Link href="/admin">Admin preview</Link>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/18 pt-5 text-xs font-semibold leading-6 text-white/62 md:flex md:items-center md:justify-between">
            <p>© BILLi&amp;BoBA NAILS. Demo build for review.</p>
            <p className="mt-2 md:mt-0">Real payments and saved orders connect in the backend phase.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
