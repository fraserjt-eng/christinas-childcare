export default function BudgetLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse bg-muted rounded" />
          <div className="h-4 w-64 animate-pulse bg-muted rounded" />
        </div>
        <div className="h-10 w-36 animate-pulse bg-muted rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse bg-muted rounded-lg" />
        ))}
      </div>
      <div className="h-64 animate-pulse bg-muted rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}
