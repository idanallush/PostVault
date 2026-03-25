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
  selectedCount, onSelectAll, onDeselectAll, onDeleteSelected,
  onAddTagToSelected, onExitSelection, tags,
}: SelectionBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  return (
    <>
      <div className="sticky top-16 z-30 glass-panel p-3 mb-4 flex items-center gap-3 flex-wrap">
        <span className="text-[13px] font-medium text-foreground">
          {selectedCount > 0 ? `${selectedCount} נבחרו` : "בחירה"}
        </span>
        <div className="flex items-center gap-1.5 flex-1">
          <button onClick={onSelectAll} className="btn-ghost text-[12px] !px-2.5 !py-1">הכל</button>
          <button onClick={onDeselectAll} className="btn-ghost text-[12px] !px-2.5 !py-1">אף אחד</button>
        </div>
        {selectedCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button onClick={() => setShowTagDropdown(!showTagDropdown)} className="btn-ghost text-[12px] !px-2.5 !py-1">
                + תגית
              </button>
              {showTagDropdown && (
                <div className="absolute top-full mt-1 start-0 glass-panel min-w-[140px] py-1 z-40">
                  {tags.map((tag) => (
                    <button key={tag.id} onClick={() => { onAddTagToSelected(tag.id); setShowTagDropdown(false); }}
                      className="w-full text-start px-3 py-1.5 text-[12px] text-foreground hover:bg-white/5 transition-colors">
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && <p className="px-3 py-1.5 text-[12px] text-foreground-dim">אין תגיות</p>}
                </div>
              )}
            </div>
            <button onClick={() => setShowDeleteConfirm(true)} className="text-[12px] px-2.5 py-1 rounded-full text-negative border border-negative/30 hover:bg-negative/10 transition-colors">
              מחק ({selectedCount})
            </button>
          </div>
        )}
        <button onClick={onExitSelection} className="btn-ghost text-[12px] !px-2.5 !py-1">סיים</button>
      </div>
      {showDeleteConfirm && (
        <ConfirmDialog
          title="מחיקת פוסטים"
          message={`בטוח למחוק ${selectedCount} פוסטים?`}
          confirmLabel="מחק"
          onConfirm={() => { setShowDeleteConfirm(false); onDeleteSelected(); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
