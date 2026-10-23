import type { Metadata } from "next";
import { fontSans, fontMono } from "@/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "System Manager",
  description: "Enterprise System Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
