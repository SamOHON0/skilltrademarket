// Free geocoding via OpenStreetMap Nominatim. Server-side only.
// Results are stored on the row, so each address is geocoded once (the cache).
// Nominatim asks for a descriptive User-Agent and ~1 req/sec; fine for
// post-a-job and signup events.

export async function geocode(
  parts: (string | null | undefined)[]
): Promise<{ lat: number; lng: number } | null> {
  const q = parts.filter((p) => p && p.trim()).join(", ");
  if (!q) return null;
  try {
    const url =
      "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ie&q=" +
      encodeURIComponent(`${q}, Ireland`);
    const res = await fetch(url, {
      headers: { "User-Agent": "SkillTrade/1.0 (hello@skilltrade.ie)" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(data) || data.length === 0) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
