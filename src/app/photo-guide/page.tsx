const guideCards = [
  ['01', 'Place your hand flat', 'Use a plain surface and keep fingers naturally relaxed.'],
  ['02', 'Shoot from above', 'Hold the phone directly over your hand, not from a side angle.'],
  ['03', 'Use clear light', 'Avoid shadows, blur, portrait mode and heavy filters.'],
  ['04', 'Add a coin reference', 'Place one ₹10 coin beside your nails so the studio has a familiar size reference.'],
];

export default function PhotoGuidePage() {
  return (
    <section className="page-shell py-14">
      <span className="pill">Hand photo guide</span>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_.7fr] lg:items-end">
        <h1 className="font-display text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-7xl">Clear photos make better fit.</h1>
        <p className="text-base leading-8 text-[#756778]">This page will later include your real correct and incorrect examples. For now these are placeholders for the final instructions.</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-4">
        {guideCards.map(([num, title, text]) => (
          <article key={num} className="liquid-glass rounded-[2rem] p-5">
            <span className="text-xs font-black uppercase tracking-[0.24em] text-[#8c6fe8]">{num}</span>
            <h2 className="mt-4 font-display text-2xl font-black tracking-[-0.06em]">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#756778]">{text}</p>
          </article>
        ))}
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="liquid-glass rounded-[2.4rem] p-5">
          <div className="grid min-h-[360px] place-items-center rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#e8ffe9] via-white to-[#d9c8ff] p-8 text-center">
            <div>
              <p className="text-5xl">✓</p>
              <h2 className="mt-4 font-display text-4xl font-black tracking-[-0.06em]">Correct example</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#756778]">Hand fully visible, taken from above, good lighting, ₹10 coin clearly visible.</p>
            </div>
          </div>
        </div>
        <div className="liquid-glass rounded-[2.4rem] p-5">
          <div className="grid min-h-[360px] place-items-center rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#ffe3e3] via-white to-[#ffd4e2] p-8 text-center">
            <div>
              <p className="text-5xl">×</p>
              <h2 className="mt-4 font-display text-4xl font-black tracking-[-0.06em]">Wrong example</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#756778]">Blurry, cropped fingers, side angle, dark shadows or no coin reference.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
