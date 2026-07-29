'use client';

import { useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { categories, finishes, lengths, nailSets, priceBands, shapes } from '@/lib/mock-data';

export default function FilterRail() {
  const [category, setCategory] = useState('All');
  const [length, setLength] = useState('All');
  const [shape, setShape] = useState('All');
  const [finish, setFinish] = useState('All');
  const [price, setPrice] = useState('All');
  const [query, setQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const activeFilterCount = [category, length, shape, finish, price].filter((value) => value !== 'All').length + (query.trim() ? 1 : 0);

  const reset = () => {
    setCategory('All');
    setLength('All');
    setShape('All');
    setFinish('All');
    setPrice('All');
    setQuery('');
  };

  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterOpen]);

  return (
    <section className="page-shell mt-7 md:mt-10">
      <div className="mobile-shop-toolbar mb-4 flex items-center justify-between gap-3 lg:hidden">
        <div className="min-w-0">
          <p className="text-sm font-black text-[#4d3d56]">{filteredSets.length} sets</p>
          {activeFilterCount > 0 ? (
            <p className="mt-0.5 truncate text-[0.66rem] font-black uppercase tracking-[0.15em] text-[#9b6ea8]">
              {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
            </p>
          ) : (
            <p className="mt-0.5 text-[0.66rem] font-black uppercase tracking-[0.15em] text-[#9b7f9f]">Newest first</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#c9a5ff66] bg-[linear-gradient(135deg,rgba(255,232,244,.88),rgba(236,226,255,.92))] px-4 py-2.5 text-xs font-black text-[#4a3059] shadow-[0_14px_34px_rgba(159,115,184,0.18)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(159,115,184,0.24)]"
        >
          <span className="text-sm">⚙</span>
          Filters
          {activeFilterCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#5a3f6d] px-1.5 text-[10px] text-white">{activeFilterCount}</span>
          )}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="liquid-glass hidden h-fit rounded-[2rem] p-5 lg:sticky lg:top-28 lg:block">
          <FilterContent
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            length={length}
            setLength={setLength}
            shape={shape}
            setShape={setShape}
            finish={finish}
            setFinish={setFinish}
            price={price}
            setPrice={setPrice}
            reset={reset}
          />
        </aside>

        <div>
          <div className="mb-5 hidden flex-col justify-between gap-3 rounded-[1.6rem] border border-[#4a314e1c] bg-white/50 p-4 backdrop-blur md:flex-row md:items-center lg:flex">
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
      </div>

      <div className={`fixed inset-0 z-[80] lg:hidden ${isFilterOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isFilterOpen}>
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setIsFilterOpen(false)}
          className={`absolute inset-0 bg-[#201528]/35 backdrop-blur-sm transition-opacity duration-300 ${isFilterOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          className={`absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto rounded-t-[2.25rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,250,253,.96),rgba(239,229,255,.94))] p-5 shadow-[0_-28px_80px_rgba(75,51,88,0.22)] backdrop-blur-3xl transition-transform duration-300 ease-out ${isFilterOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#9f77b8]/40" />
          <FilterContent
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            length={length}
            setLength={setLength}
            shape={shape}
            setShape={setShape}
            finish={finish}
            setFinish={setFinish}
            price={price}
            setPrice={setPrice}
            reset={reset}
            close={() => setIsFilterOpen(false)}
          />
        </aside>
      </div>
    </section>
  );
}

function FilterContent({
  query,
  setQuery,
  category,
  setCategory,
  length,
  setLength,
  shape,
  setShape,
  finish,
  setFinish,
  price,
  setPrice,
  reset,
  close,
}: {
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  length: string;
  setLength: (value: string) => void;
  shape: string;
  setShape: (value: string) => void;
  finish: string;
  setFinish: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  reset: () => void;
  close?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Filters</h2>
        <div className="flex items-center gap-3">
          <button className="text-xs font-black uppercase tracking-[0.16em] text-[#8d738f]" onClick={reset}>Reset</button>
          {close && (
            <button
              type="button"
              onClick={close}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#cba8ff55] bg-white/50 text-lg font-black text-[#5a3f6d] shadow-sm backdrop-blur-xl"
              aria-label="Close filters"
            >
              ×
            </button>
          )}
        </div>
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
      {close && (
        <button type="button" onClick={close} className="mt-7 w-full rounded-full bg-[#24182a] px-5 py-3 text-sm font-black text-white shadow-[0_18px_42px_rgba(36,24,42,0.2)] transition hover:-translate-y-0.5">
          Show sets
        </button>
      )}
    </div>
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
                ? 'border-[#c9a5ff70] bg-[linear-gradient(135deg,rgba(255,225,242,.92),rgba(232,221,255,.94))] text-[#3b2e55] shadow-[0_10px_24px_rgba(159,115,184,0.16)]'
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
