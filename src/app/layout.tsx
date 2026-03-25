import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Navbar } from "@/components/Navbar";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PostVault",
    template: "%s | PostVault",
  },
  description: "כלי חכם לשמירה, ניתוח וסיכום תוכן מאינסטגרם, פייסבוק ויוטיוב",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen text-foreground font-sans antialiased">
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
