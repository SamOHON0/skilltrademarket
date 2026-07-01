// AI moderation of job posts via Claude Haiku (plain HTTPS, no SDK).
//
// Fail-safe by design:
//  - No ANTHROPIC_API_KEY  -> "approve" (moderation disabled; posting as before)
//  - API error / unparseable -> "review" (sent to the admin queue, never auto-published)
// So adding the key turns moderation on; removing it turns it off.

import type { NewJobInput } from "./types";

export type ModerationDecision = "approve" | "review" | "reject";
export type ModerationResult = {
  decision: ModerationDecision;
  reasons: string[];
};

const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_RUBRIC = `You moderate job posts for Skill Trade, an Irish marketplace where homeowners post home-improvement and trade jobs (plumbing, electrical, carpentry, roofing, etc.) for local tradespeople.

Decide one of:
- "approve": a normal, legitimate job post (publish immediately). Approve even if short or sparse.
- "review": borderline. Use for very low-detail or vague posts, likely wrong category, suspected attempts to move off-platform, or anything you are unsure about.
- "reject": clear violations only: spam or advertising, abusive/hateful/sexual content, hiring for illegal or dangerous work, obviously fake or nonsensical text, or exposing other people's private data.

Be lenient. Prefer "approve" or "review" over "reject" so real customers are never wrongly blocked.

Respond with ONLY minified JSON, no other text:
{"decision":"approve|review|reject","reasons":["short reason"]}
Give 1 to 3 short reason strings.`;

function buildUserMessage(input: NewJobInput): string {
  const lines = [
    `Category: ${input.category}`,
    `Title: ${input.title}`,
    `Description: ${input.description || "(none)"}`,
    `Location: ${[input.town, input.county].filter(Boolean).join(", ")}`,
    `Budget: ${input.budgetBand || "(not given)"}`,
    `Answers: ${JSON.stringify(input.answers ?? {})}`,
  ];
  return `Moderate this job post:\n${lines.join("\n")}`;
}

function parseVerdict(text: string): ModerationResult | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]) as {
      decision?: string;
      reasons?: unknown;
    };
    const decision = obj.decision;
    if (decision !== "approve" && decision !== "review" && decision !== "reject")
      return null;
    const reasons = Array.isArray(obj.reasons)
      ? obj.reasons.map((r) => String(r)).slice(0, 3)
      : [];
    return { decision, reasons };
  } catch {
    return null;
  }
}

export async function moderateJob(input: NewJobInput): Promise<ModerationResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { decision: "approve", reasons: ["moderation disabled"] };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: SYSTEM_RUBRIC,
        messages: [{ role: "user", content: buildUserMessage(input) }],
      }),
      cache: "no-store",
    });
    if (!res.ok) return { decision: "review", reasons: ["moderation service error"] };
    const data = (await res.json()) as {
      content?: { text?: string }[];
    };
    const text = data?.content?.[0]?.text ?? "";
    return parseVerdict(text) ?? { decision: "review", reasons: ["unparseable moderation result"] };
  } catch {
    return { decision: "review", reasons: ["moderation request failed"] };
  }
}
