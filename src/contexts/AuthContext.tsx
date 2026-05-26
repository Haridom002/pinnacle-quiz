import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, AppUser, UserRole } from '../lib/supabase';
import { getLevelFromXP } from '../utils/mathEngine';

interface AuthContextValue {
  session: Session | null;
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<AuthError | null>;
  signUpWithEmail: (email: string, password: string, fullName: string, role: UserRole, avatarId: string, house?: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AppUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

async function fetchAppUser(supabaseUser: User): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .single();

  if (error || !data) return null;
  return {
    ...data,
    level: getLevelFromXP(data.xp ?? 0),
  } as AppUser;
}

async function upsertProfile(supabaseUser: User, extra?: Partial<AppUser>): Promise<AppUser | null> {
  const defaultProfile = {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    full_name: extra?.full_name ?? supabaseUser.user_metadata?.full_name ?? supabaseUser.email?.split('@')[0] ?? 'Player',
    avatar_id: extra?.avatar_id ?? '0',
    role: extra?.role ?? 'student' as UserRole,
    house: extra?.house ?? null,
    xp: 0,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(defaultProfile, { onConflict: 'id', ignoreDuplicates: true })
    .select()
    .single();

  if (error) {
    // Profile may already exist — just fetch it
    return fetchAppUser(supabaseUser);
  }
  return { ...data, level: getLevelFromXP(data.xp ?? 0) } as AppUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (s?.user) {
      const appUser = await fetchAppUser(s.user);
      setUser(appUser);
    }
  }, []);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        const appUser = await fetchAppUser(s.user);
        setUser(appUser);
      }
      setLoading(false);
    });

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      if (s?.user) {
        if (event === 'SIGNED_IN') {
          // New OAuth sign-in: upsert profile
          const appUser = await upsertProfile(s.user);
          setUser(appUser);
        } else {
          const appUser = await fetchAppUser(s.user);
          setUser(appUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    avatarId: string,
    house?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error || !data.user) return error;

    // Create profile immediately
    await upsertProfile(data.user, {
      full_name: fullName,
      role,
      avatar_id: avatarId,
      house: house as AppUser['house'],
    });
    return null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<AppUser>) => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single();
    if (data) setUser({ ...data, level: getLevelFromXP(data.xp ?? 0) } as AppUser);
  };

  return (
    <AuthContext.Provider value={{
      session, user, loading,
      signInWithGoogle, signInWithEmail, signUpWithEmail,
      signOut, updateProfile, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
