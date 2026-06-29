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

type JobLoc = Pick<Job, "lat" | "lng" | "county">;
type TradeLoc = Pick<TradesPerson, "lat" | "lng" | "counties">;

// Distance between a job and a trade, or null if either lacks coordinates.
export function jobDistanceKm(
  job: Pick<Job, "lat" | "lng">,
  trade: Pick<TradesPerson, "lat" | "lng">
): number | null {
  if (job.lat == null || job.lng == null || trade.lat == null || trade.lng == null)
    return null;
  return distanceKm(job.lat, job.lng, trade.lat, trade.lng);
}

// Distance when both have coordinates; otherwise fall back to county overlap.
export function matchesLocation(
  job: JobLoc,
  trade: TradeLoc,
  radiusKm: number
): boolean {
  const d = jobDistanceKm(job, trade);
  if (d != null) return d <= radiusKm;
  return trade.counties.includes(job.county);
}
