import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
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

    // Tag filter: get post IDs first
    let tagPostIds: string[] | null = null;
    if (tagFilter) {
      const tagLinks = await sql`SELECT post_id FROM posts_tags WHERE tag_id = ${tagFilter}`;
      tagPostIds = tagLinks.map((l) => l.post_id as string);
      if (tagPostIds.length === 0) {
        return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 });
      }
    }

    // Use multiple queries based on filter combinations to avoid dynamic SQL
    // This approach uses tagged templates which are safe and properly parameterized
    let posts: Post[];
    let total: number;

    if (search && platform && category && favorite === "true" && tagPostIds) {
      const countResult = await sql`SELECT COUNT(*)::int as total FROM posts WHERE platform = ${platform} AND ai_category = ${category} AND is_favorite = true AND id = ANY(${tagPostIds}::uuid[]) AND (ai_summary ILIKE ${"%" + search + "%"} OR original_text ILIKE ${"%" + search + "%"})`;
      total = (countResult[0]?.total as number) || 0;
      posts = sort === "oldest"
        ? (await sql`SELECT * FROM posts WHERE platform = ${platform} AND ai_category = ${category} AND is_favorite = true AND id = ANY(${tagPostIds}::uuid[]) AND (ai_summary ILIKE ${"%" + search + "%"} OR original_text ILIKE ${"%" + search + "%"}) ORDER BY created_at ASC LIMIT ${limit} OFFSET ${offset}`) as Post[]
        : (await sql`SELECT * FROM posts WHERE platform = ${platform} AND ai_category = ${category} AND is_favorite = true AND id = ANY(${tagPostIds}::uuid[]) AND (ai_summary ILIKE ${"%" + search + "%"} OR original_text ILIKE ${"%" + search + "%"}) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`) as Post[];
    } else {
      // Generic approach: fetch all with broad filters, apply the rest in-memory
      // For better performance, we query with the most common filter combinations
      const searchPattern = search ? "%" + search + "%" : null;

      // Base query with all possible filters using COALESCE/conditional logic
      const countResult = await sql`
        SELECT COUNT(*)::int as total FROM posts
        WHERE
          (${platform}::text IS NULL OR platform = ${platform})
          AND (${category}::text IS NULL OR ai_category = ${category})
          AND (${contentType}::text IS NULL OR ai_content_type = ${contentType})
          AND (${favorite !== "true"}::boolean OR is_favorite = true)
          AND (${!tagPostIds}::boolean OR id = ANY(${tagPostIds ?? []}::uuid[]))
          AND (${!searchPattern}::boolean OR ai_summary ILIKE ${searchPattern ?? "%"} OR original_text ILIKE ${searchPattern ?? "%"})
      `;
      total = (countResult[0]?.total as number) || 0;

      posts = sort === "oldest"
        ? (await sql`
            SELECT * FROM posts
            WHERE
              (${platform}::text IS NULL OR platform = ${platform})
              AND (${category}::text IS NULL OR ai_category = ${category})
              AND (${contentType}::text IS NULL OR ai_content_type = ${contentType})
              AND (${favorite !== "true"}::boolean OR is_favorite = true)
              AND (${!tagPostIds}::boolean OR id = ANY(${tagPostIds ?? []}::uuid[]))
              AND (${!searchPattern}::boolean OR ai_summary ILIKE ${searchPattern ?? "%"} OR original_text ILIKE ${searchPattern ?? "%"})
            ORDER BY created_at ASC LIMIT ${limit} OFFSET ${offset}
          `) as Post[]
        : (await sql`
            SELECT * FROM posts
            WHERE
              (${platform}::text IS NULL OR platform = ${platform})
              AND (${category}::text IS NULL OR ai_category = ${category})
              AND (${contentType}::text IS NULL OR ai_content_type = ${contentType})
              AND (${favorite !== "true"}::boolean OR is_favorite = true)
              AND (${!tagPostIds}::boolean OR id = ANY(${tagPostIds ?? []}::uuid[]))
              AND (${!searchPattern}::boolean OR ai_summary ILIKE ${searchPattern ?? "%"} OR original_text ILIKE ${searchPattern ?? "%"})
            ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
          `) as Post[];
    }

    // Fetch tags for all posts
    const postIds = posts.map((p) => p.id);
    let postsWithTags: PostWithTags[] = posts.map((p) => ({
      ...p,
      tags: [] as Tag[],
    }));

    if (postIds.length > 0) {
      const tagData = await sql`
        SELECT t.*, pt.post_id
        FROM tags t
        JOIN posts_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ANY(${postIds}::uuid[])
      `;

      if (tagData.length > 0) {
        postsWithTags = postsWithTags.map((post) => ({
          ...post,
          tags: tagData
            .filter((t) => t.post_id === post.id)
            .map((t) => ({
              id: t.id as string,
              name: t.name as string,
              color: t.color as string,
              created_at: t.created_at as string,
            })),
        }));
      }
    }

    return NextResponse.json({
      posts: postsWithTags,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("DATABASE_URL") || err.message.includes("connect"))
    ) {
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

    await sql`DELETE FROM posts WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/posts]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}
