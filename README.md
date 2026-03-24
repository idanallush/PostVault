# PostVault

כלי אישי לשמירה וניתוח פוסטים מרשתות חברתיות.

## מה זה עושה?

הדבק לינק מ-Instagram, Facebook או YouTube, קבל סיכום חכם עם AI, ושמור בספרייה מסודרת.

## טכנולוגיות

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- Neon (PostgreSQL serverless)
- Claude AI (Sonnet 4.6)
- Vercel

## התקנה מקומית

1. `npm install`
2. העתק `.env.example` ל-`.env.local` ומלא את הערכים
3. הרץ את ה-migration (`supabase/migrations/001_initial.sql`) ב-Neon SQL Editor
4. `npm run dev`

## Environment Variables

```
DATABASE_URL=
ANTHROPIC_API_KEY=
```

## פקודות

```bash
npm run dev    # שרת פיתוח
npm run build  # בנייה לפרודקשן
npm run lint   # בדיקת קוד
```
