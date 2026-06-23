"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "@/app/auth-actions";

const inputCls =
  "w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    {}
  );

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="shout text-3xl">Reset your password</h1>
      <p className="mt-2 text-ink/70">
        Enter your email and we&apos;ll send a link to set a new password.
      </p>

      {state.notice ? (
        <p className="mt-6 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-800">
          {state.notice}
        </p>
      ) : (
        <form action={action} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" autoComplete="email" className={inputCls} />
          </div>
          {state.error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-ink text-white px-5 py-2.5 font-semibold hover:bg-ink-light disabled:opacity-50"
          >
            {pending ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm">
        <Link href="/login" className="underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
