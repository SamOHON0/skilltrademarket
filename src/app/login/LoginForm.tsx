"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInUser, type AuthState } from "@/app/auth-actions";

const inputCls =
  "w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent";
const labelCls = "block text-sm font-medium mb-1.5";

export default function LoginForm({
  next,
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signInUser,
    {}
  );
  const error = state.error ?? initialError;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/trade/feed"} />
      <div>
        <label className={labelCls} htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" className={inputCls} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Link href="/trade/forgot-password" className="text-sm underline text-ink/60">
            Forgot?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className={inputCls}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-ink text-white px-5 py-2.5 font-semibold hover:bg-ink-light disabled:opacity-50"
      >
        {pending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
