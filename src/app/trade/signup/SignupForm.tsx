"use client";

import { useActionState } from "react";
import { signUpTrade, type AuthState } from "@/app/auth-actions";
import { COUNTIES } from "@/lib/constants";
import type { TradeCategory } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent";
const labelCls = "block text-sm font-medium mb-1.5";

export default function SignupForm({
  categories,
}: {
  categories: TradeCategory[];
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signUpTrade,
    {}
  );

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="businessName">
            Business name
          </label>
          <input id="businessName" name="businessName" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="ownerName">
            Your name
          </label>
          <input id="ownerName" name="ownerName" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="phone">
            Phone
          </label>
          <input id="phone" name="phone" type="tel" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="password">
          Password
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="baseTown">
            Base town or area
          </label>
          <input id="baseTown" name="baseTown" className={inputCls} placeholder="e.g. Drumcondra" />
        </div>
        <div>
          <label className={labelCls} htmlFor="baseEircode">
            Base eircode (optional)
          </label>
          <input id="baseEircode" name="baseEircode" className={inputCls} placeholder="D09 X1Y2" />
        </div>
      </div>
      <p className="-mt-3 text-xs text-ink/50">
        We use this to show you jobs within 12 km. Leave blank and we match you
        by county instead.
      </p>

      <fieldset>
        <legend className="text-sm font-medium mb-2">
          Trades you cover
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((c) => (
            <label
              key={c.slug}
              className="flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm has-checked:border-accent has-checked:bg-accent/10"
            >
              <input
                type="checkbox"
                name="tradeCategories"
                value={c.slug}
                className="accent-[#f2a20c]"
              />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium mb-2">Counties you work in</legend>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {COUNTIES.map((county) => (
            <label
              key={county}
              className="flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-2.5 py-2 text-sm has-checked:border-accent has-checked:bg-accent/10"
            >
              <input
                type="checkbox"
                name="counties"
                value={county}
                className="accent-[#f2a20c]"
              />
              {county}
            </label>
          ))}
        </div>
      </fieldset>

      {state.error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent hover:bg-accent-dark text-ink px-5 py-2.5 font-semibold disabled:opacity-50"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
