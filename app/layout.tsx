import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "ViWaldorf Harness — Waldorf Education & Storytelling in Vietnam",
  description:
    "Self-evolving agentic platform for Waldorf-inspired education in Vietnam with storytelling practice, 3 art styles, and multi-device sync.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink min-h-screen">
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
