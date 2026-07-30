'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getDisplayName, normalizeRole, type AppUser, type ProfileRow } from '@/lib/auth';

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  refreshUser: () => Promise<AppUser | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function getProfileUser(): Promise<AppUser | null> {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) return null;

  const authUser = authData.user;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id,email,full_name,role')
    .eq('id', authUser.id)
    .maybeSingle<ProfileRow>();

  const email = profile?.email ?? authUser.email ?? '';
  const name = getDisplayName(email, profile?.full_name ?? (authUser.user_metadata?.full_name as string | undefined));

  return {
    id: authUser.id,
    email,
    name,
    role: normalizeRole(profile?.role),
  };
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const nextUser = await getProfileUser();
    setUser(nextUser);
    return nextUser;
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    getProfileUser().then((nextUser) => {
      if (!mounted) return;
      setUser(nextUser);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getProfileUser().then((nextUser) => {
        if (mounted) setUser(nextUser);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, loading, refreshUser, signOut }), [user, loading, refreshUser, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
