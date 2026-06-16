import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const name = s.site_name || "AffiPro";
  return {
    title: {
      default: `${name} - ${s.site_tagline || "Giới thiệu & đánh giá sản phẩm"}`,
      template: `%s | ${name}`,
    },
    description:
      s.site_description ||
      "Trang giới thiệu, đánh giá và tổng hợp ưu đãi sản phẩm.",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
