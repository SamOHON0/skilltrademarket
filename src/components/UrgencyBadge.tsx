import type { JobUrgency } from "@/lib/types";

const STYLES: Record<JobUrgency, { label: string; cls: string }> = {
  asap: { label: "ASAP", cls: "bg-red-100 text-red-700" },
  this_week: { label: "This week", cls: "bg-amber-100 text-amber-800" },
  this_month: { label: "This month", cls: "bg-blue-100 text-blue-700" },
  flexible: { label: "Flexible", cls: "bg-ink/10 text-ink/60" },
};

export default function UrgencyBadge({ urgency }: { urgency: JobUrgency }) {
  const s = STYLES[urgency] ?? STYLES.flexible;
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}
