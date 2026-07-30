'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AUTH_STORAGE_KEY, demoUsers, type DemoUser, type UserRole } from '@/lib/demo-auth';

type LoginInput = {
  email?: string;
  name?: string;
  role: UserRole;
};

type AuthContextValue = {
  user: DemoUser | null;
  loading: boolean;
  loginAsDemo: (role: UserRole) => DemoUser;
  loginWithEmail: (input: LoginInput) => DemoUser;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const value = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return value ? (JSON.parse(value) as DemoUser) : null;
  } catch {
    return null;
  }
}

function saveStoredUser(user: DemoUser | null) {
  if (typeof window === 'undefined') return;

  if (!user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  const loginAsDemo = useCallback((role: UserRole) => {
    const nextUser = demoUsers[role];
    setUser(nextUser);
    saveStoredUser(nextUser);
    return nextUser;
  }, []);

  const loginWithEmail = useCallback((input: LoginInput) => {
    const fallback = demoUsers[input.role];
    const nextUser: DemoUser = {
      id: `${input.role}-${Date.now()}`,
      name: input.name?.trim() || fallback.name,
      email: input.email?.trim() || fallback.email,
      role: input.role,
    };

    setUser(nextUser);
    saveStoredUser(nextUser);
    return nextUser;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    saveStoredUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, loginAsDemo, loginWithEmail, signOut }),
    [user, loading, loginAsDemo, loginWithEmail, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
