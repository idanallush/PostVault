import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { analyzeContent } from "@/lib/claude";
import { scrapeContent, createManualContent } from "@/lib/scrapers";
import { analyzeVideo } from "@/lib/video-analyzer";
import { validateUrl, cleanUrl } from "@/lib/parsers/url-parser";
import type { Post, Tag } from "@/types";

// CORS headers for Chrome Extension support
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

// Rate limiting בסיסי - request אחד כל 2 שניות
let lastRequestTime = 0;

export async function POST(request: Request) {
  // Rate limit check
  const now = Date.now();
  if (now - lastRequestTime < 2000) {
    return jsonResponse({ error: "יש להמתין 2 שניות בין בקשות" }, 429);
  }
  lastRequestTime = now;

  try {
    const body = (await request.json()) as {
      url?: string;
      manualText?: string;
      imageUrl?: string;
    };

    if (!body.url) {
      return jsonResponse({ error: "חסר שדה url בבקשה" }, 400);
    }

    // וולידציה
    const validation = validateUrl(body.url);
    if (!validation.valid || !validation.platform) {
      return jsonResponse({ error: validation.error || "כתובת לא תקינה" }, 400);
    }

    const cleanedUrl = cleanUrl(body.url);

    // בדיקה אם כבר קיים ב-DB
    const existing = await sql`SELECT id FROM posts WHERE url = ${cleanedUrl} LIMIT 1`;

    if (existing.length > 0) {
      return jsonResponse({ error: "הפוסט הזה כבר נשמר בעבר" }, 409);
    }

    // שליפת תוכן
    const scraped = body.manualText
      ? createManualContent(cleanedUrl, validation.platform, body.manualText, body.imageUrl)
      : await scrapeContent(cleanedUrl);

    // שדרוג: ניתוח וידאו אם רלוונטי
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

    // בדיקה שיש מספיק תוכן לנתח
    const hasContent = scraped.text || scraped.transcript || scraped.frameDescription;
    if (!hasContent && !body.manualText) {
      return jsonResponse(
        {
          error: "לא הצלחנו לשלוף תוכן מהפוסט. יש להדביק את הטקסט ידנית",
          needsManualInput: true,
          scraped,
        },
        422,
      );
    }

    // ניתוח AI
    const analysis = await analyzeContent(scraped);

    // טקסט מקורי לשמירה — שילוב כל המקורות
    const originalText =
      [
        scraped.text,
        scraped.transcript ? `[תמלול] ${scraped.transcript}` : null,
        scraped.frameDescription ? `[ויזואלי] ${scraped.frameDescription}` : null,
      ]
        .filter(Boolean)
        .join("\n\n") || null;

    // שמירה ב-DB
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

    const savedPost = rows[0] as Post;

    if (!savedPost) {
      return jsonResponse({ error: "שגיאה בשמירת הפוסט" }, 500);
    }

    // יצירת תגיות וחיבור לפוסט
    const tags: Tag[] = [];
    if (analysis.suggested_tags.length > 0) {
      for (const tagName of analysis.suggested_tags) {
        await sql`
          INSERT INTO tags (name) VALUES (${tagName})
          ON CONFLICT (name) DO NOTHING
        `;
        const tagRows = await sql`SELECT * FROM tags WHERE name = ${tagName}`;
        const tag = tagRows[0] as Tag | undefined;

        if (tag) {
          tags.push(tag);
          await sql`
            INSERT INTO posts_tags (post_id, tag_id) VALUES (${savedPost.id}, ${tag.id})
            ON CONFLICT DO NOTHING
          `;
        }
      }
    }

    return jsonResponse({
      post: { ...savedPost, tags },
      analysis,
    });
  } catch (err) {
    console.error("[API /analyze]", err);
    const message = err instanceof Error ? err.message : "שגיאה לא צפויה";
    return jsonResponse({ error: message }, 500);
  }
}
