import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentTrade } from "@/lib/auth";
import { getDataStore } from "@/lib/data";
import { signOut } from "@/app/auth-actions";
import { setOutcomeAction } from "@/app/actions";
import ContactButtons from "@/components/ContactButtons";
import UrgencyBadge from "@/components/UrgencyBadge";
import JobMap from "@/components/JobMap";
import { jobDistanceKm, effectiveRadiusKm } from "@/lib/geo";
import {
  MATCH_RADIUS_KM,
  TIER_LABELS,
  UNLOCK_ALLOWANCES_MONTHLY,
  URGENCY_LABELS,
} from "@/lib/constants";

export const metadata = { title: "Dashboard | Skill Trade" };

const OUTCOMES = ["won", "lost", "completed"] as const;

function kmLabel(km: number): string {
  return km < 10 ? `${km.toFixed(1)} km away` : `${Math.round(km)} km away`;
}

export default async function DashboardPage() {
  const supabaseMode = process.env.DATA_SOURCE === "supabase";
  const trade = await getCurrentTrade();

  if (!trade) {
    if (!supabaseMode) redirect("/login");
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="shout text-3xl">No trade profile</h1>
        <p className="mt-3 text-ink/70">
          You are signed in but this account has no tradesperson profile.
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

  const store = getDataStore();
  const [feed, unlocks] = await Promise.all([
    store.getFeed(trade.id),
    store.getUnlocks(trade.id),
  ]);

  const allowance = UNLOCK_ALLOWANCES_MONTHLY[trade.tier];
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const usedThisMonth = unlocks.filter(
    (u) => new Date(u.unlockedAt) >= monthStart
  ).length;
  const active = trade.status === "active" && trade.subscriptionActive;

  const stats: { label: string; value: string }[] = [
    { label: "Your plan", value: TIER_LABELS[trade.tier] },
    {
      label: "Unlocks this month",
      value:
        allowance === null
          ? `${usedThisMonth} / unlimited`
          : `${usedThisMonth} / ${allowance}`,
    },
    { label: "Jobs near you", value: String(feed.length) },
    { label: "Jobs unlocked", value: String(unlocks.length) },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="shout text-3xl">Dashboard</h1>
          <p className="mt-1 text-ink/70">
            {trade.businessName} &middot;{" "}
            <span className="font-semibold text-accent-dark">
              {TIER_LABELS[trade.tier]}
            </span>
            {trade.verifiedAt && (
              <>
                {" "}
                &middot;{" "}
                <span className="text-green-700 font-semibold">Verified</span>
              </>
            )}
          </p>
        </div>
        <form action={signOut}>
          <button className="text-sm underline text-ink/60 hover:text-ink">
            Log out
          </button>
        </form>
      </div>

      {!active && (
        <p className="mt-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
          Your account is being set up. You can browse matched jobs now;
          unlocking opens once your account is approved and your subscription is
          active (Phase 3, Stripe).
        </p>
      )}

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/trade/feed"
          className="rounded-lg bg-accent hover:bg-accent-dark text-ink px-5 py-2.5 font-semibold"
        >
          Browse {feed.length} job{feed.length === 1 ? "" : "s"} near you
        </Link>
        <Link
          href="/trade/profile"
          className="rounded-lg border border-ink/20 px-5 py-2.5 font-medium hover:bg-white"
        >
          Edit profile
        </Link>
        <Link
          href="/post-job"
          className="rounded-lg border border-ink/20 px-5 py-2.5 font-medium hover:bg-white"
        >
          Need a job done? Post one
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-sm text-ink/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Jobs you have unlocked</h2>
            <Link
              href="/trade/feed"
              className="text-sm font-semibold underline text-accent-dark"
            >
              Browse the feed
            </Link>
          </div>
          {unlocks.length === 0 ? (
            <p className="mt-4 text-sm text-ink/60">
              You have not unlocked any jobs yet. Head to the job feed to find
              local work.
            </p>
          ) : (
            <ul className="mt-4 space-y-5">
              {unlocks.map((u) => {
                const dist = jobDistanceKm(u.job, trade);
                return (
                  <li
                    key={u.id}
                    className="border-t border-ink/10 pt-5 first:border-0 first:pt-0"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{u.job.title}</h3>
                      <UrgencyBadge urgency={u.job.urgency} />
                    </div>
                    <p className="mt-0.5 text-sm text-ink/70">
                      {[u.job.town, u.job.county].filter(Boolean).join(", ")}
                      {dist != null ? ` · ${kmLabel(dist)}` : ""} &middot;{" "}
                      {URGENCY_LABELS[u.job.urgency]}
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {u.job.customerName}
                    </p>
                    <div className="mt-2">
                      <ContactButtons
                        phone={u.job.customerPhone}
                        email={u.job.customerEmail}
                        preferred={u.job.preferredContact}
                      />
                    </div>
                    {u.job.lat != null && u.job.lng != null && (
                      <div className="mt-3">
                        <JobMap
                          lat={u.job.lat}
                          lng={u.job.lng}
                          marker
                          className="h-40"
                          label={`${u.job.title} location`}
                        />
                      </div>
                    )}
                    <form
                      action={setOutcomeAction}
                      className="mt-3 flex items-center gap-2"
                    >
                      <input type="hidden" name="unlockId" value={u.id} />
                      <span className="text-xs text-ink/50">Outcome:</span>
                      <select
                        name="outcome"
                        defaultValue={u.outcome}
                        className="rounded-lg border border-ink/20 bg-white px-2 py-1 text-sm"
                      >
                        <option value="none">Not set</option>
                        {OUTCOMES.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      <button className="rounded-lg border border-ink/20 px-3 py-1 text-sm font-medium hover:bg-paper">
                        Save
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm h-fit">
          <h2 className="font-semibold text-lg">Your profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-ink/50">Trades</dt>
              <dd className="font-medium">
                {trade.tradeCategories.join(", ") || "None set"}
              </dd>
            </div>
            <div>
              <dt className="text-ink/50">Base</dt>
              <dd className="font-medium">
                {trade.baseTown || trade.baseEircode || "Not set"}
                {trade.lat != null ? "" : " (county matching)"}
              </dd>
            </div>
            <div>
              <dt className="text-ink/50">Travel radius</dt>
              <dd className="font-medium">
                {effectiveRadiusKm(trade, MATCH_RADIUS_KM) === 0
                  ? "Anywhere in Ireland"
                  : `${effectiveRadiusKm(trade, MATCH_RADIUS_KM)} km`}
              </dd>
            </div>
            <div>
              <dt className="text-ink/50">Counties</dt>
              <dd className="font-medium">
                {trade.counties.join(", ") || "None set"}
              </dd>
            </div>
            <div>
              <dt className="text-ink/50">Status</dt>
              <dd className="font-medium capitalize">
                {trade.status}
                {trade.subscriptionActive ? ", subscribed" : ""}
              </dd>
            </div>
          </dl>
          <Link
            href="/pricing"
            className="mt-5 block text-center rounded-lg border border-ink/20 px-4 py-2 text-sm font-semibold hover:bg-paper"
          >
            View plans
          </Link>
        </div>
      </div>
    </div>
  );
}
