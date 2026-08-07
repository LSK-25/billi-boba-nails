import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/ProductGallery';
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
      <ProductGallery
        name={set.name}
        code={set.code}
        gallery={gallery}
        tone={set.tone}
        accentTone={set.accentTone}
        details={[
          { label: 'Length', value: set.length },
          { label: 'Shape', value: set.shape },
          { label: 'Finish', value: set.finish },
        ]}
      />

      <div className="self-center">
        <span className="pill">
          {set.category} - {set.code}
        </span>

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