import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Fallback to placeholder if not a valid URL
if (!supabaseUrl.startsWith('http')) {
  console.warn('Supabase URL or Anon Key is missing/invalid. Check your environment variables.');
  supabaseUrl = 'https://placeholder.supabase.co';
  supabaseAnonKey = 'placeholder';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
