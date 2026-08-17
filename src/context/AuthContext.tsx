import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Profile } from '@/types/models';
import { getCurrentProfile, logout as doLogout } from '@/services/authService';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const p = await getCurrentProfile();
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // Initial load
    (async () => {
      await refreshProfile();
      setLoading(false);
    })();

    // Listen for auth state changes. Wrap async work to avoid deadlock.
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      (async () => {
        await refreshProfile();
      })();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    try {
      await doLogout();
    } catch {
      // signOut can fail if the server-side session is already invalid/expired.
      // We still need to clear local state so the user is logged out client-side.
    } finally {
      setProfile(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
