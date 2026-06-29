"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS: [string, string][] = [
  ["/trade/dashboard", "Dashboard"],
  ["/trade/feed", "Job feed"],
  ["/trade/profile", "Profile"],
  ["/trade/billing", "Plan & billing"],
  ["/trade/verification", "Verification"],
];

export default function TradeTabs() {
  const path = usePathname();
  return (
    <div className="border-b border-ink/10 bg-paper">
      <nav className="mx-auto max-w-4xl px-4 flex gap-1 overflow-x-auto">
        {TABS.map(([href, label]) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 ${
                active
                  ? "border-accent text-ink"
                  : "border-transparent text-ink/60 hover:text-ink"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
