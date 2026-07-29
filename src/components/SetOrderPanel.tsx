'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import type { NailSet, PreferredLength } from '@/types';

const lengthOptions: PreferredLength[] = ['Short', 'Medium', 'Long', 'Same as shown'];

export default function SetOrderPanel({ set }: { set: NailSet }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedLength, setSelectedLength] = useState<PreferredLength>(set.length);
  const [added, setAdded] = useState(false);

  const addSelectedSet = () => {
    addItem(set, selectedLength);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const orderNow = () => {
    addItem(set, selectedLength);
    router.push('/checkout');
  };

  return (
    <div className="mt-8 rounded-[2rem] border border-[#4a314e1c] bg-white/48 p-5 backdrop-blur">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Preferred length</p>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[#756778]">
            Size is handled through hand photos during checkout. Here the customer only chooses the nail length preference.
          </p>
        </div>
        {added && (
          <span className="rounded-full bg-[#efe8ff] px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-[#6d3fb1]">
            Added
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {lengthOptions.map((length) => {
          const isActive = selectedLength === length;

          return (
            <button
              key={length}
              type="button"
              onClick={() => setSelectedLength(length)}
              className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                isActive
                  ? 'border-[#cdbdff] bg-[#f2e9ff] text-[#6043ad] shadow-[0_12px_30px_rgba(126,91,183,.13)]'
                  : 'border-[#4a314e1c] bg-white/58 text-[#5f5263] hover:bg-white/80'
              }`}
            >
              {length}
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={addSelectedSet} className="btn-primary">
          Add to cart
        </button>
        <button type="button" onClick={orderNow} className="btn-secondary">
          Order this set
        </button>
        <Link href="/photo-guide" className="btn-ghost">
          View photo guide
        </Link>
      </div>
    </div>
  );
}
