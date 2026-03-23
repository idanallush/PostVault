import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { postId, isFavorite } = (await request.json()) as {
      postId: string;
      isFavorite: boolean;
    };

    if (!postId) {
      return NextResponse.json({ error: "חסר מזהה פוסט" }, { status: 400 });
    }

    const { error } = await supabase
      .from("posts")
      .update({ is_favorite: isFavorite })
      .eq("id", postId);

    if (error) {
      console.error("[Favorite]", error);
      return NextResponse.json({ error: "שגיאה בעדכון" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API /favorite]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}
