import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent-dark">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-ink/70">
        The page or job link you are after does not exist. If you followed a job
        link, check it was copied in full.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-ink text-white px-5 py-2.5 font-semibold hover:bg-ink-light"
      >
        Back to home
      </Link>
    </div>
  );
}
