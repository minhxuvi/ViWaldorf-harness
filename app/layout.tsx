import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "ViWaldorf — Luyện Kể Chuyện Sư Phạm",
  description:
    "Ứng dụng luyện kể chuyện 5 cấp độ theo tinh thần sư phạm Waldorf tại Việt Nam với thu âm và nghe lại cục bộ, không sử dụng AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-paper text-ink min-h-screen">
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
