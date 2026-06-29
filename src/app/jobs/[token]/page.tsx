import { notFound } from "next/navigation";
import { getDataStore } from "@/lib/data";
import { URGENCY_LABELS, TIER_LABELS } from "@/lib/constants";
import { cancelJobAction, completeJobAction } from "@/app/actions";
import UrgencyBadge from "@/components/UrgencyBadge";
import JobMap from "@/components/JobMap";

export const metadata = { title: "Your job | Skill Trade" };

const STATUS_COPY: Record<string, string> = {
  pending_review:
    "Our team is reviewing your job. We may give you a quick call if we need more detail. It will go out to matched trades shortly.",
  live: "Your job is live. Matched local trades are being notified now; the first five to claim it will contact you directly.",
  fully_claimed:
    "Five tradespeople have claimed your job and have your contact details. Expect to hear from them soon if you have not already.",
  expired:
    "This job expired without being claimed. You can post it again with more detail or a wider area.",
  completed: "This job is marked complete. Thanks for using Skill Trade.",
  removed: "This job was cancelled. Contact us if you think that is a mistake.",
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent-dark">
        Job posted
      </p>
      <h1 className="mt-1 text-3xl font-bold">{job.title}</h1>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <p className="font-medium">{STATUS_COPY[effectiveStatus]}</p>
        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-ink/70">
          <dt>Status</dt>
          <dd className="font-medium text-ink">{effectiveStatus.replace("_", " ")}</dd>
          <dt>Location</dt>
          <dd className="font-medium text-ink">
            {[job.town, job.county].filter(Boolean).join(", ")}
          </dd>
          <dt>Timing</dt>
          <dd className="font-medium text-ink flex items-center gap-2">
            <UrgencyBadge urgency={job.urgency} />
            {URGENCY_LABELS[job.urgency]}
          </dd>
          <dt>Trades claimed</dt>
          <dd className="font-medium text-ink">{job.unlockCount} of 5</dd>
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
          <h2 className="font-semibold">Trades who have your details</h2>
          <p className="mt-1 text-sm text-ink/60">
            These businesses claimed your job and will be in touch. Expect them
            to contact you the way you asked.
          </p>
          <ul className="mt-4 space-y-2">
            {claimants.map((c, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm font-medium"
              >
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
        Bookmark this page. It is your private link to manage this job and leave
        a review once the work is done. Reviews open after completion (Phase 4).
      </p>
    </div>
  );
}
