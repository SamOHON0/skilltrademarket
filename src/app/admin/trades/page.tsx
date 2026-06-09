import { getDataStore } from "@/lib/data";
import { TIER_LABELS } from "@/lib/constants";

export const metadata = { title: "Trades | Skill Trade admin" };

export default async function AdminTradesPage() {
  const trades = await getDataStore().getTrades();

  return (
    <div>
      <h1 className="text-2xl font-bold">Trades</h1>
      <p className="mt-1 text-sm text-ink/60">
        Verification doc review, suspension, and manual tier changes wire up
        with Supabase Auth and Stripe (Phases 1 and 3).
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="text-left text-ink/50">
            <tr className="border-b border-ink/10">
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Trades</th>
              <th className="px-4 py-3">Counties</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Verified</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} className="border-b border-ink/5">
                <td className="px-4 py-3 font-medium">{t.businessName}</td>
                <td className="px-4 py-3">{t.tradeCategories.join(", ")}</td>
                <td className="px-4 py-3">{t.counties.join(", ")}</td>
                <td className="px-4 py-3">{TIER_LABELS[t.tier]}</td>
                <td className="px-4 py-3">{t.verifiedAt ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
