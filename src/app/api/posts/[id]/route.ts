import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Post, Tag } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { data: post, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "הפוסט לא נמצא" }, { status: 404 });
    }

    // Fetch tags
    const { data: tagLinks } = await supabase
      .from("posts_tags")
      .select("tag_id")
      .eq("post_id", id);

    let tags: Tag[] = [];
    if (tagLinks && tagLinks.length > 0) {
      const tagIds = tagLinks.map((l) => l.tag_id);
      const { data: tagData } = await supabase
        .from("tags")
        .select("*")
        .in("id", tagIds);
      tags = (tagData || []) as unknown as Tag[];
    }

    return NextResponse.json({ post: { ...(post as unknown as Post), tags } });
  } catch (err) {
    if (err instanceof Error && (err.message.includes("Supabase") || err.message.includes("Invalid"))) {
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

    const update: Record<string, unknown> = {};
    if ("personal_note" in body) update.personal_note = body.personal_note;
    if ("is_favorite" in body) update.is_favorite = body.is_favorite;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "אין שדות לעדכון" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("posts")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "שגיאה בעדכון" }, { status: 500 });
    }

    return NextResponse.json({ post: data });
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

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.error("[DELETE /api/posts/[id]]", error);
      return NextResponse.json({ error: "שגיאה במחיקה" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/posts/[id]]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}
