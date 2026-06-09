"use client";

import { useState, useTransition } from "react";
import { unlockJobAction } from "@/app/actions";

const REASON_COPY: Record<string, string> = {
  subscription_inactive: "Your subscription is not active.",
  not_found: "Job not found.",
  not_available: "This job is no longer available.",
  not_yet_visible: "Not released to your tier yet. Upgrade for earlier access.",
  allowance_exhausted: "Monthly unlock allowance used. Upgrade for more.",
  fully_claimed: "Too late, five trades got there first.",
  already_unlocked: "You already unlocked this job.",
};

export default function UnlockButton({
  jobId,
  tradeId,
  disabled,
}: {
  jobId: string;
  tradeId: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <button
        disabled={disabled || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await unlockJobAction(jobId, tradeId);
            setError(result.success ? null : REASON_COPY[result.reason]);
          })
        }
        className="rounded-lg bg-ink text-white px-4 py-2 text-sm font-semibold hover:bg-ink-light disabled:opacity-40"
      >
        {pending ? "Unlocking..." : "Unlock job"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
