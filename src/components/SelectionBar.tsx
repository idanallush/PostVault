"use client";

import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import type { Tag } from "@/types";

interface SelectionBarProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  onAddTagToSelected: (tagId: string) => void;
  onExitSelection: () => void;
  tags: (Tag & { postCount?: number })[];
}

export function SelectionBar({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  onAddTagToSelected,
  onExitSelection,
  tags,
}: SelectionBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  return (
    <>
      <div className="sticky top-16 z-30 rounded-xl bg-surface border border-surface-border p-3 mb-4 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">
          {selectedCount > 0 ? `נבחרו ${selectedCount} פוסטים` : "מצב בחירה"}
        </span>

        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={onSelectAll}
            className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground-mid hover:text-foreground transition-colors"
          >
            בחר הכל
          </button>
          <button
            onClick={onDeselectAll}
            className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground-mid hover:text-foreground transition-colors"
          >
            בטל בחירה
          </button>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            {/* Add tag */}
            <div className="relative">
              <button
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground-mid hover:text-foreground transition-colors"
              >
                + תגית לנבחרים
              </button>
              {showTagDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-surface border border-surface-border rounded-lg shadow-lg z-40 min-w-[160px] py-1">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        onAddTagToSelected(tag.id);
                        setShowTagDropdown(false);
                      }}
                      className="w-full text-start px-3 py-2 text-xs text-foreground hover:bg-background transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <p className="px-3 py-2 text-xs text-foreground-dim">אין תגיות</p>
                  )}
                </div>
              )}
            </div>

            {/* Delete */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs px-3 py-1.5 rounded-lg text-negative border border-negative/30 hover:bg-negative-bg transition-colors"
            >
              מחק ({selectedCount})
            </button>
          </div>
        )}

        <button
          onClick={onExitSelection}
          className="text-xs px-3 py-1.5 rounded-lg text-foreground-dim hover:text-foreground transition-colors"
        >
          סיים
        </button>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="מחיקת פוסטים"
          message={`בטוח שרוצה למחוק ${selectedCount} פוסטים? הפעולה בלתי הפיכה.`}
          confirmLabel="מחק"
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDeleteSelected();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
