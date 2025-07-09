import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - replace these with your actual values
// IMPORTANT: In production, use environment variables for these values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anonymous Key is missing. Check your environment variables.'
  );
}

// Create a Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export default supabase; 