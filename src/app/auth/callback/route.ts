import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// Handles email-confirmation and password-recovery links: exchanges the code
// for a session cookie, then redirects on.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/trade/feed";

  if (code) {
    const supabase = await createServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
