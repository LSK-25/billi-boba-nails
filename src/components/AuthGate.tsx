'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { getRoleLabel, type UserRole } from '@/lib/demo-auth';
import { useAuth } from '@/components/AuthProvider';

type AuthGateProps = {
  children: ReactNode;
  requiredRole?: UserRole;
  title?: string;
  description?: string;
};

export default function AuthGate({ children, requiredRole, title, description }: AuthGateProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <section className="page-shell py-14">
        <div className="liquid-glass rounded-[2rem] p-8">
          <span className="pill">Checking studio access</span>
          <h1 className="mt-5 font-display text-4xl font-black tracking-[-0.06em]">Loading your session…</h1>
          <p className="mt-3 text-sm font-semibold leading-7 text-[#756778]">Please wait while BILLi&amp;BoBA checks your account role.</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-shell py-14">
        <div className="liquid-glass mx-auto max-w-3xl rounded-[2rem] p-8 md:p-10">
          <span className="pill">Login required</span>
          <h1 className="mt-5 font-display text-4xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl">
            {title ?? 'Sign in to continue.'}
          </h1>
          <p className="mt-5 text-base leading-8 text-[#756778]">
            {description ?? 'Use your BILLi&BoBA account to view this private studio area.'}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="btn-primary">Login / Signup</Link>
            <Link href="/shop" className="btn-secondary">Back to shop</Link>
          </div>
        </div>
      </section>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <section className="page-shell py-14">
        <div className="liquid-glass mx-auto max-w-3xl rounded-[2rem] p-8 md:p-10">
          <span className="pill">Wrong account type</span>
          <h1 className="mt-5 font-display text-4xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl">
            {getRoleLabel(requiredRole)} access required.
          </h1>
          <p className="mt-5 text-base leading-8 text-[#756778]">
            You are currently signed in as a {getRoleLabel(user.role).toLowerCase()}. Switch accounts to open this area.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="btn-primary">Switch account</Link>
            <Link href={user.role === 'admin' ? '/admin' : '/account'} className="btn-secondary">Go to my area</Link>
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
