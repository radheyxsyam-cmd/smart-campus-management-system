import { supabase } from '@/lib/supabaseClient';
import { fetchProfileById } from '@/dao/userDAO';
import type { Profile } from '@/types/models';

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function validateRegisterInput(input: RegisterInput): string | null {
  if (!input.fullName.trim()) return 'Full name is required.';
  if (!input.email.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return 'Please enter a valid email address.';
  if (input.password.length < 6) return 'Password must be at least 6 characters long.';
  return null;
}

export function validateLoginInput(input: LoginInput): string | null {
  if (!input.email.trim()) return 'Email is required.';
  if (!input.password) return 'Password is required.';
  return null;
}

export async function register(input: RegisterInput): Promise<Profile> {
  const validationError = validateRegisterInput(input);
  if (validationError) throw new Error(validationError);

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: { full_name: input.fullName.trim() },
    },
  });

  if (error) throw new Error(translateAuthError(error.message));
  if (!data.user) throw new Error('Registration failed. Please try again.');

  // The trigger creates the profile row; fetch it to confirm.
  const profile = await fetchProfileById(data.user.id);
  if (!profile) throw new Error('Account created but profile could not be loaded. Please log in.');
  return profile;
}

export async function login(input: LoginInput): Promise<Profile> {
  const validationError = validateLoginInput(input);
  if (validationError) throw new Error(validationError);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });

  if (error) throw new Error(translateAuthError(error.message));
  if (!data.user) throw new Error('Login failed. Please check your credentials.');

  const profile = await fetchProfileById(data.user.id);
  if (!profile) throw new Error('Account exists but profile not found. Please contact support.');
  return profile;
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(translateAuthError(error.message));
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  return fetchProfileById(data.session.user.id);
}

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'This email is already registered. Please log in instead.';
  }
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Invalid email or password.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Email not confirmed. Please contact support.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  return message;
}
