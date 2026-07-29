export default function AccountPage() {
  return (
    <section className="page-shell py-14">
      <span className="pill">Customer account</span>
      <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Hi, customer.</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          ['My orders', 'See current and previous orders.'],
          ['Saved address', 'Manage delivery details.'],
          ['Photo requests', 'Replace hand photos if the studio asks.'],
        ].map(([title, text]) => <article key={title} className="liquid-glass rounded-[2rem] p-6"><h2 className="font-display text-3xl font-black tracking-[-0.06em]">{title}</h2><p className="mt-3 text-sm leading-6 text-[#756778]">{text}</p></article>)}
      </div>
    </section>
  );
}
