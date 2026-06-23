"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerSupabase, createServiceClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; notice?: string };

const NO_SUPABASE: AuthState = {
  error: "Accounts need Supabase configured. Set DATA_SOURCE=supabase in .env.local.",
};

export async function signUpTrade(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const businessName = String(formData.get("businessName") ?? "").trim();
  const ownerName = String(formData.get("ownerName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const tradeCategories = formData.getAll("tradeCategories").map(String);
  const counties = formData.getAll("counties").map(String);

  if (!email || !email.includes("@")) return { error: "Enter a valid email." };
  if (password.length < 8)
    return { error: "Use at least 8 characters for your password." };
  if (!businessName || !ownerName || !phone)
    return { error: "Add your business name, your name, and a phone number." };
  if (tradeCategories.length === 0)
    return { error: "Pick at least one trade you cover." };
  if (counties.length === 0)
    return { error: "Pick at least one county you work in." };

  const supabase = await createServerSupabase();
  if (!supabase) return NO_SUPABASE;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  const userId = data.user?.id;
  if (!userId) return { error: "Could not create the account. Try again." };

  // Create the linked trade profile with the service role (bypasses RLS).
  const admin = createServiceClient();
  const { error: insErr } = await admin.from("trades_people").insert({
    auth_user_id: userId,
    business_name: businessName,
    owner_name: ownerName,
    email,
    phone,
    trade_categories: tradeCategories,
    counties,
    tier: "basic",
    subscription_active: false,
    status: "pending",
  });
  if (insErr) {
    // Roll back the orphaned auth user so the email can be reused.
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    if (insErr.code === "23505")
      return { error: "There is already an account with that email." };
    return { error: insErr.message };
  }

  if (data.session) redirect("/trade/dashboard");
  redirect("/login?notice=check-email");
}

export async function signInUser(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/trade/dashboard") || "/trade/dashboard";

  const supabase = await createServerSupabase();
  if (!supabase) return NO_SUPABASE;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Wrong email or password." };
  redirect(next.startsWith("/") ? next : "/trade/dashboard");
}

export async function signOut() {
  const supabase = await createServerSupabase();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email.includes("@")) return { error: "Enter a valid email." };

  const supabase = await createServerSupabase();
  if (!supabase) return NO_SUPABASE;

  const hdrs = await headers();
  const origin = hdrs.get("origin") ?? `https://${hdrs.get("host") ?? ""}`;
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/trade/reset-password`,
  });
  // Always show the same message, so we don't leak which emails are registered.
  return {
    notice: "If that email has an account, a reset link is on its way.",
  };
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters." };

  const supabase = await createServerSupabase();
  if (!supabase) return NO_SUPABASE;

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/trade/dashboard");
}
