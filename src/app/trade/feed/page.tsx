import Link from "next/link";
import { getDataStore } from "@/lib/data";
import { TIER_LABELS, UNLOCK_ALLOWANCES_MONTHLY, URGENCY_LABELS } from "@/lib/constants";
import UnlockButton from "./UnlockButton";

export const metadata = { title: "Job feed | Skill Trade" };

// DEMO MODE: until Supabase Auth is wired, pick a trade with ?as=trade-1|trade-2|trade-3.
// trade-1 Elite plumber (Dublin/Meath), trade-2 Pro electrician (Dublin/Kildare),
// trade-3 Basic painter (Kildare/Dublin/Wicklow). Tier release windows apply for real.

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string }>;
}) {
  const { as } = await searchParams;
  const tradeId = as ?? "trade-1";
  const store = getDataStore();
  const trade = await store.getTrade(tradeId);
  const feed = trade ? await store.getFeed(tradeId) : [];
  const unlocks = trade ? await store.getUnlocks(tradeId) : [];
  const allowance = trade ? UNLOCK_ALLOWANCES_MONTHLY[trade.tier] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Job feed</h1>
          {trade && (
            <p className="mt-1 text-ink/70">
              {trade.businessName} &middot;{" "}
              <span className="font-semibold text-accent-dark">
                {TIER_LABELS[trade.tier]}
              </span>{" "}
              &middot; {trade.counties.join(", ")} &middot;{" "}
              {allowance === null
                ? "Unlimited unlocks"
                : `${allowance} unlocks/month`}
            </p>
          )}
        </div>
        <div className="text-xs text-ink/50">
          Demo as:{" "}
          {["trade-1", "trade-2", "trade-3"].map((id) => (
            <Link
              key={id}
              href={`/trade/feed?as=${id}`}
              className={`ml-1 underline ${id === tradeId ? "font-bold text-ink" : ""}`}
            >
              {id}
            </Link>
          ))}
        </div>
      </div>

      {!trade && <p className="mt-8">Trade not found.</p>}

      <div className="mt-8 space-y-4">
        {feed.map((job) => {
          const slotsLeft = 5 - job.unlockCount;
          const myUnlock = unlocks.find((u) => u.jobId === job.id);
          return (
            <div key={job.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-lg">{job.title}</h2>
                  <p className="mt-1 text-sm text-ink/70">
                    {[job.town, job.county].filter(Boolean).join(", ")} &middot;{" "}
                    {URGENCY_LABELS[job.urgency]}
                    {job.budgetBand ? <> &middot; {job.budgetBand}</> : null}
                  </p>
                  {job.description && (
                    <p className="mt-2 text-sm text-ink/80">{job.description}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    slotsLeft > 0
                      ? "bg-accent/15 text-accent-dark"
                      : "bg-ink/10 text-ink/60"
                  }`}
                >
                  {slotsLeft > 0 ? `${slotsLeft} of 5 slots left` : "Fully claimed"}
                </span>
              </div>

              <div className="mt-4 border-t border-ink/10 pt-4">
                {myUnlock ? (
                  <div className="text-sm">
                    <p className="font-semibold text-green-700">
                      Unlocked. Customer: {myUnlock.job.customerName},{" "}
                      {myUnlock.job.customerPhone}, {myUnlock.job.customerEmail}{" "}
                      (prefers {myUnlock.job.preferredContact})
                    </p>
                  </div>
                ) : (
                  <UnlockButton
                    jobId={job.id}
                    tradeId={tradeId}
                    disabled={slotsLeft <= 0}
                  />
                )}
              </div>
            </div>
          );
        })}
        {trade && feed.length === 0 && (
          <p className="text-ink/60">
            No jobs match your trade and counties right now. Higher tiers see
            new jobs sooner.
          </p>
        )}
      </div>
    </div>
  );
}
