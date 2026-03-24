"use client";

import { useState } from "react";
import type { Platform } from "@/types";
import { PlatformBadge } from "./PlatformBadge";

interface ManualInputFallbackProps {
  url: string;
  platform: Platform;
  onSubmit: (text: string, imageUrl?: string) => void;
  isLoading: boolean;
}

const platformInstructions: Record<Platform, string[]> = {
  instagram: [
    "פתח את הפוסט באפליקציית אינסטגרם",
    'לחץ על \u22EF (שלוש נקודות) מעל הפוסט',
    'בחר "העתק טקסט" או "Copy text"',
    "חזור לכאן והדבק",
  ],
  facebook: [
    "פתח את הפוסט בפייסבוק",
    "סמן את הטקסט של הפוסט",
    "העתק (Ctrl+C / Cmd+C)",
    "חזור לכאן והדבק",
  ],
  youtube: [
    'פתח את הסרטון ביוטיוב ולחץ "הצג עוד" בתיאור',
    "סמן את הטקסט והעתק",
    "חזור לכאן והדבק",
  ],
};

export function ManualInputFallback({ url, platform, onSubmit, isLoading }: ManualInputFallbackProps) {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isVideo, setIsVideo] = useState(
    url.includes("/reel") || url.includes("/shorts") || url.includes("/watch") || url.includes("fb.watch"),
  );

  const instructions = platformInstructions[platform];

  return (
    <div className="rounded-xl bg-surface border border-surface-border p-6">
      {/* כותרת חיובית */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">&#x1F4CB;</span>
        <div>
          <h3 className="text-foreground font-medium">הדבק את תוכן הפוסט</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <PlatformBadge platform={platform} />
            <span className="text-foreground-dim text-xs truncate max-w-xs">{url}</span>
          </div>
        </div>
      </div>

      {/* הוראות */}
      <div className="rounded-lg bg-background/50 border border-surface-border p-4 mb-4">
        <p className="text-foreground-mid text-xs font-medium mb-2">
          איך להעתיק את הטקסט:
        </p>
        <ol className="text-foreground-dim text-xs space-y-1.5 list-decimal list-inside">
          {instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {/* שדה טקסט ראשי */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="הדבק כאן את טקסט הפוסט..."
        rows={5}
        className="w-full rounded-lg bg-background border border-input-border px-4 py-3 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-ring transition-colors resize-none"
      />

      {/* Toggle וידאו */}
      <label className="flex items-center gap-2 mt-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isVideo}
          onChange={(e) => setIsVideo(e.target.checked)}
          className="rounded border-input-border accent-accent-gold"
        />
        <span className="text-foreground-mid text-sm">זה סרטון</span>
      </label>
      {isVideo && (
        <p className="text-foreground-dim text-xs mt-1 mr-6">
          אם אפשר, הדבק גם את מה שנאמר בסרטון (תמלול) בתוך שדה הטקסט למעלה
        </p>
      )}

      {/* שדה תמונה אופציונלי */}
      <div className="mt-4">
        <label className="text-foreground-mid text-xs font-medium">
          קישור לתמונה (אופציונלי)
        </label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://... (URL של תמונת הפוסט)"
          className="w-full mt-1 rounded-lg bg-background border border-input-border px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-ring transition-colors"
        />
        <p className="text-foreground-dim text-xs mt-1">
          אם תדביק קישור לתמונה, AI ינתח גם את התוכן הויזואלי
        </p>
      </div>

      {/* כפתור שליחה */}
      <button
        onClick={() => onSubmit(text, imageUrl || undefined)}
        disabled={!text.trim() || isLoading}
        className="mt-4 w-full rounded-lg bg-accent-gold px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? "מנתח..." : "נתח את הפוסט"}
      </button>
    </div>
  );
}
