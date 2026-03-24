import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await params;
    const { tagId } = (await request.json()) as { tagId: string };

    if (!tagId) {
      return NextResponse.json({ error: "חסר מזהה תגית" }, { status: 400 });
    }

    try {
      await sql`
        INSERT INTO posts_tags (post_id, tag_id) VALUES (${postId}, ${tagId})
        ON CONFLICT DO NOTHING
      `;
    } catch (insertErr) {
      const msg = insertErr instanceof Error ? insertErr.message : "";
      if (msg.includes("23505") || msg.includes("duplicate")) {
        return NextResponse.json({ error: "התגית כבר מחוברת" }, { status: 409 });
      }
      throw insertErr;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/posts/[id]/tags]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await params;
    const { tagId } = (await request.json()) as { tagId: string };

    if (!tagId) {
      return NextResponse.json({ error: "חסר מזהה תגית" }, { status: 400 });
    }

    await sql`DELETE FROM posts_tags WHERE post_id = ${postId} AND tag_id = ${tagId}`;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/posts/[id]/tags]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}
