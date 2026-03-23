"use client";

const categoryColors: Record<string, { color: string; bg: string }> = {
  "טכנולוגיה": { color: "text-accent-blue", bg: "bg-accent-blue/10" },
  "עסקים": { color: "text-accent-gold", bg: "bg-accent-gold/10" },
  "בריאות": { color: "text-accent-green", bg: "bg-accent-green/10" },
  "אוכל": { color: "text-accent-orange", bg: "bg-accent-orange/10" },
  "ספורט": { color: "text-accent-green", bg: "bg-accent-green/10" },
  "יצירתיות": { color: "text-accent-purple", bg: "bg-accent-purple/10" },
  "לימוד": { color: "text-accent-blue", bg: "bg-accent-blue/10" },
  "השראה": { color: "text-accent-gold", bg: "bg-accent-gold/10" },
  "חדשות": { color: "text-foreground-mid", bg: "bg-foreground-mid/10" },
  "טיפים": { color: "text-accent-green", bg: "bg-accent-green/10" },
  "ביקורת": { color: "text-accent-orange", bg: "bg-accent-orange/10" },
  "בידור": { color: "text-accent-purple", bg: "bg-accent-purple/10" },
  "אחר": { color: "text-foreground-dim", bg: "bg-foreground-dim/10" },
};

const contentTypeLabels: Record<string, string> = {
  tutorial: "מדריך",
  educational: "חינוכי",
  inspirational: "השראתי",
  news: "חדשות",
  review: "ביקורת",
  recipe: "מתכון",
  tip: "טיפ",
  entertainment: "בידור",
  other: "אחר",
};

export function CategoryBadge({ category }: { category: string }) {
  const config = categoryColors[category] || categoryColors["אחר"];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${config.color} ${config.bg}`}>
      {category}
    </span>
  );
}

export function ContentTypeBadge({ contentType }: { contentType: string }) {
  const label = contentTypeLabels[contentType] || contentType;
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium text-foreground-mid bg-surface border border-border">
      {label}
    </span>
  );
}
