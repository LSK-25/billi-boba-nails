import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <section className="page-shell grid min-h-[calc(100vh-12rem)] items-center gap-8 py-12 lg:grid-cols-[.92fr_1.08fr]">
      <div className="reveal">
        <span className="pill">Secure studio access</span>
        <h1 className="mt-6 font-display text-5xl font-black leading-[0.94] tracking-[-0.07em] md:text-7xl">
          One login. Different roles.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-[#756778]">
          Customers see orders, addresses and photo requests. Your admin role opens the studio dashboard for products, orders and tracking.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/account" className="btn-secondary">Customer preview</Link>
          <Link href="/admin" className="btn-ghost">Admin preview</Link>
        </div>
      </div>

      <div className="liquid-glass overflow-hidden rounded-[2.4rem] p-4 md:p-5">
        <div className="grid gap-0 overflow-hidden rounded-[2rem] border border-white/70 bg-white/38 md:grid-cols-[.86fr_1.14fr]">
          <div className="relative hidden min-h-[610px] overflow-hidden bg-gradient-to-br from-[#ffd4e2] via-[#fffaf3] to-[#d9c8ff] p-6 md:block">
            <div className="noise-overlay" />
            <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(circle at 50% 20%, white, transparent 14rem)' }} />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="w-fit rounded-full border border-white/70 bg-white/50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#7d6484] backdrop-blur">BILLi&amp;BoBA</div>
              <div className="grid place-items-center">
                <Image src="/images/billi-boba-logo.jpg" alt="BILLi&BoBA NAILS logo" width={260} height={260} className="float-slow h-64 w-64 rounded-full object-cover shadow-[0_30px_80px_rgba(127,80,120,.2)]" />
              </div>
              <p className="rounded-[1.4rem] border border-white/60 bg-white/45 p-4 text-sm font-bold leading-6 text-[#4f4254] backdrop-blur">
                In production, Supabase Auth will protect customer accounts and admin routes.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-9">
            <div className="mb-8 flex items-center gap-3">
              <div className="liquid-glass grid h-12 w-12 place-items-center rounded-2xl"><span className="font-display font-black tracking-[-0.08em]">B&amp;B</span></div>
              <div>
                <h2 className="font-display text-4xl font-black tracking-[-0.06em]">Welcome back</h2>
                <p className="text-sm font-semibold text-[#8a7a8e]">Sign in to continue</p>
              </div>
            </div>
            <form className="grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-[#4f4254]">
                Email address
                <input className="input-field" type="email" placeholder="you@example.com" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#4f4254]">
                Password
                <input className="input-field" type="password" placeholder="••••••••" />
              </label>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 font-semibold text-[#756778]"><input type="checkbox" /> Remember me</label>
                <button type="button" className="font-black text-[#7b5fc2]">Forgot?</button>
              </div>
              <button type="button" className="btn-primary mt-2">Login</button>
              <button type="button" className="btn-secondary">Create account</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
