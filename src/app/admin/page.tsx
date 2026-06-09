import { getDataStore } from "@/lib/data";
import { TIER_PRICES_EUR } from "@/lib/constants";

export const metadata = { title: "Admin dashboard | Skill Trade" };

export default async function AdminDashboard() {
  const store = getDataStore();
  const [jobs, trades] = await Promise.all([store.getJobs(), store.getTrades()]);

  const active = trades.filter((t) => t.subscriptionActive && t.status === "active");
  const mrr = active.reduce((sum, t) => sum + TIER_PRICES_EUR[t.tier], 0);

  const stats: [string, string | number][] = [
    ["Jobs pending review", jobs.filter((j) => j.status === "pending_review").length],
    ["Jobs live", jobs.filter((j) => j.status === "live").length],
    ["Jobs fully claimed", jobs.filter((j) => j.status === "fully_claimed").length],
    ["Active subscribers", active.length],
    ["MRR (ex VAT)", `€${mrr.toFixed(2)}`],
    ["Verification pending", trades.filter((t) => !t.verifiedAt && t.tier !== "basic").length],
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold">{value}</p>
            <p className="mt-1 text-sm text-ink/60">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink/50">
        Unlock latency by tier, churn, and the raffle tool land in Phase 4.
      </p>
    </div>
  );
}
