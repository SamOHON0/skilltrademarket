import { redirect } from "next/navigation";
import { getCurrentTrade } from "@/lib/auth";
import { TIER_LABELS } from "@/lib/constants";

export const metadata = { title: "Profile | Skill Trade" };

export default async function ProfilePage() {
  const trade = await getCurrentTrade();
  if (!trade) {
    if (process.env.DATA_SOURCE === "supabase") redirect("/trade/dashboard");
    redirect("/login");
  }

  const rows: [string, string][] = [
    ["Business name", trade.businessName],
    ["Owner", trade.ownerName],
    ["Email", trade.email],
    ["Phone", trade.phone],
    ["Trades", trade.tradeCategories.join(", ") || "None set"],
    ["Counties", trade.counties.join(", ") || "None set"],
    ["Plan", TIER_LABELS[trade.tier]],
    ["Verified", trade.verifiedAt ? "Yes" : "Not yet"],
    ["Bio", trade.bio || "No bio yet"],
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="shout text-3xl">Your profile</h1>
      <p className="mt-1 text-sm text-ink/60">
        This is the information on your account. Editing your profile and a
        public-facing profile page are part of the build still to come.
      </p>
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <dl className="grid sm:grid-cols-3 gap-y-3 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="sm:col-span-3 sm:grid sm:grid-cols-3">
              <dt className="text-ink/50">{label}</dt>
              <dd className="font-medium sm:col-span-2">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <button
        disabled
        className="mt-4 rounded-lg bg-ink text-white px-4 py-2 text-sm font-semibold opacity-40 cursor-not-allowed"
        title="Profile editing is coming soon"
      >
        Edit profile (coming soon)
      </button>
    </div>
  );
}
