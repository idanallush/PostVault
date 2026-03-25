"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { LinkInput } from "@/components/LinkInput";
import { AnalysisResult } from "@/components/AnalysisResult";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { ManualInputFallback } from "@/components/ManualInputFallback";
import type { Post, Tag, Platform } from "@/types";

type AppState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; post: Post & { tags: Tag[] } }
  | { type: "needsManual"; url: string; platform: Platform }
  | { type: "duplicate"; message: string }
  | { type: "error"; message: string };

export default function Home() {
  const [state, setState] = useState<AppState>({ type: "idle" });

  const analyze = useCallback(async (url: string, manualText?: string, imageUrl?: string) => {
    setState({ type: "loading" });
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, manualText, imageUrl }),
      });
      const data = await response.json();
      if (response.ok) { setState({ type: "success", post: data.post }); return; }
      if (response.status === 409) { setState({ type: "duplicate", message: data.error }); return; }
      if (response.status === 422 && data.needsManualInput) {
        setState({ type: "needsManual", url, platform: data.scraped?.platform || "instagram" }); return;
      }
      if (response.status === 429) { setState({ type: "error", message: "אנא המתן מספר שניות ונסה שוב" }); return; }
      setState({ type: "error", message: data.error || "שגיאה לא צפויה" });
    } catch { setState({ type: "error", message: "שגיאה בחיבור לשרת. נסה שוב." }); }
  }, []);

  const handleSubmit = useCallback((url: string) => analyze(url), [analyze]);

  const handleManualSubmit = useCallback((text: string, imageUrl?: string) => {
    if (state.type === "needsManual") analyze(state.url, text, imageUrl);
  }, [analyze, state]);

  const handleToggleFavorite = useCallback(async () => {
    if (state.type !== "success") return;
    const post = state.post;
    const newFav = !post.is_favorite;
    setState({ type: "success", post: { ...post, is_favorite: newFav } });
    try {
      await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, isFavorite: newFav }),
      });
    } catch { setState({ type: "success", post }); }
  }, [state]);

  const handleReset = useCallback(() => setState({ type: "idle" }), []);

  const showForm = state.type === "idle" || state.type === "error" || state.type === "duplicate";

  return (
    <div className="min-h-[80vh] flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl">
        {/* Main glass panel */}
        {showForm && (
          <div className="glass-panel p-8 animate-in">
            <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">
              PostVault
            </h1>
            <p className="text-[14px] text-foreground-mid text-center mb-8 leading-relaxed">
              הדבק לינק מרשת חברתית וקבל סיכום חכם עם AI
            </p>

            <LinkInput onSubmit={handleSubmit} isLoading={false} />

            {/* Error */}
            {state.type === "error" && (
              <div className="glass-card p-3 mt-4 text-center">
                <p className="text-negative text-[13px]">{state.message}</p>
              </div>
            )}

            {/* Duplicate */}
            {state.type === "duplicate" && (
              <div className="glass-card p-3 mt-4 text-center">
                <p className="text-accent-gold text-[13px] mb-1">{state.message}</p>
                <Link href="/library" className="text-accent-blue text-[13px] hover:underline">
                  {"פתח ספרייה \u2190"}
                </Link>
              </div>
            )}

            <div className="text-center mt-6">
              <Link href="/library" className="text-[13px] text-foreground-dim hover:text-foreground transition-colors">
                {"עבור לספרייה \u2190"}
              </Link>
            </div>
          </div>
        )}

        {/* Loading */}
        {state.type === "loading" && (
          <div className="glass-panel p-8 animate-in">
            <LoadingAnalysis />
          </div>
        )}

        {/* Manual */}
        {state.type === "needsManual" && (
          <div className="glass-panel p-8 animate-in">
            <ManualInputFallback
              url={state.url}
              platform={state.platform}
              onSubmit={handleManualSubmit}
              isLoading={false}
            />
          </div>
        )}

        {/* Success */}
        {state.type === "success" && (
          <div className="animate-in">
            <AnalysisResult
              post={state.post}
              onReset={handleReset}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}
      </div>
    </div>
  );
}
