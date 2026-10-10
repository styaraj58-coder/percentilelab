import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { JsonLd } from "@/components/json-ld";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import { SITE_EMAIL, SITE_INSTAGRAM, SITE_LINKEDIN, SITE_NAME, SITE_PHONE, SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.percentilelab.in"),
  title: "Percentile Lab | MBA Entrance Exam Test Prep",
  description:
    "Practice mock tests for CAT, MAH-CET, MAT, ATMA, and more - timed exams with detailed percentile and section-wise analysis from Percentile Lab.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    title: "Percentile Lab | MBA Entrance Exam Test Prep",
    description:
      "Timed mock tests for CAT, MAH-CET, MAT, ATMA and UG BMS CET with percentile, section-wise and time-per-question analysis.",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Percentile Lab",
  },
};

export const viewport: Viewport = {
  themeColor: "#14224b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-white text-brand-ink">
        <noscript>
          <style>{".reveal { opacity: 1 !important; transform: none !important; }"}</style>
        </noscript>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "EducationalOrganization",
                "@id": `${SITE_URL}/#organization`,
                name: SITE_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}/logo.png`,
                email: SITE_EMAIL,
                telephone: SITE_PHONE,
                sameAs: [SITE_INSTAGRAM, SITE_LINKEDIN],
                founder: { "@type": "Person", name: "Satya Raj" },
              },
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: SITE_URL,
                name: SITE_NAME,
                publisher: { "@id": `${SITE_URL}/#organization` },
                inLanguage: "en-IN",
              },
            ],
          }}
        />
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
