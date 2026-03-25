"use client";

import { useEffect, useState } from "react";

const steps = ["שולף תוכן...", "מנתח תמונות...", "מעבד עם AI...", "שומר בספרייה..."];

export function LoadingAnalysis() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const progress = ((activeStep + 0.5) / steps.length) * 100;

  return (
    <div className="text-center">
      <p className="text-[15px] font-semibold text-foreground mb-2">מנתח את הפוסט...</p>
      <p className="text-[13px] text-foreground-dim mb-6">זה יכול לקחת כמה שניות</p>

      <div className="h-[3px] bg-white/5 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-accent-blue rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex flex-col gap-3 text-start max-w-xs mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-5 h-5 flex items-center justify-center text-[12px]">
              {i < activeStep ? (
                <span className="text-accent-green">{"\u2713"}</span>
              ) : i === activeStep ? (
                <svg className="animate-spin text-accent-blue" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>
              ) : (
                <span className="text-foreground-dim">{"\u23F3"}</span>
              )}
            </span>
            <span className={`text-[13px] transition-colors ${i <= activeStep ? "text-foreground" : "text-foreground-dim"}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
