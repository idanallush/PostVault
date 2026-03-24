import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { analyzeContent } from "@/lib/claude";
import { scrapeContent, createManualContent } from "@/lib/scrapers";
import { validateUrl, cleanUrl } from "@/lib/parsers/url-parser";
import type { Post, Tag } from "@/types";

// Rate limiting בסיסי - request אחד כל 2 שניות
let lastRequestTime = 0;

export async function POST(request: Request) {
  // Rate limit check
  const now = Date.now();
  if (now - lastRequestTime < 2000) {
    return NextResponse.json(
      { error: "יש להמתין 2 שניות בין בקשות" },
      { status: 429 },
    );
  }
  lastRequestTime = now;

  try {
    const body = (await request.json()) as {
      url?: string;
      manualText?: string;
    };

    if (!body.url) {
      return NextResponse.json(
        { error: "חסר שדה url בבקשה" },
        { status: 400 },
      );
    }

    // וולידציה
    const validation = validateUrl(body.url);
    if (!validation.valid || !validation.platform) {
      return NextResponse.json(
        { error: validation.error || "כתובת לא תקינה" },
        { status: 400 },
      );
    }

    const cleanedUrl = cleanUrl(body.url);

    // בדיקה אם כבר קיים ב-DB
    const existing = await sql`SELECT id FROM posts WHERE url = ${cleanedUrl} LIMIT 1`;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "הפוסט הזה כבר נשמר בעבר" },
        { status: 409 },
      );
    }

    // שליפת תוכן
    const scraped = body.manualText
      ? createManualContent(cleanedUrl, validation.platform, body.manualText)
      : await scrapeContent(cleanedUrl);

    // בדיקה שיש טקסט לנתח
    if (!scraped.text && !body.manualText) {
      return NextResponse.json(
        {
          error: "לא הצלחנו לשלוף תוכן מהפוסט. יש להדביק את הטקסט ידנית",
          needsManualInput: true,
          scraped,
        },
        { status: 422 },
      );
    }

    // ניתוח AI
    const analysis = await analyzeContent(scraped);

    // שמירה ב-DB
    const rows = await sql`
      INSERT INTO posts (
        url, platform, post_type, original_text, media_url, thumbnail_url,
        author_name, author_handle, ai_summary, ai_category, ai_key_points,
        ai_content_type, ai_action_items
      ) VALUES (
        ${cleanedUrl}, ${scraped.platform}, ${scraped.postType},
        ${scraped.text}, ${scraped.mediaUrl}, ${scraped.thumbnailUrl},
        ${scraped.authorName}, ${scraped.authorHandle},
        ${analysis.summary}, ${analysis.category},
        ${JSON.stringify(analysis.key_points)}::jsonb,
        ${analysis.content_type},
        ${JSON.stringify(analysis.action_items)}::jsonb
      ) RETURNING *
    `;

    const savedPost = rows[0] as Post;

    if (!savedPost) {
      return NextResponse.json(
        { error: "שגיאה בשמירת הפוסט" },
        { status: 500 },
      );
    }

    // יצירת תגיות וחיבור לפוסט
    const tags: Tag[] = [];
    if (analysis.suggested_tags.length > 0) {
      for (const tagName of analysis.suggested_tags) {
        // upsert - צור או קבל קיים
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

    return NextResponse.json({
      post: { ...savedPost, tags },
      analysis,
    });
  } catch (err) {
    console.error("[API /analyze]", err);
    const message = err instanceof Error ? err.message : "שגיאה לא צפויה";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
