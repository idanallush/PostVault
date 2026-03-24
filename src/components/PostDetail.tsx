"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlatformBadge } from "./PlatformBadge";
import { CategoryBadge, ContentTypeBadge } from "./CategoryBadge";
import { TagSelector } from "./TagSelector";
import { ConfirmDialog } from "./ConfirmDialog";
import { SmartImage } from "./SmartImage";
import { useTags } from "@/hooks/useTags";
import { formatHebrewDate } from "@/lib/utils";
import type { Post, Tag, Platform } from "@/types";

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
      if (tag) {
        setPost((p) => ({ ...p, tags: [...p.tags, tag] }));
      }
    }
  }, [post.id, addTagToPost, allTags]);

  const handleRemoveTag = useCallback(async (tagId: string) => {
    const ok = await removeTagFromPost(post.id, tagId);
    if (ok) {
      setPost((p) => ({ ...p, tags: p.tags.filter((t) => t.id !== tagId) }));
    }
  }, [post.id, removeTagFromPost]);

  const handleCreateTag = useCallback(async (name: string) => {
    const ok = await createTag(name);
    if (ok) {
      await refetchTags();
    }
  }, [createTag, refetchTags]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6">
      {/* Back link */}
      <Link
        href="/library"
        className="inline-flex items-center gap-1 text-sm text-foreground-mid hover:text-foreground transition-colors mb-6"
      >
{"\u2190 חזרה לספרייה"}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={post.platform as Platform} />
          <CategoryBadge category={post.ai_category} />
          {post.ai_content_type && <ContentTypeBadge contentType={post.ai_content_type} />}
        </div>
        <button
          onClick={handleToggleFavorite}
          className={`text-xl transition-colors ${
            post.is_favorite ? "text-accent-gold" : "text-foreground-dim hover:text-accent-gold"
          }`}
          aria-label={post.is_favorite ? "הסר ממועדפים" : "הוסף למועדפים"}
        >
          {post.is_favorite ? "\u2605" : "\u2606"}
        </button>
      </div>

      {/* Thumbnail */}
      <div className="rounded-xl overflow-hidden mb-6 aspect-video">
        <SmartImage
          src={post.thumbnail_url}
          alt={post.ai_summary || ""}
          platform={post.platform}
          category={post.ai_category}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Summary */}
      <section className="mb-6">
        <h2 className="text-xs font-medium text-foreground-dim mb-2">סיכום</h2>
        <p className="text-foreground leading-relaxed">{post.ai_summary}</p>
      </section>

      {/* Key Points */}
      {post.ai_key_points.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-medium text-foreground-dim mb-2">נקודות מפתח</h2>
          <ul className="space-y-1.5">
            {post.ai_key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-accent-gold mt-0.5">{"\u2022"}</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Action Items */}
      {post.ai_action_items.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-medium text-foreground-dim mb-2">צעדים לביצוע</h2>
          <ol className="space-y-1.5">
            {post.ai_action_items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-accent-gold font-medium min-w-[1.2rem]">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Tags */}
      <section className="mb-6">
        <h2 className="text-xs font-medium text-foreground-dim mb-2">תגיות</h2>
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-accent-gold/10 text-accent-gold"
            >
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="hover:text-negative transition-colors"
                aria-label={`הסר תגית ${tag.name}`}
              >
                {"\u00D7"}
              </button>
            </span>
          ))}
          <button
            onClick={() => setShowTagSelector(!showTagSelector)}
            className="px-2.5 py-1 rounded-md text-xs border border-border text-foreground-dim hover:text-foreground transition-colors"
          >
            + הוסף תגית
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
        <h2 className="text-xs font-medium text-foreground-dim mb-2">הערה אישית</h2>
        <textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setNoteChanged(true);
          }}
          placeholder="הוסף הערה אישית..."
          rows={3}
          className="w-full rounded-lg bg-surface border border-input-border px-4 py-3 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-ring transition-colors resize-none"
        />
        <div className="flex items-center gap-2 mt-2">
          {noteChanged && (
            <button
              onClick={handleSaveNote}
              className="rounded-lg bg-accent-gold px-4 py-2 text-xs font-medium text-background hover:opacity-90 transition-opacity"
            >
              שמור
            </button>
          )}
          {noteSaved && (
            <span className="text-accent-green text-xs">נשמר</span>
          )}
        </div>
      </section>

      {/* Details */}
      <section className="mb-6 rounded-xl bg-surface border border-surface-border p-4">
        <h2 className="text-xs font-medium text-foreground-dim mb-3">פרטים</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground-dim">מקור</span>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-gold hover:underline truncate max-w-[60%]"
            >
              {post.url}
            </a>
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

      {/* Original Text (Collapsible) */}
      <section className="mb-6">
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="text-sm text-foreground-mid hover:text-foreground transition-colors"
        >
          {showOriginal ? "הסתר טקסט מקורי \u25BE" : "הצג טקסט מקורי \u25B8"}
        </button>
        {showOriginal && (
          <div className="mt-3 rounded-lg bg-surface border border-surface-border p-4 text-sm text-foreground-mid leading-relaxed animate-in">
            {post.original_text || "הטקסט המקורי לא זמין"}
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3.5 py-2 rounded-lg border border-border text-sm text-foreground-mid hover:text-foreground transition-colors"
        >
          פתח מקור
        </a>
        <div className="flex-1" />
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm text-negative hover:bg-negative-bg transition-colors"
        >
          מחק פוסט
        </button>
      </div>

      {/* Delete Confirm */}
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
