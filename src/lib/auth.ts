import type { User } from "@supabase/supabase-js";
import { createServerSupabase } from "./supabase/server";
import { getDataStore } from "./data";
import type { TradesPerson } from "./types";

// Auth helpers for server components, actions, and route handlers.
// Customers stay accountless (manage-token flow); accounts are for trades + admin.

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The trade profile linked to the signed-in user, or null. */
export async function getCurrentTrade(): Promise<TradesPerson | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getDataStore().getTradeByAuthUserId(user.id);
}

/** Admin is an allowlist of emails in the ADMIN_EMAILS env var (comma-separated). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}
