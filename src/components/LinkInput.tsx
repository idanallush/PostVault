"use client";

import { useState, useCallback } from "react";
import { detectPlatform } from "@/lib/parsers/url-parser";
import { PlatformBadge } from "./PlatformBadge";
import type { Platform } from "@/types";

interface LinkInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function LinkInput({ onSubmit, isLoading }: LinkInputProps) {
  const [url, setUrl] = useState("");
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((value: string) => {
    setUrl(value);
    setError(null);
    if (value.trim().length > 5) {
      const platform = detectPlatform(value);
      setDetectedPlatform(platform);
    } else {
      setDetectedPlatform(null);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("יש להזין כתובת");
      return;
    }

    const platform = detectPlatform(trimmed);
    if (!platform) {
      setError("הפלטפורמה לא נתמכת. נתמכים: Instagram, Facebook, YouTube");
      return;
    }

    setError(null);
    onSubmit(trimmed);
  }, [url, onSubmit]);

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            value={url}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSubmit()}
            placeholder="הדבק כאן לינק לפוסט..."
            disabled={isLoading}
            dir="ltr"
            className="w-full rounded-xl bg-surface border border-input-border px-4 py-3.5 text-sm text-foreground text-right placeholder:text-foreground-dim focus:outline-none focus:border-ring transition-colors disabled:opacity-50"
            aria-label="כתובת הפוסט"
          />
          {detectedPlatform && (
            <div className="absolute start-3 top-1/2 -translate-y-1/2">
              <PlatformBadge platform={detectedPlatform} />
            </div>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !url.trim()}
          className="rounded-xl bg-accent-gold px-6 py-3.5 text-sm font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          aria-label="נתח פוסט"
        >
          {isLoading ? "מנתח..." : "נתח"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-negative">{error}</p>
      )}
    </div>
  );
}
