"use client";

import Link from "next/link";
import type { Post, Tag } from "@/types";

interface AnalysisResultProps {
  post: Post & { tags: Tag[] };
  onReset: () => void;
  onToggleFavorite: () => void;
}

export function AnalysisResult({ post, onReset, onToggleFavorite }: AnalysisResultProps) {
  return (
    <div className="glass-panel p-6 animate-in">
      {/* Summary */}
      <p className="text-[15px] text-foreground leading-relaxed mb-5">{post.ai_summary}</p>

      <hr className="border-[var(--glass-border)] mb-5" />

      {/* Key Points */}
      {post.ai_key_points.length > 0 && (
        <section className="mb-5">
          <span className="text-[11px] uppercase tracking-wider text-foreground-dim block mb-2">נקודות מפתח</span>
          <ul className="space-y-1.5">
            {post.ai_key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px] text-foreground leading-relaxed">
                <span className="text-foreground-dim mt-1 text-[8px]">{"\u25CF"}</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Action Items */}
      {post.ai_action_items.length > 0 && (
        <section className="mb-5">
          <span className="text-[11px] uppercase tracking-wider text-foreground-dim block mb-2">צעדים לביצוע</span>
          <ol className="space-y-1.5">
            {post.ai_action_items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px] text-foreground leading-relaxed">
                <span className="text-foreground-dim font-medium min-w-[1.2rem]">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {post.tags.map((tag) => (
            <span key={tag.id} className="px-2.5 py-1 rounded-full text-[12px] bg-white/6 text-foreground-mid border border-[var(--glass-border)]">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Link href="/library" className="btn-primary text-[13px]">
          פתח ספרייה
        </Link>
        <button onClick={onToggleFavorite} className="btn-ghost text-[13px]">
          {post.is_favorite ? "\u2605 מועדף" : "\u2606 מועדף"}
        </button>
        <button onClick={onReset} className="btn-ghost text-[13px]">
          + נתח עוד
        </button>
      </div>
    </div>
  );
}
