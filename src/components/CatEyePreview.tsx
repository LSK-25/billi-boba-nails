export default function CatEyePreview() {
  return (
    <section className="page-shell mt-24">
      <div className="liquid-glass grid overflow-hidden rounded-[2.4rem] p-6 md:grid-cols-[.92fr_1.08fr] md:p-8 lg:p-10">
        <div className="flex flex-col justify-center py-8">
          <span className="pill">Motion detail</span>
          <h2 className="mt-5 font-display text-4xl font-black tracking-[-0.06em] text-[#221927] md:text-6xl">
            A cat-eye moment that catches light.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-[#756778]">
            This is a CSS placeholder for a future product video: a short muted loop where a real nail set turns under light and creates the cat-eye glow.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Muted loop', 'Fast loading', 'One strong section'].map((item) => <span key={item} className="rounded-full bg-white/62 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#7d6584]">{item}</span>)}
          </div>
        </div>
        <div className="nail-video-card relative min-h-[390px] overflow-hidden rounded-[2rem] border border-white/40 p-8 shadow-[inset_0_0_90px_rgba(255,255,255,.16)]">
          <div className="noise-overlay" />
          <div className="absolute -left-12 top-10 h-52 w-52 rounded-full bg-[#ffd4e2]/35 blur-3xl" />
          <div className="absolute -right-10 bottom-10 h-60 w-60 rounded-full bg-[#d9c8ff]/38 blur-3xl" />
          <div className="relative grid h-full place-items-center">
            <div className="cat-eye-nail" />
          </div>
          <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/30 bg-white/16 p-4 text-white backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] opacity-80">Future product video block</p>
            <p className="mt-1 font-display text-2xl font-black tracking-[-0.05em]">Magnetic shimmer preview</p>
          </div>
        </div>
      </div>
    </section>
  );
}
