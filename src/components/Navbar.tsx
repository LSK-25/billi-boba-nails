'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/how-to-order', label: 'How it works' },
  { href: '/photo-guide', label: 'Photo guide' },
  { href: '/track-order', label: 'Track order' },
  { href: '/account/orders', label: 'My orders' },
];

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="transition duration-300 group-hover:-rotate-6 group-hover:scale-110"
    >
      <path
        d="M7.2 8.2h12.05l-1.1 7.15a2 2 0 0 1-1.98 1.7H9.35a2 2 0 0 1-1.97-1.65L5.9 5.8H3.85"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.3 20.15h.02M16.55 20.15h.02"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M10.1 8.2a3.1 3.1 0 0 1 6.2 0"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const [activePill, setActivePill] = useState({ left: 4, width: 72, ready: false });

  useLayoutEffect(() => {
    const movePill = () => {
      const nav = navRef.current;
      if (!nav) return;

      const activeLink = nav.querySelector<HTMLAnchorElement>(`a[data-active="true"]`);
      if (!activeLink) return;

      setActivePill({
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
        ready: true,
      });
    };

    movePill();
    window.addEventListener('resize', movePill);
    return () => window.removeEventListener('resize', movePill);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 nav-blur">
      <div className="page-shell flex min-h-[5rem] items-center justify-between gap-5 py-3">
        <Link href="/" className="group flex items-center gap-3" aria-label="BILLi&BoBA NAILS home">
          <div className="brand-mark grid h-12 w-12 place-items-center rounded-[1.05rem] transition duration-300 group-hover:-rotate-3 group-hover:scale-105">
            <span className="font-display text-[1.08rem] font-black tracking-[-0.08em] text-[#2b2130]">B&amp;B</span>
          </div>
          <div className="leading-none">
            <div className="brand-wordmark font-display text-[1.38rem] font-black tracking-[-0.065em] md:text-[1.6rem]">BILLi&amp;BoBA</div>
            <div className="mt-1 text-[0.58rem] font-black uppercase tracking-[0.36em] text-[#8f7492]">NAILS</div>
          </div>
        </Link>

        <nav
          ref={navRef}
          className="nav-pill-track relative hidden items-center gap-1 rounded-full border border-white/50 bg-white/30 p-1 shadow-[0_18px_56px_rgba(139,101,190,.12),inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-2xl lg:flex"
        >
          <span
            className="nav-active-glider"
            style={{
              transform: `translateX(${activePill.left}px)`,
              width: `${activePill.width}px`,
              opacity: activePill.ready ? 1 : 0,
            }}
            aria-hidden="true"
          />
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive}
                className={cn(
                  'relative z-10 rounded-full px-4 py-2 text-sm font-bold text-[#5f5368] transition duration-300 hover:text-[#6646ad]',
                  isActive && 'text-[#6d3fb1]',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/cart"
            className={cn(
              'group relative grid h-12 w-12 place-items-center rounded-full border border-white/55 bg-white/42 text-[#33233b] shadow-[0_14px_42px_rgba(139,101,190,.13),inset_0_1px_0_rgba(255,255,255,.78)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white/78 hover:text-[#7c58d7] hover:shadow-[0_18px_52px_rgba(126,91,183,.2)]',
              pathname === '/cart' && 'border-[#d8ccff] bg-[#f8f3ff]/80 text-[#7c58d7]',
            )}
            aria-label={`Cart with ${count} item${count === 1 ? '' : 's'}`}
            title="Cart"
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-br from-[#ee77a6] to-[#8c6fe8] px-1 text-[0.65rem] font-black text-white shadow-[0_10px_24px_rgba(126,91,183,.25)]">
                {count}
              </span>
            )}
          </Link>
          <Link href="/login" className="btn-primary px-4 py-2 text-sm">Login</Link>
        </div>

        <button
          className="grid h-11 w-11 place-items-center rounded-2xl border border-[#4a314e1c] bg-white/65 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open menu"
        >
          <span className="text-xl">☰</span>
        </button>
      </div>

      {open && (
        <div className="page-shell pb-4 lg:hidden">
          <div className="liquid-glass grid gap-1 rounded-3xl p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-bold text-[#3b3040] hover:bg-white/70"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/cart" onClick={() => setOpen(false)} className="btn-secondary relative py-3 text-sm" aria-label="Cart">
                <CartIcon /> Cart {count > 0 && <span className="ml-1 rounded-full bg-[#eee8ff] px-2 py-0.5 text-xs text-[#6d3fb1]">{count}</span>}
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className="btn-primary py-3 text-sm">Login</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
