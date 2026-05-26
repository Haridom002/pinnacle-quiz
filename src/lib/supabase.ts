import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
});

export type UserRole = 'student' | 'teacher' | 'parent';
export interface AppUser {
  id: string; email: string; full_name: string; avatar_id: string;
  role: UserRole; house?: 'Alpha'|'Beta'|'Gamma'|'Pulsar'; xp: number; level: number; created_at: string;
}
