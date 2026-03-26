"use client";

import Link from "next/link";
import { formatHebrewDate } from "@/lib/utils";
import type { PostWithTags } from "@/types";

interface PostCardProps {
  post: PostWithTags;
  onToggleFavorite: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  active?: boolean;
  /** When provided, clicking calls this instead of navigating via Link */
  onClick?: (id: string) => void;
}

export function PostCard({ post, onToggleFavorite, selectable, selected, onToggleSelect, active, onClick }: PostCardProps) {
  const cardContent = (
    <div className={`glass-card p-4 cursor-pointer ${
      active ? "!border-accent-blue !bg-[rgba(255,255,255,0.08)]" : ""
    } ${selected ? "!border-accent-blue ring-1 ring-accent-blue/30" : ""}`}>
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h3 className="text-[14px] font-semibold text-foreground leading-snug line-clamp-1 flex-1">
          {post.ai_summary?.split(".")[0] || post.ai_summary}
        </h3>
        {selectable && (
          <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
            selected ? "bg-accent-blue border-accent-blue" : "border-foreground-dim"
          }`}>
            {selected && <span className="text-white text-[10px]">{"\u2713"}</span>}
          </div>
        )}
        {!selectable && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(post.id); }}
            className={`text-[13px] flex-shrink-0 transition-colors ${
              post.is_favorite ? "text-accent-gold" : "text-foreground-dim hover:text-accent-gold"
            }`}
          >
            {post.is_favorite ? "\u2605" : "\u2606"}
          </button>
        )}
      </div>
      <p className="text-[13px] text-foreground-mid leading-relaxed line-clamp-2 mb-2">
        {post.ai_summary}
      </p>
      <span className="text-[11px] text-foreground-dim">{formatHebrewDate(post.created_at)}</span>
    </div>
  );

  if (selectable) {
    return <div onClick={() => onToggleSelect?.(post.id)}>{cardContent}</div>;
  }

  // If onClick handler provided (desktop split view), use div instead of Link
  if (onClick) {
    return <div onClick={() => onClick(post.id)}>{cardContent}</div>;
  }

  // Default: navigate to post page (mobile)
  return <Link href={`/post/${post.id}`} className="block">{cardContent}</Link>;
}

export function PostCardSkeleton() {
  return (
    <div className="glass-card p-4">
      <div className="skeleton-pulse h-4 w-3/4 mb-2" />
      <div className="skeleton-pulse h-3 w-full mb-1.5" />
      <div className="skeleton-pulse h-3 w-2/3 mb-3" />
      <div className="skeleton-pulse h-2.5 w-20" />
    </div>
  );
}
