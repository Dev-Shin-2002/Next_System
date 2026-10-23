import type { Metadata } from "next";
import { fontSans, fontMono, fontDisplay } from "@/theme";
import { I18nProvider } from "@/i18n";
import { CONFIG } from "@/config";
import "./globals.css";

export const metadata: Metadata = {
  title: CONFIG.app.name,
  description: CONFIG.app.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={CONFIG.app.defaultLocale}
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <I18nProvider initialLocale={CONFIG.app.defaultLocale as "vi" | "en"}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
