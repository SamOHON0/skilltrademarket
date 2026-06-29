import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { signOut } from "@/app/auth-actions";

// Admin is gated when Supabase is configured: must be signed in and on the
// ADMIN_EMAILS allowlist. In mock mode it stays open for local development.
// Middleware enforces this too; this is defence in depth.

const nav: [string, string][] = [
  ["/admin", "Dashboard"],
  ["/admin/jobs", "Job queue"],
  ["/admin/trades", "Trades"],
  ["/admin/verification", "Verification"],
  ["/admin/reviews", "Reviews"],
  ["/admin/leaderboard", "Leaderboard"],
  ["/admin/settings", "Settings"],
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.DATA_SOURCE === "supabase") {
    const user = await getCurrentUser();
    if (!user) redirect("/login?next=/admin");
    if (!isAdminEmail(user.email)) redirect("/login?error=not-admin");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:flex md:gap-8">
      <aside className="md:w-48 shrink-0 mb-6 md:mb-0">
        <p className="text-xs font-bold uppercase tracking-wide text-ink/50 mb-3">
          Admin
        </p>
        <nav className="flex md:flex-col gap-1 text-sm">
          {nav.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 hover:bg-white font-medium"
            >
              {label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="mt-4 hidden md:block">
          <button className="text-xs underline text-ink/50 hover:text-ink px-3">
            Log out
          </button>
        </form>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
