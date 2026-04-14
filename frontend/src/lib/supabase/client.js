import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasPlaceholderKey =
  typeof supabaseAnonKey === 'string' &&
  (supabaseAnonKey.includes('<SECRET>') || supabaseAnonKey.includes('YOUR_SUPABASE'));

if (!supabaseUrl || !supabaseAnonKey || hasPlaceholderKey) {
  console.error(
    'Supabase URL or Anonymous Key is missing/invalid. Set real values for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env and restart the Vite server.'
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