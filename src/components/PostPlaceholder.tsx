"use client";

const PLATFORM_STYLES: Record<string, { gradient: string; icon: string }> = {
  instagram: {
    gradient: "from-fuchsia-900/40 via-purple-900/30 to-pink-900/40",
    icon: "\uD83D\uDCF8",
  },
  facebook: {
    gradient: "from-blue-900/40 via-blue-800/30 to-indigo-900/40",
    icon: "\uD83D\uDCD8",
  },
  youtube: {
    gradient: "from-red-900/40 via-red-800/30 to-orange-900/40",
    icon: "\u25B6\uFE0F",
  },
};

interface PostPlaceholderProps {
  platform: string;
  category?: string;
  title?: string;
  className?: string;
}

export function PostPlaceholder({
  platform,
  category,
  title,
  className = "",
}: PostPlaceholderProps) {
  const style = PLATFORM_STYLES[platform] || PLATFORM_STYLES.instagram;

  return (
    <div
      className={`relative flex flex-col items-center justify-center bg-gradient-to-br ${style.gradient} ${className}`}
    >
      {/* subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <span className="relative text-3xl mb-2 select-none">{style.icon}</span>

      {category && (
        <span className="relative text-xs font-medium text-foreground-dim/70">
          {category}
        </span>
      )}

      {title && (
        <span className="relative text-[11px] text-foreground-dim/50 mt-1 max-w-[80%] text-center line-clamp-1">
          {title}
        </span>
      )}
    </div>
  );
}
