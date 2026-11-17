import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "ViWaldorf — Từ Sáng Thế Đến Giáng Sinh",
  description:
    "Không gian luyện kể chuyện sử thi Từ Sáng Thế Đến Giáng Sinh (5 Quyển · 180 Chương · 28 Tranh gợi nhớ) theo 4 cấp độ, kèm mục đọc thêm bối cảnh, xuất PDF toàn văn và thu âm cục bộ.",
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
