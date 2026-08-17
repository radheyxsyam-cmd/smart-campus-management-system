import { supabase } from '@/lib/supabaseClient';
import type { Profile } from '@/types/models';

export async function fetchProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as Profile) ?? null;
}

export async function updateProfileName(userId: string, fullName: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', userId)
    .select('id, full_name, email, role, created_at')
    .single();

  if (error) throw error;
  return data as Profile;
}
