import type { Platform } from "@/types";

/**
 * מזהה את הפלטפורמה מ-URL
 */
export function detectPlatform(url: string): Platform | null {
  const normalized = url.toLowerCase();

  if (
    normalized.includes("instagram.com") ||
    normalized.includes("instagr.am")
  ) {
    return "instagram";
  }

  if (
    normalized.includes("facebook.com") ||
    normalized.includes("fb.com") ||
    normalized.includes("fb.watch")
  ) {
    return "facebook";
  }

  if (
    normalized.includes("youtube.com") ||
    normalized.includes("youtu.be") ||
    normalized.includes("yt.be")
  ) {
    return "youtube";
  }

  return null;
}

/**
 * חילוץ shortcode מ-Instagram
 * תומך ב: instagram.com/p/XXX, instagram.com/reel/XXX, instagram.com/reels/XXX
 */
export function extractInstagramShortcode(url: string): string | null {
  const patterns = [
    /instagram\.com\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/i,
    /instagr\.am\/p\/([A-Za-z0-9_-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * חילוץ video ID מ-YouTube
 * תומך ב: youtube.com/watch?v=XXX, youtu.be/XXX, youtube.com/shorts/XXX
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?.*v=([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/v\/([A-Za-z0-9_-]{11})/i,
    /youtu\.be\/([A-Za-z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * חילוץ post identifier מ-Facebook
 * תומך ב: facebook.com/.../posts/XXX, facebook.com/photo/?fbid=XXX, fb.watch/XXX
 */
export function extractFacebookPostId(url: string): string | null {
  const patterns = [
    /facebook\.com\/.*\/posts\/([A-Za-z0-9_.-]+)/i,
    /facebook\.com\/photo\/?\?fbid=(\d+)/i,
    /facebook\.com\/.*\/photos\/[^/]+\/(\d+)/i,
    /facebook\.com\/permalink\.php\?.*story_fbid=(\d+)/i,
    /facebook\.com\/watch\/?\?v=(\d+)/i,
    /facebook\.com\/reel\/(\d+)/i,
    /fb\.watch\/([A-Za-z0-9_-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * ניקוי URL - הסרת tracking params
 */
export function cleanUrl(url: string): string {
  try {
    const parsed = new URL(url);

    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "igshid",
      "igsh",
      "ref",
      "share_source",
      "share_id",
      "si",
      "feature",
    ];

    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    // הסרת hash fragments ריקים
    if (parsed.hash === "#") {
      parsed.hash = "";
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * וולידציה - בדיקה שזה URL תקין מפלטפורמה נתמכת
 */
export function validateUrl(url: string): {
  valid: boolean;
  platform?: Platform;
  error?: string;
} {
  // בדיקת URL בסיסית
  let parsed: URL;
  try {
    // הוספת https אם חסר
    const normalized = url.match(/^https?:\/\//) ? url : `https://${url}`;
    parsed = new URL(normalized);
  } catch {
    return { valid: false, error: "הכתובת שהוזנה אינה תקינה" };
  }

  // בדיקת protocol
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { valid: false, error: "הכתובת חייבת להתחיל ב-http או https" };
  }

  // זיהוי פלטפורמה
  const platform = detectPlatform(parsed.href);
  if (!platform) {
    return {
      valid: false,
      error: "הפלטפורמה לא נתמכת. נתמכים: Instagram, Facebook, YouTube",
    };
  }

  // וולידציה ספציפית לפלטפורמה
  if (platform === "youtube" && !extractYouTubeVideoId(parsed.href)) {
    return { valid: false, platform, error: "לא הצלחנו לזהות את מזהה הסרטון ביוטיוב" };
  }

  if (platform === "instagram" && !extractInstagramShortcode(parsed.href)) {
    return { valid: false, platform, error: "לא הצלחנו לזהות את מזהה הפוסט באינסטגרם" };
  }

  return { valid: true, platform };
}
