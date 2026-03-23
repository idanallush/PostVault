"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePosts } from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { PostCard, PostCardSkeleton } from "@/components/PostCard";

export default function LibraryPage() {
  const {
    posts,
    total,
    page,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    toggleFavorite,
    nextPage,
    prevPage,
  } = usePosts();

  const { tags } = useTags();

  // Extract unique categories from posts for filter chips
  const categories = useMemo(() => {
    const cats = new Set(posts.map((p) => p.ai_category));
    return Array.from(cats).sort();
  }, [posts]);

  const showEmpty = !loading && posts.length === 0;
  const hasFilters = filters.search || filters.platform || filters.category || filters.tag || filters.favorite;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">הספרייה שלי</h1>
        {!loading && (
          <p className="text-sm text-foreground-dim">
            {total > 0 ? `${total} פוסטים שמורים` : "עדיין אין פוסטים"}
          </p>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchBar
          value={filters.search}
          onChange={(search) => setFilters({ search })}
        />
      </div>

      {/* Filters */}
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

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-negative-bg border border-negative/20 p-4 text-center mb-6">
          <p className="text-negative text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {showEmpty && !hasFilters && (
        <div className="text-center py-16">
          <p className="text-foreground-dim text-4xl mb-4">
{"\uD83D\uDCDA"}
          </p>
          <p className="text-foreground mb-2">עדיין לא שמרת פוסטים</p>
          <p className="text-foreground-dim text-sm mb-6">התחל בהדבקת לינק לפוסט מרשת חברתית</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-accent-gold text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {"נתח פוסט חדש \u2190"}
          </Link>
        </div>
      )}

      {showEmpty && hasFilters && (
        <div className="text-center py-16">
          <p className="text-foreground mb-2">לא נמצאו פוסטים</p>
          <p className="text-foreground-dim text-sm">נסה לחפש משהו אחר או לשנות את הסינון</p>
        </div>
      )}

      {/* Posts Grid */}
      {!loading && posts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevPage}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg text-sm border border-border text-foreground-mid hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                הקודם
              </button>
              <span className="text-sm text-foreground-dim">
                עמוד {page} מתוך {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg text-sm border border-border text-foreground-mid hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                הבא
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
