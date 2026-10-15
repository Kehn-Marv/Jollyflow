import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { UserProfile } from '../types/domain';
import { auth } from '../services';

interface AuthContextValue {
  user: UserProfile | null;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (input: {name: string;email: string;password: string;}) => Promise<UserProfile>;
  enterDemo: () => Promise<UserProfile>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<UserProfile>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<UserProfile | null>(() => auth.getSession());

  const wrap = useCallback(<A extends unknown[],>(fn: (...args: A) => Promise<UserProfile>) => async (...args: A) => {
    const u = await fn(...args);
    setUser(u);
    return u;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: wrap(auth.signIn),
      signUp: wrap(auth.signUp),
      enterDemo: wrap(auth.enterDemo),
      updateProfile: wrap(auth.updateProfile),
      signOut: async () => {
        await auth.signOut();
        setUser(null);
      }
    }),
    [user, wrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}