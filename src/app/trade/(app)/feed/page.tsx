import Link from "next/link";
import { getDataStore } from "@/lib/data";
import { getCurrentTrade } from "@/lib/auth";
import { signOut } from "@/app/auth-actions";
import {
  TIER_LABELS,
  UNLOCK_ALLOWANCES_MONTHLY,
  URGENCY_LABELS,
  MATCH_RADIUS_KM,
} from "@/lib/constants";
import { jobDistanceKm, effectiveRadiusKm } from "@/lib/geo";
import UnlockButton from "./UnlockButton";
import ContactButtons from "@/components/ContactButtons";
import UrgencyBadge from "@/components/UrgencyBadge";
import JobMap from "@/components/JobMap";

export const metadata = { title: "Job feed | Skill Trade" };

const DEMO_TRADES = [
  { id: "trade-1", label: "trade-1" },
  { id: "trade-2", label: "trade-2" },
  { id: "trade-3", label: "trade-3" },
];

function kmLabel(km: number): string {
  return km < 10 ? `${km.toFixed(1)} km away` : `${Math.round(km)} km away`;
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string }>;
}) {
  const { as } = await searchParams;
  const store = getDataStore();
  const supabaseMode = process.env.DATA_SOURCE === "supabase";

  const current = await getCurrentTrade();
  let trade = current;
  let tradeId = current?.id ?? "";
  let isDemo = false;

  if (!current && !supabaseMode) {
    isDemo = true;
    tradeId = as ?? DEMO_TRADES[0].id;
    trade = await store.getTrade(tradeId);
  }

  if (!trade && supabaseMode) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="shout text-3xl">No trade profile</h1>
        <p className="mt-3 text-ink/70">
          This account is signed in but has no tradesperson profile attached.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/trade/signup"
            className="rounded-lg bg-accent hover:bg-accent-dark text-ink px-4 py-2.5 font-semibold"
          >
            Create a trade profile
          </Link>
          <form action={signOut}>
            <button className="rounded-lg border border-ink/20 px-4 py-2.5 font-medium hover:bg-white">
              Log out
            </button>
          </form>
        </div>
      </div>
    );
  }

  const feed = trade ? await store.getFeed(tradeId) : [];
  const unlocks = trade ? await store.getUnlocks(tradeId) : [];
  const allowance = trade ? UNLOCK_ALLOWANCES_MONTHLY[trade.tier] : null;
  const pending = trade
    ? trade.status !== "active" || !trade.subscriptionActive
    : false;
  const radiusText = trade
    ? effectiveRadiusKm(trade, MATCH_RADIUS_KM) === 0
      ? "anywhere in Ireland"
      : `within ${effectiveRadiusKm(trade, MATCH_RADIUS_KM)} km of your base`
    : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="shout text-3xl">Job feed</h1>
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
        {current ? (
          <form action={signOut}>
            <button className="text-sm underline text-ink/60 hover:text-ink">
              Log out
            </button>
          </form>
        ) : isDemo ? (
          <div className="text-xs text-ink/50">
            Demo as:{" "}
            {DEMO_TRADES.map((t) => (
              <Link
                key={t.id}
                href={`/trade/feed?as=${t.id}`}
                className={`ml-1 underline ${t.id === tradeId ? "font-bold text-ink" : ""}`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {!trade && <p className="mt-8">Trade not found.</p>}

      {pending && (
        <p className="mt-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
          Your account is being set up. You can browse matched jobs now;
          unlocking opens once your account is approved and your subscription is
          active (Phase 3).
        </p>
      )}

      {trade && (
        <p className="mt-4 text-xs text-ink/50">
          Showing jobs {radiusText} (or in your counties where we don&apos;t
          have an exact location).
        </p>
      )}

      <div className="mt-4 space-y-4">
        {feed.map((job) => {
          const slotsLeft = 5 - job.unlockCount;
          const myUnlock = unlocks.find((u) => u.jobId === job.id);
          const dist = trade ? jobDistanceKm(job, trade) : null;
          return (
            <div key={job.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-lg">{job.title}</h2>
                    <UrgencyBadge urgency={job.urgency} />
                  </div>
                  <p className="mt-1 text-sm text-ink/70">
                    {[job.town, job.county].filter(Boolean).join(", ")}
                    {dist != null ? ` · ${kmLabel(dist)}` : ""} &middot;{" "}
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
                  {slotsLeft > 0
                    ? `${job.unlockCount} of 5 unlocked`
                    : "Fully claimed"}
                </span>
              </div>

              {job.lat != null && job.lng != null && (
                <div className="mt-3">
                  <JobMap
                    lat={job.lat}
                    lng={job.lng}
                    marker={!!myUnlock}
                    className="h-40"
                    label={`${job.town ?? job.county} area`}
                  />
                </div>
              )}

              <div className="mt-4 border-t border-ink/10 pt-4">
                {myUnlock ? (
                  <div className="text-sm">
                    <p className="font-semibold text-green-700">
                      Unlocked. Customer: {myUnlock.job.customerName}
                    </p>
                    <div className="mt-2">
                      <ContactButtons
                        phone={myUnlock.job.customerPhone}
                        email={myUnlock.job.customerEmail}
                        preferred={myUnlock.job.preferredContact}
                      />
                    </div>
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
            No jobs match your trade {radiusText} right now. Higher tiers see new
            jobs sooner.
          </p>
        )}
      </div>
    </div>
  );
}
