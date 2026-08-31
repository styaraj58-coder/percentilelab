import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.percentilelab.in"),
  title: "Percentile Lab | MBA Entrance Exam Test Prep",
  description:
    "Practice mock tests for CAT, MAH-CET, MAT, ATMA, and more — timed exams with detailed percentile and section-wise analysis from Percentile Lab.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-white text-brand-ink">{children}</body>
    </html>
  );
}
