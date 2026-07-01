// Small display helpers shared by the feed, dashboard, and manage pages.

/** "just now", "25 min ago", "3 h ago", "2 days ago" */
export function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

/** Whole days until an ISO date, or null if past/missing. */
export function daysLeft(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return null;
  return Math.ceil(ms / 86_400_000);
}

/** "expires today", "1 day left", "5 days left" */
export function expiryLabel(iso: string | null): string | null {
  const d = daysLeft(iso);
  if (d == null) return null;
  if (d <= 1) return "expires today";
  return `${d} days left`;
}

/** Distance label; approx=true marks blurred pre-unlock coordinates. */
export function kmLabel(km: number, approx = false): string {
  const value = km < 10 ? km.toFixed(1) : String(Math.round(km));
  return `${approx ? "~" : ""}${value} km away`;
}

/** "14 June 2026" in Irish date style. */
export function dateIE(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
