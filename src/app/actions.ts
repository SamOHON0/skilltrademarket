"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDataStore } from "@/lib/data";
import type { ContactMethod, JobUrgency, NewJobInput, UnlockOutcome } from "@/lib/types";

export async function submitJob(formData: FormData) {
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

  if (!input.category || !input.title || !input.county || !input.customerName || !input.customerPhone || !input.customerEmail) {
    throw new Error("Missing required fields");
  }
  if (!input.consentShareContact) {
    throw new Error("Consent to share contact details is required");
  }

  const job = await getDataStore().createJob(input);
  redirect(`/jobs/${job.manageToken}`);
}

export async function unlockJobAction(jobId: string, tradeId: string) {
  const result = await getDataStore().unlockJob(jobId, tradeId);
  revalidatePath("/trade/feed");
  return result;
}

export async function approveJobAction(formData: FormData) {
  await getDataStore().approveJob(String(formData.get("jobId")));
  revalidatePath("/admin/jobs");
}

export async function rejectJobAction(formData: FormData) {
  await getDataStore().rejectJob(String(formData.get("jobId")));
  revalidatePath("/admin/jobs");
}

export async function setOutcomeAction(formData: FormData) {
  await getDataStore().setUnlockOutcome(
    String(formData.get("unlockId")),
    String(formData.get("outcome")) as UnlockOutcome
  );
  revalidatePath("/trade/feed");
}
