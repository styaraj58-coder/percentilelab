import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Percentile Lab MBA | MBA CET Test Prep",
  description:
    "Practice MBA CET mock tests, take timed exams, and get detailed percentile and section-wise analysis with Percentile Lab MBA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-white text-brand-ink`}>
        {children}
      </body>
    </html>
  );
}
