import { YoutubeTranscript } from "youtube-transcript";
import { extractYouTubeVideoId } from "@/lib/parsers/url-parser";
import type { ScrapedContent } from "@/types";

interface OEmbedResponse {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
  type: string;
}

export async function scrapeYouTube(url: string): Promise<ScrapedContent> {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return {
      platform: "youtube",
      postType: "video",
      text: null,
      mediaUrl: null,
      thumbnailUrl: null,
      authorName: null,
      authorHandle: null,
      originalUrl: url,
      scrapedSuccessfully: false,
      needsManualInput: true,
      error: "לא הצלחנו לזהות את מזהה הסרטון",
    };
  }

  let title: string | null = null;
  let authorName: string | null = null;
  let thumbnailUrl: string | null = null;

  // שלב 1: oEmbed metadata
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = (await response.json()) as OEmbedResponse;
      title = data.title || null;
      authorName = data.author_name || null;
      thumbnailUrl = data.thumbnail_url || null;
    }
  } catch (err) {
    console.error("[YouTube oEmbed]", err);
  }

  // fallback thumbnail
  if (!thumbnailUrl) {
    thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  // שלב 2: transcript
  let transcriptText: string | null = null;
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (transcript.length > 0) {
      transcriptText = transcript.map((t) => t.text).join(" ");
    }
  } catch (err) {
    console.error("[YouTube Transcript]", err);
  }

  // שלב 3: הרכבת תוצאה
  const text = transcriptText || title || null;
  const scrapedSuccessfully = text !== null;

  return {
    platform: "youtube",
    postType: "video",
    text,
    mediaUrl: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl,
    authorName,
    authorHandle: null,
    originalUrl: url,
    scrapedSuccessfully,
    needsManualInput: !scrapedSuccessfully,
    error: scrapedSuccessfully ? undefined : "לא הצלחנו לשלוף את תוכן הסרטון",
  };
}
