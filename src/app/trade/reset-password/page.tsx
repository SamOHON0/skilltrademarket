"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/app/auth-actions";

const inputCls =
  "w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    updatePassword,
    {}
  );

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="shout text-3xl">Set a new password</h1>
      <p className="mt-2 text-ink/70">
        Choose a new password for your account.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-ink/50">At least 8 characters.</p>
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
          {pending ? "Saving..." : "Save new password"}
        </button>
      </form>
    </div>
  );
}
