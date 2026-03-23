import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-6xl mb-4 text-foreground-dim">404</p>
      <h1 className="text-xl font-bold text-foreground mb-2">הדף לא נמצא</h1>
      <p className="text-foreground-mid text-sm mb-6">
        הדף שחיפשת לא קיים או שהוסר
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2.5 rounded-lg bg-accent-gold text-background text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {"\u2190 חזרה לדף הבית"}
      </Link>
    </div>
  );
}
