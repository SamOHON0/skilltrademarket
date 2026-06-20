import { getDataStore } from "@/lib/data";
import { TIER_LABELS } from "@/lib/constants";
import type { Tier } from "@/lib/types";
import {
  setTradeStatusAction,
  setTradeTierAction,
  setTradeVerifiedAction,
} from "@/app/actions";

export const metadata = { title: "Trades | Skill Trade admin" };

const TIERS: Tier[] = ["basic", "pro", "elite"];

export default async function AdminTradesPage() {
  const trades = await getDataStore().getTrades();

  return (
    <div>
      <h1 className="text-2xl font-bold">Trades</h1>
      <p className="mt-1 text-sm text-ink/60">
        Mark trades verified once ID and insurance check out, change a tier
        manually, or suspend a trade to pull them from the feed. Billing-driven
        tier changes arrive with Stripe (Phase 3).
      </p>
      <div className="mt-6 space-y-3">
        {trades.map((t) => {
          const suspended = t.status === "suspended";
          return (
            <div key={t.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{t.businessName}</h2>
                    {t.verifiedAt && (
                      <span className="rounded-full bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5">
                        Verified
                      </span>
                    )}
                    <span
                      className={`rounded-full text-xs font-semibold px-2 py-0.5 ${
                        suspended
                          ? "bg-red-100 text-red-700"
                          : t.status === "active"
                            ? "bg-ink/5 text-ink/70"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink/70">
                    {t.ownerName} &middot; {t.email} &middot; {t.phone}
                  </p>
                  <p className="mt-1 text-sm text-ink/60">
                    {t.tradeCategories.join(", ")} &middot;{" "}
                    {t.counties.join(", ")} &middot;{" "}
                    <span className="font-medium text-ink">
                      {TIER_LABELS[t.tier]}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form action={setTradeTierAction} className="flex items-center gap-1">
                    <input type="hidden" name="tradeId" value={t.id} />
                    <select
                      name="tier"
                      defaultValue={t.tier}
                      className="rounded-lg border border-ink/20 bg-white px-2 py-1.5 text-sm"
                    >
                      {TIERS.map((tier) => (
                        <option key={tier} value={tier}>
                          {TIER_LABELS[tier]}
                        </option>
                      ))}
                    </select>
                    <button className="rounded-lg border border-ink/20 px-3 py-1.5 text-sm font-medium hover:bg-paper">
                      Set tier
                    </button>
                  </form>

                  <form action={setTradeVerifiedAction}>
                    <input type="hidden" name="tradeId" value={t.id} />
                    <input
                      type="hidden"
                      name="verified"
                      value={t.verifiedAt ? "false" : "true"}
                    />
                    <button className="rounded-lg border border-ink/20 px-3 py-1.5 text-sm font-medium hover:bg-paper">
                      {t.verifiedAt ? "Unverify" : "Mark verified"}
                    </button>
                  </form>

                  <form action={setTradeStatusAction}>
                    <input type="hidden" name="tradeId" value={t.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={suspended ? "active" : "suspended"}
                    />
                    <button
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                        suspended
                          ? "bg-green-700 text-white hover:bg-green-800"
                          : "border border-red-300 text-red-700 hover:bg-red-50"
                      }`}
                    >
                      {suspended ? "Reactivate" : "Suspend"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
        {trades.length === 0 && (
          <p className="text-sm text-ink/50">No trades registered yet.</p>
        )}
      </div>
    </div>
  );
}
