"use client";

import type { TagWithCount } from "@/hooks/useTags";

interface FilterBarProps {
  activePlatform: string;
  activeCategory: string;
  activeTag: string;
  favoriteOnly: boolean;
  sort: "newest" | "oldest";
  categories: string[];
  tags: TagWithCount[];
  onPlatformChange: (platform: string) => void;
  onCategoryChange: (category: string) => void;
  onTagChange: (tag: string) => void;
  onFavoriteChange: (favorite: boolean) => void;
  onSortChange: (sort: "newest" | "oldest") => void;
}

const platforms = [
  { value: "", label: "הכל" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[12px] transition-all ${
        active
          ? "bg-white/15 text-foreground border border-white/20"
          : "btn-ghost !py-1.5 !px-3 !text-[12px]"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterBar({
  activePlatform, activeCategory, activeTag, favoriteOnly, sort,
  categories, tags,
  onPlatformChange, onCategoryChange, onTagChange, onFavoriteChange, onSortChange,
}: FilterBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {platforms.map((p) => (
          <Chip key={p.value} active={activePlatform === p.value} onClick={() => onPlatformChange(p.value)}>
            {p.label}
          </Chip>
        ))}
        <div className="w-px h-4 bg-[var(--glass-border)] mx-1" />
        <Chip active={favoriteOnly} onClick={() => onFavoriteChange(!favoriteOnly)}>
          {"\u2605"} מועדפים
        </Chip>
        <div className="flex-1" />
        <Chip active={false} onClick={() => onSortChange(sort === "newest" ? "oldest" : "newest")}>
          {sort === "newest" ? "\u2193 חדש" : "\u2191 ישן"}
        </Chip>
      </div>

      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Chip key={cat} active={activeCategory === cat} onClick={() => onCategoryChange(activeCategory === cat ? "" : cat)}>
              {cat}
            </Chip>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {tags.map((tag) => (
            <Chip key={tag.id} active={activeTag === tag.id} onClick={() => onTagChange(activeTag === tag.id ? "" : tag.id)}>
              {tag.name}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
