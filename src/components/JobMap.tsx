// Free map via OpenStreetMap embed (no API key, no JS library).
// marker=false shows the general area only (used pre-unlock for privacy);
// marker=true drops a pin (used on a customer's own job or after unlock).
export default function JobMap({
  lat,
  lng,
  marker = false,
  className = "h-44",
  label,
}: {
  lat: number;
  lng: number;
  marker?: boolean;
  className?: string;
  label?: string;
}) {
  const d = 0.04; // ~4km half-box
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const src =
    "https://www.openstreetmap.org/export/embed.html?bbox=" +
    encodeURIComponent(bbox) +
    "&layer=mapnik" +
    (marker ? `&marker=${lat},${lng}` : "");
  return (
    <div className={`overflow-hidden rounded-lg border border-ink/10 ${className}`}>
      <iframe
        src={src}
        className="w-full h-full"
        loading="lazy"
        title={label ?? "Job area"}
      />
    </div>
  );
}
