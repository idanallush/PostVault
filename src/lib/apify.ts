import { ApifyClient } from "apify-client";

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN!,
});

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

/**
 * Scrape with Apify — with timeout wrapper.
 * Apify Actors can take 30-90 seconds. We cap at 45s so Vercel (60s) doesn't timeout.
 */
export async function scrapeWithApify(
  url: string,
  platform: "instagram" | "facebook",
): Promise<ApifyScrapedContent | null> {
  if (!process.env.APIFY_API_TOKEN) {
    console.log("[Apify] No APIFY_API_TOKEN configured, skipping");
    return null;
  }

  try {
    const result = await Promise.race([
      platform === "instagram" ? scrapeInstagram(url) : scrapeFacebook(url),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Apify timeout")), 45000),
      ),
    ]);
    return result;
  } catch (error) {
    console.error(`[Apify] ${platform} scraping failed:`, error);
    return null;
  }
}

async function scrapeInstagram(url: string): Promise<ApifyScrapedContent | null> {
  console.log("[Apify] Running Instagram scraper...");

  const run = await client.actor("apify/instagram-scraper").call(
    {
      directUrls: [url],
      resultsLimit: 1,
    },
    { timeout: 120, memory: 256 },
  );

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  if (!items || items.length === 0) {
    console.log("[Apify] Instagram: no results");
    return null;
  }

  const post = items[0] as Record<string, unknown>;
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
  console.log("[Apify] Running Facebook scraper...");

  const run = await client.actor("apify/facebook-posts-scraper").call(
    {
      startUrls: [{ url }],
      maxPosts: 1,
    },
    { timeout: 120, memory: 256 },
  );

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  if (!items || items.length === 0) {
    console.log("[Apify] Facebook: no results");
    return null;
  }

  const post = items[0] as Record<string, unknown>;
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
