"use client";

import { useState } from "react";
import type { Platform } from "@/types";
import { PlatformBadge } from "./PlatformBadge";

interface ManualInputFallbackProps {
  url: string;
  platform: Platform;
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export function ManualInputFallback({ url, platform, onSubmit, isLoading }: ManualInputFallbackProps) {
  const [text, setText] = useState("");

  return (
    <div className="rounded-xl bg-surface border border-surface-border p-6">
      <div className="flex items-center gap-2 mb-3">
        <PlatformBadge platform={platform} />
        <span className="text-foreground-dim text-xs truncate max-w-xs">{url}</span>
      </div>
      <p className="text-foreground mb-1 font-medium">
        לא הצלחנו לשלוף את תוכן הפוסט אוטומטית
      </p>
      <p className="text-foreground-dim text-sm mb-4">
        הדבק את הטקסט ידנית כדי שנוכל לנתח אותו:
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="הדבק כאן את טקסט הפוסט..."
        rows={5}
        className="w-full rounded-lg bg-background border border-input-border px-4 py-3 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-ring transition-colors resize-none"
      />
      <button
        onClick={() => onSubmit(text)}
        disabled={!text.trim() || isLoading}
        className="mt-3 w-full rounded-lg bg-accent-gold px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? "מנתח..." : "נתח עם הטקסט הזה"}
      </button>
    </div>
  );
}
