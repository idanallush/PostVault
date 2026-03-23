import { validateUrl, cleanUrl } from "@/lib/parsers/url-parser";
import { scrapeYouTube } from "./youtube";
import { scrapeInstagram } from "./instagram";
import { scrapeFacebook } from "./facebook";
import type { Platform, PostType, ScrapedContent } from "@/types";

/**
 * Router ראשי - מנתב ל-scraper הנכון לפי פלטפורמה
 */
export async function scrapeContent(url: string): Promise<ScrapedContent> {
  const validation = validateUrl(url);

  if (!validation.valid || !validation.platform) {
    return {
      platform: "instagram",
      postType: "text",
      text: null,
      mediaUrl: null,
      thumbnailUrl: null,
      authorName: null,
      authorHandle: null,
      originalUrl: url,
      scrapedSuccessfully: false,
      needsManualInput: true,
      error: validation.error || "כתובת לא תקינה",
    };
  }

  const cleanedUrl = cleanUrl(url);

  switch (validation.platform) {
    case "youtube":
      return scrapeYouTube(cleanedUrl);
    case "instagram":
      return scrapeInstagram(cleanedUrl);
    case "facebook":
      return scrapeFacebook(cleanedUrl);
  }
}

/**
 * למקרה שה-scraping נכשל - המשתמש מדביק טקסט ידנית
 */
export function createManualContent(
  url: string,
  platform: Platform,
  text: string,
  imageUrl?: string,
): ScrapedContent {
  let postType: PostType = "text";
  if (imageUrl) postType = "image";
  if (
    url.includes("/reel") ||
    url.includes("/shorts") ||
    url.includes("/watch") ||
    url.includes("fb.watch")
  ) {
    postType = "video";
  }

  return {
    platform,
    postType,
    text,
    mediaUrl: imageUrl || null,
    thumbnailUrl: imageUrl || null,
    authorName: null,
    authorHandle: null,
    originalUrl: url,
    scrapedSuccessfully: true,
    needsManualInput: false,
  };
}
