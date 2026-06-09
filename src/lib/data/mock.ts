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
import {
  JOB_EXPIRY_DAYS,
  JOB_UNLOCK_CAP,
  TIER_RELEASE_OFFSETS_MINUTES,
  UNLOCK_ALLOWANCES_MONTHLY,
} from "../constants";

// ---------- seed data ----------

const categories: TradeCategory[] = [
  ["plumbing", "Plumbing"],
  ["electrical", "Electrical"],
  ["carpentry", "Carpentry"],
  ["painting", "Painting & Decorating"],
  ["tiling", "Tiling"],
  ["plastering", "Plastering"],
  ["roofing", "Roofing"],
  ["landscaping", "Landscaping & Gardening"],
  ["handyman", "General Handyman"],
].map(([slug, name], i) => ({
  slug,
  name,
  sortOrder: i + 1,
  active: true,
  questions: [
    {
      key: "job_type",
      label: `What kind of ${name.toLowerCase()} work?`,
      type: "select" as const,
      options: ["Repair", "New installation", "Maintenance", "Other"],
    },
  ],
}));

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const daysFromNow = (d: number) =>
  new Date(Date.now() + d * 86_400_000).toISOString();

function makeJob(partial: Partial<Job> & Pick<Job, "id" | "category" | "title" | "county">): Job {
  return {
    description: null,
    answers: {},
    photos: [],
    town: null,
    eircode: null,
    urgency: "flexible",
    budgetBand: null,
    customerName: "Test Customer",
    customerPhone: "0851234567",
    customerEmail: "customer@example.com",
    preferredContact: "call",
    consentShareContact: true,
    consentReviewContact: true,
    manageToken: `token-${partial.id}`,
    status: "live",
    unlockCount: 0,
    releasedAt: minsAgo(90),
    expiresAt: daysFromNow(JOB_EXPIRY_DAYS),
    createdAt: minsAgo(120),
    ...partial,
  };
}

interface Db {
  jobs: Job[];
  trades: TradesPerson[];
  unlocks: Unlock[];
  reviews: Review[];
}

function seed(): Db {
  return {
    jobs: [
      makeJob({
        id: "job-1",
        category: "plumbing",
        title: "Leaking radiator valve, Drumcondra",
        description: "Radiator in the front room leaking at the valve. Wood floor, want it sorted quickly.",
        county: "Dublin",
        town: "Drumcondra",
        urgency: "asap",
        budgetBand: "Under EUR 250",
        answers: { job_type: "Repair" },
        releasedAt: minsAgo(75),
        unlockCount: 2,
      }),
      makeJob({
        id: "job-2",
        category: "electrical",
        title: "EV charger install, semi-d in Lucan",
        description: "Need a 7kW home charger installed, fuse board is 3 years old.",
        county: "Dublin",
        town: "Lucan",
        urgency: "this_month",
        budgetBand: "EUR 250 to 1,000",
        answers: { job_type: "New installation" },
        releasedAt: minsAgo(20), // inside Pro window, Basic cannot see yet
      }),
      makeJob({
        id: "job-3",
        category: "painting",
        title: "Repaint 3-bed interior before letting",
        county: "Kildare",
        town: "Naas",
        urgency: "this_week",
        budgetBand: "EUR 1,000 to 5,000",
        releasedAt: minsAgo(5), // Elite only right now
      }),
      makeJob({
        id: "job-4",
        category: "roofing",
        title: "Slipped slates after storm",
        county: "Dublin",
        town: "Clontarf",
        urgency: "asap",
        status: "pending_review", // sits in the admin queue
        releasedAt: null,
      }),
      makeJob({
        id: "job-5",
        category: "plumbing",
        title: "Bathroom refit plumbing first fix",
        county: "Meath",
        town: "Ashbourne",
        urgency: "this_month",
        status: "fully_claimed",
        unlockCount: 5,
        releasedAt: minsAgo(2880),
      }),
    ],
    trades: [
      {
        id: "trade-1",
        businessName: "Murphy Plumbing & Heating",
        ownerName: "Dec Murphy",
        email: "dec@murphyplumbing.ie",
        phone: "0861111111",
        tradeCategories: ["plumbing"],
        counties: ["Dublin", "Meath"],
        bio: "20 years in domestic plumbing and heating across north Dublin.",
        photos: [],
        tier: "elite",
        subscriptionActive: true,
        verifiedAt: minsAgo(60 * 24 * 30),
        status: "active",
        createdAt: minsAgo(60 * 24 * 60),
      },
      {
        id: "trade-2",
        businessName: "Bright Spark Electrical",
        ownerName: "Aoife Byrne",
        email: "aoife@brightspark.ie",
        phone: "0862222222",
        tradeCategories: ["electrical"],
        counties: ["Dublin", "Kildare"],
        bio: "RECI registered. Domestic and light commercial.",
        photos: [],
        tier: "pro",
        subscriptionActive: true,
        verifiedAt: minsAgo(60 * 24 * 10),
        status: "active",
        createdAt: minsAgo(60 * 24 * 40),
      },
      {
        id: "trade-3",
        businessName: "O'Shea Painting",
        ownerName: "Tom O'Shea",
        email: "tom@osheapainting.ie",
        phone: "0863333333",
        tradeCategories: ["painting", "plastering"],
        counties: ["Kildare", "Dublin", "Wicklow"],
        bio: null,
        photos: [],
        tier: "basic",
        subscriptionActive: true,
        verifiedAt: null,
        status: "active",
        createdAt: minsAgo(60 * 24 * 5),
      },
    ],
    unlocks: [
      {
        id: "unlock-1",
        jobId: "job-1",
        tradeId: "trade-1",
        unlockedAt: minsAgo(70),
        outcome: "none",
      },
    ],
    reviews: [
      {
        id: "review-1",
        jobId: "job-5",
        tradeId: "trade-1",
        rating: 5,
        text: "Dec was out within the hour, fair price, no mess.",
        status: "live",
        createdAt: minsAgo(60 * 24 * 2),
      },
    ],
  };
}

// Survive Next.js dev-server HMR so state behaves like a database during a session
const g = globalThis as unknown as { __skillTradeDb?: Db };
const db: Db = (g.__skillTradeDb ??= seed());

// ---------- helpers ----------

function toFeedJob(job: Job, tradeId: string): FeedJob {
  const {
    customerName: _n,
    customerPhone: _p,
    customerEmail: _e,
    manageToken: _t,
    consentShareContact: _c1,
    consentReviewContact: _c2,
    ...safe
  } = job;
  return {
    ...safe,
    unlocked: db.unlocks.some((u) => u.jobId === job.id && u.tradeId === tradeId),
  };
}

function visibleAt(job: Job, tier: TradesPerson["tier"]): number {
  return (
    new Date(job.releasedAt ?? 0).getTime() +
    TIER_RELEASE_OFFSETS_MINUTES[tier] * 60_000
  );
}

// ---------- store ----------

export const mockStore: DataStore = {
  async getCategories() {
    return categories;
  },

  async createJob(input: NewJobInput) {
    const id = `job-${Date.now()}`;
    const job = makeJob({
      id,
      ...input,
      status: "pending_review", // admin approval queue per PRD decision 2
      releasedAt: null,
      expiresAt: null,
      manageToken: `token-${id}`,
      unlockCount: 0,
    });
    db.jobs.unshift(job);
    return job;
  },

  async getJobByToken(token: string) {
    return db.jobs.find((j) => j.manageToken === token) ?? null;
  },

  async getTrade(id: string) {
    return db.trades.find((t) => t.id === id) ?? null;
  },

  async getFeed(tradeId: string) {
    const trade = db.trades.find((t) => t.id === tradeId);
    if (!trade) return [];
    return db.jobs
      .filter(
        (j) =>
          (j.status === "live" || j.status === "fully_claimed") &&
          trade.tradeCategories.includes(j.category) &&
          trade.counties.includes(j.county) &&
          Date.now() >= visibleAt(j, trade.tier)
      )
      .sort((a, b) => visibleAt(b, trade.tier) - visibleAt(a, trade.tier))
      .map((j) => toFeedJob(j, tradeId));
  },

  // Mirrors the unlock_job() Postgres function. In production the DB row lock
  // is what makes this safe under simultaneous taps; this mock just mirrors
  // the rule order so the UI behaves identically.
  async unlockJob(jobId: string, tradeId: string): Promise<UnlockResult> {
    const trade = db.trades.find((t) => t.id === tradeId);
    if (!trade || trade.status !== "active" || !trade.subscriptionActive)
      return { success: false, reason: "subscription_inactive" };

    const job = db.jobs.find((j) => j.id === jobId);
    if (!job) return { success: false, reason: "not_found" };
    if (job.status !== "live")
      return {
        success: false,
        reason: job.status === "fully_claimed" ? "fully_claimed" : "not_available",
      };
    if (Date.now() < visibleAt(job, trade.tier))
      return { success: false, reason: "not_yet_visible" };

    const allowance = UNLOCK_ALLOWANCES_MONTHLY[trade.tier];
    if (allowance !== null) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const used = db.unlocks.filter(
        (u) => u.tradeId === tradeId && new Date(u.unlockedAt) >= monthStart
      ).length;
      if (used >= allowance)
        return { success: false, reason: "allowance_exhausted" };
    }

    if (db.unlocks.some((u) => u.jobId === jobId && u.tradeId === tradeId))
      return { success: false, reason: "already_unlocked" };
    if (job.unlockCount >= JOB_UNLOCK_CAP)
      return { success: false, reason: "fully_claimed" };

    db.unlocks.push({
      id: `unlock-${Date.now()}`,
      jobId,
      tradeId,
      unlockedAt: new Date().toISOString(),
      outcome: "none",
    });
    job.unlockCount += 1;
    if (job.unlockCount >= JOB_UNLOCK_CAP) job.status = "fully_claimed";
    return { success: true };
  },

  async getUnlocks(tradeId: string) {
    return db.unlocks
      .filter((u) => u.tradeId === tradeId)
      .map((u) => ({ ...u, job: db.jobs.find((j) => j.id === u.jobId)! }))
      .filter((u) => u.job);
  },

  async setUnlockOutcome(unlockId: string, outcome: UnlockOutcome) {
    const unlock = db.unlocks.find((u) => u.id === unlockId);
    if (unlock) unlock.outcome = outcome;
  },

  async getJobs(status?: Job["status"]) {
    return status ? db.jobs.filter((j) => j.status === status) : [...db.jobs];
  },

  async approveJob(jobId: string) {
    const job = db.jobs.find((j) => j.id === jobId);
    if (job && job.status === "pending_review") {
      job.status = "live";
      job.releasedAt = new Date().toISOString();
      job.expiresAt = daysFromNow(JOB_EXPIRY_DAYS);
    }
  },

  async rejectJob(jobId: string) {
    const job = db.jobs.find((j) => j.id === jobId);
    if (job && job.status === "pending_review") job.status = "removed";
  },

  async getTrades() {
    return [...db.trades];
  },

  async getReviews() {
    return [...db.reviews];
  },
};
