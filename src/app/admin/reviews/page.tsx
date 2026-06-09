import { getDataStore } from "@/lib/data";

export const metadata = { title: "Reviews | Skill Trade admin" };

export default async function AdminReviewsPage() {
  const store = getDataStore();
  const [reviews, trades] = await Promise.all([
    store.getReviews(),
    store.getTrades(),
  ]);
  const tradeName = (id: string) =>
    trades.find((t) => t.id === id)?.businessName ?? id;

  return (
    <div>
      <h1 className="text-2xl font-bold">Review moderation</h1>
      <p className="mt-1 text-sm text-ink/60">
        Post-then-moderate model: reviews go live instantly, flagged ones land
        here for takedown with a logged reason. Full tooling ships in Phase 4.
      </p>
      <div className="mt-6 space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{tradeName(r.tradeId)}</p>
              <p className="text-sm">
                {"★".repeat(r.rating)}
                <span className="text-ink/30">{"★".repeat(5 - r.rating)}</span>
                <span className="ml-3 rounded-full bg-ink/5 px-2 py-0.5 text-xs">
                  {r.status}
                </span>
              </p>
            </div>
            {r.text && <p className="mt-2 text-sm text-ink/80">{r.text}</p>}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-ink/50">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
