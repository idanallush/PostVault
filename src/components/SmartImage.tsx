"use client";

import { useState } from "react";
import { PostPlaceholder } from "./PostPlaceholder";

interface SmartImageProps {
  src: string | null | undefined;
  alt: string;
  platform: string;
  category?: string;
  title?: string;
  className?: string;
}

export function SmartImage({
  src,
  alt,
  platform,
  category,
  title,
  className = "",
}: SmartImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <PostPlaceholder
        platform={platform}
        category={category}
        title={title}
        className={className}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
