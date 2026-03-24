import { NextResponse } from "next/server";
import { analyzeUrl, isAnalyzeError } from "@/lib/analyzer";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders() });
}

// Rate limiting בסיסי - request אחד כל 2 שניות
let lastRequestTime = 0;

export async function POST(request: Request) {
  const now = Date.now();
  if (now - lastRequestTime < 2000) {
    return jsonResponse({ error: "יש להמתין 2 שניות בין בקשות" }, 429);
  }
  lastRequestTime = now;

  try {
    const body = (await request.json()) as {
      url?: string;
      manualText?: string;
      imageUrl?: string;
    };

    const result = await analyzeUrl({
      url: body.url || "",
      manualText: body.manualText,
      imageUrl: body.imageUrl,
    });

    if (isAnalyzeError(result)) {
      return jsonResponse(result, result.status);
    }

    return jsonResponse(result);
  } catch (err) {
    console.error("[API /analyze]", err);
    const message = err instanceof Error ? err.message : "שגיאה לא צפויה";
    return jsonResponse({ error: message }, 500);
  }
}
