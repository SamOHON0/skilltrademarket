import { getDataStore } from "@/lib/data";
import { approveJobAction, rejectJobAction } from "@/app/actions";
import { URGENCY_LABELS, AUTO_APPROVE_JOBS } from "@/lib/constants";

export const metadata = { title: "Job queue | Skill Trade admin" };

export default async function AdminJobsPage() {
  const jobs = await getDataStore().getJobs();
  const pending = jobs.filter((j) => j.status === "pending_review");
  const rest = jobs.filter((j) => j.status !== "pending_review");

  return (
    <div>
      <h1 className="text-2xl font-bold">Job queue</h1>
      <p className="mt-1 text-sm text-ink/60">
        Approval releases a job to matched trades with tier offsets.
      </p>
      {AUTO_APPROVE_JOBS && (
        <p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-900">
          Auto-approval is on: posted jobs go live immediately, so this queue
          will usually be empty. Turn it off in constants.ts to review jobs
          manually.
        </p>
      )}

      <h2 className="mt-8 font-semibold">
        Awaiting review ({pending.length})
      </h2>
      <div className="mt-3 space-y-3">
        {pending.map((job) => (
          <div key={job.id} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-ink/70">
                  {job.category} &middot;{" "}
                  {[job.town, job.county].filter(Boolean).join(", ")} &middot;{" "}
                  {URGENCY_LABELS[job.urgency]}
                </p>
                <p className="mt-1 text-sm text-ink/70">
                  {job.customerName} &middot; {job.customerPhone} &middot;{" "}
                  {job.customerEmail}
                </p>
                {job.aiDecision === "review" && (
                  <p className="mt-1 text-xs font-semibold text-amber-700">
                    AI flagged for review
                    {job.aiReasons.length ? `: ${job.aiReasons.join(", ")}` : ""}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <form action={approveJobAction}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button className="rounded-lg bg-green-700 text-white px-4 py-2 text-sm font-semibold hover:bg-green-800">
                    Approve &amp; release
                  </button>
                </form>
                <form action={rejectJobAction}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button className="rounded-lg border border-red-300 text-red-700 px-4 py-2 text-sm font-semibold hover:bg-red-50">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {pending.length === 0 && (
          <p className="text-sm text-ink/50">Queue is clear.</p>
        )}
      </div>

      <h2 className="mt-10 font-semibold">All jobs</h2>
      <div className="mt-3 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="text-left text-ink/50">
            <tr className="border-b border-ink/10">
              <th className="px-4 py-3">Job</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Unlocks</th>
            </tr>
          </thead>
          <tbody>
            {rest.map((job) => (
              <tr key={job.id} className="border-b border-ink/5">
                <td className="px-4 py-3 font-medium">{job.title}</td>
                <td className="px-4 py-3">
                  {[job.town, job.county].filter(Boolean).join(", ")}
                </td>
                <td className="px-4 py-3">{job.status.replace("_", " ")}</td>
                <td className="px-4 py-3">{job.unlockCount}/5</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
