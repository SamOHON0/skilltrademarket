import type {
  FeedJob,
  Job,
  JobClaimant,
  NewJobInput,
  Review,
  Tier,
  TradeCategory,
  TradesPerson,
  TradeStatus,
  Unlock,
  UnlockOutcome,
  UnlockResult,
} from "../types";

/**
 * Data access contract. The app talks only to this interface.
 * Swap the implementation in getDataStore() when Supabase is connected;
 * no page or component changes required.
 */
export interface DataStore {
  // Reference
  getCategories(): Promise<TradeCategory[]>;

  // Customer side (no accounts; jobs keyed to manage token)
  createJob(input: NewJobInput): Promise<Job>;
  getJobByToken(token: string): Promise<Job | null>;
  cancelJobByToken(token: string): Promise<void>;
  completeJobByToken(token: string): Promise<void>;
  getJobClaimants(jobId: string): Promise<JobClaimant[]>;

  // Trade side
  getTrade(id: string): Promise<TradesPerson | null>;
  getTradeByAuthUserId(authUserId: string): Promise<TradesPerson | null>;
  getFeed(tradeId: string): Promise<FeedJob[]>;
  unlockJob(jobId: string, tradeId: string): Promise<UnlockResult>;
  getUnlocks(tradeId: string): Promise<(Unlock & { job: Job })[]>;
  setUnlockOutcome(unlockId: string, outcome: UnlockOutcome): Promise<void>;

  // Admin
  getJobs(status?: Job["status"]): Promise<Job[]>;
  approveJob(jobId: string): Promise<void>;
  rejectJob(jobId: string): Promise<void>;
  getTrades(): Promise<TradesPerson[]>;
  setTradeStatus(tradeId: string, status: TradeStatus): Promise<void>;
  setTradeTier(tradeId: string, tier: Tier): Promise<void>;
  setTradeVerified(tradeId: string, verified: boolean): Promise<void>;
  getReviews(): Promise<Review[]>;
}

import { mockStore } from "./mock";
import { supabaseStore } from "./supabase";

// DATA_SOURCE=supabase uses the live database; anything else falls back to the
// in-memory mock store. Toggle in .env.local. See SUPABASE_SETUP.md.
export function getDataStore(): DataStore {
  return process.env.DATA_SOURCE === "supabase" ? supabaseStore : mockStore;
}
