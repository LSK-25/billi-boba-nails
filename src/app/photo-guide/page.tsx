const guideCards = [
  ['01', 'Place your hand flat', 'Use a plain surface and keep fingers naturally relaxed. Do not bend or curl the fingers.'],
  ['02', 'Shoot from above', 'Hold the phone directly above your hand. Avoid side angles because they distort nail size.'],
  ['03', 'Use clear light', 'Use bright natural light or a well-lit room. Avoid shadows, blur, portrait mode and heavy filters.'],
  ['04', 'Add a coin reference', 'Place one ₹10 coin beside your nails so the studio has a familiar size reference.'],
];

const uploadList = [
  'Left hand photo with coin reference',
  'Right hand photo with coin reference',
  'Length reference photo if you want a specific length',
];

export default function PhotoGuidePage() {
  return (
    <section className="page-shell py-14">
      <span className="pill">Hand photo guide</span>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_.7fr] lg:items-end">
        <h1 className="font-display text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-7xl">
          Clear photos make a better fit.
        </h1>
        <p className="text-base font-semibold leading-8 text-[#756778]">
          Your hand photos help the studio understand nail width and length. Better photos mean fewer delays before production.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {guideCards.map(([num, title, text]) => (
          <article key={num} className="liquid-glass rounded-[2rem] p-5">
            <span className="text-xs font-black uppercase tracking-[0.24em] text-[#8c6fe8]">{num}</span>
            <h2 className="mt-4 font-display text-2xl font-black tracking-[-0.06em]">{title}</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-[#756778]">{text}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <div className="liquid-glass rounded-[2rem] p-6">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Upload these photos</h2>
          <div className="mt-5 grid gap-3">
            {uploadList.map((item) => (
              <div key={item} className="rounded-[1.35rem] border border-white/55 bg-white/38 p-4">
                <p className="text-sm font-black text-[#34263c]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="liquid-glass rounded-[2rem] p-6">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Before you submit</h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-[#756778]">
            Make sure the full hand is visible, the image is not blurry, and the coin reference is clearly placed beside the nails.
            If the studio cannot review the photo, you will be asked to upload new photos from My Orders.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="liquid-glass rounded-[2.4rem] p-5">
          <div className="grid min-h-[320px] place-items-center rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#e8ffe9] via-white to-[#d9c8ff] p-8 text-center">
            <div>
              <p className="text-5xl">✓</p>
              <h2 className="mt-4 font-display text-4xl font-black tracking-[-0.06em]">Correct example</h2>
              <p className="mt-3 max-w-md text-sm font-semibold leading-7 text-[#756778]">
                Hand fully visible, shot from above, bright lighting, ₹10 coin clearly visible.
              </p>
            </div>
          </div>
        </div>

        <div className="liquid-glass rounded-[2.4rem] p-5">
          <div className="grid min-h-[320px] place-items-center rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#ffe3e3] via-white to-[#ffd4e2] p-8 text-center">
            <div>
              <p className="text-5xl">×</p>
              <h2 className="mt-4 font-display text-4xl font-black tracking-[-0.06em]">Wrong example</h2>
              <p className="mt-3 max-w-md text-sm font-semibold leading-7 text-[#756778]">
                Blurry image, cropped fingers, side angle, dark shadows, filters, or no coin reference.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}