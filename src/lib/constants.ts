import type { Tier } from "./types";

// Tunable platform settings. Mirrors platform_settings in the DB; once Supabase
// is connected these become the fallback defaults, with the DB as source of truth.

export const TIER_RELEASE_OFFSETS_MINUTES: Record<Tier, number> = {
  elite: 0,
  pro: 30,
  basic: 60,
};

// null = unlimited. Per PRD decision 5 (needs James sign-off, shown openly on pricing).
export const UNLOCK_ALLOWANCES_MONTHLY: Record<Tier, number | null> = {
  basic: 10,
  pro: 25,
  elite: null,
};

export const JOB_UNLOCK_CAP = 5;
export const MATCH_RADIUS_KM = 12; // default distance radius, km
// Selectable travel radii for trades (km). 0 is treated as 'anywhere in Ireland'.
export const RADIUS_OPTIONS = [5, 10, 15, 25, 50, 100] as const;
export const JOB_EXPIRY_DAYS = 7;
// Auto-approve posted jobs straight to live (skip the admin review queue).
// Flip to false to restore the manual approval queue.
export const AUTO_APPROVE_JOBS = true;
export const ADMIN_ESCALATION_HOURS = 48;

export const TIER_PRICES_EUR: Record<Tier, number> = {
  basic: 39.99,
  pro: 59.99,
  elite: 89.99,
};

export const TIER_LABELS: Record<Tier, string> = {
  basic: "Basic",
  pro: "Pro",
  elite: "Elite",
};

export const POINTS_FORMULA = {
  completedJob: 10,
  perReviewStar: 2,
  windowDays: 90,
};

export const BUDGET_BANDS = [
  "Under EUR 250",
  "EUR 250 to 1,000",
  "EUR 1,000 to 5,000",
  "EUR 5,000 to 20,000",
  "Over EUR 20,000",
  "Not sure yet",
];

export const URGENCY_LABELS: Record<string, string> = {
  asap: "ASAP",
  this_week: "This week",
  this_month: "This month",
  flexible: "Flexible",
};

export const COUNTIES = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry",
  "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth",
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary",
  "Waterford", "Westmeath", "Wexford", "Wicklow",
];
