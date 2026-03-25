"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TagSelector } from "./TagSelector";
import { ConfirmDialog } from "./ConfirmDialog";
import { useTags } from "@/hooks/useTags";
import { formatHebrewDate } from "@/lib/utils";
import type { Post, Tag } from "@/types";

interface PostDetailProps {
  initialPost: Post & { tags: Tag[] };
}

export function PostDetail({ initialPost }: PostDetailProps) {
  const router = useRouter();
  const { tags: allTags, addTagToPost, removeTagFromPost, createTag, refetch: refetchTags } = useTags();

  const [post, setPost] = useState(initialPost);
  const [note, setNote] = useState(post.personal_note || "");
  const [noteChanged, setNoteChanged] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleFavorite = useCallback(async () => {
    const newFav = !post.is_favorite;
    setPost((p) => ({ ...p, is_favorite: newFav }));
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorite: newFav }),
    });
  }, [post]);

  const handleSaveNote = useCallback(async () => {
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personal_note: note || null }),
    });
    setPost((p) => ({ ...p, personal_note: note || null }));
    setNoteChanged(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }, [post.id, note]);

  const handleDelete = useCallback(async () => {
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    router.push("/library");
  }, [post.id, router]);

  const handleAddTag = useCallback(async (tagId: string) => {
    const ok = await addTagToPost(post.id, tagId);
    if (ok) {
      const tag = allTags.find((t) => t.id === tagId);
      if (tag) setPost((p) => ({ ...p, tags: [...p.tags, tag] }));
    }
  }, [post.id, addTagToPost, allTags]);

  const handleRemoveTag = useCallback(async (tagId: string) => {
    const ok = await removeTagFromPost(post.id, tagId);
    if (ok) setPost((p) => ({ ...p, tags: p.tags.filter((t) => t.id !== tagId) }));
  }, [post.id, removeTagFromPost]);

  const handleCreateTag = useCallback(async (name: string) => {
    const ok = await createTag(name);
    if (ok) await refetchTags();
  }, [createTag, refetchTags]);

  return (
    <div className="animate-in">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/library" className="text-[13px] text-foreground-dim hover:text-foreground transition-colors">
          {"\u2190 חזרה"}
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className="icon-btn"
            aria-label={post.is_favorite ? "הסר ממועדפים" : "הוסף למועדפים"}
          >
            <span className={post.is_favorite ? "text-accent-gold" : ""}>{post.is_favorite ? "\u2605" : "\u2606"}</span>
          </button>
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="פתח מקור">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <span className="text-[11px] uppercase tracking-wider text-foreground-dim block mb-1">סיכום</span>
        <p className="text-[16px] font-semibold text-foreground leading-relaxed">{post.ai_summary}</p>
      </div>

      <hr className="border-[var(--glass-border)] mb-6" />

      {/* Key Points */}
      {post.ai_key_points.length > 0 && (
        <section className="mb-6">
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
        <section className="mb-6">
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
      <section className="mb-6">
        <span className="text-[11px] uppercase tracking-wider text-foreground-dim block mb-2">תגיות</span>
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {post.tags.map((tag) => (
            <span key={tag.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] bg-white/6 text-foreground-mid border border-[var(--glass-border)]">
              {tag.name}
              <button onClick={() => handleRemoveTag(tag.id)} className="hover:text-negative transition-colors text-foreground-dim">{"\u00D7"}</button>
            </span>
          ))}
          <button onClick={() => setShowTagSelector(!showTagSelector)} className="btn-ghost text-[12px] px-2.5 py-1">
            + תגית
          </button>
        </div>
        {showTagSelector && (
          <TagSelector
            allTags={allTags}
            activeTags={post.tags}
            onAdd={handleAddTag}
            onRemove={handleRemoveTag}
            onCreate={handleCreateTag}
            onClose={() => setShowTagSelector(false)}
          />
        )}
      </section>

      {/* Personal Note */}
      <section className="mb-6">
        <span className="text-[11px] uppercase tracking-wider text-foreground-dim block mb-2">הערה אישית</span>
        <textarea
          value={note}
          onChange={(e) => { setNote(e.target.value); setNoteChanged(true); }}
          placeholder="הוסף הערה..."
          rows={3}
          className="glass-input w-full px-4 py-3 text-[14px] resize-none"
        />
        <div className="flex items-center gap-2 mt-2">
          {noteChanged && (
            <button onClick={handleSaveNote} className="btn-primary text-[13px] px-4 py-1.5">שמור</button>
          )}
          {noteSaved && <span className="text-accent-green text-[12px]">נשמר</span>}
        </div>
      </section>

      {/* Original Text */}
      <section className="mb-6">
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="text-[13px] text-foreground-dim hover:text-foreground transition-colors"
        >
          {showOriginal ? "הסתר טקסט מקורי \u25BE" : "הצג טקסט מקורי \u25B8"}
        </button>
        {showOriginal && (
          <div className="mt-3 glass-card p-4 text-[13px] text-foreground-mid leading-relaxed">
            {post.original_text || "הטקסט המקורי לא זמין"}
          </div>
        )}
      </section>

      {/* Details */}
      <section className="mb-6 glass-card p-4">
        <span className="text-[11px] uppercase tracking-wider text-foreground-dim block mb-3">פרטים</span>
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-foreground-dim">פלטפורמה</span>
            <span className="text-foreground">{post.platform}</span>
          </div>
          {post.author_name && (
            <div className="flex justify-between">
              <span className="text-foreground-dim">מאת</span>
              <span className="text-foreground">{post.author_name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-foreground-dim">נשמר</span>
            <span className="text-foreground">{formatHebrewDate(post.created_at)}</span>
          </div>
        </div>
      </section>

      {/* Delete */}
      <div className="pt-4 border-t border-[var(--glass-border)]">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-[13px] text-negative hover:underline"
        >
          מחק פוסט
        </button>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="מחיקת פוסט"
          message="בטוח שרוצה למחוק את הפוסט? הפעולה בלתי הפיכה."
          confirmLabel="מחק"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
