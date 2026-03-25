"use client";

import { useState, useEffect, useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => { setLocal(value); }, [value]);

  const handleChange = (val: string) => {
    setLocal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(val), 300);
  };

  return (
    <div className="relative">
      <svg className="absolute start-3 top-1/2 -translate-y-1/2 text-foreground-dim" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="חיפוש..."
        className="glass-input w-full ps-10 pe-10 py-2.5 text-[14px]"
      />
      {local && (
        <button
          onClick={() => { setLocal(""); onChange(""); }}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-foreground-dim hover:text-foreground transition-colors text-sm"
        >
          {"\u00D7"}
        </button>
      )}
    </div>
  );
}
