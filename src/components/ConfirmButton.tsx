"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

/**
 * Two-tap destructive button for server-action forms: first tap arms it,
 * second tap submits. Blur disarms, so a stray tap never cancels a job.
 */
export default function ConfirmButton({
  label,
  confirmLabel,
  className = "",
}: {
  label: string;
  confirmLabel: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const { pending } = useFormStatus();

  return (
    <button
      type={armed ? "submit" : "button"}
      onClick={armed ? undefined : () => setArmed(true)}
      onBlur={() => setArmed(false)}
      disabled={pending}
      aria-live="polite"
      className={`${className} ${armed ? "bg-red-600 text-white border-red-600 hover:bg-red-700" : ""} disabled:opacity-50`}
    >
      {pending ? "Working..." : armed ? confirmLabel : label}
    </button>
  );
}
