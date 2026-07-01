"use client";

import { useActionState, useRef, useState } from "react";
import { submitJob, type JobFormState } from "../actions";
import { BUDGET_BANDS, COUNTIES, URGENCY_LABELS } from "@/lib/constants";
import type { TradeCategory } from "@/lib/types";

const STEPS = ["Trade", "Details", "Location", "Timing", "Contact", "Review"] as const;

const inputCls =
  "w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent";
const labelCls = "block text-sm font-medium mb-1.5";
const errCls = "mt-1 text-xs font-medium text-red-600";

type Errors = Record<string, string>;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function PostJobForm({
  categories,
  initialCategory,
}: {
  categories: TradeCategory[];
  initialCategory?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const stepHeadingRef = useRef<HTMLParagraphElement>(null);
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(
    categories.some((c) => c.slug === initialCategory) ? initialCategory! : ""
  );
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const selected = categories.find((c) => c.slug === category);

  const [state, formAction, isPending] = useActionState<JobFormState, FormData>(
    submitJob,
    {}
  );

  function validate(stepIdx: number, fd: FormData): Errors {
    const e: Errors = {};
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    if (stepIdx === 0 && !category) e.category = "Pick the trade you need.";
    if (stepIdx === 1 && get("title").length < 4)
      e.title = "Give the job a short, clear title.";
    if (stepIdx === 2 && !get("county")) e.county = "Choose the county.";
    if (stepIdx === 4) {
      if (!get("customerName")) e.customerName = "Add your name.";
      const phone = get("customerPhone");
      const email = get("customerEmail");
      const preferred = get("preferredContact");
      if (!phone && !email)
        e.customerContact = "Add a phone number or email so trades can reach you.";
      if (phone) {
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 7 || digits.length > 15)
          e.customerPhone = "That phone number does not look right.";
      }
      if (email && !EMAIL_RE.test(email))
        e.customerEmail = "That email address does not look right.";
      if (preferred === "whatsapp" && !phone)
        e.customerContact = "WhatsApp needs a phone number. Add one or pick email.";
      if (preferred === "email" && !email)
        e.customerContact = "Add an email address, or pick phone or WhatsApp.";
      if (fd.get("consentShareContact") !== "on")
        e.consent = "Please confirm you are happy to be contacted.";
    }
    return e;
  }

  function capture(fd: FormData) {
    const next: Record<string, string> = {};
    for (const [k, v] of fd.entries()) {
      if (typeof v === "string") next[k] = v;
    }
    setValues((prev) => ({ ...prev, ...next }));
  }

  // Keyboard and screen-reader users land back at the step indicator on
  // every step change instead of being stranded mid-form.
  function focusStepHeading() {
    requestAnimationFrame(() => stepHeadingRef.current?.focus());
  }

  function goNext() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const e = validate(step, fd);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    capture(fd);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    focusStepHeading();
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    focusStepHeading();
  }

  const reviewRows: [string, string][] = [
    ["Trade", selected?.name ?? "—"],
    ["Title", values.title || "—"],
    ...(selected?.questions ?? [])
      .filter((q) => values[`answer_${q.key}`])
      .map((q): [string, string] => [q.label, values[`answer_${q.key}`]]),
    ["Location", [values.town, values.county].filter(Boolean).join(", ") || "—"],
    ["Eircode", values.eircode || "—"],
    ["Timing", URGENCY_LABELS[values.urgency ?? "flexible"] ?? "—"],
    ["Budget", values.budgetBand || "Not specified"],
    ["Name", values.customerName || "—"],
    ["Phone", values.customerPhone || "—"],
    ["Email", values.customerEmail || "—"],
    [
      "Preferred contact",
      values.preferredContact === "whatsapp"
        ? "WhatsApp"
        : values.preferredContact === "email"
          ? "Email"
          : "Phone call",
    ],
  ];

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {/* Progress */}
      <div>
        <ol className="flex gap-1.5">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-ink/10"}`}
              aria-label={`${label}${i === step ? " (current step)" : ""}`}
            />
          ))}
        </ol>
        <p
          ref={stepHeadingRef}
          tabIndex={-1}
          className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink/50 focus:outline-none"
        >
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </div>

      {/* Step 1: trade */}
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
        {errors.category && <p className={errCls}>{errors.category}</p>}
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
          {errors.title && <p className={errCls}>{errors.title}</p>}
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
          {errors.county && <p className={errCls}>{errors.county}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="town">Town or area</label>
            <input id="town" name="town" className={inputCls} placeholder="e.g. Drumcondra" />
          </div>
          <div>
            <label className={labelCls} htmlFor="eircode">Eircode (optional)</label>
            <input id="eircode" name="eircode" className={inputCls} placeholder="D01 X2Y3" />
          </div>
        </div>
        <p className="text-xs text-ink/50">
          Adding a town or eircode matches you with trades within range, not just
          the county.
        </p>
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
          {errors.customerName && <p className={errCls}>{errors.customerName}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="customerPhone">Phone</label>
            <input id="customerPhone" name="customerPhone" type="tel" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="customerEmail">Email</label>
            <input id="customerEmail" name="customerEmail" type="email" className={inputCls} />
            {errors.customerEmail && <p className={errCls}>{errors.customerEmail}</p>}
          </div>
        </div>
        {errors.customerContact && <p className={errCls}>{errors.customerContact}</p>}
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
        {errors.consent && <p className={errCls}>{errors.consent}</p>}
        <label className="flex items-start gap-2.5 text-sm">
          <input type="checkbox" name="consentReviewContact" className="mt-0.5 accent-[#f2a20c]" />
          <span>
            Contact me after the job is done so I can leave a review. Optional.
          </span>
        </label>
      </fieldset>

      {/* Step 6: review */}
      <fieldset className={step === 5 ? "space-y-4" : "hidden"}>
        <legend className="text-lg font-semibold mb-3">Review &amp; post</legend>
        <p className="text-sm text-ink/60">
          Quick check before it goes to local trades. You can go back to change
          anything.
        </p>
        <div className="rounded-xl border border-ink/10 bg-white divide-y divide-ink/5">
          {reviewRows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
              <span className="text-ink/50">{label}</span>
              <span className="font-medium text-right">{value}</span>
            </div>
          ))}
        </div>
        {values.description && (
          <div className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm">
            <p className="text-ink/50 mb-1">Description</p>
            <p>{values.description}</p>
          </div>
        )}
      </fieldset>

      {/* Nav */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={goBack}
          className={`rounded-lg border border-ink/20 px-5 py-2.5 font-medium ${step === 0 ? "invisible" : ""}`}
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-ink text-white px-5 py-2.5 font-medium hover:bg-ink-light"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-accent hover:bg-accent-dark text-ink px-6 py-2.5 font-semibold disabled:opacity-50"
          >
            {isPending ? "Posting..." : "Post my job"}
          </button>
        )}
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
