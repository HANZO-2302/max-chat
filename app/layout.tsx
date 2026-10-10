import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAX Chat",
  description: "Чат для мессенджера MAX на GREEN-API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-max-bg text-white antialiased">{children}</body>
    </html>
  );
}