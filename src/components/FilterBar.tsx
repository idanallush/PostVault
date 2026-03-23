"use client";

import type { Platform } from "@/types";
import type { TagWithCount } from "@/hooks/useTags";

interface FilterBarProps {
  activePlatform: string;
  activeCategory: string;
  activeTag: string;
  favoriteOnly: boolean;
  sort: "newest" | "oldest";
  categories: string[];
  tags: TagWithCount[];
  onPlatformChange: (platform: string) => void;
  onCategoryChange: (category: string) => void;
  onTagChange: (tag: string) => void;
  onFavoriteChange: (favorite: boolean) => void;
  onSortChange: (sort: "newest" | "oldest") => void;
}

const platforms: { value: string; label: string }[] = [
  { value: "", label: "הכל" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
];

export function FilterBar({
  activePlatform,
  activeCategory,
  activeTag,
  favoriteOnly,
  sort,
  categories,
  tags,
  onPlatformChange,
  onCategoryChange,
  onTagChange,
  onFavoriteChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Platform + Favorite + Sort */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {platforms.map((p) => (
          <button
            key={p.value}
            onClick={() => onPlatformChange(p.value)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activePlatform === p.value
                ? "bg-accent-gold text-background"
                : "bg-surface border border-border text-foreground-mid hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="w-px h-5 bg-border mx-1" />
        <button
          onClick={() => onFavoriteChange(!favoriteOnly)}
          className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            favoriteOnly
              ? "bg-accent-gold text-background"
              : "bg-surface border border-border text-foreground-mid hover:text-foreground"
          }`}
        >
          {favoriteOnly ? "מועדפים" : "מועדפים"}
        </button>
        <div className="flex-1" />
        <button
          onClick={() => onSortChange(sort === "newest" ? "oldest" : "newest")}
          className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-foreground-mid hover:text-foreground transition-colors"
        >
          {sort === "newest" ? "חדש \u2190 ישן" : "ישן \u2190 חדש"}
        </button>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-xs text-foreground-dim whitespace-nowrap">קטגוריה:</span>
          <button
            onClick={() => onCategoryChange("")}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md text-xs transition-colors ${
              !activeCategory
                ? "bg-accent-gold/20 text-accent-gold"
                : "text-foreground-dim hover:text-foreground"
            }`}
          >
            הכל
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(activeCategory === cat ? "" : cat)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-md text-xs transition-colors ${
                activeCategory === cat
                  ? "bg-accent-gold/20 text-accent-gold"
                  : "text-foreground-dim hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-xs text-foreground-dim whitespace-nowrap">תגית:</span>
          <button
            onClick={() => onTagChange("")}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md text-xs transition-colors ${
              !activeTag
                ? "bg-accent-purple/20 text-accent-purple"
                : "text-foreground-dim hover:text-foreground"
            }`}
          >
            הכל
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagChange(activeTag === tag.id ? "" : tag.id)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-md text-xs transition-colors ${
                activeTag === tag.id
                  ? "bg-accent-purple/20 text-accent-purple"
                  : "text-foreground-dim hover:text-foreground"
              }`}
            >
              {tag.name}
              <span className="text-foreground-dim ms-1">({tag.postCount})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
