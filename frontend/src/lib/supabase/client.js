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

// Other apps in this workspace (ICAN, mybodaguy, digital-city-era) get
// bundled onto this page via cross-app imports and point at the same
// Supabase project. Reuse whichever client for this project URL was
// created first to avoid a second GoTrueClient fighting over the same
// auth session.
const sharedClients = (globalThis.__ICANERACOIN_SUPABASE_CLIENTS__ ||= {});

// Create a Supabase client instance
export const supabase =
  sharedClients[supabaseUrl] ||
  (sharedClients[supabaseUrl] = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }));

export default supabase; 