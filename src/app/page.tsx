"use client";

import { useState, useCallback } from "react";
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

  const analyze = useCallback(async (url: string, manualText?: string) => {
    setState({ type: "loading" });

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, manualText }),
      });

      const data = await response.json();

      if (response.ok) {
        setState({ type: "success", post: data.post });
        return;
      }

      if (response.status === 409) {
        setState({ type: "duplicate", message: data.error });
        return;
      }

      if (response.status === 422 && data.needsManualInput) {
        const platform = data.scraped?.platform || "instagram";
        setState({ type: "needsManual", url, platform });
        return;
      }

      if (response.status === 429) {
        setState({ type: "error", message: "אנא המתן מספר שניות ונסה שוב" });
        return;
      }

      setState({ type: "error", message: data.error || "שגיאה לא צפויה" });
    } catch {
      setState({ type: "error", message: "שגיאה בחיבור לשרת. נסה שוב." });
    }
  }, []);

  const handleSubmit = useCallback((url: string) => {
    analyze(url);
  }, [analyze]);

  const handleManualSubmit = useCallback((text: string) => {
    if (state.type === "needsManual") {
      analyze(state.url, text);
    }
  }, [analyze, state]);

  const handleToggleFavorite = useCallback(async () => {
    if (state.type !== "success") return;
    const post = state.post;
    const newFav = !post.is_favorite;

    setState({
      type: "success",
      post: { ...post, is_favorite: newFav },
    });

    try {
      await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, isFavorite: newFav }),
      });
    } catch {
      // Revert on error
      setState({ type: "success", post });
    }
  }, [state]);

  const handleReset = useCallback(() => {
    setState({ type: "idle" });
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6">
      {/* Hero */}
      {(state.type === "idle" || state.type === "error" || state.type === "duplicate") && (
        <div className="pt-16 pb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            שמור. נתח. חזור אליו.
          </h1>
          <p className="text-foreground-mid text-base sm:text-lg mb-6">
            הדבק לינק מאינסטגרם, פייסבוק או יוטיוב וקבל סיכום חכם עם AI
          </p>
          <div className="flex items-center justify-center gap-6 text-foreground-dim text-sm">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              YouTube
            </span>
          </div>
        </div>
      )}

      {/* Link Input */}
      {(state.type === "idle" || state.type === "error" || state.type === "duplicate") && (
        <div className="pb-8">
          <LinkInput onSubmit={handleSubmit} isLoading={false} />
        </div>
      )}

      {/* Error State */}
      {state.type === "error" && (
        <div className="rounded-xl bg-negative-bg border border-negative/20 p-4 text-center">
          <p className="text-negative text-sm">{state.message}</p>
        </div>
      )}

      {/* Duplicate State */}
      {state.type === "duplicate" && (
        <div className="rounded-xl bg-accent-gold/10 border border-accent-gold/20 p-4 text-center">
          <p className="text-accent-gold text-sm mb-2">{state.message}</p>
          <a href="/library" className="text-accent-gold text-sm font-medium hover:underline">
            {"צפה בספרייה \u2190"}
          </a>
        </div>
      )}

      {/* Loading State */}
      {state.type === "loading" && (
        <div className="py-16">
          <LoadingAnalysis />
        </div>
      )}

      {/* Manual Input Fallback */}
      {state.type === "needsManual" && (
        <div className="py-8">
          <ManualInputFallback
            url={state.url}
            platform={state.platform}
            onSubmit={handleManualSubmit}
            isLoading={false}
          />
        </div>
      )}

      {/* Success State */}
      {state.type === "success" && (
        <div className="py-8">
          <AnalysisResult
            post={state.post}
            onReset={handleReset}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      )}
    </div>
  );
}
