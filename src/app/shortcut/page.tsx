"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = "https://post-vault-sigma.vercel.app/api/shortcut";

export default function ShortcutPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(API_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-foreground-mid hover:text-foreground transition-colors mb-8"
      >
        {"\u2190 חזרה לדף הבית"}
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-2">
        קיצור דרך לאייפון
      </h1>
      <p className="text-foreground-mid mb-8">
        שמור פוסטים ישירות מהאייפון עם Shortcuts
      </p>

      {/* API URL */}
      <section className="rounded-xl bg-surface border border-surface-border p-5 mb-8">
        <h2 className="text-sm font-medium text-foreground mb-3">כתובת ה-API</h2>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-background rounded-lg px-3 py-2.5 text-accent-gold overflow-x-auto font-mono" dir="ltr">
            {API_URL}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 px-4 py-2.5 rounded-lg bg-accent-gold text-background text-xs font-medium hover:opacity-90 transition-opacity"
          >
            {copied ? "הועתק" : "העתק"}
          </button>
        </div>
      </section>

      {/* Steps */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">הוראות הגדרה</h2>
        <ol className="space-y-4">
          {[
            {
              title: "פתח את אפליקציית Shortcuts",
              desc: "לחץ על + כדי ליצור קיצור דרך חדש",
            },
            {
              title: "הוסף פעולה: Share Sheet",
              desc: "בהגדרות הקיצור, הפעל \"Show in Share Sheet\" וסנן ל-URLs",
            },
            {
              title: "הוסף פעולה: Get Contents of URL",
              desc: "בחר POST method, הוסף Header: Content-Type = application/json",
            },
            {
              title: "הגדר את ה-Body",
              desc: 'Request Body: JSON, עם מפתח "url" וערך Shortcut Input',
            },
            {
              title: "הדבק את כתובת ה-API",
              desc: "הדבק את הכתובת שהעתקת למעלה בשדה URL",
            },
            {
              title: "הוסף פעולה: Show Notification",
              desc: "הצג את השדה message מהתוצאה כהתראה",
            },
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-accent-gold/15 text-accent-gold flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="text-xs text-foreground-dim mt-0.5">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Test */}
      <section className="rounded-xl bg-surface border border-surface-border p-5 mb-8">
        <h2 className="text-sm font-medium text-foreground mb-3">בדיקה עם curl</h2>
        <code className="block text-xs bg-background rounded-lg px-3 py-2.5 text-foreground-mid overflow-x-auto font-mono whitespace-pre" dir="ltr">{`curl -X POST ${API_URL} \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'`}</code>
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">איך משתמשים?</h2>
        <div className="space-y-2 text-sm text-foreground-mid">
          <p>פתח פוסט באינסטגרם, פייסבוק או יוטיוב באייפון</p>
          <p>לחץ על כפתור השיתוף (Share)</p>
          <p>בחר את קיצור הדרך PostVault</p>
          <p>תקבל התראה כשהניתוח הושלם</p>
        </div>
      </section>
    </div>
  );
}
