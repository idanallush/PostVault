import { PostCardSkeleton } from "@/components/PostCard";

export default function LibraryLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="h-7 w-32 bg-border/30 rounded mb-2 animate-pulse" />
        <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
      </div>
      <div className="h-10 bg-border/30 rounded-lg mb-4 animate-pulse" />
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-border/30 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
