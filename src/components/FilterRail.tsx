'use client';

import { useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { categories, finishes, lengths, nailSets, priceBands, shapes } from '@/lib/mock-data';

export default function FilterRail() {
  const [category, setCategory] = useState('All');
  const [length, setLength] = useState('All');
  const [shape, setShape] = useState('All');
  const [finish, setFinish] = useState('All');
  const [price, setPrice] = useState('All');
  const [query, setQuery] = useState('');

  const filteredSets = useMemo(() => {
    return nailSets.filter((set) => {
      const q = query.trim().toLowerCase();
      const textMatch = !q || [set.name, set.code, set.category, set.color, set.finish, set.shape].join(' ').toLowerCase().includes(q);
      const categoryMatch = category === 'All' || set.category === category;
      const lengthMatch = length === 'All' || set.length === length;
      const shapeMatch = shape === 'All' || set.shape === shape;
      const finishMatch = finish === 'All' || set.finish === finish;
      const priceMatch =
        price === 'All' ||
        (price === 'Under ₹800' && set.price < 800) ||
        (price === '₹800–₹1100' && set.price >= 800 && set.price <= 1100) ||
        (price === 'Above ₹1100' && set.price > 1100);

      return textMatch && categoryMatch && lengthMatch && shapeMatch && finishMatch && priceMatch;
    });
  }, [category, length, shape, finish, price, query]);

  const reset = () => {
    setCategory('All');
    setLength('All');
    setShape('All');
    setFinish('All');
    setPrice('All');
    setQuery('');
  };

  return (
    <section className="page-shell mt-10 grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="liquid-glass h-fit rounded-[2rem] p-5 lg:sticky lg:top-28">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Filters</h2>
          <button className="text-xs font-black uppercase tracking-[0.16em] text-[#8d738f]" onClick={reset}>Reset</button>
        </div>
        <label className="mt-5 grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">
          Search
          <input className="input-field text-sm normal-case tracking-normal" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, code, colour..." />
        </label>
        <div className="mt-6 grid gap-5">
          <FilterGroup label="Category" value={category} values={categories} onChange={setCategory} />
          <FilterGroup label="Size / length" value={length} values={lengths} onChange={setLength} />
          <FilterGroup label="Shape" value={shape} values={shapes} onChange={setShape} />
          <FilterGroup label="Finish" value={finish} values={finishes} onChange={setFinish} />
          <FilterGroup label="Price" value={price} values={priceBands} onChange={setPrice} />
        </div>
      </aside>

      <div>
        <div className="mb-5 flex flex-col justify-between gap-3 rounded-[1.6rem] border border-[#4a314e1c] bg-white/50 p-4 backdrop-blur md:flex-row md:items-center">
          <p className="text-sm font-bold text-[#6d5871]">Showing {filteredSets.length} studio sets</p>
          <select className="input-field max-w-[230px] text-sm">
            <option>Sort by newest</option>
            <option>Featured first</option>
            <option>Price: low to high</option>
            <option>Price: high to low</option>
          </select>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredSets.map((set) => <ProductCard key={set.id} set={set} />)}
        </div>
        {filteredSets.length === 0 && (
          <div className="soft-card p-10 text-center">
            <h3 className="font-display text-3xl font-black">No sets found</h3>
            <p className="mt-3 text-[#756778]">Try changing one filter. Later this will search real uploaded nail sets.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function FilterGroup({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((item) => (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`rounded-full border px-3 py-2 text-xs font-black transition ${
              value === item
                ? 'border-[#bdaaff] bg-[#eee8ff] text-[#3b2e55] shadow-sm'
                : 'border-[#4a314e1c] bg-white/55 text-[#6f6274] hover:bg-white/80'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
