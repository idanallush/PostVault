"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-4xl mb-4 text-foreground-dim">!</p>
      <h1 className="text-xl font-bold text-foreground mb-2">משהו השתבש</h1>
      <p className="text-foreground-mid text-sm mb-6">אירעה שגיאה בלתי צפויה</p>
      <button
        onClick={reset}
        className="inline-flex items-center px-4 py-2.5 rounded-lg bg-accent-gold text-background text-sm font-medium hover:opacity-90 transition-opacity"
      >
        נסה שוב
      </button>
    </div>
  );
}
