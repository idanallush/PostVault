import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// DELETE /api/posts/bulk — delete multiple posts by IDs
export async function DELETE(request: Request) {
  try {
    const { ids } = (await request.json()) as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "חסרים מזהי פוסטים" }, { status: 400 });
    }

    await sql`DELETE FROM posts WHERE id = ANY(${ids}::uuid[])`;

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (err) {
    console.error("[DELETE /api/posts/bulk]", err);
    return NextResponse.json({ error: "שגיאה במחיקה" }, { status: 500 });
  }
}

// POST /api/posts/bulk — add tag to multiple posts
export async function POST(request: Request) {
  try {
    const { ids, tagId } = (await request.json()) as { ids: string[]; tagId: string };

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !tagId) {
      return NextResponse.json({ error: "חסרים מזהי פוסטים או תגית" }, { status: 400 });
    }

    for (const postId of ids) {
      await sql`
        INSERT INTO posts_tags (post_id, tag_id) VALUES (${postId}, ${tagId})
        ON CONFLICT DO NOTHING
      `;
    }

    return NextResponse.json({ success: true, updated: ids.length });
  } catch (err) {
    console.error("[POST /api/posts/bulk]", err);
    return NextResponse.json({ error: "שגיאה בעדכון" }, { status: 500 });
  }
}
