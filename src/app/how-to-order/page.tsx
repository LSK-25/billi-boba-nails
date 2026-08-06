const steps = [
  ['01', 'Choose a set', 'Browse the studio collection and pick a design uploaded by BILLi&BoBA.'],
  ['02', 'Choose length', 'Select your preferred length before adding the set to cart.'],
  ['03', 'Upload hand photos', 'Upload left hand, right hand and length reference photos using the photo guide.'],
  ['04', 'Checkout securely', 'Add your address and complete payment through the checkout flow.'],
  ['05', 'Studio photo review', 'The studio checks your photos before production. If photos are unclear, you will be asked to upload them again.'],
  ['06', 'Track your order', 'Follow your order from confirmation to production, dispatch and delivery from My Orders or Track Order.'],
];

export default function HowToOrderPage() {
  return (
    <section className="page-shell py-14">
      <span className="pill">How it works</span>

      <div className="mt-5 max-w-4xl">
        <h1 className="font-display text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-7xl">
          A normal checkout flow, with studio fitting behind it.
        </h1>
        <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#756778]">
          Pick your set, upload guided hand photos, complete payment, and let the studio handle the fitting review before production.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {steps.map(([num, title, text]) => (
          <article key={num} className="liquid-glass rounded-[2rem] p-6">
            <span className="text-xs font-black uppercase tracking-[0.24em] text-[#8c6fe8]">{num}</span>
            <h2 className="mt-4 font-display text-3xl font-black tracking-[-0.06em]">{title}</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-[#756778]">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}