import * as cheerio from "cheerio";
import { scrapeWithApify } from "@/lib/apify";
import type { ScrapedContent, PostType } from "@/types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function scrapeFacebook(url: string): Promise<ScrapedContent> {
  // שיטה 1: Apify API (הכי אמין)
  try {
    const apifyResult = await scrapeWithApify(url, "facebook");
    if (apifyResult && (apifyResult.text || apifyResult.mediaUrl)) {
      return {
        platform: "facebook",
        postType: apifyResult.postType,
        text: apifyResult.text,
        mediaUrl: apifyResult.mediaUrl,
        thumbnailUrl: apifyResult.thumbnailUrl,
        authorName: apifyResult.authorName,
        authorHandle: apifyResult.authorHandle,
        originalUrl: url,
        scrapedSuccessfully: true,
        needsManualInput: false,
        videoUrl: apifyResult.videoUrl,
        transcript: null,
        frameDescription: null,
      };
    }
  } catch (err) {
    console.error("[Facebook Apify]", err);
  }

  // שיטה 2: Facebook oEmbed (fallback)
  try {
    const result = await scrapeViaOEmbed(url);
    if (result) return result;
  } catch (err) {
    console.error("[Facebook oEmbed]", err);
  }

  // שיטה 3: Meta tags fallback
  try {
    const result = await scrapeViaMeta(url);
    if (result) return result;
  } catch (err) {
    console.error("[Facebook Meta]", err);
  }

  // שיטה 4: Manual fallback
  return createPartialResult(url, "לא הצלחנו לשלוף תוכן מפייסבוק. יש להדביק את הטקסט ידנית");
}

async function scrapeViaOEmbed(url: string): Promise<ScrapedContent | null> {
  const oembedUrl = `https://www.facebook.com/plugins/post/oembed.json/?url=${encodeURIComponent(url)}`;

  const response = await fetch(oembedUrl, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return null;

  try {
    const data = (await response.json()) as {
      html?: string;
      author_name?: string;
      author_url?: string;
      title?: string;
    };

    if (!data.html) return null;

    // חילוץ תוכן מה-HTML של ה-oEmbed
    const $ = cheerio.load(data.html);
    const text = $("p").text().trim() || $("div").text().trim() || null;

    // זיהוי סוג תוכן
    let postType: PostType = "text";
    if (url.includes("/watch") || url.includes("/reel") || url.includes("fb.watch") || url.includes("/videos/")) {
      postType = "video";
    } else if (url.includes("/photo")) {
      postType = "image";
    }

    return {
      platform: "facebook",
      postType,
      text: text || data.title || null,
      mediaUrl: null,
      thumbnailUrl: null,
      authorName: data.author_name || null,
      authorHandle: null,
      originalUrl: url,
      scrapedSuccessfully: (text || data.title) !== null,
      needsManualInput: (text || data.title) === null,
      videoUrl: null,
      transcript: null,
      frameDescription: null,
      error: (text || data.title) === null ? "לא נמצא טקסט. ניתן להדביק ידנית" : undefined,
    };
  } catch {
    return null;
  }
}

async function scrapeViaMeta(url: string): Promise<ScrapedContent | null> {
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
  const ogVideo = $('meta[property="og:video"]').attr("content") || null;

  let postType: PostType = "text";
  if (ogType.includes("video") || url.includes("/watch") || url.includes("/reel") || url.includes("fb.watch")) {
    postType = "video";
  } else if (ogImage || url.includes("/photo")) {
    postType = "image";
  }

  const text = ogDescription || null;
  if (!text && !ogImage) return null;

  return {
    platform: "facebook",
    postType,
    text,
    mediaUrl: ogVideo || null,
    thumbnailUrl: ogImage,
    authorName: ogTitle || null,
    authorHandle: null,
    originalUrl: url,
    scrapedSuccessfully: text !== null,
    needsManualInput: text === null,
    videoUrl: ogVideo || null,
    transcript: null,
    frameDescription: null,
    error: text === null ? "לא נמצא טקסט. ניתן להדביק ידנית" : undefined,
  };
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
    videoUrl: null,
    transcript: null,
    frameDescription: null,
    error,
  };
}
