import { NextResponse } from "next/server";
import { analyzeUrl, isAnalyzeError } from "@/lib/analyzer";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

/**
 * iOS Shortcut endpoint — simplified JSON response
 * POST { url: "https://www.instagram.com/p/..." }
 * Returns { status, message, postId, summary, category }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };

    if (!body.url) {
      return NextResponse.json(
        { status: "error", message: "Missing URL" },
        { status: 400, headers: corsHeaders() },
      );
    }

    const result = await analyzeUrl({ url: body.url });

    if (isAnalyzeError(result)) {
      return NextResponse.json(
        { status: "error", message: result.error },
        { status: result.status, headers: corsHeaders() },
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: result.post.ai_summary?.substring(0, 100) || "Post saved!",
        postId: result.post.id,
        summary: result.post.ai_summary,
        category: result.post.ai_category,
      },
      { headers: corsHeaders() },
    );
  } catch (error) {
    console.error("[API /shortcut]", error);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
