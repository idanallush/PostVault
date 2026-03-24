import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const tags = await sql`
      SELECT t.*, COUNT(pt.post_id)::int as post_count
      FROM tags t
      LEFT JOIN posts_tags pt ON t.id = pt.tag_id
      GROUP BY t.id
      ORDER BY t.name
    `;

    const tagsWithCount = tags.map((t) => ({
      id: t.id as string,
      name: t.name as string,
      color: t.color as string,
      created_at: t.created_at as string,
      postCount: (t.post_count as number) || 0,
    }));

    return NextResponse.json({ tags: tagsWithCount });
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("DATABASE_URL") || err.message.includes("connect"))
    ) {
      return NextResponse.json({ tags: [] });
    }
    console.error("[GET /api/tags]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, color } = (await request.json()) as {
      name: string;
      color?: string;
    };
    if (!name?.trim()) {
      return NextResponse.json({ error: "שם תגית חסר" }, { status: 400 });
    }

    try {
      const rows = color
        ? await sql`INSERT INTO tags (name, color) VALUES (${name.trim()}, ${color}) RETURNING *`
        : await sql`INSERT INTO tags (name) VALUES (${name.trim()}) RETURNING *`;

      return NextResponse.json({ tag: rows[0] });
    } catch (insertErr) {
      const msg = insertErr instanceof Error ? insertErr.message : "";
      if (msg.includes("23505") || msg.includes("duplicate")) {
        return NextResponse.json(
          { error: "תגית עם שם זה כבר קיימת" },
          { status: 409 },
        );
      }
      throw insertErr;
    }
  } catch (err) {
    console.error("[POST /api/tags]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, color } = (await request.json()) as {
      id: string;
      name?: string;
      color?: string;
    };
    if (!id) {
      return NextResponse.json({ error: "חסר מזהה תגית" }, { status: 400 });
    }

    const hasName = !!name;
    const hasColor = !!color;

    if (!hasName && !hasColor) {
      return NextResponse.json({ error: "אין שדות לעדכון" }, { status: 400 });
    }

    let rows;
    if (hasName && hasColor) {
      rows = await sql`UPDATE tags SET name = ${name!.trim()}, color = ${color} WHERE id = ${id} RETURNING *`;
    } else if (hasName) {
      rows = await sql`UPDATE tags SET name = ${name!.trim()} WHERE id = ${id} RETURNING *`;
    } else {
      rows = await sql`UPDATE tags SET color = ${color} WHERE id = ${id} RETURNING *`;
    }

    return NextResponse.json({ tag: rows[0] });
  } catch (err) {
    console.error("[PUT /api/tags]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as { id: string };
    if (!id) {
      return NextResponse.json({ error: "חסר מזהה תגית" }, { status: 400 });
    }

    await sql`DELETE FROM tags WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/tags]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}
