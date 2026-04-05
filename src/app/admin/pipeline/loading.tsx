export default function PipelineLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse bg-muted rounded" />
          <div className="h-4 w-80 animate-pulse bg-muted rounded" />
        </div>
        <div className="h-10 w-32 animate-pulse bg-muted rounded" />
      </div>
      <div className="flex gap-4 overflow-hidden pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-[300px] flex-1 space-y-3">
            <div className="h-6 w-28 animate-pulse bg-muted rounded" />
            {[1, 2].map((j) => (
              <div key={j} className="h-24 animate-pulse bg-muted rounded-lg" />
            ))}
          </div>
        ))}
      </div>
      <div className="h-32 animate-pulse bg-muted rounded-lg" />
    </div>
  );
}
