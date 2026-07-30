'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getRoleHome } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'signup';

function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const supabase = useMemo(() => createClient(), []);
  const { refreshUser } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;

        if (!data.session) {
          setMessage('Account created. Check your email to confirm your account, then log in.');
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }

      const nextUser = await refreshUser();
      router.push(next || getRoleHome(nextUser?.role ?? 'customer'));
      router.refresh();
    } catch (caughtError) {
      const authError = caughtError instanceof Error ? caughtError.message : 'Something went wrong. Please try again.';
      setError(authError);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Enter your email first, then tap forgot password.');
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage('Password reset link sent. Check your email.');
  }

  return (
    <section className="page-shell grid min-h-[calc(100vh-12rem)] items-center gap-8 py-12 lg:grid-cols-[.92fr_1.08fr]">
      <div className="reveal">
        <span className="pill">Secure studio access</span>
        <h1 className="mt-6 font-display text-5xl font-black leading-[0.94] tracking-[-0.07em] md:text-7xl">
          One login for customers and studio.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-[#756778]">
          Customers create normal accounts. The private admin account is assigned from the database, so admin access is never chosen publicly on the website.
        </p>
        <div className="mt-8 grid gap-3 sm:max-w-xl sm:grid-cols-2">
          {[
            ['Customers', 'Orders, checkout, tracking and future photo requests.'],
            ['Studio admin', 'Products, orders and workflow only for approved admin email.'],
          ].map(([title, text]) => (
            <div key={title} className="liquid-glass rounded-[1.6rem] p-5">
              <p className="font-display text-3xl font-black tracking-[-0.06em]">{title}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">{text}</p>
            </div>
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
              <p className="rounded-[1.4rem] border border-white/60 bg-white/45 p-4 text-sm font-semibold leading-6 text-[#5f5263] backdrop-blur-xl">
                Real authentication is now connected through Supabase. Admin access is controlled by the profile role, not a visible button.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10">
            <div className="mb-7 flex rounded-full border border-white/70 bg-white/45 p-1 backdrop-blur-xl">
              {(['login', 'signup'] as AuthMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setError('');
                    setMessage('');
                  }}
                  className={cn('flex-1 rounded-full px-4 py-3 text-sm font-black capitalize transition', mode === item ? 'bg-gradient-to-r from-[#f48ab7] to-[#9173ee] text-white shadow-[0_16px_36px_rgba(145,115,238,.2)]' : 'text-[#6f6372] hover:bg-white/55')}
                >
                  {item === 'login' ? 'Login' : 'Create account'}
                </button>
              ))}
            </div>

            <h2 className="font-display text-4xl font-black tracking-[-0.07em] md:text-5xl">
              {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
            </h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#756778]">
              {mode === 'login'
                ? 'Use the email and password connected to your BILLi&BoBA account.'
                : 'New accounts are customers by default. Admin role is assigned privately by the studio owner.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
              {mode === 'signup' && (
                <label className="grid gap-2 text-sm font-bold text-[#4f4254]">
                  Full name
                  <input className="input-field" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" autoComplete="name" required />
                </label>
              )}
              <label className="grid gap-2 text-sm font-bold text-[#4f4254]">
                Email
                <input className="input-field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#4f4254]">
                Password
                <input className="input-field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 6 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required />
              </label>

              {error && <p className="rounded-[1.2rem] border border-[#ffb3c966] bg-[#fff3f7]/80 p-3 text-xs font-bold leading-5 text-[#a13f66]">{error}</p>}
              {message && <p className="rounded-[1.2rem] border border-[#d8ccff66] bg-white/55 p-3 text-xs font-bold leading-5 text-[#6d5a78]">{message}</p>}

              <button type="submit" className="btn-primary mt-2" disabled={submitting}>
                {submitting ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
              </button>
              {mode === 'login' && (
                <button type="button" onClick={handlePasswordReset} className="btn-secondary">
                  Forgot password
                </button>
              )}
              <p className="rounded-[1.2rem] border border-[#d8ccff66] bg-white/45 p-3 text-xs font-bold leading-5 text-[#786a7c]">
                There is no public admin signup. Your admin role is set inside Supabase after your account is created.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<section className="page-shell py-14"><div className="liquid-glass rounded-[2rem] p-8">Loading login…</div></section>}>
      <LoginPanel />
    </Suspense>
  );
}
