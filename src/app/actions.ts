"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDataStore } from "@/lib/data";
import { moderateJob } from "@/lib/moderation";
import { COUNTIES } from "@/lib/constants";
import type {
  ContactMethod,
  JobUrgency,
  NewJobInput,
  Tier,
  TradeStatus,
  UnlockOutcome,
} from "@/lib/types";

export type JobFormState = { error?: string };

const URGENCIES: JobUrgency[] = ["asap", "this_week", "this_month", "flexible"];
const CONTACT_METHODS: ContactMethod[] = ["whatsapp", "call", "email"];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const clip = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "").trim().slice(0, max);

export async function submitJob(
  _prev: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const store = getDataStore();

  const category = clip(formData.get("category"), 60);
  const categories = await store.getCategories().catch(() => []);
  const selected = categories.find((c) => c.slug === category);
  if (!selected) return { error: "Pick a trade category." };

  // Only keep answers to questions this category actually asks.
  const answers: Record<string, string> = {};
  for (const q of selected.questions) {
    const value = formData.get(`answer_${q.key}`);
    if (typeof value === "string" && value.trim())
      answers[q.key] = value.trim().slice(0, 200);
  }

  const urgencyRaw = String(formData.get("urgency") ?? "");
  const contactRaw = String(formData.get("preferredContact") ?? "");

  const input: NewJobInput = {
    category,
    title: clip(formData.get("title"), 120),
    description: clip(formData.get("description"), 4000),
    answers,
    county: clip(formData.get("county"), 40),
    town: clip(formData.get("town"), 80),
    eircode: clip(formData.get("eircode"), 12).toUpperCase(),
    urgency: URGENCIES.includes(urgencyRaw as JobUrgency)
      ? (urgencyRaw as JobUrgency)
      : "flexible",
    budgetBand: clip(formData.get("budgetBand"), 40),
    customerName: clip(formData.get("customerName"), 80),
    customerPhone: clip(formData.get("customerPhone"), 25),
    customerEmail: clip(formData.get("customerEmail"), 120),
    preferredContact: CONTACT_METHODS.includes(contactRaw as ContactMethod)
      ? (contactRaw as ContactMethod)
      : "call",
    consentShareContact: formData.get("consentShareContact") === "on",
    consentReviewContact: formData.get("consentReviewContact") === "on",
  };

  if (input.title.length < 4) return { error: "Give the job a short, clear title." };
  if (!COUNTIES.includes(input.county))
    return { error: "Choose the county the job is in." };
  if (!input.customerName) return { error: "Add your name." };
  if (!input.customerPhone && !input.customerEmail)
    return { error: "Add a phone number or email so trades can reach you." };
  if (input.customerPhone) {
    const digits = input.customerPhone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15)
      return { error: "That phone number does not look right." };
  }
  if (input.customerEmail && !EMAIL_RE.test(input.customerEmail))
    return { error: "That email address does not look right." };
  if (input.preferredContact === "whatsapp" && !input.customerPhone)
    return { error: "WhatsApp needs a phone number. Add one or pick email." };
  if (input.preferredContact === "email" && !input.customerEmail)
    return { error: "Add an email address, or pick phone or WhatsApp." };
  if (!input.consentShareContact)
    return { error: "You need to agree to share your details with matched trades." };

  // AI moderation (no-op if no ANTHROPIC_API_KEY): approve | review | reject.
  const moderation = await moderateJob(input);
  if (moderation.decision === "reject") {
    const reason = moderation.reasons[0] ? `: ${moderation.reasons[0]}` : "";
    return {
      error: `This job couldn't be posted as written${reason}. Please reword it and try again.`,
    };
  }

  let manageToken: string;
  try {
    const job = await store.createJob(input, moderation);
    manageToken = job.manageToken;
  } catch (err) {
    console.error("createJob failed:", err);
    return {
      error:
        "Something went wrong posting your job. Please try again in a moment.",
    };
  }
  // redirect must be outside the try: it works by throwing internally.
  redirect(`/jobs/${manageToken}`);
}

export async function unlockJobAction(jobId: string, tradeId: string) {
  const result = await getDataStore().unlockJob(jobId, tradeId);
  revalidatePath("/trade/feed");
  return result;
}

// ---------- customer self-service (via manage token) ----------

export async function cancelJobAction(formData: FormData) {
  const token = String(formData.get("token"));
  await getDataStore().cancelJobByToken(token);
  revalidatePath(`/jobs/${token}`);
}

export async function completeJobAction(formData: FormData) {
  const token = String(formData.get("token"));
  await getDataStore().completeJobByToken(token);
  revalidatePath(`/jobs/${token}`);
}

// ---------- admin: jobs ----------

export async function approveJobAction(formData: FormData) {
  await getDataStore().approveJob(String(formData.get("jobId")));
  revalidatePath("/admin/jobs");
}

export async function rejectJobAction(formData: FormData) {
  await getDataStore().rejectJob(String(formData.get("jobId")));
  revalidatePath("/admin/jobs");
}

export async function reportLeadAction(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  const tradeId = String(formData.get("tradeId") ?? "");
  const reason = String(formData.get("reason") || "Other");
  if (!jobId || !tradeId) return;
  await getDataStore().reportLead(jobId, tradeId, reason);
  revalidatePath("/trade/dashboard");
  revalidatePath("/trade/feed");
  revalidatePath("/admin/reports");
}

export async function setOutcomeAction(formData: FormData) {
  const outcome = String(formData.get("outcome"));
  const allowed: UnlockOutcome[] = ["none", "won", "lost", "completed"];
  if (!allowed.includes(outcome as UnlockOutcome)) return;
  await getDataStore().setUnlockOutcome(
    String(formData.get("unlockId")),
    outcome as UnlockOutcome
  );
  revalidatePath("/trade/dashboard");
  revalidatePath("/trade/feed");
}

// ---------- admin: trades ----------

export async function setTradeStatusAction(formData: FormData) {
  await getDataStore().setTradeStatus(
    String(formData.get("tradeId")),
    String(formData.get("status")) as TradeStatus
  );
  revalidatePath("/admin/trades");
  revalidatePath("/admin");
}

export async function setTradeTierAction(formData: FormData) {
  await getDataStore().setTradeTier(
    String(formData.get("tradeId")),
    String(formData.get("tier")) as Tier
  );
  revalidatePath("/admin/trades");
  revalidatePath("/admin");
}

export async function setTradeVerifiedAction(formData: FormData) {
  await getDataStore().setTradeVerified(
    String(formData.get("tradeId")),
    formData.get("verified") === "true"
  );
  revalidatePath("/admin/trades");
  revalidatePath("/admin");
}
