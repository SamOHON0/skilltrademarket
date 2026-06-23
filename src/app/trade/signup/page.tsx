import Link from "next/link";
import { getDataStore } from "@/lib/data";
import SignupForm from "./SignupForm";

export const metadata = { title: "Create a trade account | Skill Trade" };

export default async function TradeSignupPage() {
  const categories = await getDataStore().getCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="shout text-3xl">Create your trade account</h1>
      <p className="mt-2 text-ink/70">
        Set up your profile to start seeing local jobs in your trade and county.
        Choosing a plan and getting verified come after you sign up.
      </p>
      <div className="mt-8">
        <SignupForm categories={categories} />
      </div>
      <p className="mt-6 text-sm text-ink/70">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
