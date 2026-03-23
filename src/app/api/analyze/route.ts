import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { analyzeContent } from "@/lib/claude";
import { scrapeContent, createManualContent } from "@/lib/scrapers";
import { validateUrl, cleanUrl } from "@/lib/parsers/url-parser";
import type { InsertPost } from "@/types";

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
    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("url", cleanedUrl)
      .single();

    if (existing) {
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

    // שמירה ב-Supabase
    const postData: InsertPost = {
      url: cleanedUrl,
      platform: scraped.platform,
      post_type: scraped.postType,
      original_text: scraped.text,
      media_url: scraped.mediaUrl,
      thumbnail_url: scraped.thumbnailUrl,
      author_name: scraped.authorName,
      author_handle: scraped.authorHandle,
      ai_summary: analysis.summary,
      ai_category: analysis.category,
      ai_key_points: analysis.key_points,
      ai_content_type: analysis.content_type,
      ai_action_items: analysis.action_items,
    };

    const { data: savedPost, error: postError } = await supabase
      .from("posts")
      .insert(postData)
      .select()
      .single();

    if (postError || !savedPost) {
      console.error("[Supabase] Post insert error:", postError);
      return NextResponse.json(
        { error: "שגיאה בשמירת הפוסט" },
        { status: 500 },
      );
    }

    // יצירת תגיות וחיבור לפוסט
    const tags = [];
    if (analysis.suggested_tags.length > 0) {
      for (const tagName of analysis.suggested_tags) {
        // upsert - צור או קבל קיים
        const { data: tag } = await supabase
          .from("tags")
          .upsert({ name: tagName }, { onConflict: "name" })
          .select()
          .single();

        if (tag) {
          tags.push(tag);
          // חיבור פוסט-תגית
          await supabase
            .from("posts_tags")
            .insert({ post_id: savedPost.id, tag_id: tag.id });
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
