import Image from 'next/image';

export default function AboutPage() {
  return (
    <section className="page-shell grid gap-10 py-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
      <div>
        <span className="pill">About the studio</span>
        <h1 className="mt-5 font-display text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-7xl">Designed by us. Fitted for real hands.</h1>
        <p className="mt-6 text-base leading-8 text-[#756778]">BILLi&BoBA NAILS is built around curated press-on sets, guided hand photos and a smooth shopping experience. Customers choose from designs we upload, so expectations stay clear and production stays controlled.</p>
      </div>
      <div className="liquid-glass grid min-h-[480px] place-items-center rounded-[2.4rem] p-8">
        <Image src="/images/billi-boba-logo.jpg" alt="BILLi&BoBA NAILS logo" width={310} height={310} className="float-slow rounded-full object-cover shadow-[0_30px_90px_rgba(127,80,120,.18)]" />
      </div>
    </section>
  );
}
