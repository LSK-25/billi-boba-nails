import Link from 'next/link';
import { notFound } from 'next/navigation';
import SetOrderPanel from '@/components/SetOrderPanel';
import { getActiveProductBySlug } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function SetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const set = await getActiveProductBySlug(id);

  if (!set) notFound();

  const gallery = set.gallery?.length ? set.gallery : set.imageUrl ? [set.imageUrl] : [];

  return (
    <section className="page-shell grid gap-10 py-14 lg:grid-cols-[1fr_.82fr]">
      <div className="liquid-glass rounded-[2.4rem] p-4">
        <div
          className="relative min-h-[620px] overflow-hidden rounded-[2rem] border border-white/70"
          style={{ background: `linear-gradient(135deg, ${set.tone}, #ffffff 52%, ${set.accentTone})` }}
        >
          <div className="noise-overlay" />

          <div className="absolute left-6 top-6 z-10 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#6e5971] backdrop-blur">
            {set.code}
          </div>

          {gallery[0] ? (
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gallery[0]}
                alt={set.name}
                className="h-full w-full object-contain p-4 md:p-8"
              />
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <div className="relative h-80 w-80">
                <span className="absolute left-10 top-10 h-60 w-20 rounded-full bg-white/62 shadow-[inset_0_0_30px_rgba(255,255,255,.7),0_34px_70px_rgba(120,84,132,.16)]" />
                <span className="absolute left-32 top-0 h-80 w-24 rounded-full bg-white/72 shadow-[inset_0_0_34px_rgba(255,255,255,.72),0_34px_80px_rgba(120,84,132,.18)]" />
                <span className="absolute right-12 top-20 h-52 w-20 rounded-full bg-white/58 shadow-[inset_0_0_30px_rgba(255,255,255,.62),0_34px_70px_rgba(120,84,132,.14)]" />
                <span className="absolute inset-x-20 top-36 h-8 rounded-full bg-white/75 blur-md" />
              </div>
            </div>
          )}

          <div className="absolute bottom-6 left-6 right-6 z-10 grid gap-3 rounded-[1.6rem] border border-white/70 bg-white/62 p-5 backdrop-blur-xl md:grid-cols-3">
            {[set.length, set.shape, set.finish].map((item) => (
              <div key={item}>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#8f7492]">Detail</p>
                <p className="font-black text-[#2c2131]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {gallery.length > 1 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {gallery.map((imageUrl, index) => (
              <div key={imageUrl} className="overflow-hidden rounded-[1.2rem] border border-white/70 bg-white/45">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`${set.name} gallery ${index + 1}`}
                  className="h-28 w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="self-center">
        <span className="pill">{set.category} - {set.code}</span>
        <h1 className="mt-6 font-display text-5xl font-black leading-[0.93] tracking-[-0.07em] md:text-7xl">
          {set.name}
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#756778]">{set.description}</p>
        <p className="mt-3 text-base font-bold leading-7 text-[#5f5263]">{set.story}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            ['Price', formatPrice(set.price)],
            ['Production', set.productionTime],
            ['Colour', set.color],
            ['Finish', set.finish],
          ].map(([label, value]) => (
            <div key={label} className="liquid-glass rounded-3xl p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">{label}</p>
              <p className="mt-2 font-display text-2xl font-black tracking-[-0.05em]">{value}</p>
            </div>
          ))}
        </div>

        <SetOrderPanel set={set} />

        <div className="mt-6 rounded-[1.6rem] border border-[#4a314e1c] bg-white/40 p-5 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">What happens next</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">
            At checkout, customers upload left and right hand photos. After payment, the order is confirmed and production starts after photo review.
          </p>
          <Link href="/how-to-order" className="mt-4 inline-flex text-sm font-black text-[#6d3fb1]">
            Read the process -&gt;
          </Link>
        </div>
      </div>
    </section>
  );
}