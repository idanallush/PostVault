"use client";

import Link from "next/link";
import { useTheme } from "@/components/ui/theme-provider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-3 z-50 mx-auto max-w-3xl px-4">
      <nav className="glass-panel flex items-center justify-between px-5 py-2.5">
        <div className="flex items-center gap-5">
          <Link href="/" className="text-[15px] font-semibold text-foreground tracking-tight">
            PostVault
          </Link>
          <Link
            href="/library"
            className="text-[13px] text-foreground-mid hover:text-foreground transition-colors"
          >
            הספרייה
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/" className="btn-primary text-[13px] px-4 py-1.5">
            + חדש
          </Link>
          <button
            onClick={toggleTheme}
            className="icon-btn"
            aria-label={theme === "dark" ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
