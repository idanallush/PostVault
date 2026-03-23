import Anthropic from "@anthropic-ai/sdk";
import { buildAnalysisPrompt } from "@/lib/prompts/analyze";
import type { ScrapedContent, AnalysisResult } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeContent(
  content: ScrapedContent,
): Promise<AnalysisResult> {
  if (!content.text) {
    throw new Error("אין טקסט לניתוח");
  }

  const { system, user } = buildAnalysisPrompt({
    platform: content.platform,
    text: content.text,
    hasVideo: content.postType === "video",
    hasImage: content.postType === "image" || content.postType === "carousel",
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system,
    messages: [{ role: "user", content: user }],
  });

  // חילוץ טקסט מה-response
  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("תשובה לא צפויה מ-Claude");
  }

  // ניקוי backticks אם קלוד בכל זאת מוסיף אותם
  const cleaned = textBlock.text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  // פרסור JSON
  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(cleaned) as AnalysisResult;
  } catch {
    console.error("[Claude] Failed to parse JSON:", cleaned);
    // fallback - ניסיון לחלץ JSON מתוך טקסט חופשי
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]) as AnalysisResult;
      } catch {
        throw new Error("לא הצלחנו לפרסר את תשובת Claude");
      }
    } else {
      throw new Error("לא הצלחנו לפרסר את תשובת Claude");
    }
  }

  // וולידציה בסיסית והשלמת שדות חסרים
  return {
    summary: parsed.summary || "לא נמצא סיכום",
    category: parsed.category || "אחר",
    content_type: parsed.content_type || "other",
    key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [],
    action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
    suggested_tags: Array.isArray(parsed.suggested_tags) ? parsed.suggested_tags : [],
  };
}
