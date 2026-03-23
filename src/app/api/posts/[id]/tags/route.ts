import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    const { error } = await supabase
      .from("posts_tags")
      .insert({ post_id: postId, tag_id: tagId });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "התגית כבר מחוברת" }, { status: 409 });
      }
      console.error("[POST /api/posts/[id]/tags]", error);
      return NextResponse.json({ error: "שגיאה בהוספת תגית" }, { status: 500 });
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

    const { error } = await supabase
      .from("posts_tags")
      .delete()
      .eq("post_id", postId)
      .eq("tag_id", tagId);

    if (error) {
      console.error("[DELETE /api/posts/[id]/tags]", error);
      return NextResponse.json({ error: "שגיאה בהסרת תגית" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/posts/[id]/tags]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}
