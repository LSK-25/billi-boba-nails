import Link from 'next/link';
import type { ReactNode } from 'react';

const adminNav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/products/new', label: 'Add set' },
  { href: '/admin/orders', label: 'Orders' },
];

type AdminShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
};

export default function AdminShell({ eyebrow = 'BILLi&BoBA admin', title, description, children, action }: AdminShellProps) {
  return (
    <section className="page-shell py-10 md:py-12">
      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <aside className="liquid-glass h-fit rounded-[2rem] p-4 lg:sticky lg:top-28">
          <div className="rounded-[1.5rem] border border-white/65 bg-white/35 p-4">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-[#8d6d98]">Studio tools</p>
            <p className="mt-2 font-display text-2xl font-black tracking-[-0.06em] text-[#2b2130]">B&amp;B workspace</p>
          </div>
          <nav className="mt-4 grid gap-2">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/0 px-4 py-3 text-sm font-black text-[#5f5368] transition hover:border-white/65 hover:bg-white/55 hover:text-[#6d3fb1]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/shop" className="btn-secondary mt-4 w-full py-3 text-sm">
            View customer shop
          </Link>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="pill">{eyebrow}</span>
              <h1 className="mt-5 font-display text-4xl font-black leading-[0.92] tracking-[-0.07em] md:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#756778]">{description}</p>
            </div>
            {action}
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
