import Link from 'next/link';
import type { NailSet } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ set }: { set: NailSet }) {
  return (
    <article className="group liquid-glass rounded-[2rem] p-3 transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_90px_rgba(120,84,132,.2)]">
      <Link href={`/sets/${set.id}`} className="block">
        <div className="relative min-h-[250px] overflow-hidden rounded-[1.55rem] border border-white/70" style={{ background: `linear-gradient(135deg, ${set.tone}, #ffffff 52%, ${set.accentTone})` }}>
          <div className="noise-overlay" />
          <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[0.66rem] font-black uppercase tracking-[0.18em] text-[#6e5971] backdrop-blur">{set.code}</div>
          <div className="absolute right-4 top-4 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[0.66rem] font-black uppercase tracking-[0.18em] text-[#6e5971] backdrop-blur">{set.length}</div>
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative h-40 w-40 transition duration-500 group-hover:scale-110 group-hover:rotate-3">
              <span className="absolute left-5 top-2 h-32 w-10 rounded-full bg-white/64 shadow-[inset_0_0_20px_rgba(255,255,255,.55),0_20px_45px_rgba(120,84,132,.13)]" />
              <span className="absolute left-16 top-0 h-40 w-11 rounded-full bg-white/72 shadow-[inset_0_0_20px_rgba(255,255,255,.7),0_20px_45px_rgba(120,84,132,.15)]" />
              <span className="absolute right-5 top-7 h-28 w-10 rounded-full bg-white/58 shadow-[inset_0_0_20px_rgba(255,255,255,.52),0_20px_45px_rgba(120,84,132,.11)]" />
              <span className="absolute inset-x-10 top-16 h-4 rounded-full bg-white/80 blur-sm" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 rounded-[1.2rem] border border-white/70 bg-white/42 p-3 text-xs font-bold text-[#67556a] backdrop-blur-xl">
            {set.finish} • {set.shape} • {set.productionTime}
          </div>
        </div>
        <div className="px-2 pb-2 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-black leading-none tracking-[-0.06em] text-[#241a29]">{set.name}</h3>
              <p className="mt-2 text-sm font-bold text-[#7a6b7e]">{set.color}</p>
            </div>
            <p className="rounded-full bg-white/62 px-3 py-1 text-sm font-black text-[#2c2131]">{formatPrice(set.price)}</p>
          </div>
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#756778]">{set.description}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">View set</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#241a29] text-white transition group-hover:translate-x-1">→</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
