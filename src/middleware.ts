import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Refreshes the Supabase session on every navigation (so users stay logged in)
// and protects the trade + admin areas. Only active when Supabase is configured
// (DATA_SOURCE=supabase); in mock mode the demo feed stays open.

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || process.env.DATA_SOURCE !== "supabase") return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet: CookieToSet[]) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touch the session so the access token is refreshed and re-stored as needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  const tradeAuthPages = [
    "/trade/signup",
    "/trade/forgot-password",
    "/trade/reset-password",
  ];
  const isTradeArea =
    path.startsWith("/trade/") &&
    !tradeAuthPages.some((p) => path === p || path.startsWith(p + "/"));

  if ((isAdmin || isTradeArea) && !user) {
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
