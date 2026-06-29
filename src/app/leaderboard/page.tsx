import PhaseStub from "@/components/PhaseStub";

export const metadata = { title: "Leaderboard | Skill Trade" };

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="shout text-3xl md:text-4xl">Local leaderboard</h1>
      <p className="mt-3 text-ink/70">
        The best-rated, most active trades in each county and category.
      </p>
      <div className="mt-8">
        <PhaseStub phase={4} title="The leaderboard arrives in Phase 4">
          Rankings are built from completed jobs and customer reviews, so the
          leaderboard ships with the reviews layer in Phase 4.
        </PhaseStub>
      </div>
    </div>
  );
}
