import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Single server-side Supabase client using the service_role key.
// All database access in this app happens on the server, never in the browser.
let client = null;

export function supabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.local.example to .env.local and fill it in.'
      );
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
