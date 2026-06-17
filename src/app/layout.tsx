import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { jsonLdString } from "@/lib/jsonld";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const name = s.site_name || "AffiPro";
  const description =
    s.site_description ||
    "Trang giới thiệu, đánh giá và tổng hợp ưu đãi sản phẩm.";
  const ogImage = s.og_default_image || s.hero_image || s.logo_url || undefined;

  return {
    title: {
      default: `${name} - ${s.site_tagline || "Giới thiệu & đánh giá sản phẩm"}`,
      template: `%s | ${name}`,
    },
    description,
    metadataBase: new URL(SITE_URL),
    keywords: s.seo_keywords
      ? s.seo_keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : undefined,
    applicationName: name,
    alternates: { canonical: "/" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    openGraph: {
      type: "website",
      siteName: name,
      title: `${name} - ${s.site_tagline || ""}`,
      description,
      url: SITE_URL,
      locale: "vi_VN",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    verification: s.google_site_verification
      ? { google: s.google_site_verification }
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSettings();
  const name = s.site_name || "AffiPro";
  const gaId = s.ga_measurement_id;

  // JSON-LD: Tổ chức + Website (giúp Google hiểu thương hiệu, hiện sitelinks search box)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name,
        url: SITE_URL,
        ...(s.logo_url ? { logo: s.logo_url } : {}),
        ...(s.facebook_url ? { sameAs: [s.facebook_url] } : {}),
      },
      {
        "@type": "WebSite",
        name,
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/san-pham?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
        />
      </head>
      <body className="font-sans">
        {children}

        {/* Google Analytics (chỉ nạp khi đã cấu hình ID) */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
