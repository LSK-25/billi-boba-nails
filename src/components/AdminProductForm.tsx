import type { NailSet } from '@/types';
import { categories, finishes, lengths, shapes } from '@/lib/mock-data';

const cleanCategories = categories.filter((item) => item !== 'All');
const cleanLengths = lengths.filter((item) => item !== 'All');
const cleanShapes = shapes.filter((item) => item !== 'All');
const cleanFinishes = finishes.filter((item) => item !== 'All');

type AdminProductFormProps = {
  mode: 'new' | 'edit';
  initialSet?: NailSet;
};

export default function AdminProductForm({ mode, initialSet }: AdminProductFormProps) {
  return (
    <form className="grid gap-6">
      <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Set details</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">
              These fields will later save into Supabase. For now this is the exact admin form layout.
            </p>
          </div>
          <span className="rounded-full bg-white/55 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#7a5b86]">
            {mode === 'new' ? 'Draft' : initialSet?.code}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
            Set name
            <input className="input-field" defaultValue={initialSet?.name} placeholder="Blush Boba French" />
          </label>
          <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
            Design code
            <input className="input-field" defaultValue={initialSet?.code ?? 'BNB-009'} placeholder="BNB-009" />
          </label>
          <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
            Price
            <input className="input-field" defaultValue={initialSet?.price} placeholder="999" type="number" />
          </label>
          <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
            Production time
            <input className="input-field" defaultValue={initialSet?.productionTime} placeholder="4–6 working days" />
          </label>
          <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
            Category
            <select className="input-field" defaultValue={initialSet?.category ?? cleanCategories[0]}>
              {cleanCategories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
            Main length
            <select className="input-field" defaultValue={initialSet?.length ?? cleanLengths[0]}>
              {cleanLengths.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
            Shape
            <select className="input-field" defaultValue={initialSet?.shape ?? cleanShapes[0]}>
              {cleanShapes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
            Finish
            <select className="input-field" defaultValue={initialSet?.finish ?? cleanFinishes[0]}>
              {cleanFinishes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
            Short description
            <textarea className="input-field min-h-28 resize-y" defaultValue={initialSet?.description} placeholder="Describe the look, colour, shape and finish." />
          </label>
          <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
            Studio note
            <textarea className="input-field min-h-24 resize-y" defaultValue={initialSet?.story} placeholder="Small brand-style story shown on the product page." />
          </label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
        <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Set photos</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">
            Later you will upload real nail photos here. The first image becomes the product card image.
          </p>
          <label className="mt-5 grid min-h-56 cursor-pointer place-items-center rounded-[1.6rem] border border-dashed border-[#cbb8ff] bg-white/35 p-6 text-center transition hover:bg-white/55">
            <input type="file" multiple accept="image/*" className="hidden" />
            <span>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(135deg,#ffe1ed,#e8dcff)] text-2xl">＋</span>
              <span className="mt-4 block font-black text-[#3b3040]">Upload multiple product photos</span>
              <span className="mt-2 block text-sm font-semibold text-[#756778]">PNG, JPG or WEBP. Real storage comes with Supabase.</span>
            </span>
          </label>
        </div>

        <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Publishing</h2>
          <div className="mt-5 grid gap-3">
            {['Show on shop page', 'Feature on homepage', 'Allow ordering', 'Move to Studio Archive later'].map((item, index) => (
              <label key={item} className="flex items-center justify-between gap-4 rounded-2xl border border-white/55 bg-white/38 p-4 text-sm font-black text-[#4b3e51]">
                {item}
                <input type="checkbox" defaultChecked={index < 3 || Boolean(initialSet?.archived)} className="h-5 w-5 accent-[#b66bd7]" />
              </label>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" className="btn-secondary">Save draft</button>
            <button type="button" className="btn-primary">Publish set</button>
          </div>
        </div>
      </div>
    </form>
  );
}
