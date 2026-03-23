"use client";

import { useState } from "react";
import type { Tag } from "@/types";
import type { TagWithCount } from "@/hooks/useTags";

interface TagSelectorProps {
  allTags: TagWithCount[];
  activeTags: Tag[];
  onAdd: (tagId: string) => void;
  onRemove: (tagId: string) => void;
  onCreate: (name: string) => void;
  onClose: () => void;
}

export function TagSelector({
  allTags,
  activeTags,
  onAdd,
  onRemove,
  onCreate,
  onClose,
}: TagSelectorProps) {
  const [newTagName, setNewTagName] = useState("");
  const activeIds = new Set(activeTags.map((t) => t.id));

  const handleCreate = () => {
    const name = newTagName.trim();
    if (!name) return;
    onCreate(name);
    setNewTagName("");
  };

  return (
    <div className="rounded-xl bg-surface border border-surface-border p-4 animate-in">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground">ניהול תגיות</h4>
        <button
          onClick={onClose}
          className="text-foreground-dim hover:text-foreground transition-colors"
          aria-label="סגור"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Existing tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {allTags.map((tag) => {
            const isActive = activeIds.has(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => (isActive ? onRemove(tag.id) : onAdd(tag.id))}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  isActive
                    ? "bg-accent-gold/20 text-accent-gold"
                    : "bg-background text-foreground-dim hover:text-foreground"
                }`}
              >
                {isActive ? "\u2713 " : ""}{tag.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Create new tag */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="תגית חדשה..."
          className="flex-1 rounded-lg bg-background border border-input-border px-3 py-2 text-xs text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-ring transition-colors"
        />
        <button
          onClick={handleCreate}
          disabled={!newTagName.trim()}
          className="rounded-lg bg-accent-gold px-3 py-2 text-xs font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          צור
        </button>
      </div>
    </div>
  );
}
