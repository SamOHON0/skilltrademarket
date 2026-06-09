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

  // Trade side
  getTrade(id: string): Promise<TradesPerson | null>;
  getFeed(tradeId: string): Promise<FeedJob[]>;
  unlockJob(jobId: string, tradeId: string): Promise<UnlockResult>;
  getUnlocks(tradeId: string): Promise<(Unlock & { job: Job })[]>;
  setUnlockOutcome(unlockId: string, outcome: UnlockOutcome): Promise<void>;

  // Admin
  getJobs(status?: Job["status"]): Promise<Job[]>;
  approveJob(jobId: string): Promise<void>;
  rejectJob(jobId: string): Promise<void>;
  getTrades(): Promise<TradesPerson[]>;
  getReviews(): Promise<Review[]>;
}

import { mockStore } from "./mock";
// import { supabaseStore } from "./supabase"; // Phase 1 hookup

export function getDataStore(): DataStore {
  // When Supabase is connected: return process.env.DATA_SOURCE === "supabase" ? supabaseStore : mockStore;
  return mockStore;
}
