"use client";

import { useState, useCallback } from "react";
import { detectPlatform } from "@/lib/parsers/url-parser";
import type { Platform } from "@/types";

interface LinkInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

export function LinkInput({ onSubmit, isLoading }: LinkInputProps) {
  const [url, setUrl] = useState("");
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((value: string) => {
    setUrl(value);
    setError(null);
    setDetectedPlatform(value.trim().length > 5 ? detectPlatform(value) : null);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) { setError("יש להזין כתובת"); return; }
    if (!detectPlatform(trimmed)) { setError("נתמכים: Instagram, Facebook, YouTube"); return; }
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
            placeholder="הדבק לינק לפוסט..."
            disabled={isLoading}
            dir="ltr"
            className="glass-input w-full px-4 py-3 text-[14px] text-right placeholder:text-foreground-dim disabled:opacity-50"
            aria-label="כתובת הפוסט"
          />
          {detectedPlatform && (
            <div className="absolute start-3 top-1/2 -translate-y-1/2">
              <span className="text-[11px] text-foreground-dim bg-white/5 px-2 py-0.5 rounded-full">
                {PLATFORM_LABELS[detectedPlatform]}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !url.trim()}
          className="btn-primary whitespace-nowrap"
          aria-label="נתח פוסט"
        >
          {isLoading ? "מנתח..." : "נתח"}
        </button>
      </div>
      {error && <p className="mt-2 text-[13px] text-negative">{error}</p>}
    </div>
  );
}
