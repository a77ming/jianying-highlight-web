import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI高光剪辑工具",
  description: "智能识别视频高光片段，自动生成剪辑执行表",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
