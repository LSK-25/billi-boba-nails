'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getRoleHome, type UserRole } from '@/lib/demo-auth';
import { cn } from '@/lib/utils';

const roleOptions: { role: UserRole; title: string; text: string }[] = [
  { role: 'customer', title: 'Customer', text: 'Orders, tracking and photo requests.' },
  { role: 'admin', title: 'Admin', text: 'Products, orders and studio workflow.' },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { loginAsDemo, loginWithEmail } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'admin') setRole('admin');
  }, []);

  const roleCopy = useMemo(() => roleOptions.find((item) => item.role === role) ?? roleOptions[0], [role]);

  function handleDemoLogin(selectedRole = role) {
    const user = loginAsDemo(selectedRole);
    router.push(getRoleHome(user.role));
  }

  function handleEmailLogin() {
    const user = loginWithEmail({ role, email, name });
    router.push(getRoleHome(user.role));
  }

  return (
    <section className="page-shell grid min-h-[calc(100vh-12rem)] items-center gap-8 py-12 lg:grid-cols-[.92fr_1.08fr]">
      <div className="reveal">
        <span className="pill">Secure studio access</span>
        <h1 className="mt-6 font-display text-5xl font-black leading-[0.94] tracking-[-0.07em] md:text-7xl">
          Login for customers and studio.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-[#756778]">
          This milestone adds the account structure. For now it uses a safe local demo login; next we will connect Supabase Auth for real accounts.
        </p>
        <div className="mt-8 grid gap-3 sm:max-w-xl sm:grid-cols-2">
          {roleOptions.map((option) => (
            <button
              key={option.role}
              type="button"
              onClick={() => handleDemoLogin(option.role)}
              className="liquid-glass rounded-[1.6rem] p-5 text-left transition hover:-translate-y-1 hover:bg-white/70"
            >
              <p className="font-display text-3xl font-black tracking-[-0.06em]">{option.title}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">Continue demo login →</p>
            </button>
          ))}
        </div>
      </div>

      <div className="liquid-glass overflow-hidden rounded-[2.4rem] p-4 md:p-5">
        <div className="grid gap-0 overflow-hidden rounded-[2rem] border border-white/70 bg-white/38 md:grid-cols-[.86fr_1.14fr]">
          <div className="relative hidden min-h-[650px] overflow-hidden bg-gradient-to-br from-[#ffd4e2] via-[#fffaf3] to-[#d9c8ff] p-6 md:block">
            <div className="noise-overlay" />
            <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(circle at 50% 20%, white, transparent 14rem)' }} />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="w-fit rounded-full border border-white/70 bg-white/50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#7d6484] backdrop-blur">BILLi&amp;BoBA</div>
              <div className="grid place-items-center">
                <Image src="/images/billi-boba-logo.jpg" alt="BILLi&BoBA NAILS logo" width={260} height={260} className="float-slow h-64 w-64 rounded-full object-cover shadow-[0_30px_80px_rgba(127,80,120,.2)]" />
              </div>
              <p className="rounded-[1.4rem] border border-white/60 bg-white/45 p-4 text-sm font-bold leading-6 text-[#4f4254] backdrop-blur">
                Later, Supabase will protect sessions with secure cookies and role-based access for customers and admin.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-9">
            <div className="mb-8 flex items-center gap-3">
              <div className="liquid-glass grid h-12 w-12 place-items-center rounded-2xl"><span className="font-display font-black tracking-[-0.08em]">B&amp;B</span></div>
              <div>
                <h2 className="font-display text-4xl font-black tracking-[-0.06em]">Welcome back</h2>
                <p className="text-sm font-semibold text-[#8a7a8e]">{roleCopy.text}</p>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-[1.4rem] border border-white/60 bg-white/38 p-1.5 backdrop-blur-xl">
              {roleOptions.map((option) => (
                <button
                  key={option.role}
                  type="button"
                  onClick={() => setRole(option.role)}
                  className={cn(
                    'rounded-[1.05rem] px-4 py-3 text-sm font-black transition',
                    role === option.role ? 'bg-gradient-to-br from-[#ffe6f2] to-[#eee4ff] text-[#744eb6] shadow-[inset_0_1px_0_rgba(255,255,255,.75)]' : 'text-[#7b7080] hover:bg-white/55',
                  )}
                >
                  {option.title}
                </button>
              ))}
            </div>

            <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
              <label className="grid gap-2 text-sm font-bold text-[#4f4254]">
                Name
                <input className="input-field" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#4f4254]">
                Email address
                <input className="input-field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#4f4254]">
                Password
                <input className="input-field" type="password" placeholder="Demo only for now" />
              </label>
              <button type="button" onClick={handleEmailLogin} className="btn-primary mt-2">Login as {roleCopy.title}</button>
              <button type="button" onClick={() => handleDemoLogin()} className="btn-secondary">Use quick demo access</button>
              <p className="rounded-[1.2rem] border border-[#d8ccff66] bg-white/45 p-3 text-xs font-bold leading-5 text-[#786a7c]">
                Current build stores the session only in your browser for preview. Real signup, passwords and email verification come with Supabase.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
