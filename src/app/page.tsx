import Link from "next/link";
import { getDataStore } from "@/lib/data";
import { TIER_PRICES_EUR } from "@/lib/constants";

export default async function Home() {
  const categories = await getDataStore().getCategories();

  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <h1 className="shout text-4xl md:text-6xl max-w-3xl leading-[0.95]">
            No dead leads.{" "}
            <span className="text-accent">No hidden fees.</span> Just jobs.
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl">
            Skill Trade connects homeowners with up to five local tradespeople
            across Ireland. Free to post, no commission, no dead leads. Pick your
            side below.
          </p>
        </div>
      </section>

      {/* The choice: customer vs trade */}
      <section className="mx-auto max-w-6xl px-4 -mt-10 md:-mt-14 pb-4">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer */}
          <div className="rounded-2xl bg-white p-8 shadow-md flex flex-col">
            <span className="self-start rounded-full bg-accent/15 text-accent-dark text-xs font-bold uppercase tracking-wide px-3 py-1">
              I need work done
            </span>
            <h2 className="shout text-3xl mt-4">Hire a local trade</h2>
            <p className="mt-3 text-ink/70">
              Post your job in under two minutes. Up to five vetted local trades
              get your details and come to you. No account, no cost.
            </p>
            <ul className="mt-5 space-y-2 text-sm flex-1">
              {[
                "Free to post, no account needed",
                "Up to five quotes from local trades",
                "Deal direct by WhatsApp, call or email",
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-accent-dark font-bold">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/post-job"
              className="mt-7 rounded-lg bg-accent hover:bg-accent-dark text-ink font-semibold px-5 py-3 text-center"
            >
              Post a job, free
            </Link>
          </div>

          {/* Trade */}
          <div className="rounded-2xl bg-ink text-white p-8 shadow-md flex flex-col ring-1 ring-white/10">
            <span className="self-start rounded-full bg-white/10 text-accent text-xs font-bold uppercase tracking-wide px-3 py-1">
              I do the work
            </span>
            <h2 className="shout text-3xl mt-4 text-accent">Find local work</h2>
            <p className="mt-3 text-white/75">
              Real jobs from real customers in your county. No commission, no
              pay-per-lead surprises. Unlock the jobs you want and contact them
              direct.
            </p>
            <ul className="mt-5 space-y-2 text-sm flex-1">
              {[
                `Plans from €${TIER_PRICES_EUR.basic.toFixed(2)}/mo, cancel anytime`,
                "No commission on the work you win",
                "Earlier access to jobs on higher tiers",
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-accent font-bold">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="mt-7 rounded-lg bg-accent hover:bg-accent-dark text-ink font-semibold px-5 py-3 text-center"
            >
              See plans for trades
            </Link>
          </div>
        </div>
      </section>

      {/* How it works, both sides */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="shout text-2xl">How it works</h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-accent-dark">
              If you need a job done
            </p>
            <ol className="mt-4 space-y-4">
              {[
                ["Tell us the job", "A short guided form captures what you need, where, and when."],
                ["We match local trades", "Tradespeople in your county who do exactly this work see your job."],
                ["They contact you", "The first five to claim it get your details and reach out directly."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-3">
                  <span className="shrink-0 h-7 w-7 rounded-full bg-ink text-white text-sm font-bold grid place-items-center">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-0.5 text-sm text-ink/70">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-accent-dark">
              If you are a tradesperson
            </p>
            <ol className="mt-4 space-y-4">
              {[
                ["Pick a plan", "Choose Basic, Pro or Elite. Higher tiers see new jobs sooner."],
                ["See matched jobs", "Jobs in your trade and counties land in your feed, contact details hidden."],
                ["Unlock and win", "Unlock a job to get the customer's details. Only five trades can, so it stays worth it."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-3">
                  <span className="shrink-0 h-7 w-7 rounded-full bg-accent text-ink text-sm font-bold grid place-items-center">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-0.5 text-sm text-ink/70">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Categories, for customers */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="shout text-2xl">What do you need done?</h2>
        <p className="mt-1 text-ink/60">Tap a trade to start a job post.</p>
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
