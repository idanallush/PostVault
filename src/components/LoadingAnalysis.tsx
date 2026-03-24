"use client";

import { useEffect, useState } from "react";

const steps = [
  { icon: "\uD83D\uDD0D", text: "מזהה פלטפורמה..." },
  { icon: "\uD83D\uDCE5", text: "שולף תוכן..." },
  { icon: "\uD83D\uDDBC\uFE0F", text: "מנתח תמונות..." },
  { icon: "\uD83C\uDFA4", text: "מתמלל אודיו..." },
  { icon: "\uD83E\uDD16", text: "מנתח עם AI..." },
  { icon: "\uD83D\uDCBE", text: "שומר בספרייה..." },
];

export function LoadingAnalysis() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
        </div>
      </div>
      <p className="text-foreground mb-1 font-medium">מנתח את הפוסט...</p>
      <p className="text-foreground-dim text-sm mb-6">זה יכול לקחת כמה שניות</p>
      <div className="flex flex-col gap-3 text-start">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-base w-6 text-center">
              {i < activeStep ? "\u2713" : step.icon}
            </span>
            <span className={`text-sm transition-colors ${
              i < activeStep
                ? "text-accent-green"
                : i === activeStep
                  ? "text-foreground"
                  : "text-foreground-dim"
            }`}>
              {step.text}
            </span>
            {i === activeStep && (
              <div className="h-1 w-1 rounded-full bg-accent-gold animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
