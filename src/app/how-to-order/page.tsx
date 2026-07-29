const steps = [
  ['01', 'Choose a set', 'Browse the studio collection and pick a design uploaded by BILLi&BoBA.'],
  ['02', 'Choose length', 'Select short, medium, long or same as shown.'],
  ['03', 'Upload hand photos', 'Send left and right hand photos using the guide.'],
  ['04', 'Checkout', 'Add address and complete payment just like a normal store.'],
  ['05', 'Photo review', 'We check the photos before production and ask for new ones only if needed.'],
  ['06', 'Track order', 'Follow order status from confirmed to dispatched.'],
];

export default function HowToOrderPage() {
  return (
    <section className="page-shell py-14">
      <span className="pill">How it works</span>
      <h1 className="mt-5 max-w-4xl font-display text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-7xl">A normal checkout flow, with studio fitting behind it.</h1>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {steps.map(([num, title, text]) => (
          <article key={num} className="liquid-glass rounded-[2rem] p-6">
            <span className="text-xs font-black uppercase tracking-[0.24em] text-[#8c6fe8]">{num}</span>
            <h2 className="mt-4 font-display text-3xl font-black tracking-[-0.06em]">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#756778]">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
