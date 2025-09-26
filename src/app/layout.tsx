import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DataProvider } from "@/contexts/DataContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoneyCheck - 男子大学生向け資産診断ツール",
  description: "あなたの資産状況を100点満点で診断。収入・支出・投資を分析して、お金の使い方を改善しよう。",
  keywords: "資産診断, 家計簿, 投資, お金, 大学生, 資産管理",
  openGraph: {
    title: "MoneyCheck - 男子大学生向け資産診断ツール",
    description: "あなたの資産状況を100点満点で診断。収入・支出・投資を分析して、お金の使い方を改善しよう。",
    type: "website",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1e3a8a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <DataProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
