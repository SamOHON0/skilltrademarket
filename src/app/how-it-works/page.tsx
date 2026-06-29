import Link from "next/link";

export const metadata = { title: "How it works | Skill Trade" };

const customer = [
  ["Tell us the job", "A short guided form captures what you need, where, and when."],
  ["We match local trades", "Tradespeople in your county who do exactly this work see your job."],
  ["They contact you", "The first five to claim it get your details and reach out directly."],
];
const trade = [
  ["Pick a plan", "Choose Basic, Pro or Elite. Higher tiers see new jobs sooner."],
  ["See matched jobs", "Jobs in your trade and counties land in your feed, contact details hidden."],
  ["Unlock and win", "Unlock a job to get the customer's details. Only five trades can."],
];

function Steps({ items, accent }: { items: string[][]; accent: string }) {
  return (
    <ol className="mt-4 space-y-4">
      {items.map(([title, body], i) => (
        <li key={title} className="flex gap-3">
          <span className={`shrink-0 h-7 w-7 rounded-full ${accent} text-sm font-bold grid place-items-center`}>
            {i + 1}
          </span>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-0.5 text-sm text-ink/70">{body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="shout text-3xl md:text-4xl">How it works</h1>
      <p className="mt-3 text-ink/70 max-w-2xl">
        Skill Trade connects homeowners with up to five local tradespeople. Free
        for customers, subscription-based for trades. No commission, no dead leads.
      </p>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-accent-dark">
            If you need a job done
          </p>
          <Steps items={customer} accent="bg-ink text-white" />
          <Link href="/post-job" className="mt-6 inline-block rounded-lg bg-accent hover:bg-accent-dark text-ink px-5 py-2.5 font-semibold">
            Post a job, free
          </Link>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-accent-dark">
            If you are a tradesperson
          </p>
          <Steps items={trade} accent="bg-accent text-ink" />
          <Link href="/pricing" className="mt-6 inline-block rounded-lg border border-ink/20 px-5 py-2.5 font-semibold hover:bg-white">
            See plans for trades
          </Link>
        </div>
      </div>
    </div>
  );
}
