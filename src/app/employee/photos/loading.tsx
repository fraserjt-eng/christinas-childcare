export default function PhotosLoading() {
  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-1">
        <div className="h-7 w-40 animate-pulse bg-muted rounded" />
        <div className="h-4 w-72 animate-pulse bg-muted rounded" />
      </div>
      <div className="h-24 animate-pulse bg-muted rounded-lg" />
      <div className="h-48 animate-pulse bg-muted rounded-lg" />
    </div>
  );
}
