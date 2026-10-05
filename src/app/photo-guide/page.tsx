import Image from 'next/image';

const guideCards = [
  [
    '01',
    'Place your hand flat',
    'Use a plain surface and keep fingers naturally relaxed. Do not bend or curl the fingers.',
  ],
  [
    '02',
    'Shoot from above',
    'Hold the phone directly above your hand. Avoid side angles because they distort nail size.',
  ],
  [
    '03',
    'Use clear light',
    'Use bright natural light or a well-lit room. Avoid shadows, blur, portrait mode and heavy filters.',
  ],
  [
    '04',
    'Add a ₹10 coin',
    'Place one ₹10 coin beside your nails so the studio has a familiar size reference.',
  ],
];

const uploadList = [
  'Left hand photo with ₹10 coin reference',
  'Right hand photo with ₹10 coin reference',
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
          Your hand photos help the studio understand nail width and
          length. Better photos mean fewer delays before production.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {guideCards.map(([num, title, text]) => (
          <article
            key={num}
            className="liquid-glass rounded-[2rem] p-5"
          >
            <span className="text-xs font-black uppercase tracking-[0.24em] text-[#8c6fe8]">
              {num}
            </span>

            <h2 className="mt-4 font-display text-2xl font-black tracking-[-0.06em]">
              {title}
            </h2>

            <p className="mt-3 text-sm font-semibold leading-7 text-[#756778]">
              {text}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <div className="liquid-glass rounded-[2rem] p-6">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">
            Upload these photos
          </h2>

          <div className="mt-5 grid gap-3">
            {uploadList.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-[1.35rem] border border-white/55 bg-white/38 p-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ede5ff] text-xs font-black text-[#6d3fb1]">
                  {index + 1}
                </span>

                <p className="text-sm font-black text-[#34263c]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="liquid-glass rounded-[2rem] p-6">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">
            Before you submit
          </h2>

          <p className="mt-3 text-sm font-semibold leading-7 text-[#756778]">
            Make sure the complete hand is visible, the image is sharp
            and well lit, and the ₹10 coin is placed beside the nails
            on the same flat surface.
          </p>

          <div className="mt-5 rounded-[1.4rem] border border-[#d7c5ff] bg-[#f5f0ff] p-4">
            <p className="text-xs font-black uppercase tracking-[0.17em] text-[#7c61ae]">
              Important
            </p>

            <p className="mt-2 text-sm font-semibold leading-6 text-[#675a6b]">
              Do not place the coin on top of your fingers or hold it
              in your other hand. It must lie flat next to the hand for
              an accurate size reference.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <div className="text-center">
          <span className="pill">Photo examples</span>

          <h2 className="mt-5 font-display text-4xl font-black tracking-[-0.06em] md:text-6xl">
            Take your hand photos like this.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#756778] md:text-base">
            Compare the correct and wrong examples before uploading.
            Clear top-view photos help us check your nail sizing accurately.
          </p>
        </div>

        <div className="liquid-glass mt-8 overflow-hidden rounded-[2.4rem] p-3 sm:p-4 md:p-5">
          <div className="relative overflow-hidden rounded-[2rem] bg-white">
            <Image
              src="/images/photo-guide-examples-v2.png"
              alt="Correct and wrong hand photo examples for BILLi&BoBA nail sizing"
              width={1536}
              height={1024}
              className="h-auto w-full object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.7rem] border border-[#b8e2c7] bg-[#effbf3] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#278553]">
              ✓ Correct
            </p>

            <p className="mt-2 text-sm font-semibold leading-6 text-[#53645a]">
              Keep the complete hand flat, shoot directly from above,
              use bright lighting and place the ₹10 coin beside the hand.
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-[#f0becb] bg-[#fff1f4] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c04f70]">
              × Avoid
            </p>

            <p className="mt-2 text-sm font-semibold leading-6 text-[#715c63]">
              Do not send angled, blurry or cropped photos. Avoid shadows,
              filters and holding the coin above the hand.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[2rem] border border-[#dbcaff] bg-[linear-gradient(135deg,rgba(255,240,247,.72),rgba(239,232,255,.78))] p-5 text-center backdrop-blur md:p-7">
        <p className="font-display text-2xl font-black tracking-[-0.05em] text-[#34263c]">
          Not sure if your photo is good enough?
        </p>

        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-[#756778]">
          Use the example above as your reference. The most important
          things are a flat hand, direct top view, clear lighting and a
          visible ₹10 coin.
        </p>
      </div>
    </section>
  );
}