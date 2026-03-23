import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Post, Tag, PostWithTags } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const category = searchParams.get("category");
    const contentType = searchParams.get("content_type");
    const tagFilter = searchParams.get("tag");
    const favorite = searchParams.get("favorite");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase.from("posts").select("*", { count: "exact" });

    if (platform) query = query.eq("platform", platform);
    if (category) query = query.eq("ai_category", category);
    if (contentType) query = query.eq("ai_content_type", contentType);
    if (favorite === "true") query = query.eq("is_favorite", true);

    if (search) {
      query = query.or(
        `ai_summary.ilike.%${search}%,original_text.ilike.%${search}%`,
      );
    }

    // If filtering by tag, get post IDs first
    if (tagFilter) {
      const { data: tagLinks } = await supabase
        .from("posts_tags")
        .select("post_id")
        .eq("tag_id", tagFilter);
      const postIds = tagLinks?.map((l) => l.post_id) || [];
      if (postIds.length === 0) {
        return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 });
      }
      query = query.in("id", postIds);
    }

    // Sort
    query = query.order("created_at", { ascending: sort === "oldest" });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, count, error } = await query;

    if (error) {
      console.error("[GET /api/posts]", error);
      return NextResponse.json({ error: "שגיאה בטעינת פוסטים" }, { status: 500 });
    }

    // Fetch tags for all posts
    const postIds = (posts || []).map((p) => p.id);
    let postsWithTags: PostWithTags[] = (posts || []).map((p) => ({
      ...(p as unknown as Post),
      tags: [] as Tag[],
    }));

    if (postIds.length > 0) {
      const { data: tagLinks } = await supabase
        .from("posts_tags")
        .select("post_id, tag_id")
        .in("post_id", postIds);

      if (tagLinks && tagLinks.length > 0) {
        const tagIds = [...new Set(tagLinks.map((l) => l.tag_id))];
        const { data: tags } = await supabase
          .from("tags")
          .select("*")
          .in("id", tagIds);

        const tagMap = new Map((tags || []).map((t) => [t.id, t as unknown as Tag]));

        postsWithTags = postsWithTags.map((post) => ({
          ...post,
          tags: tagLinks
            .filter((l) => l.post_id === post.id)
            .map((l) => tagMap.get(l.tag_id))
            .filter(Boolean) as Tag[],
        }));
      }
    }

    const total = count || 0;
    return NextResponse.json({
      posts: postsWithTags,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    // If Supabase isn't configured, return empty results instead of error
    if (err instanceof Error && (err.message.includes("Supabase") || err.message.includes("supabase") || err.message.includes("Invalid"))) {
      return NextResponse.json({ posts: [], total: 0, page: 1, totalPages: 0 });
    }
    console.error("[GET /api/posts]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as { id: string };
    if (!id) {
      return NextResponse.json({ error: "חסר מזהה פוסט" }, { status: 400 });
    }

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.error("[DELETE /api/posts]", error);
      return NextResponse.json({ error: "שגיאה במחיקה" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/posts]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}
