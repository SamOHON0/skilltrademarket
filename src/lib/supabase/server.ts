import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service role key.
//
// Phase 1: there is no end-user auth yet, and every DataStore call runs on the
// server (server actions / server components). We use the service role key,
// which bypasses RLS, and rely on the data layer to strip customer contact
// fields from the trade-facing feed (see toFeedJob in supabase.ts).
//
// Phase 2 (Supabase Auth): add an anon/SSR client bound to the request cookies
// for trade + admin sessions, and let the RLS policies + security-definer
// functions in 0001_initial_schema.sql do the gatekeeping. The service client
// stays for admin/service tasks only.

let cached: SupabaseClient | null = null;

export function createServiceClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (see SUPABASE_SETUP.md)."
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
