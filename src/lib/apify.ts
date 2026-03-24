/**
 * Apify REST API integration (no SDK — works on any serverless platform).
 * Uses the synchronous run-and-get-dataset-items endpoint.
 * https://docs.apify.com/api/v2#/reference/actors/run-actor-synchronously-and-get-dataset-items
 */

const APIFY_BASE = "https://api.apify.com/v2/acts";

interface ApifyScrapedContent {
  text: string | null;
  mediaUrl: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  authorName: string | null;
  authorHandle: string | null;
  platform: "instagram" | "facebook";
  postType: "image" | "video" | "carousel" | "text";
}

export async function scrapeWithApify(
  url: string,
  platform: "instagram" | "facebook",
): Promise<ApifyScrapedContent | null> {
  if (!process.env.APIFY_API_TOKEN) {
    console.log("[Apify] No APIFY_API_TOKEN configured, skipping");
    return null;
  }

  try {
    return platform === "instagram"
      ? await scrapeInstagram(url)
      : await scrapeFacebook(url);
  } catch (error) {
    console.error(`[Apify] ${platform} scraping failed:`, error);
    return null;
  }
}

async function scrapeInstagram(url: string): Promise<ApifyScrapedContent | null> {
  console.log("[Apify] Running Instagram scraper via REST API...");

  const token = process.env.APIFY_API_TOKEN;
  const response = await fetch(
    `${APIFY_BASE}/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        directUrls: [url],
        resultsLimit: 1,
      }),
      signal: AbortSignal.timeout(50000),
    },
  );

  if (!response.ok) {
    console.error(`[Apify] Instagram HTTP ${response.status}`);
    return null;
  }

  const items = (await response.json()) as Record<string, unknown>[];

  if (!items || items.length === 0) {
    console.log("[Apify] Instagram: no results");
    return null;
  }

  const post = items[0];
  console.log("[Apify] Instagram: got result, type:", post.type);

  return {
    text: (post.caption as string) || null,
    mediaUrl: (post.displayUrl as string) || null,
    videoUrl: (post.videoUrl as string) || null,
    thumbnailUrl: (post.displayUrl as string) || null,
    authorName: (post.ownerFullName as string) || (post.ownerUsername as string) || null,
    authorHandle: post.ownerUsername ? `@${post.ownerUsername}` : null,
    platform: "instagram",
    postType:
      post.type === "Video"
        ? "video"
        : post.type === "Sidecar"
          ? "carousel"
          : "image",
  };
}

async function scrapeFacebook(url: string): Promise<ApifyScrapedContent | null> {
  console.log("[Apify] Running Facebook scraper via REST API...");

  const token = process.env.APIFY_API_TOKEN;
  const response = await fetch(
    `${APIFY_BASE}/apify~facebook-posts-scraper/run-sync-get-dataset-items?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls: [{ url }],
        maxPosts: 1,
      }),
      signal: AbortSignal.timeout(50000),
    },
  );

  if (!response.ok) {
    console.error(`[Apify] Facebook HTTP ${response.status}`);
    return null;
  }

  const items = (await response.json()) as Record<string, unknown>[];

  if (!items || items.length === 0) {
    console.log("[Apify] Facebook: no results");
    return null;
  }

  const post = items[0];
  const media = post.media as Array<Record<string, unknown>> | undefined;
  const hasVideo = !!(post.videoUrl || post.video);
  const hasImage = !!(post.imageUrl || post.image || media?.[0]);

  return {
    text: (post.text as string) || (post.message as string) || null,
    mediaUrl: (post.imageUrl as string) || (post.image as string) || (media?.[0]?.url as string) || null,
    videoUrl: (post.videoUrl as string) || (post.video as string) || null,
    thumbnailUrl: (post.thumbnail as string) || (post.imageUrl as string) || null,
    authorName: (post.pageName as string) || (post.userName as string) || null,
    authorHandle: null,
    platform: "facebook",
    postType: hasVideo ? "video" : hasImage ? "image" : "text",
  };
}
