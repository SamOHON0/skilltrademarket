export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      <div className="flex items-center gap-3 text-ink/50">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
        Loading...
      </div>
    </div>
  );
}
