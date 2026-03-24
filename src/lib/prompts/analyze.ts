export function buildAnalysisPrompt(content: {
  platform: string;
  text: string;
  transcript?: string | null;
  frameDescription?: string | null;
  hasVideo: boolean;
  hasImage: boolean;
}): { system: string; user: string } {
  const contentType = content.hasVideo
    ? "וידאו"
    : content.hasImage
      ? "תמונה"
      : "טקסט";

  const system = `אתה מנתח תוכן חכם מרשתות חברתיות. התפקיד שלך לנתח פוסטים ולהחזיר סיכום מדויק ושימושי בעברית.

כללים:
- תמיד תענה בעברית
- החזר JSON תקין בלבד, בלי markdown, בלי backticks, בלי הסברים
- הסיכום צריך להיות תמציתי (2-4 משפטים) אבל מלא
- אם זה מדריך: פרט את הצעדים בדיוק
- אם זה חינוכי: הוצא את הנקודות החשובות
- אם זה השראתי: תפוס את הרעיון המרכזי
- התגיות צריכות להיות קצרות ובעברית
- אם קיבלת תמלול וידאו, תיאור ויזואלי וכיתוב — שלב את כל המקורות לניתוח אחד מקיף`;

  // בניית תוכן הפרומפט עם כל המקורות הזמינים
  let contentSection = `נתח את הפוסט הבא מ-${content.platform}:\n\nסוג תוכן: ${contentType}`;

  contentSection += `\n\nכיתוב/טקסט הפוסט:\n---\n${content.text}\n---`;

  if (content.transcript) {
    contentSection += `\n\nתמלול הוידאו (מה נאמר בסרטון):\n---\n${content.transcript}\n---`;
  }

  if (content.frameDescription) {
    contentSection += `\n\nתיאור ויזואלי (מה רואים בסרטון/תמונה):\n---\n${content.frameDescription}\n---`;
  }

  const user = `${contentSection}

נתח את כל המידע ביחד והחזר JSON בפורמט הזה בלבד:
{
  "summary": "סיכום תמציתי בעברית",
  "category": "אחד מ: טכנולוגיה, עסקים, בריאות, אוכל, ספורט, יצירתיות, לימוד, השראה, חדשות, טיפים, ביקורת, בידור, אחר",
  "content_type": "אחד מ: tutorial, educational, inspirational, news, review, recipe, tip, entertainment, other",
  "key_points": ["נקודה 1", "נקודה 2", "נקודה 3"],
  "action_items": ["צעד 1", "צעד 2"],
  "suggested_tags": ["תג1", "תג2", "תג3"]
}

אם אין צעדים מעשיים, action_items יהיה מערך ריק.`;

  return { system, user };
}
