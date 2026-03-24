import * as cheerio from "cheerio";
import { extractInstagramShortcode } from "@/lib/parsers/url-parser";
import type { ScrapedContent, PostType } from "@/types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function scrapeInstagram(url: string): Promise<ScrapedContent> {
  const shortcode = extractInstagramShortcode(url);

  if (!shortcode) {
    return createPartialResult(url, "לא הצלחנו לזהות את מזהה הפוסט");
  }

  // שיטה 1: Embed endpoint (הכי אמין)
  try {
    const result = await scrapeViaEmbed(url, shortcode);
    if (result) return result;
  } catch (err) {
    console.error("[Instagram Embed]", err);
  }

  // שיטה 2: Meta tags fallback
  try {
    const result = await scrapeViaMeta(url, shortcode);
    if (result) return result;
  } catch (err) {
    console.error("[Instagram Meta]", err);
  }

  // שיטה 3: Manual fallback
  return createPartialResult(url, "לא הצלחנו לשלוף תוכן מאינסטגרם. יש להדביק את הטקסט ידנית");
}

async function scrapeViaEmbed(url: string, shortcode: string): Promise<ScrapedContent | null> {
  const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
  const response = await fetch(embedUrl, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    console.error(`[Instagram Embed] HTTP ${response.status}`);
    return null;
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // חילוץ caption מה-embed HTML
  let caption: string | null = null;
  const captionEl = $(".Caption, .CaptionComments, .CaptionUsername + span");
  if (captionEl.length > 0) {
    caption = captionEl.first().text().trim() || null;
  }
  // fallback: חפש ב-meta tags של ה-embed
  if (!caption) {
    caption = $('meta[property="og:description"]').attr("content") || null;
  }

  // חילוץ video URL מה-HTML (JSON escaped string)
  let videoUrl: string | null = null;
  const videoMatch = html.match(/"video_url"\s*:\s*"([^"]+)"/);
  if (videoMatch) {
    videoUrl = videoMatch[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
  }

  // חילוץ image URL
  let thumbnailUrl: string | null = null;
  const imgEl = $(".EmbeddedMediaImage, img[src*='instagram']");
  if (imgEl.length > 0) {
    thumbnailUrl = imgEl.first().attr("src") || null;
  }
  if (!thumbnailUrl) {
    thumbnailUrl = $('meta[property="og:image"]').attr("content") || null;
  }

  // חילוץ username
  let authorHandle: string | null = null;
  let authorName: string | null = null;
  const usernameEl = $(".UsernameText, a[href*='instagram.com/']");
  if (usernameEl.length > 0) {
    authorHandle = usernameEl.first().text().trim() || null;
  }

  // זיהוי סוג הפוסט
  let postType: PostType = "image";
  if (videoUrl || url.includes("/reel") || url.includes("/reels")) {
    postType = "video";
  }

  if (!caption && !videoUrl && !thumbnailUrl) {
    return null; // לא הצלחנו לחלץ כלום, עבור ל-fallback
  }

  return {
    platform: "instagram",
    postType,
    text: caption,
    mediaUrl: videoUrl || thumbnailUrl,
    thumbnailUrl,
    authorName,
    authorHandle,
    originalUrl: url,
    scrapedSuccessfully: caption !== null || videoUrl !== null,
    needsManualInput: caption === null && videoUrl === null,
    videoUrl,
    transcript: null,
    frameDescription: null,
    error: caption === null && videoUrl === null ? "לא נמצא טקסט. ניתן להדביק ידנית" : undefined,
  };
}

async function scrapeViaMeta(url: string, _shortcode: string): Promise<ScrapedContent | null> {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return null;

  const html = await response.text();
  const $ = cheerio.load(html);

  const ogDescription = $('meta[property="og:description"]').attr("content") || null;
  const ogImage = $('meta[property="og:image"]').attr("content") || null;
  const ogTitle = $('meta[property="og:title"]').attr("content") || null;
  const ogType = $('meta[property="og:type"]').attr("content") || "";

  let postType: PostType = "image";
  if (url.includes("/reel") || ogType.includes("video")) {
    postType = "video";
  }

  let authorHandle: string | null = null;
  let authorName: string | null = null;
  if (ogTitle) {
    const titleMatch = ogTitle.match(/^(.+?)\s+on\s+Instagram/i);
    if (titleMatch) authorName = titleMatch[1];
    const handleMatch = ogTitle.match(/@([A-Za-z0-9_.]+)/);
    if (handleMatch) authorHandle = handleMatch[1];
  }

  const text = ogDescription || null;
  if (!text && !ogImage) return null;

  return {
    platform: "instagram",
    postType,
    text,
    mediaUrl: null,
    thumbnailUrl: ogImage,
    authorName,
    authorHandle,
    originalUrl: url,
    scrapedSuccessfully: text !== null,
    needsManualInput: text === null,
    videoUrl: null,
    transcript: null,
    frameDescription: null,
    error: text === null ? "לא נמצא טקסט. ניתן להדביק ידנית" : undefined,
  };
}

function createPartialResult(url: string, error: string): ScrapedContent {
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
    videoUrl: null,
    transcript: null,
    frameDescription: null,
    error,
  };
}
