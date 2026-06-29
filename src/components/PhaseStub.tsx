import type { ReactNode } from "react";

// Consistent placeholder for features arriving in a later phase.
export default function PhaseStub({
  phase,
  title,
  children,
}: {
  phase: number;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/25 bg-white/60 p-10 text-center">
      <span className="inline-block rounded-full bg-accent/15 text-accent-dark text-xs font-bold uppercase tracking-wide px-3 py-1">
        Coming in Phase {phase}
      </span>
      <h2 className="shout text-2xl mt-4">{title}</h2>
      {children && (
        <div className="mt-3 text-ink/60 max-w-md mx-auto text-sm">{children}</div>
      )}
    </div>
  );
}
