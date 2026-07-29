import Link from 'next/link';

const statCards = [
  ['Orders today', '12', '+4 pending photo checks'],
  ['Revenue preview', '₹18.4k', 'Placeholder metric'],
  ['In production', '08', 'Sets being made'],
  ['Photo review', '05', 'Needs checking'],
];

const orders = [
  ['BNB-001', 'Aarohi M.', 'Photos under review', '₹899'],
  ['BNB-005', 'Kavya S.', 'In production', '₹1,499'],
  ['BNB-003', 'Rhea P.', 'Quality check', '₹1,299'],
];

export default function AdminPage() {
  return (
    <section className="page-shell py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <span className="pill">Admin preview</span>
          <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Studio dashboard</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#756778]">This future admin area lets you add sets, upload photos, change prices and manage orders without touching code.</p>
        </div>
        <Link href="/shop" className="btn-secondary w-fit">View shop</Link>
      </div>

      <div className="mt-9 grid gap-4 md:grid-cols-4">
        {statCards.map(([label, value, note]) => (
          <div key={label} className="liquid-glass rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9a7d9c]">{label}</p>
            <p className="mt-3 font-display text-4xl font-black tracking-[-0.06em]">{value}</p>
            <p className="mt-2 text-sm font-semibold text-[#756778]">{note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Recent orders</h2>
            <button className="btn-secondary px-4 py-2 text-sm">View all</button>
          </div>
          <div className="mt-5 grid gap-3">
            {orders.map(([code, customer, status, price]) => (
              <div key={`${code}-${customer}`} className="grid gap-3 rounded-[1.4rem] border border-[#4a314e1c] bg-white/50 p-4 md:grid-cols-[.7fr_1fr_1fr_.5fr] md:items-center">
                <span className="font-black text-[#3b3040]">{code}</span>
                <span className="text-sm font-bold text-[#6d5871]">{customer}</span>
                <span className="rounded-full bg-[#ede5ff] px-3 py-1 text-xs font-black text-[#60498f]">{status}</span>
                <span className="font-black">{price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Add new set</h2>
          <p className="mt-2 text-sm leading-6 text-[#756778]">Preview of the product form you will use later.</p>
          <form className="mt-6 grid gap-4">
            <input className="input-field" placeholder="Set name" />
            <div className="grid gap-4 md:grid-cols-2"><input className="input-field" placeholder="Price" /><input className="input-field" placeholder="Design code" /></div>
            <div className="grid gap-4 md:grid-cols-2"><select className="input-field"><option>Category</option><option>French</option><option>Minimal</option></select><select className="input-field"><option>Available length</option><option>Short</option><option>Medium</option></select></div>
            <label className="input-field cursor-pointer text-sm font-bold">Upload set photos<input type="file" className="hidden" multiple /></label>
            <button type="button" className="btn-primary">Save set preview</button>
          </form>
        </div>
      </div>
    </section>
  );
}
