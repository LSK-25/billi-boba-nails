const policies = [
  ['Shipping', 'Delivery timelines and shipping charges will be finalized before launch.'],
  ['Refunds', 'Refund or replacement is available only if the set arrives damaged. A clear opening video or photo proof may be required.'],
  ['Made to order', 'Because each set is handmade and fitted for the customer, returns are not accepted for change of mind, wrong length choice or personal preference after production.'],
  ['Photo privacy', 'Hand photos will be stored privately and used only for fitting and order support.'],
  ['Order changes', 'Changes can be requested before production starts.'],
];

export default function PoliciesPage() {
  return (
    <section className="page-shell py-14">
      <span className="pill">Policies</span>
      <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Clear rules, soft experience.</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {policies.map(([title, text]) => (
          <article key={title} className="liquid-glass rounded-[2rem] p-6">
            <h2 className="font-display text-3xl font-black tracking-[-0.06em]">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#756778]">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
