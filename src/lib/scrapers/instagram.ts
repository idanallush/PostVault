import * as cheerio from "cheerio";
import { extractInstagramShortcode } from "@/lib/parsers/url-parser";
import type { ScrapedContent, PostType } from "@/types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function scrapeInstagram(url: string): Promise<ScrapedContent> {
  const shortcode = extractInstagramShortcode(url);

  if (!shortcode) {
    return {
      platform: "instagram",
      postType: "image",
      text: null,
      mediaUrl: null,
      thumbnailUrl: null,
      authorName: null,
      authorHandle: null,
      originalUrl: url,
      scrapedSuccessfully: false,
      needsManualInput: true,
      error: "לא הצלחנו לזהות את מזהה הפוסט",
    };
  }

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`[Instagram] HTTP ${response.status} for ${url}`);
      return createPartialResult(url, shortcode, "הגישה לאינסטגרם נחסמה. יש להדביק את הטקסט ידנית");
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const ogDescription = $('meta[property="og:description"]').attr("content") || null;
    const ogImage = $('meta[property="og:image"]').attr("content") || null;
    const ogTitle = $('meta[property="og:title"]').attr("content") || null;
    const ogType = $('meta[property="og:type"]').attr("content") || "";

    // זיהוי סוג הפוסט
    let postType: PostType = "image";
    if (url.includes("/reel") || ogType.includes("video")) {
      postType = "video";
    }

    // חילוץ שם המשתמש מ-title
    let authorHandle: string | null = null;
    let authorName: string | null = null;
    if (ogTitle) {
      // פורמט נפוץ: "Username on Instagram: ..."
      const titleMatch = ogTitle.match(/^(.+?)\s+on\s+Instagram/i);
      if (titleMatch) {
        authorName = titleMatch[1];
      }
      // פורמט נפוץ: "@handle"
      const handleMatch = ogTitle.match(/@([A-Za-z0-9_.]+)/);
      if (handleMatch) {
        authorHandle = handleMatch[1];
      }
    }

    const text = ogDescription || null;
    const scrapedSuccessfully = text !== null;

    return {
      platform: "instagram",
      postType,
      text,
      mediaUrl: null,
      thumbnailUrl: ogImage,
      authorName,
      authorHandle,
      originalUrl: url,
      scrapedSuccessfully,
      needsManualInput: !scrapedSuccessfully,
      error: scrapedSuccessfully ? undefined : "לא נמצא טקסט בפוסט. ניתן להדביק ידנית",
    };
  } catch (err) {
    console.error("[Instagram Scraper]", err);
    return createPartialResult(url, shortcode, "שגיאה בשליפת התוכן מאינסטגרם");
  }
}

function createPartialResult(url: string, _shortcode: string, error: string): ScrapedContent {
  return {
    platform: "instagram",
    postType: "image",
    text: null,
    mediaUrl: null,
    thumbnailUrl: null,
    authorName: null,
    authorHandle: null,
    originalUrl: url,
    scrapedSuccessfully: false,
    needsManualInput: true,
    error,
  };
}
