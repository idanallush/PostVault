import * as cheerio from "cheerio";
import type { ScrapedContent, PostType } from "@/types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function scrapeFacebook(url: string): Promise<ScrapedContent> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`[Facebook] HTTP ${response.status} for ${url}`);
      return createPartialResult(url, "הגישה לפייסבוק נחסמה. יש להדביק את הטקסט ידנית");
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const ogDescription = $('meta[property="og:description"]').attr("content") || null;
    const ogImage = $('meta[property="og:image"]').attr("content") || null;
    const ogTitle = $('meta[property="og:title"]').attr("content") || null;
    const ogType = $('meta[property="og:type"]').attr("content") || "";

    // זיהוי סוג התוכן
    let postType: PostType = "text";
    if (ogType.includes("video") || url.includes("/watch") || url.includes("/reel") || url.includes("fb.watch")) {
      postType = "video";
    } else if (ogImage || url.includes("/photo")) {
      postType = "image";
    }

    // חילוץ שם המחבר
    let authorName: string | null = null;
    if (ogTitle) {
      // פייסבוק בד"כ שם את שם המחבר ב-title
      authorName = ogTitle;
    }

    const text = ogDescription || null;
    const scrapedSuccessfully = text !== null;

    return {
      platform: "facebook",
      postType,
      text,
      mediaUrl: null,
      thumbnailUrl: ogImage,
      authorName,
      authorHandle: null,
      originalUrl: url,
      scrapedSuccessfully,
      needsManualInput: !scrapedSuccessfully,
      error: scrapedSuccessfully ? undefined : "לא נמצא טקסט בפוסט. ניתן להדביק ידנית",
    };
  } catch (err) {
    console.error("[Facebook Scraper]", err);
    return createPartialResult(url, "שגיאה בשליפת התוכן מפייסבוק");
  }
}

function createPartialResult(url: string, error: string): ScrapedContent {
  return {
    platform: "facebook",
    postType: "text",
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
