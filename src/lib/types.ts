// Domain types, mirroring supabase/migrations/0001_initial_schema.sql

export type Tier = "basic" | "pro" | "elite";
export type TradeStatus = "active" | "suspended" | "pending";
export type JobStatus =
  | "pending_review"
  | "live"
  | "fully_claimed"
  | "expired"
  | "completed"
  | "removed";
export type JobUrgency = "asap" | "this_week" | "this_month" | "flexible";
export type ContactMethod = "whatsapp" | "call" | "email";
export type UnlockOutcome = "none" | "won" | "lost" | "completed";
export type ReviewStatus = "live" | "flagged" | "removed";

export interface CategoryQuestion {
  key: string;
  label: string;
  type: "select" | "text";
  options?: string[];
}

export interface TradeCategory {
  slug: string;
  name: string;
  sortOrder: number;
  active: boolean;
  questions: CategoryQuestion[];
}

export interface TradesPerson {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  tradeCategories: string[];
  counties: string[];
  bio: string | null;
  photos: string[];
  tier: Tier;
  subscriptionActive: boolean;
  verifiedAt: string | null;
  status: TradeStatus;
  lat: number | null;
  lng: number | null;
  baseEircode: string | null;
  baseTown: string | null;
  matchRadiusKm: number | null;
  createdAt: string;
}

export interface Job {
  id: string;
  category: string;
  title: string;
  description: string | null;
  answers: Record<string, string>;
  photos: string[];
  county: string;
  town: string | null;
  eircode: string | null;
  urgency: JobUrgency;
  budgetBand: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  preferredContact: ContactMethod;
  consentShareContact: boolean;
  consentReviewContact: boolean;
  manageToken: string;
  status: JobStatus;
  unlockCount: number;
  releasedAt: string | null;
  expiresAt: string | null;
  lat: number | null;
  lng: number | null;
  aiDecision: string | null;
  aiReasons: string[];
  moderatedAt: string | null;
  createdAt: string;
}

/**
 * Job as a trade sees it in the feed: contact fields and the exact address
 * (eircode) stripped, coordinates blurred to ~1km so the map shows an area,
 * never a house, until the lead is unlocked.
 */
export type FeedJob = Omit<
  Job,
  | "customerName"
  | "customerPhone"
  | "customerEmail"
  | "manageToken"
  | "consentShareContact"
  | "consentReviewContact"
  | "eircode"
> & { unlocked: boolean };

export interface Unlock {
  id: string;
  jobId: string;
  tradeId: string;
  unlockedAt: string;
  outcome: UnlockOutcome;
}

/** Public-safe view of a trade that has claimed a job, shown to the customer. */
export interface JobClaimant {
  businessName: string;
  tier: Tier;
  verified: boolean;
}

export interface LeadReport {
  id: string;
  jobId: string;
  tradeId: string;
  reason: string;
  status: string;
  createdAt: string;
}

/** Lead report with job + trade names, for the admin list. */
export interface LeadReportView extends LeadReport {
  jobTitle: string;
  tradeName: string;
}

export interface Review {
  id: string;
  jobId: string;
  tradeId: string;
  rating: number;
  text: string | null;
  status: ReviewStatus;
  createdAt: string;
}

export type UnlockResult =
  | { success: true }
  | {
      success: false;
      reason:
        | "subscription_inactive"
        | "not_found"
        | "not_available"
        | "not_yet_visible"
        | "allowance_exhausted"
        | "fully_claimed"
        | "already_unlocked";
    };

export interface NewJobInput {
  category: string;
  title: string;
  description: string;
  answers: Record<string, string>;
  county: string;
  town: string;
  eircode: string;
  urgency: JobUrgency;
  budgetBand: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  preferredContact: ContactMethod;
  consentShareContact: boolean;
  consentReviewContact: boolean;
}
