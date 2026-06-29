import { notFound } from "next/navigation";
import { getDataStore } from "@/lib/data";
import { URGENCY_LABELS, TIER_LABELS } from "@/lib/constants";
import { cancelJobAction, completeJobAction } from "@/app/actions";
import UrgencyBadge from "@/components/UrgencyBadge";
import JobMap from "@/components/JobMap";

export const metadata = { title: "Your job | Skill Trade" };

const STATUS_COPY: Record<string, string> = {
  pending_review:
    "Our team is reviewing your job. We may call if we need more detail, then it goes out to matched trades.",
  live: "Your job is live. Matched local trades are being notified; the first five to claim it contact you directly.",
  fully_claimed:
    "Five tradespeople have your details. Expect to hear from them shortly if you haven't already.",
  expired:
    "This job expired without being claimed. You can post it again with more detail or a wider area.",
  completed: "This job is marked complete. Thanks for using Skill Trade.",
  removed: "This job was cancelled. Contact us if you think that's a mistake.",
};

const STATUS_PILL: Record<string, string> = {
  pending_review: "bg-amber-100 text-amber-800",
  live: "bg-green-100 text-green-800",
  fully_claimed: "bg-blue-100 text-blue-800",
  expired: "bg-ink/10 text-ink/60",
  completed: "bg-green-100 text-green-800",
  removed: "bg-red-100 text-red-700",
};

const STEPS = ["Posted", "In review", "Live", "Claimed", "Complete"];
const STEP_INDEX: Record<string, number> = {
  pending_review: 1,
  live: 2,
  fully_claimed: 3,
  completed: 4,
};

export default async function ManageJobPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const store = getDataStore();
  const job = await store.getJobByToken(token);
  if (!job) notFound();

  const claimants = await store.getJobClaimants(job.id);
  const expired =
    (job.status === "live" || job.status === "fully_claimed") &&
    !!job.expiresAt &&
    new Date(job.expiresAt).getTime() < Date.now();
  const effectiveStatus = expired ? "expired" : job.status;
  const canCancel =
    job.status === "pending_review" ||
    job.status === "live" ||
    job.status === "fully_claimed";
  const canComplete =
    !expired && (job.status === "live" || job.status === "fully_claimed");

  const showStepper = effectiveStatus in STEP_INDEX;
  const activeStep = STEP_INDEX[effectiveStatus] ?? 0;
  const postedOn = new Date(job.createdAt).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent-dark">
        Your job
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <UrgencyBadge urgency={job.urgency} />
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_PILL[effectiveStatus]}`}
        >
          {effectiveStatus.replace("_", " ")}
        </span>
      </div>

      {/* Progress timeline */}
      {showStepper && (
        <ol className="mt-6 flex items-center">
          {STEPS.map((label, i) => {
            const done = i <= activeStep;
            return (
              <li key={label} className="flex-1 flex items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                      done ? "bg-accent text-ink" : "bg-ink/10 text-ink/40"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`mt-1 text-[11px] font-medium ${done ? "text-ink" : "text-ink/40"}`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    className={`mx-1 h-0.5 flex-1 ${i < activeStep ? "bg-accent" : "bg-ink/10"}`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <p className="font-medium">{STATUS_COPY[effectiveStatus]}</p>
        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-ink/70">
          <dt>Location</dt>
          <dd className="font-medium text-ink">
            {[job.town, job.county].filter(Boolean).join(", ")}
          </dd>
          <dt>Timing</dt>
          <dd className="font-medium text-ink">{URGENCY_LABELS[job.urgency]}</dd>
          {job.budgetBand && (
            <>
              <dt>Budget</dt>
              <dd className="font-medium text-ink">{job.budgetBand}</dd>
            </>
          )}
          <dt>Trades claimed</dt>
          <dd className="font-medium text-ink">{job.unlockCount} of 5</dd>
          <dt>Posted</dt>
          <dd className="font-medium text-ink">{postedOn}</dd>
        </dl>
      </div>

      {job.lat != null && job.lng != null && (
        <div className="mt-6">
          <JobMap
            lat={job.lat}
            lng={job.lng}
            marker
            className="h-56"
            label={`${job.title} location`}
          />
        </div>
      )}

      {claimants.length > 0 && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold">
            Trades who have your details ({claimants.length})
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            These businesses claimed your job and will be in touch your chosen
            way.
          </p>
          <ul className="mt-4 space-y-2">
            {claimants.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-medium">
                {c.businessName}
                {c.verified && (
                  <span className="rounded-full bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5">
                    Verified
                  </span>
                )}
                <span className="text-ink/40">{TIER_LABELS[c.tier]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(canComplete || canCancel) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {canComplete && (
            <form action={completeJobAction}>
              <input type="hidden" name="token" value={token} />
              <button className="rounded-lg bg-ink text-white px-4 py-2.5 text-sm font-semibold hover:bg-ink-light">
                Mark job as done
              </button>
            </form>
          )}
          {canCancel && (
            <form action={cancelJobAction}>
              <input type="hidden" name="token" value={token} />
              <button className="rounded-lg border border-red-300 text-red-700 px-4 py-2.5 text-sm font-semibold hover:bg-red-50">
                Cancel this job
              </button>
            </form>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-ink/60">
        Bookmark this page, it&apos;s your private link to manage this job and
        leave a review once the work is done. Reviews open after completion
        (Phase 4).
      </p>
    </div>
  );
}
