import { TIER_PRICES_EUR, UNLOCK_ALLOWANCES_MONTHLY } from "@/lib/constants";

export const metadata = { title: "Pricing for trades | Skill Trade" };

const tiers = [
  {
    key: "basic" as const,
    name: "Basic",
    blurb: "Get listed and start winning local work.",
    features: [
      "Profile in local search with reviews and portfolio",
      "Job alerts 60 minutes after release",
      `${UNLOCK_ALLOWANCES_MONTHLY.basic} job unlocks per month`,
      "Standard placement in category listings",
      "Cancel anytime",
    ],
  },
  {
    key: "pro" as const,
    name: "Pro",
    highlight: true,
    blurb: "Earlier access, verified badge, more unlocks.",
    features: [
      "Everything in Basic",
      "Job alerts 30 minutes after release",
      `${UNLOCK_ALLOWANCES_MONTHLY.pro} job unlocks per month`,
      "Verified badge (ID + insurance checked)",
      "Priority placement and priority support",
      "Quote and invoice templates",
      "Review booster after completed jobs",
      "Automatic monthly raffle entry",
    ],
  },
  {
    key: "elite" as const,
    name: "Elite",
    blurb: "First to every job. Built for busy crews.",
    features: [
      "Everything in Pro",
      "Instant job alerts, see every job first",
      "Unlimited job unlocks",
      "Top placement in your chosen category",
      "2 profile boosts per month",
      "Performance analytics",
      "Double raffle entries",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="shout text-3xl md:text-4xl text-center">
        Plans for tradespeople
      </h1>
      <p className="mt-3 text-center text-ink/70 max-w-xl mx-auto">
        Real local jobs with real customer details. No commission on your work,
        no pay-per-lead surprises, cancel anytime. Unlock allowances are listed
        right here, nothing hidden.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.key}
            className={`rounded-2xl bg-white p-6 shadow-sm flex flex-col ${
              t.highlight ? "ring-2 ring-accent" : ""
            }`}
          >
            {t.highlight && (
              <span className="self-start rounded-full bg-accent/15 text-accent-dark text-xs font-bold px-3 py-1 mb-3">
                Most popular
              </span>
            )}
            <h2 className="text-xl font-bold">{t.name}</h2>
            <p className="mt-1 text-sm text-ink/60">{t.blurb}</p>
            <p className="mt-4 text-3xl font-bold">
              &euro;{TIER_PRICES_EUR[t.key].toFixed(2)}
              <span className="text-base font-normal text-ink/60">
                /month ex VAT
              </span>
            </p>
            <ul className="mt-5 space-y-2 text-sm flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-accent-dark font-bold">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              title="Stripe checkout ships in Phase 3"
              className="mt-6 rounded-lg bg-ink text-white py-2.5 font-semibold opacity-50 cursor-not-allowed"
            >
              Coming soon
            </button>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-ink/50">
        Subscriptions and checkout go live in Phase 3 (Stripe).
      </p>
    </div>
  );
}
