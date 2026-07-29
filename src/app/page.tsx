import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import CatEyePreview from '@/components/CatEyePreview';
import { nailSets } from '@/lib/mock-data';

export default function Home() {
  const featuredSets = nailSets.filter((set) => set.featured).slice(0, 4);

  return (
    <>
      <section className="page-shell grid min-h-[calc(100vh-5rem)] items-center gap-10 py-12 lg:grid-cols-[1.03fr_.97fr] lg:py-16">
        <div className="reveal">
          <span className="pill">Handmade press-ons • fitted by photo</span>
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(3.25rem,8vw,7.7rem)] font-black leading-[0.86] tracking-[-0.085em] text-[#221927]">
            Cute nails, <span className="brand-gradient">studio fitted.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#6f6372]">
            Choose a curated BILLi&amp;BoBA set, select your preferred length, upload clear hand photos, and checkout with the ease of a modern shopping site.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="btn-primary">Explore collection</Link>
            <Link href="/how-to-order" className="btn-secondary">How it works</Link>
          </div>
          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ['Photo fit', 'Clear hand-photo guide'],
              ['Design codes', 'Easy reorder later'],
              ['Studio made', 'Designed by us'],
            ].map(([title, text], index) => (
              <div key={title} className="liquid-glass rounded-3xl p-4" style={{ animationDelay: `${index * 110}ms` }}>
                <p className="font-display text-2xl font-black tracking-[-0.05em]">{title}</p>
                <p className="mt-1 text-xs font-bold leading-5 text-[#7d707f]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal relative lg:self-start lg:pt-1" style={{ animationDelay: '140ms' }}>
          <div className="absolute -left-8 top-16 h-36 w-36 rounded-full bg-[#d9c8ff] blur-3xl" />
          <div className="absolute -right-8 bottom-16 h-40 w-40 rounded-full bg-[#ffd4e2] blur-3xl" />
          <div className="liquid-glass hero-logo-glass relative overflow-hidden rounded-[2.6rem] p-4 md:p-5">
            <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#fff0f6] via-[#ffffff] to-[#eadfff] p-6 md:min-h-[420px]">
              <div className="noise-overlay" />
              <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(circle at 60% 25%, rgba(255,255,255,.95), transparent 13rem)' }} />
              <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                <div className="grid flex-1 place-items-center py-8">
                  <div className="float-slow hero-logo-orb relative grid h-60 w-60 place-items-center rounded-full border border-white/80 bg-white/56 shadow-[0_30px_90px_rgba(127,80,120,.18)] backdrop-blur md:h-72 md:w-72">
                    <Image
                      src="/images/billi-boba-logo.jpg"
                      alt="BILLi&BoBA NAILS cat logo"
                      width={260}
                      height={260}
                      priority
                      className="h-48 w-48 rounded-full object-cover md:h-60 md:w-60"
                    />
                  </div>
                </div>
                <div className="hero-logo-note hero-logo-note-card liquid-glass absolute bottom-6 left-6 z-20 max-w-[15.5rem] cursor-pointer rounded-[1.6rem] p-4">
                  <p className="font-display text-xl font-black tracking-[-0.06em] text-[#261d2b]">Designed by us.</p>
                  <p className="mt-2 text-xs font-bold leading-5 text-[#796a7e]">
                    Every set is curated first, so customers order designs the studio can actually make.
                  </p>
                </div>
                <div className="pointer-events-none absolute bottom-5 left-7 right-7 z-0 h-16 rounded-[1.5rem] border border-white/60 bg-white/24 opacity-55 blur-[1px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell mt-14">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="pill">Featured sets</span>
            <h2 className="mt-5 font-display text-4xl font-black tracking-[-0.06em] md:text-6xl">Soft details, ready to order.</h2>
          </div>
          <Link href="/shop" className="btn-secondary w-fit">View all sets</Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featuredSets.map((set, index) => (
            <div key={set.id} className="reveal" style={{ animationDelay: `${index * 90}ms` }}>
              <ProductCard set={set} />
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell mt-24">
        <div className="liquid-glass grid gap-8 rounded-[2.4rem] p-6 md:grid-cols-[.9fr_1.1fr] md:p-8">
          <div>
            <span className="pill">How orders work</span>
            <h2 className="mt-5 font-display text-4xl font-black tracking-[-0.06em] md:text-6xl">Normal checkout. Studio review.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#756778]">
              Customers get confirmation immediately. You review hand photos before production and request better photos only when needed.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['01', 'Pick a set', 'Browse curated designs from the collection.'],
              ['02', 'Choose length', 'Short, medium, long or same as shown.'],
              ['03', 'Upload hands', 'Both hand photos with clear lighting.'],
              ['04', 'Checkout', 'Order is confirmed instantly.'],
            ].map(([num, title, text]) => (
              <article key={num} className="rounded-[1.6rem] border border-[#4a314e1c] bg-white/45 p-5 backdrop-blur">
                <span className="text-xs font-black uppercase tracking-[0.24em] text-[#8c6fe8]">{num}</span>
                <h3 className="mt-4 font-display text-2xl font-black tracking-[-0.06em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#756778]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CatEyePreview />
    </>
  );
}
