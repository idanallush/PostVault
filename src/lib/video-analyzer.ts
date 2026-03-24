import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { Platform, VideoAnalysis } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * ניתוח ויזואלי של תמונה/thumbnail עם Claude Vision
 */
export async function analyzeFrame(thumbnailUrl: string): Promise<string | null> {
  try {
    // הורדת התמונה כ-base64
    const response = await fetch(thumbnailUrl, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error(`[Vision] HTTP ${response.status} fetching thumbnail`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // בדיקת גודל - Vision עד 20MB
    if (buffer.byteLength > 20 * 1024 * 1024) {
      console.error("[Vision] Image too large:", buffer.byteLength);
      return null;
    }

    const base64Image = buffer.toString("base64");

    // זיהוי סוג מדיה
    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg";
    if (contentType.includes("png")) mediaType = "image/png";
    else if (contentType.includes("gif")) mediaType = "image/gif";
    else if (contentType.includes("webp")) mediaType = "image/webp";

    console.log(`[Vision] Analyzing image (${(buffer.byteLength / 1024).toFixed(0)}KB, ${mediaType})`);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: "תאר בדיוק מה רואים בתמונה/סרטון הזה. מה המסר? מה מוצג? מי נראה? אם יש טקסט בתמונה — תמלל אותו. תענה בעברית.",
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (textBlock && textBlock.type === "text") {
      console.log("[Vision] Frame analysis complete");
      return textBlock.text;
    }

    return null;
  } catch (err) {
    console.error("[Vision] Error:", err);
    return null;
  }
}

/**
 * תמלול אודיו עם OpenAI Whisper API
 * מקבל URL ישיר לקובץ וידאו/אודיו (עד 25MB)
 */
export async function transcribeAudio(videoUrl: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.log("[Whisper] No OPENAI_API_KEY configured, skipping transcription");
    return null;
  }

  try {
    console.log("[Whisper] Downloading video for transcription...");

    // הורדת הקובץ
    const response = await fetch(videoUrl, {
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`[Whisper] HTTP ${response.status} downloading video`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const sizeInMB = arrayBuffer.byteLength / (1024 * 1024);

    // Whisper מקבל עד 25MB
    if (sizeInMB > 25) {
      console.error(`[Whisper] File too large: ${sizeInMB.toFixed(1)}MB (max 25MB)`);
      return null;
    }

    console.log(`[Whisper] Transcribing (${sizeInMB.toFixed(1)}MB)...`);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // יצירת File object מה-buffer
    const file = new File([arrayBuffer], "audio.mp4", { type: "video/mp4" });

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: file,
    });

    if (transcription.text) {
      console.log(`[Whisper] Transcription complete (${transcription.text.length} chars)`);
      return transcription.text;
    }

    return null;
  } catch (err) {
    console.error("[Whisper] Error:", err);
    return null;
  }
}

/**
 * ניתוח וידאו מלא - משלב Vision + Whisper
 */
export async function analyzeVideo(params: {
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  platform: Platform;
  caption?: string | null;
}): Promise<VideoAnalysis> {
  const result: VideoAnalysis = {
    transcript: null,
    frameDescriptions: [],
    combinedAnalysis: "",
  };

  // שלב א: ניתוח תמונה עם Vision (אם יש thumbnail)
  if (params.thumbnailUrl) {
    const frameDesc = await analyzeFrame(params.thumbnailUrl);
    if (frameDesc) {
      result.frameDescriptions.push(frameDesc);
    }
  }

  // שלב ב: תמלול אם צריך
  // נשתמש ב-Whisper רק אם: יש URL ישיר לוידאו ואין caption
  if (params.videoUrl && !params.caption) {
    // לא מתמללים YouTube - כבר יש youtube-transcript
    if (params.platform !== "youtube") {
      const transcript = await transcribeAudio(params.videoUrl);
      if (transcript) {
        result.transcript = transcript;
      }
    }
  }

  // הרכבת ניתוח משולב
  const parts: string[] = [];
  if (params.caption) parts.push(`כיתוב: ${params.caption}`);
  if (result.transcript) parts.push(`תמלול: ${result.transcript}`);
  if (result.frameDescriptions.length > 0) parts.push(`ויזואלי: ${result.frameDescriptions.join(". ")}`);
  result.combinedAnalysis = parts.join("\n\n");

  return result;
}
