"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { usePosts } from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { PostCard, PostCardSkeleton } from "@/components/PostCard";
import { PostDetail } from "@/components/PostDetail";
import { SelectionBar } from "@/components/SelectionBar";
import type { PostWithTags } from "@/types";

export default function LibraryPage() {
  const {
    posts, total, page, totalPages, loading, error, filters, setFilters,
    toggleFavorite, nextPage, prevPage, refetch,
  } = usePosts();
  const { tags } = useTags();

  // Selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Split view — selected post for detail panel
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const activePost = useMemo(
    () => posts.find((p) => p.id === activePostId) || null,
    [posts, activePostId],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await fetch("/api/posts/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setSelectedIds(new Set());
    setSelectionMode(false);
    refetch();
  }, [selectedIds, refetch]);

  const handleBulkAddTag = useCallback(async (tagId: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await fetch("/api/posts/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, tagId }),
    });
    refetch();
  }, [selectedIds, refetch]);

  const categories = useMemo(() => {
    return Array.from(new Set(posts.map((p) => p.ai_category))).sort();
  }, [posts]);

  const showEmpty = !loading && posts.length === 0;
  const hasFilters = filters.search || filters.platform || filters.category || filters.tag || filters.favorite;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground mb-0.5">הספרייה</h1>
          {!loading && total > 0 && (
            <p className="text-[13px] text-foreground-dim">{total} פוסטים</p>
          )}
        </div>
        {posts.length > 0 && !selectionMode && (
          <button onClick={() => setSelectionMode(true)} className="btn-ghost text-[13px]">
            בחר
          </button>
        )}
      </div>

      {/* Selection Bar */}
      {selectionMode && (
        <SelectionBar
          selectedCount={selectedIds.size}
          onSelectAll={() => setSelectedIds(new Set(posts.map((p) => p.id)))}
          onDeselectAll={() => setSelectedIds(new Set())}
          onDeleteSelected={handleBulkDelete}
          onAddTagToSelected={handleBulkAddTag}
          onExitSelection={() => { setSelectionMode(false); setSelectedIds(new Set()); }}
          tags={tags}
        />
      )}

      {/* Search + Filters */}
      <div className="mb-4">
        <SearchBar value={filters.search} onChange={(search) => setFilters({ search })} />
      </div>
      <div className="mb-6">
        <FilterBar
          activePlatform={filters.platform}
          activeCategory={filters.category}
          activeTag={filters.tag}
          favoriteOnly={filters.favorite}
          sort={filters.sort}
          categories={categories}
          tags={tags}
          onPlatformChange={(platform) => setFilters({ platform })}
          onCategoryChange={(category) => setFilters({ category })}
          onTagChange={(tag) => setFilters({ tag })}
          onFavoriteChange={(favorite) => setFilters({ favorite })}
          onSortChange={(sort) => setFilters({ sort })}
        />
      </div>

      {error && (
        <div className="glass-card p-4 text-center mb-6">
          <p className="text-negative text-[13px]">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex gap-4">
          <div className="w-80 flex-shrink-0 space-y-2 hidden md:block">
            {Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
          <div className="flex-1 glass-panel p-8">
            <div className="skeleton-pulse h-6 w-48 mb-4" />
            <div className="skeleton-pulse h-4 w-full mb-2" />
            <div className="skeleton-pulse h-4 w-3/4" />
          </div>
        </div>
      )}

      {/* Empty */}
      {showEmpty && !hasFilters && (
        <div className="glass-panel p-12 text-center">
          <p className="text-foreground mb-2">עדיין אין פוסטים שמורים</p>
          <p className="text-foreground-dim text-[13px] mb-6">הדבק לינק מרשת חברתית כדי להתחיל</p>
          <Link href="/" className="btn-primary inline-block">{"\u2190 הדבק לינק"}</Link>
        </div>
      )}
      {showEmpty && hasFilters && (
        <div className="glass-panel p-12 text-center">
          <p className="text-foreground mb-1">לא נמצאו פוסטים</p>
          <p className="text-foreground-dim text-[13px]">נסה לשנות את החיפוש או הסינון</p>
        </div>
      )}

      {/* Split view: Sidebar + Detail */}
      {!loading && posts.length > 0 && (
        <div className="flex gap-4">
          {/* Sidebar — post list */}
          <div className="w-full md:w-80 flex-shrink-0 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {posts.map((post) => (
              <div key={post.id} onClick={() => !selectionMode && setActivePostId(post.id)}>
                <PostCard
                  post={post}
                  onToggleFavorite={toggleFavorite}
                  selectable={selectionMode}
                  selected={selectedIds.has(post.id)}
                  onToggleSelect={toggleSelect}
                  active={post.id === activePostId}
                />
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button onClick={prevPage} disabled={page <= 1} className="btn-ghost text-[12px] disabled:opacity-30">
                  הקודם
                </button>
                <span className="text-[12px] text-foreground-dim">{page} / {totalPages}</span>
                <button onClick={nextPage} disabled={page >= totalPages} className="btn-ghost text-[12px] disabled:opacity-30">
                  הבא
                </button>
              </div>
            )}
          </div>

          {/* Detail panel — desktop only */}
          <div className="hidden md:block flex-1">
            {activePost ? (
              <div className="glass-panel p-6 sticky top-20">
                <PostDetail initialPost={activePost as PostWithTags & { tags: never[] }} />
              </div>
            ) : (
              <div className="glass-panel p-12 text-center sticky top-20">
                <p className="text-foreground-dim text-[14px]">בחר פוסט מהרשימה</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
