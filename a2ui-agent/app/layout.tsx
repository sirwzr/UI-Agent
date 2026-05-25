import type { Metadata } from "next";
import AppProviders from "@/components/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "A2UI Agent - AI 界面生成助手",
  description: "告诉我您需要什么样的界面，我会为您实时生成",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
