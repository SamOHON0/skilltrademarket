import type { Job, TradesPerson } from "./types";

// Great-circle distance in kilometres.
export function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Blur a coordinate to 2 decimal places (~1.1km north-south). Used on
// trade-facing feed payloads so pre-unlock maps show an area, not a house.
export function blurCoord(value: number | null): number | null {
  return value == null ? null : Math.round(value * 100) / 100;
}

type JobLoc = Pick<Job, "lat" | "lng" | "county">;
type TradeLoc = Pick<
  TradesPerson,
  "lat" | "lng" | "counties" | "matchRadiusKm"
>;

// Distance between a job and a trade, or null if either lacks coordinates.
export function jobDistanceKm(
  job: Pick<Job, "lat" | "lng">,
  trade: Pick<TradesPerson, "lat" | "lng">
): number | null {
  if (job.lat == null || job.lng == null || trade.lat == null || trade.lng == null)
    return null;
  return distanceKm(job.lat, job.lng, trade.lat, trade.lng);
}

// Effective radius for a trade: their chosen value, or the platform default.
// 0 means "anywhere in Ireland" (no distance limit).
export function effectiveRadiusKm(
  trade: Pick<TradesPerson, "matchRadiusKm">,
  defaultRadiusKm: number
): number {
  return trade.matchRadiusKm == null ? defaultRadiusKm : trade.matchRadiusKm;
}

// Match within the trade's radius when both have coordinates; fall back to
// county overlap when a location is missing. Radius 0 = match anywhere.
export function matchesLocation(
  job: JobLoc,
  trade: TradeLoc,
  defaultRadiusKm: number
): boolean {
  const radius = effectiveRadiusKm(trade, defaultRadiusKm);
  if (radius === 0) return true;
  const d = jobDistanceKm(job, trade);
  if (d != null) return d <= radius;
  return trade.counties.includes(job.county);
}
