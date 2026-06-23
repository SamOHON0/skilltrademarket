import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Protects authenticated areas and keeps the session cookie fresh.
// Only active when Supabase is configured (DATA_SOURCE=supabase); in mock mode
// the demo feed stays open.

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || process.env.DATA_SOURCE !== "supabase") return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  const isTradeFeed = path.startsWith("/trade/feed");

  if ((isAdmin || isTradeFeed) && !user) {
    const to = new URL("/login", request.url);
    to.searchParams.set("next", path);
    return NextResponse.redirect(to);
  }

  if (isAdmin && user) {
    const admins = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!admins.includes((user.email ?? "").toLowerCase())) {
      return NextResponse.redirect(new URL("/login?error=not-admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/trade/feed/:path*"],
};
