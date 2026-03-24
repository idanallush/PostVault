import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Post, Tag } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const rows = await sql`SELECT * FROM posts WHERE id = ${id}`;
    const post = rows[0] as Post | undefined;

    if (!post) {
      return NextResponse.json({ error: "הפוסט לא נמצא" }, { status: 404 });
    }

    // Fetch tags
    const tagRows = await sql`
      SELECT t.* FROM tags t
      JOIN posts_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ${id}
    `;
    const tags = tagRows as Tag[];

    return NextResponse.json({ post: { ...post, tags } });
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("DATABASE_URL") || err.message.includes("connect"))
    ) {
      return NextResponse.json({ error: "הפוסט לא נמצא" }, { status: 404 });
    }
    console.error("[GET /api/posts/[id]]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      personal_note?: string;
      is_favorite?: boolean;
    };

    const hasNote = "personal_note" in body;
    const hasFav = "is_favorite" in body;

    if (!hasNote && !hasFav) {
      return NextResponse.json({ error: "אין שדות לעדכון" }, { status: 400 });
    }

    let rows;
    if (hasNote && hasFav) {
      rows = await sql`
        UPDATE posts SET personal_note = ${body.personal_note ?? null}, is_favorite = ${body.is_favorite ?? false}
        WHERE id = ${id} RETURNING *
      `;
    } else if (hasNote) {
      rows = await sql`
        UPDATE posts SET personal_note = ${body.personal_note ?? null}
        WHERE id = ${id} RETURNING *
      `;
    } else {
      rows = await sql`
        UPDATE posts SET is_favorite = ${body.is_favorite ?? false}
        WHERE id = ${id} RETURNING *
      `;
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "שגיאה בעדכון" }, { status: 500 });
    }

    return NextResponse.json({ post: rows[0] });
  } catch (err) {
    console.error("[PUT /api/posts/[id]]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM posts WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/posts/[id]]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}
