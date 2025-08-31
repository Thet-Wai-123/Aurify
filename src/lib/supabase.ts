import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: any = null;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Avoid calling createClient with empty values which throws at runtime in the browser.
  // Export a stub that surfaces a clear error when used.
  // This keeps the app from crashing on import and gives developers a clear console message.
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Supabase features are disabled.\nSet these in your .env and restart the dev server.');

  const makeErr = () => {
    throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env and restart the dev server.');
  };

  const stub = new Proxy({}, {
    get() { return makeErr; },
    apply() { return Promise.reject(new Error('Supabase not configured')); }
  });

  supabaseClient = stub as any;
} else {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
}

export const supabase = supabaseClient;

export default supabase;
