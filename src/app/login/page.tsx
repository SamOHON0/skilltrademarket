import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata = { title: "Log in | Skill Trade" };

const NOTICES: Record<string, string> = {
  "check-email": "Account created. Check your email to confirm, then log in.",
};
const ERRORS: Record<string, string> = {
  "not-admin": "That account does not have admin access.",
  auth: "That link expired or was invalid. Try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; notice?: string; error?: string }>;
}) {
  const { next, notice, error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="shout text-3xl">Log in</h1>
      <p className="mt-2 text-ink/70">
        For tradespeople and admins. Customers don&apos;t need an account, just{" "}
        <Link href="/post-job" className="underline">
          post a job
        </Link>
        .
      </p>

      {notice && NOTICES[notice] && (
        <p className="mt-6 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-800">
          {NOTICES[notice]}
        </p>
      )}

      <div className="mt-6">
        <LoginForm next={next} initialError={error ? ERRORS[error] : undefined} />
      </div>

      <p className="mt-6 text-sm text-ink/70">
        New tradesperson?{" "}
        <Link href="/trade/signup" className="font-semibold underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
