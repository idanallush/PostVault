import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { postId, isFavorite } = (await request.json()) as {
      postId: string;
      isFavorite: boolean;
    };

    if (!postId) {
      return NextResponse.json({ error: "חסר מזהה פוסט" }, { status: 400 });
    }

    await sql`UPDATE posts SET is_favorite = ${isFavorite} WHERE id = ${postId}`;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API /favorite]", err);
    return NextResponse.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  }
}
