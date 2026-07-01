"use client";

import { useState } from "react";
import { reportLeadAction } from "@/app/actions";

const REASONS = [
  "No answer / wrong number",
  "Not a real job",
  "Already filled",
  "Customer not interested",
  "Spam or abusive",
  "Other",
];

export default function ReportLeadButton({
  jobId,
  tradeId,
  reported,
}: {
  jobId: string;
  tradeId: string;
  reported?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (reported) return <span className="text-xs text-ink/40">Lead reported</span>;

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs underline text-ink/50 hover:text-red-600"
      >
        Report dead lead
      </button>
    );

  return (
    <form action={reportLeadAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="tradeId" value={tradeId} />
      <select
        name="reason"
        className="rounded-lg border border-ink/20 bg-white px-2 py-1 text-xs"
      >
        {REASONS.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <button className="rounded-lg border border-red-300 text-red-700 px-2.5 py-1 text-xs font-semibold hover:bg-red-50">
        Submit report
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs underline text-ink/40"
      >
        Cancel
      </button>
    </form>
  );
}
