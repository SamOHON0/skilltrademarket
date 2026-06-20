"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-ink/70">
        That is on us, not you. Try again, and if it keeps happening let us know.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-block rounded-lg bg-ink text-white px-5 py-2.5 font-semibold hover:bg-ink-light"
      >
        Try again
      </button>
    </div>
  );
}
