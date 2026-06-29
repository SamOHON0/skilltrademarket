import PhaseStub from "@/components/PhaseStub";

export const metadata = { title: "Verification queue | Skill Trade admin" };

export default function AdminVerificationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Verification queue</h1>
      <p className="mt-1 text-sm text-ink/60">
        Review the ID and insurance documents trades submit, then approve or
        reject.
      </p>
      <div className="mt-6">
        <PhaseStub phase={3} title="Document review lands in Phase 3">
          Once trades can upload verification documents, they queue here for
          approval. Approving sets the verified badge on their profile.
        </PhaseStub>
      </div>
    </div>
  );
}
