const statuses = ['Order confirmed', 'Photos under review', 'In production', 'Quality check', 'Ready to dispatch', 'Dispatched', 'Delivered'];

export default function TrackOrderPage() {
  return (
    <section className="page-shell py-14">
      <span className="pill">Track order</span>
      <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Track your set</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <div className="liquid-glass h-fit rounded-[2rem] p-6">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Find order</h2>
          <form className="mt-6 grid gap-4">
            <input className="input-field" placeholder="Order number e.g. BNB-1042" />
            <input className="input-field" placeholder="Email or phone" />
            <button type="button" className="btn-primary">Track order</button>
          </form>
        </div>
        <div className="liquid-glass rounded-[2rem] p-6">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Status preview</h2>
          <div className="mt-6 grid gap-4">
            {statuses.map((status, index) => (
              <div key={status} className="flex gap-4 rounded-[1.4rem] border border-[#4a314e1c] bg-white/46 p-4">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${index < 3 ? 'bg-[#241a29] text-white' : 'bg-white/70 text-[#8d738f]'}`}>{index < 3 ? '✓' : index + 1}</span>
                <div>
                  <p className="font-black text-[#3b3040]">{status}</p>
                  <p className="mt-1 text-sm text-[#756778]">{index < 3 ? 'Completed in preview order.' : 'Upcoming step.'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
