import Link from "next/link";
import PhaseStub from "@/components/PhaseStub";

export const metadata = { title: "Plan & billing | Skill Trade" };

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="shout text-3xl">Plan &amp; billing</h1>
      <div className="mt-6">
        <PhaseStub phase={3} title="Subscriptions arrive in Phase 3">
          Card payments, upgrades and downgrades, invoices, and the subscription
          paywall are handled with Stripe in Phase 3. Plans and pricing are on
          the{" "}
          <Link href="/pricing" className="underline">
            pricing page
          </Link>
          .
        </PhaseStub>
      </div>
    </div>
  );
}
