"use client";

import Link from "next/link";
import { PlatformBadge } from "./PlatformBadge";
import { CategoryBadge, ContentTypeBadge } from "./CategoryBadge";
import { formatHebrewDate } from "@/lib/utils";
import type { PostWithTags, Platform } from "@/types";

interface PostCardProps {
  post: PostWithTags;
  onToggleFavorite: (id: string) => void;
}

export function PostCard({ post, onToggleFavorite }: PostCardProps) {
  const maxTags = 3;
  const visibleTags = post.tags.slice(0, maxTags);
  const extraCount = post.tags.length - maxTags;

  return (
    <div className="group rounded-xl bg-surface border border-surface-border overflow-hidden hover:border-foreground-dim/20 transition-all">
      {/* Thumbnail */}
      {post.thumbnail_url && (
        <div className="aspect-video bg-background overflow-hidden">
          <img
            src={post.thumbnail_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4">
        {/* Header: Platform + Favorite */}
        <div className="flex items-center justify-between mb-2">
          <PlatformBadge platform={post.platform as Platform} />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(post.id);
            }}
            className={`text-sm transition-colors ${
              post.is_favorite ? "text-accent-gold" : "text-foreground-dim hover:text-accent-gold"
            }`}
            aria-label={post.is_favorite ? "הסר ממועדפים" : "הוסף למועדפים"}
          >
            {post.is_favorite ? "\u2605" : "\u2606"}
          </button>
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground leading-relaxed line-clamp-2 mb-3">
          {post.ai_summary}
        </p>

        {/* Category + Content Type */}
        <div className="flex items-center gap-1.5 mb-3">
          <CategoryBadge category={post.ai_category} />
          {post.ai_content_type && <ContentTypeBadge contentType={post.ai_content_type} />}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {visibleTags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded text-[11px] bg-accent-gold/10 text-accent-gold"
              >
                {tag.name}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] text-foreground-dim">
                +{extraCount}
              </span>
            )}
          </div>
        )}

        {/* Date */}
        <p className="text-xs text-foreground-dim">
          {formatHebrewDate(post.created_at)}
        </p>
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-xl bg-surface border border-surface-border overflow-hidden animate-pulse">
      <div className="aspect-video bg-border/30" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-border/30 rounded" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 bg-border/30 rounded w-full" />
          <div className="h-4 bg-border/30 rounded w-3/4" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-14 bg-border/30 rounded" />
          <div className="h-5 w-12 bg-border/30 rounded" />
        </div>
        <div className="h-3 w-24 bg-border/30 rounded" />
      </div>
    </div>
  );
}
