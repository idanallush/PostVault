"use client";

import Link from "next/link";
import { PlatformBadge } from "./PlatformBadge";
import { CategoryBadge, ContentTypeBadge } from "./CategoryBadge";
import type { Post, Tag, Platform } from "@/types";

interface AnalysisResultProps {
  post: Post & { tags: Tag[] };
  onReset: () => void;
  onToggleFavorite: () => void;
}

export function AnalysisResult({ post, onReset, onToggleFavorite }: AnalysisResultProps) {
  return (
    <div className="rounded-xl bg-surface border border-surface-border overflow-hidden animate-in">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <PlatformBadge platform={post.platform as Platform} />
          <CategoryBadge category={post.ai_category} />
          {post.ai_content_type && <ContentTypeBadge contentType={post.ai_content_type} />}
        </div>
        <p className="text-foreground text-base leading-relaxed">{post.ai_summary}</p>
      </div>

      {/* Key Points */}
      {post.ai_key_points.length > 0 && (
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-xs font-medium text-foreground-dim mb-2">נקודות מפתח</h3>
          <ul className="space-y-1.5">
            {post.ai_key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-accent-gold mt-0.5">&#x2022;</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Items */}
      {post.ai_action_items.length > 0 && (
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-xs font-medium text-foreground-dim mb-2">צעדים לביצוע</h3>
          <ol className="space-y-1.5">
            {post.ai_action_items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-accent-gold font-medium min-w-[1.2rem]">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-xs font-medium text-foreground-dim mb-2">תגיות</h3>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs bg-accent-gold/10 text-accent-gold"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 flex flex-wrap gap-2">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent-gold text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          צפה בספרייה
        </Link>
        <button
          onClick={onToggleFavorite}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm transition-colors ${
            post.is_favorite
              ? "border-accent-gold text-accent-gold"
              : "border-border text-foreground-mid hover:text-foreground hover:border-foreground-dim"
          }`}
        >
          {post.is_favorite ? "מועדף" : "סמן כמועדף"}
        </button>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm text-foreground-mid hover:text-foreground hover:border-foreground-dim transition-colors"
        >
          פתח מקור
        </a>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm text-foreground-mid hover:text-foreground hover:border-foreground-dim transition-colors"
        >
          נתח עוד
        </button>
      </div>
    </div>
  );
}
