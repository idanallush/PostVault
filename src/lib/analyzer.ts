import { sql } from "@/lib/db";
import { analyzeContent } from "@/lib/claude";
import { scrapeContent, createManualContent } from "@/lib/scrapers";
import { analyzeVideo } from "@/lib/video-analyzer";
import { validateUrl, cleanUrl } from "@/lib/parsers/url-parser";
import type { Post, Tag, PostWithTags } from "@/types";

export interface AnalyzeUrlInput {
  url: string;
  manualText?: string;
  imageUrl?: string;
}

export interface AnalyzeUrlResult {
  post: PostWithTags;
  analysis: {
    summary: string;
    category: string;
    key_points: string[];
    content_type: string;
    action_items: string[];
    suggested_tags: string[];
  };
}

export interface AnalyzeUrlError {
  error: string;
  status: number;
  needsManualInput?: boolean;
  post?: Post;
}

/**
 * Shared analysis logic used by both /api/analyze and /api/shortcut
 */
export async function analyzeUrl(
  input: AnalyzeUrlInput,
): Promise<AnalyzeUrlResult | AnalyzeUrlError> {
  if (!input.url) {
    return { error: "חסר שדה url בבקשה", status: 400 };
  }

  // וולידציה
  const validation = validateUrl(input.url);
  if (!validation.valid || !validation.platform) {
    return { error: validation.error || "כתובת לא תקינה", status: 400 };
  }

  const cleanedUrl = cleanUrl(input.url);

  // בדיקה אם כבר קיים ב-DB
  const existing = await sql`SELECT * FROM posts WHERE url = ${cleanedUrl} LIMIT 1`;
  if (existing.length > 0) {
    return { error: "הפוסט הזה כבר שמור בספרייה!", status: 409, post: existing[0] as Post };
  }

  // שליפת תוכן
  const scraped = input.manualText
    ? createManualContent(cleanedUrl, validation.platform, input.manualText, input.imageUrl)
    : await scrapeContent(cleanedUrl);

  // ניתוח וידאו אם רלוונטי
  if (scraped.postType === "video" || scraped.thumbnailUrl) {
    try {
      const videoResult = await analyzeVideo({
        videoUrl: scraped.videoUrl,
        thumbnailUrl: scraped.thumbnailUrl,
        platform: scraped.platform,
        caption: scraped.text,
      });

      if (videoResult.transcript && !scraped.transcript) {
        scraped.transcript = videoResult.transcript;
      }
      if (videoResult.frameDescriptions.length > 0 && !scraped.frameDescription) {
        scraped.frameDescription = videoResult.frameDescriptions.join("\n\n");
      }
    } catch (err) {
      console.error("[Video Analysis] Error (continuing without):", err);
    }
  }

  // בדיקה שיש מספיק תוכן
  const hasContent = scraped.text || scraped.transcript || scraped.frameDescription;
  if (!hasContent && !input.manualText) {
    return {
      error: "לא הצלחנו לשלוף תוכן מהפוסט. יש להדביק את הטקסט ידנית",
      status: 422,
      needsManualInput: true,
    };
  }

  // ניתוח AI
  const analysis = await analyzeContent(scraped);

  // טקסט מקורי לשמירה
  const originalText =
    [
      scraped.text,
      scraped.transcript ? `[תמלול] ${scraped.transcript}` : null,
      scraped.frameDescription ? `[ויזואלי] ${scraped.frameDescription}` : null,
    ]
      .filter(Boolean)
      .join("\n\n") || null;

  // שמירה ב-DB
  let savedPost: Post;
  try {
    const rows = await sql`
      INSERT INTO posts (
        url, platform, post_type, original_text, media_url, thumbnail_url,
        author_name, author_handle, ai_summary, ai_category, ai_key_points,
        ai_content_type, ai_action_items
      ) VALUES (
        ${cleanedUrl}, ${scraped.platform}, ${scraped.postType},
        ${originalText}, ${scraped.mediaUrl}, ${scraped.thumbnailUrl},
        ${scraped.authorName}, ${scraped.authorHandle},
        ${analysis.summary}, ${analysis.category},
        ${JSON.stringify(analysis.key_points)}::jsonb,
        ${analysis.content_type},
        ${JSON.stringify(analysis.action_items)}::jsonb
      ) RETURNING *
    `;
    savedPost = rows[0] as Post;
    if (!savedPost) {
      return { error: "שגיאה בשמירת הפוסט", status: 500 };
    }
  } catch (insertErr: unknown) {
    const errCode = (insertErr as { code?: string })?.code;
    if (errCode === "23505") {
      const existingRows = await sql`SELECT * FROM posts WHERE url = ${cleanedUrl} LIMIT 1`;
      if (existingRows.length > 0) {
        return { error: "הפוסט הזה כבר שמור בספרייה!", status: 409, post: existingRows[0] as Post };
      }
    }
    throw insertErr;
  }

  // יצירת תגיות
  const tags: Tag[] = [];
  if (analysis.suggested_tags.length > 0) {
    for (const tagName of analysis.suggested_tags) {
      await sql`INSERT INTO tags (name) VALUES (${tagName}) ON CONFLICT (name) DO NOTHING`;
      const tagRows = await sql`SELECT * FROM tags WHERE name = ${tagName}`;
      const tag = tagRows[0] as Tag | undefined;
      if (tag) {
        tags.push(tag);
        await sql`INSERT INTO posts_tags (post_id, tag_id) VALUES (${savedPost.id}, ${tag.id}) ON CONFLICT DO NOTHING`;
      }
    }
  }

  return {
    post: { ...savedPost, tags },
    analysis,
  };
}

/** Type guard: is the result an error? */
export function isAnalyzeError(
  result: AnalyzeUrlResult | AnalyzeUrlError,
): result is AnalyzeUrlError {
  return "error" in result && "status" in result;
}
