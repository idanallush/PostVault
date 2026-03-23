export default function PostLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 animate-pulse">
      <div className="h-4 w-28 bg-border/30 rounded mb-6" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 bg-border/30 rounded" />
        <div className="h-6 w-14 bg-border/30 rounded" />
      </div>
      <div className="aspect-video bg-border/30 rounded-xl mb-6" />
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-border/30 rounded w-full" />
        <div className="h-4 bg-border/30 rounded w-4/5" />
        <div className="h-4 bg-border/30 rounded w-3/5" />
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-3 w-20 bg-border/30 rounded" />
        <div className="h-4 bg-border/30 rounded w-full" />
        <div className="h-4 bg-border/30 rounded w-5/6" />
        <div className="h-4 bg-border/30 rounded w-4/6" />
      </div>
      <div className="flex gap-2 mb-6">
        <div className="h-7 w-14 bg-border/30 rounded" />
        <div className="h-7 w-12 bg-border/30 rounded" />
        <div className="h-7 w-16 bg-border/30 rounded" />
      </div>
      <div className="h-24 bg-border/30 rounded-lg" />
    </div>
  );
}
