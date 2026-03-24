# PostVault Chrome Extension

תוסף כרום ששומר ומנתח פוסטים ישירות מאינסטגרם ופייסבוק.

## התקנה (Developer Mode)

1. פתח Chrome ונווט ל-`chrome://extensions/`
2. הפעל **Developer mode** (למעלה מימין)
3. לחץ **Load unpacked**
4. בחר את תיקיית `chrome-extension/`

## שימוש

- גלול בפיד של Instagram או Facebook
- על כל פוסט יופיע כפתור **📚 PostVault**
- לחץ על הכפתור והפוסט נשמר ומנותח אוטומטית
- לחץ על אייקון התוסף בסרגל הכלים כדי לפתוח את הספרייה

## הגדרות

לחץ על אייקון התוסף כדי לשנות את כתובת ה-API:
- ברירת מחדל: `https://post-vault-sigma.vercel.app`
- לפיתוח מקומי: `http://localhost:3000`

## איך זה עובד

1. **Content Script** רץ בתוך דפי Instagram/Facebook
2. מזהה פוסטים ב-DOM ומוסיף כפתור שמירה
3. בלחיצה, שולף טקסט + תמונות + URL ישירות מה-DOM
4. שולח ל-PostVault API לניתוח AI ושמירה
