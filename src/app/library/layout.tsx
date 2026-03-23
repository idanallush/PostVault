import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "הספרייה שלי",
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
