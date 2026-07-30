import FilterRail from '@/components/FilterRail';
import { getActiveProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <>
      <section className="page-shell pt-14">
        <span className="pill">Studio collection</span>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <h1 className="font-display text-5xl font-black leading-[0.95] tracking-[-0.07em] text-[#221927] md:text-7xl">
            Browse curated press-on sets.
          </h1>
          <p className="text-base leading-8 text-[#756778]">
            Filter by category, size / length, shape, finish and price. Products are now loaded from the BILLi&BoBA Supabase database.
          </p>
        </div>
      </section>
      <FilterRail sets={products} />
    </>
  );
}