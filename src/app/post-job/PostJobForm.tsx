"use client";

import { useActionState, useState } from "react";
import { submitJob, type JobFormState } from "../actions";
import { BUDGET_BANDS, COUNTIES, URGENCY_LABELS } from "@/lib/constants";
import type { TradeCategory } from "@/lib/types";

const STEPS = ["Trade", "Details", "Location", "Timing", "Contact"] as const;

const inputCls =
  "w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent";
const labelCls = "block text-sm font-medium mb-1.5";

export default function PostJobForm({
  categories,
  initialCategory,
}: {
  categories: TradeCategory[];
  initialCategory?: string;
}) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(
    categories.some((c) => c.slug === initialCategory) ? initialCategory! : ""
  );
  const selected = categories.find((c) => c.slug === category);
  const [state, formAction, isPending] = useActionState<JobFormState, FormData>(
    submitJob,
    {}
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Progress */}
      <ol className="flex gap-1.5">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-ink/10"}`}
            aria-label={`${label}${i === step ? " (current step)" : ""}`}
          />
        ))}
      </ol>

      {/* Step 1: trade category */}
      <fieldset className={step === 0 ? "" : "hidden"}>
        <legend className="text-lg font-semibold mb-3">
          What do you need done?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((c) => (
            <label
              key={c.slug}
              className={`cursor-pointer rounded-lg border px-3 py-3 text-sm font-medium ${
                category === c.slug
                  ? "border-accent bg-accent/10"
                  : "border-ink/15 bg-white hover:border-ink/30"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={c.slug}
                checked={category === c.slug}
                onChange={() => setCategory(c.slug)}
                className="sr-only"
              />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Step 2: details */}
      <fieldset className={step === 1 ? "space-y-4" : "hidden"}>
        <legend className="text-lg font-semibold mb-3">Job details</legend>
        <div>
          <label className={labelCls} htmlFor="title">
            Give the job a short title
          </label>
          <input
            id="title"
            name="title"
            className={inputCls}
            placeholder="e.g. Leaking radiator valve"
          />
        </div>
        {selected?.questions.map((q) => (
          <div key={q.key}>
            <label className={labelCls} htmlFor={`answer_${q.key}`}>
              {q.label}
            </label>
            {q.type === "select" ? (
              <select id={`answer_${q.key}`} name={`answer_${q.key}`} className={inputCls}>
                <option value="">Choose one</option>
                {q.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input id={`answer_${q.key}`} name={`answer_${q.key}`} className={inputCls} />
            )}
          </div>
        ))}
        <div>
          <label className={labelCls} htmlFor="description">
            Describe the job. More detail means better quotes.
          </label>
          <textarea id="description" name="description" rows={4} className={inputCls} />
        </div>
      </fieldset>

      {/* Step 3: location */}
      <fieldset className={step === 2 ? "space-y-4" : "hidden"}>
        <legend className="text-lg font-semibold mb-3">Where is the job?</legend>
        <div>
          <label className={labelCls} htmlFor="county">County</label>
          <select id="county" name="county" className={inputCls}>
            <option value="">Choose county</option>
            {COUNTIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="town">Town or area</label>
            <input id="town" name="town" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="eircode">Eircode (optional)</label>
            <input id="eircode" name="eircode" className={inputCls} placeholder="D01 X2Y3" />
          </div>
        </div>
      </fieldset>

      {/* Step 4: timing + budget */}
      <fieldset className={step === 3 ? "space-y-4" : "hidden"}>
        <legend className="text-lg font-semibold mb-3">When do you need it?</legend>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(URGENCY_LABELS).map(([value, label], i) => (
            <label
              key={value}
              className="cursor-pointer rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm font-medium has-checked:border-accent has-checked:bg-accent/10"
            >
              <input
                type="radio"
                name="urgency"
                value={value}
                defaultChecked={i === 3}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
        <div>
          <label className={labelCls} htmlFor="budgetBand">Rough budget (optional)</label>
          <select id="budgetBand" name="budgetBand" className={inputCls}>
            <option value="">Prefer not to say</option>
            {BUDGET_BANDS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
      </fieldset>

      {/* Step 5: contact + consent */}
      <fieldset className={step === 4 ? "space-y-4" : "hidden"}>
        <legend className="text-lg font-semibold mb-3">Your contact details</legend>
        <div>
          <label className={labelCls} htmlFor="customerName">Name</label>
          <input id="customerName" name="customerName" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="customerPhone">Phone</label>
            <input id="customerPhone" name="customerPhone" type="tel" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="customerEmail">Email</label>
            <input id="customerEmail" name="customerEmail" type="email" className={inputCls} />
          </div>
        </div>
        <div>
          <span className={labelCls}>How should trades contact you?</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["whatsapp", "WhatsApp"],
              ["call", "Phone call"],
              ["email", "Email"],
            ].map(([value, label], i) => (
              <label
                key={value}
                className="cursor-pointer rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm font-medium text-center has-checked:border-accent has-checked:bg-accent/10"
              >
                <input
                  type="radio"
                  name="preferredContact"
                  value={value}
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <label className="flex items-start gap-2.5 text-sm">
          <input type="checkbox" name="consentShareContact" className="mt-0.5 accent-[#f2a20c]" />
          <span>
            I&apos;m happy to be contacted by up to five matched tradespeople
            about this job, by my chosen method above. Required.
          </span>
        </label>
        <label className="flex items-start gap-2.5 text-sm">
          <input type="checkbox" name="consentReviewContact" className="mt-0.5 accent-[#f2a20c]" />
          <span>
            Contact me after the job is done so I can leave a review. Optional.
          </span>
        </label>
      </fieldset>

      {/* Nav */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={`rounded-lg border border-ink/20 px-5 py-2.5 font-medium ${step === 0 ? "invisible" : ""}`}
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 && !category}
            className="rounded-lg bg-ink text-white px-5 py-2.5 font-medium disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-accent hover:bg-accent-dark text-ink px-5 py-2.5 font-semibold disabled:opacity-50"
          >
            {isPending ? "Posting..." : "Post my job"}
          </button>
        )}
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
