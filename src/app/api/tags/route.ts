import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Tag } from "@/types";

export async function GET() {
  try {
    const { data: tags, error } = await supabase
      .from("tags")
      .select("*")
      .order("name");

    if (error) {
      console.error("[GET /api/tags]", error);
      return NextResponse.json({ error: "שגיאה בטעינת תגיות" }, { status: 500 });
    }

    // Get counts per tag
    const { data: counts } = await supabase
      .from("posts_tags")
      .select("tag_id");

    const countMap = new Map<string, number>();
    for (const row of counts || []) {
      countMap.set(row.tag_id, (countMap.get(row.tag_id) || 0) + 1);
    }

    const tagsWithCount = (tags || []).map((t) => ({
      ...(t as unknown as Tag),
      postCount: countMap.get(t.id) || 0,
    }));

    return NextResponse.json({ tags: tagsWithCount });
  } catch (err) {
    if (err instanceof Error && (err.message.includes("Supabase") || err.message.includes("supabase") || err.message.includes("Invalid"))) {
      return NextResponse.json({ tags: [] });
    }
    console.error("[GET /api/tags]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, color } = (await request.json()) as { name: string; color?: string };
    if (!name?.trim()) {
      return NextResponse.json({ error: "שם תגית חסר" }, { status: 400 });
    }

    const insert: { name: string; color?: string } = { name: name.trim() };
    if (color) insert.color = color;

    const { data, error } = await supabase.from("tags").insert(insert).select().single();
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "תגית עם שם זה כבר קיימת" }, { status: 409 });
      }
      console.error("[POST /api/tags]", error);
      return NextResponse.json({ error: "שגיאה ביצירת תגית" }, { status: 500 });
    }

    return NextResponse.json({ tag: data });
  } catch (err) {
    console.error("[POST /api/tags]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, color } = (await request.json()) as { id: string; name?: string; color?: string };
    if (!id) {
      return NextResponse.json({ error: "חסר מזהה תגית" }, { status: 400 });
    }

    const update: { name?: string; color?: string } = {};
    if (name) update.name = name.trim();
    if (color) update.color = color;

    const { data, error } = await supabase.from("tags").update(update).eq("id", id).select().single();
    if (error) {
      console.error("[PUT /api/tags]", error);
      return NextResponse.json({ error: "שגיאה בעדכון תגית" }, { status: 500 });
    }

    return NextResponse.json({ tag: data });
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

    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) {
      console.error("[DELETE /api/tags]", error);
      return NextResponse.json({ error: "שגיאה במחיקת תגית" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/tags]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}
