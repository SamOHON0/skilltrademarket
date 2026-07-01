"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDataStore } from "@/lib/data";
import { moderateJob } from "@/lib/moderation";
import type {
  ContactMethod,
  JobUrgency,
  NewJobInput,
  Tier,
  TradeStatus,
  UnlockOutcome,
} from "@/lib/types";

export type JobFormState = { error?: string };

export async function submitJob(
  _prev: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const answers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("answer_") && typeof value === "string") {
      answers[key.replace("answer_", "")] = value;
    }
  }

  const input: NewJobInput = {
    category: String(formData.get("category") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    answers,
    county: String(formData.get("county") ?? ""),
    town: String(formData.get("town") ?? ""),
    eircode: String(formData.get("eircode") ?? ""),
    urgency: (formData.get("urgency") ?? "flexible") as JobUrgency,
    budgetBand: String(formData.get("budgetBand") ?? ""),
    customerName: String(formData.get("customerName") ?? ""),
    customerPhone: String(formData.get("customerPhone") ?? ""),
    customerEmail: String(formData.get("customerEmail") ?? ""),
    preferredContact: (formData.get("preferredContact") ?? "call") as ContactMethod,
    consentShareContact: formData.get("consentShareContact") === "on",
    consentReviewContact: formData.get("consentReviewContact") === "on",
  };

  if (!input.category) return { error: "Pick a trade category." };
  if (!input.title.trim()) return { error: "Give the job a short title." };
  if (!input.county) return { error: "Choose the county the job is in." };
  if (!input.customerName.trim()) return { error: "Add your name." };
  if (!input.customerPhone.trim() && !input.customerEmail.trim())
    return { error: "Add a phone number or email so trades can reach you." };
  if (input.customerEmail && !input.customerEmail.includes("@"))
    return { error: "That email address does not look right." };
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
    const job = await getDataStore().createJob(input, moderation);
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
  await getDataStore().setUnlockOutcome(
    String(formData.get("unlockId")),
    String(formData.get("outcome")) as UnlockOutcome
  );
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
