import PhaseStub from "@/components/PhaseStub";

export const metadata = { title: "Verification | Skill Trade" };

export default function VerificationPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="shout text-3xl">Verification</h1>
      <div className="mt-6">
        <PhaseStub phase={3} title="Get verified in Phase 3">
          Uploading your ID and insurance for the verified badge is part of
          Phase 3, alongside billing. Verified trades stand out in search and on
          job cards.
        </PhaseStub>
      </div>
    </div>
  );
}
