"use client";

import type { Platform } from "@/types";

const platformConfig: Record<Platform, { label: string; color: string; bg: string }> = {
  instagram: { label: "אינסטגרם", color: "text-purple-400", bg: "bg-purple-400/10" },
  facebook: { label: "פייסבוק", color: "text-accent-blue", bg: "bg-accent-blue/10" },
  youtube: { label: "יוטיוב", color: "text-red-400", bg: "bg-red-400/10" },
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  const config = platformConfig[platform];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}
