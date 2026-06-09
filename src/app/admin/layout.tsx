import Link from "next/link";

// AUTH PLACEHOLDER: when Supabase Auth is wired, gate /admin/* in middleware
// on an admin role claim (see src/lib/data/supabase.ts notes).

const nav = [
  ["/admin", "Dashboard"],
  ["/admin/jobs", "Job queue"],
  ["/admin/trades", "Trades"],
  ["/admin/reviews", "Reviews"],
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
