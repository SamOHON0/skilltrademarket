import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-only Supabase clients.
//
// Two flavours:
//  - createServiceClient(): service-role key, bypasses RLS. Used by the data
//    layer for trusted server work and the contact-field stripping on the feed.
//  - createServerSupabase(): anon key bound to the request cookies. This is the
//    authenticated session for the signed-in trade or admin (sign-in, sign-up,
//    sign-out, password reset). Returns null if Supabase env is not configured.

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

/**
 * Cookie-bound client for the signed-in user's session. Use in server
 * components, server actions, and route handlers. Returns null when Supabase
 * env vars are absent (e.g. mock mode), so callers can fall back gracefully.
 */
export async function createServerSupabase(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll called from a Server Component where cookies are read-only;
          // the middleware refreshes the session cookie instead.
        }
      },
    },
  });
}
