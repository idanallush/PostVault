# PostVault

פרויקט PostVault - כלי לשמירה וניתוח פוסטים מרשתות חברתיות.

## כללי

- עברית RTL בלבד
- `dir="rtl"` ו-`lang="he"` על תגית `<html>`
- פונט ראשי: Heebo מ-Google Fonts (דרך `next/font`)
- דארק מוד כברירת מחדל עם אפשרות למעבר

## סטאק טכני

- **Framework:** Next.js 15+ עם App Router
- **שפה:** TypeScript (strict mode)
- **עיצוב:** Tailwind CSS v4 + design system מתיקיית `New Claude code`
- **מסד נתונים:** Neon (PostgreSQL serverless)
- **ניתוח AI:** Claude API (Vision + Text)
- **תמלול אודיו:** OpenAI Whisper API
- **שליפת תוכן:** Apify API (Instagram + Facebook), YouTube Transcript, fallback to Embed/oEmbed
- **iOS Shortcut:** `POST /api/shortcut` endpoint
- **Deployment:** Vercel

## מבנה תיקיות

```
src/
  app/          - pages ו-layouts (App Router)
  components/
    ui/         - רכיבי Design System
  lib/          - utilities ופונקציות עזר
  hooks/        - React hooks מותאמים
  types/        - TypeScript types
```

## עקרונות עיצוב

- נקי, מינימלי, מקצועי
- Whitespace ככלי עיצובי
- ללא רעש ויזואלי מיותר (גרדיאנטים, צללים, טקסטורות)
- לא להשתמש ב-`flex-row-reverse` - RTL מטפל בזה
- צבעי דארק מוד: רקע #0c0f14, משטח #151921, טקסט #e8e4dd
- צבעי לייט מוד: רקע #f7f7f5, משטח #ffffff, טקסט #1a1a1a

## פקודות פיתוח

```bash
npm run dev    # שרת פיתוח
npm run build  # בנייה לפרודקשן
npm run lint   # בדיקת קוד
```

@AGENTS.md
