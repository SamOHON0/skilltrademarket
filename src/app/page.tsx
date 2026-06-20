import Link from "next/link";
import { getDataStore } from "@/lib/data";

export default async function Home() {
  const categories = await getDataStore().getCategories();

  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <h1 className="shout text-4xl md:text-6xl max-w-3xl leading-[0.95]">
            No dead leads.{" "}
            <span className="text-accent">No hidden fees.</span> Just jobs.
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl">
            Post your job free in two minutes. Up to five vetted local
            tradespeople get your details and come to you. No commission, no
            hidden fees, no dead leads.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/post-job"
              className="bg-accent hover:bg-accent-dark text-ink font-semibold rounded-lg px-6 py-3 text-lg"
            >
              Post a job, free
            </Link>
            <Link
              href="/pricing"
              className="border border-white/30 hover:border-accent rounded-lg px-6 py-3 text-lg"
            >
              I&apos;m a tradesperson
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="shout text-2xl">How it works</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            ["1. Tell us the job", "A short guided form captures what you need, where, and when. The more detail, the better the match."],
            ["2. We match local trades", "Tradespeople in your county who do exactly this work see your job. The first five to claim it get your details."],
            ["3. They contact you", "Deal direct by WhatsApp, call, or email. Compare up to five quotes, pick your trade, leave a review after."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="mt-2 text-ink/70">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="shout text-2xl">What do you need done?</h2>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/post-job?category=${c.slug}`}
              className="rounded-lg bg-white px-4 py-4 shadow-sm font-medium hover:shadow-md hover:text-accent-dark"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
