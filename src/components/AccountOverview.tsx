'use client';

import Link from 'next/link';
import AuthGate from '@/components/AuthGate';
import { useAuth } from '@/components/AuthProvider';

const cards = [
  { title: 'My orders', text: 'See current and previous orders.', href: '/account/orders' },
  { title: 'Saved address', text: 'Manage delivery details before checkout.', href: '/checkout' },
  { title: 'Photo requests', text: 'Replace hand photos if the studio asks.', href: '/photo-guide' },
];

function AccountContent() {
  const { user, signOut } = useAuth();

  return (
    <section className="page-shell py-14">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <span className="pill">Customer account</span>
          <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">
            Hi, {user?.name.split(' ')[0] ?? 'customer'}.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#756778]">
            Your account keeps orders, delivery details and future photo requests in one place.
          </p>
        </div>
        <button type="button" onClick={signOut} className="btn-secondary w-fit">Sign out</button>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="liquid-glass rounded-[2rem] p-6 transition hover:-translate-y-1 hover:bg-white/68">
            <h2 className="font-display text-3xl font-black tracking-[-0.06em]">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#756778]">{card.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function AccountOverview() {
  return (
    <AuthGate requiredRole="customer" title="Your customer account is private." description="Login to view your orders, saved details and photo requests.">
      <AccountContent />
    </AuthGate>
  );
}
