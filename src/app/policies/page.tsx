const policies = [
  {
    title: 'Shipping',
    text: 'Orders are handmade after photo review. Delivery timelines may vary depending on production queue, design complexity and shipping location. Shipping charges are shown during checkout.',
  },
  {
    title: 'Refunds',
    text: 'Refund or replacement is available only if the set arrives damaged. A clear unboxing video or photo proof may be required before approval.',
  },
  {
    title: 'Made to order',
    text: 'Each set is handmade and fitted using the customer’s submitted photos. Returns are not accepted for change of mind, wrong length choice, wrong address, or personal preference after production starts.',
  },
  {
    title: 'Photo privacy',
    text: 'Hand photos are stored privately and used only for sizing, fitting, order support and production reference. They are not used for public marketing without permission.',
  },
  {
    title: 'Order changes',
    text: 'Changes can be requested only before production starts. Once the set enters production, design, length and address changes may not be possible.',
  },
  {
    title: 'Photo re-upload',
    text: 'If submitted photos are unclear, the studio may request new photos. Production starts only after usable photos are received and reviewed.',
  },
];

export default function PoliciesPage() {
  return (
    <section className="page-shell py-14">
      <span className="pill">Policies</span>

      <div className="mt-5 max-w-4xl">
        <h1 className="font-display text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-7xl">
          Clear rules, soft experience.
        </h1>
        <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#756778]">
          BILLi&BoBA sets are handmade, photo-fitted and prepared with care. Please read these basics before placing an order.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {policies.map((policy) => (
          <article key={policy.title} className="liquid-glass rounded-[2rem] p-6">
            <h2 className="font-display text-3xl font-black tracking-[-0.06em]">{policy.title}</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-[#756778]">{policy.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}