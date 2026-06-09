import { notFound } from "next/navigation";
import { getDataStore } from "@/lib/data";
import { URGENCY_LABELS } from "@/lib/constants";

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
  removed: "This job was removed. Contact us if you think that is a mistake.",
};

export default async function ManageJobPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const job = await getDataStore().getJobByToken(token);
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent-dark">
        Job posted
      </p>
      <h1 className="mt-1 text-3xl font-bold">{job.title}</h1>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <p className="font-medium">{STATUS_COPY[job.status]}</p>
        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-ink/70">
          <dt>Status</dt>
          <dd className="font-medium text-ink">{job.status.replace("_", " ")}</dd>
          <dt>Location</dt>
          <dd className="font-medium text-ink">
            {[job.town, job.county].filter(Boolean).join(", ")}
          </dd>
          <dt>Timing</dt>
          <dd className="font-medium text-ink">{URGENCY_LABELS[job.urgency]}</dd>
          <dt>Trades claimed</dt>
          <dd className="font-medium text-ink">{job.unlockCount} of 5</dd>
        </dl>
      </div>

      <p className="mt-6 text-sm text-ink/60">
        Bookmark this page. It is your private link to manage this job and
        leave a review once the work is done. Reviews open after completion
        (Phase 4).
      </p>
    </div>
  );
}
