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
  unlocksLeft,
}: {
  jobId: string;
  tradeId: string;
  disabled?: boolean;
  /** Remaining monthly allowance, or null for unlimited. */
  unlocksLeft?: number | null;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    // Two-tap confirm: unlocking spends allowance, so no accidental taps.
    if (!confirming) {
      setConfirming(true);
      setError(null);
      return;
    }
    startTransition(async () => {
      const result = await unlockJobAction(jobId, tradeId);
      setConfirming(false);
      setError(result.success ? null : REASON_COPY[result.reason]);
    });
  }

  const label = pending
    ? "Unlocking..."
    : confirming
      ? unlocksLeft != null
        ? `Confirm · uses 1 of ${unlocksLeft} left`
        : "Tap again to confirm"
      : "Unlock job";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        disabled={disabled || pending}
        onClick={handleClick}
        onBlur={() => setConfirming(false)}
        aria-live="polite"
        className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40 ${
          confirming
            ? "bg-accent text-ink hover:bg-accent-dark"
            : "bg-ink text-white hover:bg-ink-light"
        }`}
      >
        {label}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
