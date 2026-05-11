/* ============================================
 * Root Layout
 * Includes global navigation and meta
 * ============================================ */

import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import { LanguageProvider } from "@/lib/i18n/context";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: "Director's Vault",
    template: "%s | Director's Vault",
  },
  description:
    "Tu bóveda personal de cine. Rastrea, califica, y organiza tu mundo cinematográfico.",
  keywords: ["movies", "cinema", "tracker", "ratings", "collections", "directors vault"],
  authors: [{ name: "Director's Vault" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <LanguageProvider>
          <Sidebar />
          <main className="main-content">{children}</main>
          <BottomNav />
        </LanguageProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
