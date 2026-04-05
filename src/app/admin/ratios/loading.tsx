export default function RatiosLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-64 animate-pulse bg-muted rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}
