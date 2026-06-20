// Supabase implementation of DataStore.
//
// Connected in Phase 1 via the service-role client (server-side only). Reads and
// writes map snake_case DB columns to the camelCase domain types in ../types.
//
// Notes on parity with the mock store:
//  - unlockJob delegates to the unlock_job() Postgres function so the 5-unlock
//    cap is enforced atomically under the job row lock (PRD 8.1). The app never
//    enforces the cap itself.
//  - getFeed mirrors the mock filter (status + category + county + tier release
//    window) and strips customer contact fields before returning, exactly like
//    toFeedJob in mock.ts. Once Supabase Auth lands, this can move to the
//    job_feed() security-definer function instead.
//
// Auth (Phase 2): trades_people.auth_user_id links the auth user to the trade
// row; admin via app_metadata role claim checked in middleware for /admin.

import type { DataStore } from "./index";
import type {
  FeedJob,
  Job,
  NewJobInput,
  Review,
  TradeCategory,
  TradesPerson,
  Unlock,
  UnlockOutcome,
  UnlockResult,
} from "../types";
import { JOB_EXPIRY_DAYS, TIER_RELEASE_OFFSETS_MINUTES } from "../constants";
import { createServiceClient } from "../supabase/server";

// ---------- row mappers (snake_case DB -> camelCase domain) ----------

type Row = Record<string, unknown>;

function toCategory(r: Row): TradeCategory {
  return {
    slug: r.slug as string,
    name: r.name as string,
    sortOrder: r.sort_order as number,
    active: r.active as boolean,
    questions: (r.questions as TradeCategory["questions"]) ?? [],
  };
}

function toTrade(r: Row): TradesPerson {
  return {
    id: r.id as string,
    businessName: r.business_name as string,
    ownerName: r.owner_name as string,
    email: r.email as string,
    phone: r.phone as string,
    tradeCategories: (r.trade_categories as string[]) ?? [],
    counties: (r.counties as string[]) ?? [],
    bio: (r.bio as string | null) ?? null,
    photos: (r.photos as string[]) ?? [],
    tier: r.tier as TradesPerson["tier"],
    subscriptionActive: r.subscription_active as boolean,
    verifiedAt: (r.verified_at as string | null) ?? null,
    status: r.status as TradesPerson["status"],
    createdAt: r.created_at as string,
  };
}

function toJob(r: Row): Job {
  return {
    id: r.id as string,
    category: r.category as string,
    title: r.title as string,
    description: (r.description as string | null) ?? null,
    answers: (r.answers as Record<string, string>) ?? {},
    photos: (r.photos as string[]) ?? [],
    county: r.county as string,
    town: (r.town as string | null) ?? null,
    eircode: (r.eircode as string | null) ?? null,
    urgency: r.urgency as Job["urgency"],
    budgetBand: (r.budget_band as string | null) ?? null,
    customerName: r.customer_name as string,
    customerPhone: r.customer_phone as string,
    customerEmail: r.customer_email as string,
    preferredContact: r.preferred_contact as Job["preferredContact"],
    consentShareContact: r.consent_share_contact as boolean,
    consentReviewContact: r.consent_review_contact as boolean,
    manageToken: r.manage_token as string,
    status: r.status as Job["status"],
    unlockCount: r.unlock_count as number,
    releasedAt: (r.released_at as string | null) ?? null,
    expiresAt: (r.expires_at as string | null) ?? null,
    createdAt: r.created_at as string,
  };
}

function toUnlock(r: Row): Unlock {
  return {
    id: r.id as string,
    jobId: r.job_id as string,
    tradeId: r.trade_id as string,
    unlockedAt: r.unlocked_at as string,
    outcome: r.outcome as UnlockOutcome,
  };
}

function toReview(r: Row): Review {
  return {
    id: r.id as string,
    jobId: r.job_id as string,
    tradeId: r.trade_id as string,
    rating: r.rating as number,
    text: (r.text as string | null) ?? null,
    status: r.status as Review["status"],
    createdAt: r.created_at as string,
  };
}

function toFeedJob(job: Job, unlocked: boolean): FeedJob {
  const {
    customerName: _n,
    customerPhone: _p,
    customerEmail: _e,
    manageToken: _t,
    consentShareContact: _c1,
    consentReviewContact: _c2,
    ...safe
  } = job;
  return { ...safe, unlocked };
}

function visibleAtMs(job: Job, tier: TradesPerson["tier"]): number {
  return (
    new Date(job.releasedAt ?? 0).getTime() +
    TIER_RELEASE_OFFSETS_MINUTES[tier] * 60_000
  );
}

const emptyToNull = (v: string) => (v && v.trim() !== "" ? v : null);

// ---------- store ----------

export const supabaseStore: DataStore = {
  async getCategories() {
    const db = createServiceClient();
    const { data, error } = await db
      .from("trade_categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCategory);
  },

  async createJob(input: NewJobInput) {
    const db = createServiceClient();
    const { data, error } = await db
      .from("jobs")
      .insert({
        category: input.category,
        title: input.title,
        description: emptyToNull(input.description),
        answers: input.answers,
        county: input.county,
        town: emptyToNull(input.town),
        eircode: emptyToNull(input.eircode),
        urgency: input.urgency,
        budget_band: emptyToNull(input.budgetBand),
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        customer_email: input.customerEmail,
        preferred_contact: input.preferredContact,
        consent_share_contact: input.consentShareContact,
        consent_review_contact: input.consentReviewContact,
        status: "pending_review", // admin approval queue (PRD decision 2)
      })
      .select("*")
      .single();
    if (error) throw error;
    return toJob(data);
  },

  async getJobByToken(token: string) {
    const db = createServiceClient();
    const { data, error } = await db
      .from("jobs")
      .select("*")
      .eq("manage_token", token)
      .maybeSingle();
    if (error) throw error;
    return data ? toJob(data) : null;
  },

  async cancelJobByToken(token: string) {
    const db = createServiceClient();
    const { error } = await db
      .from("jobs")
      .update({ status: "removed" })
      .eq("manage_token", token)
      .neq("status", "completed");
    if (error) throw error;
  },

  async completeJobByToken(token: string) {
    const db = createServiceClient();
    const { error } = await db
      .from("jobs")
      .update({ status: "completed" })
      .eq("manage_token", token)
      .in("status", ["live", "fully_claimed"]);
    if (error) throw error;
  },

  async getJobClaimants(jobId: string) {
    const db = createServiceClient();
    const { data, error } = await db
      .from("unlocks")
      .select("trade:trades_people(business_name, tier, verified_at)")
      .eq("job_id", jobId);
    if (error) throw error;
    return (data ?? [])
      .map((r) => {
        const t = r.trade as unknown;
        return (Array.isArray(t) ? t[0] : t) as Row | undefined;
      })
      .filter((t): t is Row => Boolean(t))
      .map((t) => ({
        businessName: t.business_name as string,
        tier: t.tier as TradesPerson["tier"],
        verified: (t.verified_at as string | null) !== null,
      }));
  },

  async getTrade(id: string) {
    const db = createServiceClient();
    const { data, error } = await db
      .from("trades_people")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? toTrade(data) : null;
  },

  async getFeed(tradeId: string) {
    const db = createServiceClient();

    const { data: tradeRow, error: tErr } = await db
      .from("trades_people")
      .select("*")
      .eq("id", tradeId)
      .maybeSingle();
    if (tErr) throw tErr;
    if (!tradeRow) return [];
    const trade = toTrade(tradeRow);

    const { data: jobRows, error } = await db
      .from("jobs")
      .select("*")
      .in("status", ["live", "fully_claimed"])
      .in("category", trade.tradeCategories)
      .in("county", trade.counties);
    if (error) throw error;

    const { data: unlockRows, error: uErr } = await db
      .from("unlocks")
      .select("job_id")
      .eq("trade_id", tradeId);
    if (uErr) throw uErr;
    const unlockedJobIds = new Set((unlockRows ?? []).map((u) => u.job_id as string));

    const now = Date.now();
    return (jobRows ?? [])
      .map(toJob)
      .filter((j) => now >= visibleAtMs(j, trade.tier))
      .sort((a, b) => visibleAtMs(b, trade.tier) - visibleAtMs(a, trade.tier))
      .map((j) => toFeedJob(j, unlockedJobIds.has(j.id)));
  },

  // Atomic 5-cap + tier window + allowance all enforced inside unlock_job().
  async unlockJob(jobId: string, tradeId: string): Promise<UnlockResult> {
    const db = createServiceClient();
    const { data, error } = await db.rpc("unlock_job", {
      p_job_id: jobId,
      p_trade_id: tradeId,
    });
    if (error) throw error;

    // unlock_job() returns a single row: { success, reason }
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.success) return { success: true };
    return {
      success: false,
      reason: (row?.reason ?? "not_available") as Exclude<
        UnlockResult,
        { success: true }
      >["reason"],
    };
  },

  async getUnlocks(tradeId: string) {
    const db = createServiceClient();
    const { data, error } = await db
      .from("unlocks")
      .select("*, job:jobs(*)")
      .eq("trade_id", tradeId)
      .order("unlocked_at", { ascending: false });
    if (error) throw error;
    return (data ?? [])
      .filter((r) => r.job)
      .map((r) => ({ ...toUnlock(r), job: toJob(r.job as Row) }));
  },

  async setUnlockOutcome(unlockId: string, outcome: UnlockOutcome) {
    const db = createServiceClient();
    const { error } = await db
      .from("unlocks")
      .update({ outcome, outcome_at: new Date().toISOString() })
      .eq("id", unlockId);
    if (error) throw error;
  },

  async getJobs(status?: Job["status"]) {
    const db = createServiceClient();
    let query = db.from("jobs").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toJob);
  },

  async approveJob(jobId: string) {
    const db = createServiceClient();
    const now = new Date();
    const expires = new Date(now.getTime() + JOB_EXPIRY_DAYS * 86_400_000);
    const { error } = await db
      .from("jobs")
      .update({
        status: "live",
        released_at: now.toISOString(),
        expires_at: expires.toISOString(),
      })
      .eq("id", jobId)
      .eq("status", "pending_review");
    if (error) throw error;
  },

  async rejectJob(jobId: string) {
    const db = createServiceClient();
    const { error } = await db
      .from("jobs")
      .update({ status: "removed" })
      .eq("id", jobId)
      .eq("status", "pending_review");
    if (error) throw error;
  },

  async getTrades() {
    const db = createServiceClient();
    const { data, error } = await db
      .from("trades_people")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toTrade);
  },

  async setTradeStatus(tradeId: string, status: TradesPerson["status"]) {
    const db = createServiceClient();
    const { error } = await db
      .from("trades_people")
      .update({ status })
      .eq("id", tradeId);
    if (error) throw error;
  },

  async setTradeTier(tradeId: string, tier: TradesPerson["tier"]) {
    const db = createServiceClient();
    const { error } = await db
      .from("trades_people")
      .update({ tier })
      .eq("id", tradeId);
    if (error) throw error;
  },

  async setTradeVerified(tradeId: string, verified: boolean) {
    const db = createServiceClient();
    const { error } = await db
      .from("trades_people")
      .update({ verified_at: verified ? new Date().toISOString() : null })
      .eq("id", tradeId);
    if (error) throw error;
  },

  async getReviews() {
    const db = createServiceClient();
    const { data, error } = await db
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toReview);
  },
};
