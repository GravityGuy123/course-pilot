export default function SkeletonBlock({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="animate-pulse space-y-3">
        <div className="h-5 w-1/3 rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}