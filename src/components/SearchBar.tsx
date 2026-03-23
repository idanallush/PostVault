"use client";

import { useState, useEffect, useRef } from "react";

interface SearchBarProps {
  onChange: (query: string) => void;
  value?: string;
}

export function SearchBar({ onChange, value = "" }: SearchBarProps) {
  const [input, setInput] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  const handleChange = (val: string) => {
    setInput(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(val), 300);
  };

  const handleClear = () => {
    setInput("");
    onChange("");
  };

  return (
    <div className="relative">
      <span className="absolute start-3 top-1/2 -translate-y-1/2 text-foreground-dim text-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="text"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="חפש בפוסטים..."
        className="w-full rounded-lg bg-surface border border-input-border ps-9 pe-9 py-2.5 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-ring transition-colors"
        aria-label="חיפוש"
      />
      {input && (
        <button
          onClick={handleClear}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-foreground-dim hover:text-foreground transition-colors"
          aria-label="נקה חיפוש"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
