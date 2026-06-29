import PhaseStub from "@/components/PhaseStub";

export const metadata = { title: "Leaderboard & raffle | Skill Trade admin" };

export default function AdminLeaderboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Leaderboard &amp; raffle</h1>
      <p className="mt-1 text-sm text-ink/60">
        Local rankings by completed jobs and rating, plus the monthly raffle
        draw tool.
      </p>
      <div className="mt-6">
        <PhaseStub phase={4} title="Ranking and raffle arrive in Phase 4">
          The leaderboard is built on completed jobs and reviews, so it comes
          with the reviews layer in Phase 4. The raffle draw tool lands here too.
        </PhaseStub>
      </div>
    </div>
  );
}
