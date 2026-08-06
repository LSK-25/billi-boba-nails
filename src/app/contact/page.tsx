const contactCards = [
  {
    title: 'Email',
    text: 'For order help, photo review questions, payment issues or support.',
    value: 'billiboba9704@gmail.com',
  },
  {
    title: 'Order support',
    text: 'For placed orders, use My Orders or Track Order first. It keeps your order number and status easy to find.',
    value: 'My Orders / Track Order',
  },
  {
    title: 'Response time',
    text: 'Support replies are handled manually by the studio. Response time may vary during production-heavy days.',
    value: 'Studio support',
  },
];

export default function ContactPage() {
  return (
    <section className="page-shell py-14">
      <span className="pill">Contact</span>

      <div className="mt-5 max-w-4xl">
        <h1 className="font-display text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-7xl">
          Talk to the studio.
        </h1>
        <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#756778]">
          Need help with an order, hand photo review, payment or production update? Contact BILLi&BoBA support.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {contactCards.map((card) => (
          <article key={card.title} className="liquid-glass rounded-[2rem] p-6">
            <h2 className="font-display text-3xl font-black tracking-[-0.06em]">{card.title}</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-[#756778]">{card.text}</p>
            <p className="mt-5 break-words rounded-[1.25rem] bg-white/45 p-4 text-sm font-black text-[#34263c]">
              {card.value}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 liquid-glass rounded-[2rem] p-6">
        <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Before messaging</h2>
        <p className="mt-3 text-sm font-semibold leading-7 text-[#756778]">
          Please include your order number, registered email and a clear description of the issue. For damaged sets, keep the unboxing proof ready.
        </p>

        <a href="mailto:billiboba9704@gmail.com" className="btn-primary mt-6 inline-flex">
          Email support
        </a>
      </div>
    </section>
  );
}