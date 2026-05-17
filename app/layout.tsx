import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reseller Fee Calculator — Etsy, Poshmark, Mercari, Depop & eBay",
  description:
    "Free profit calculator for resellers. Instantly calculate fees, net profit, and break-even price across Etsy, Poshmark, Mercari, Depop, and eBay. No signup needed.",
  keywords: [
    "reseller fee calculator",
    "etsy fee calculator",
    "poshmark fee calculator",
    "mercari fee calculator",
    "depop fee calculator",
    "ebay fee calculator",
    "reseller profit calculator",
    "selling fees 2024",
  ],
  authors: [{ name: "ListGenie" }],
  openGraph: {
    title: "Reseller Fee Calculator — Know Your Profit Before You Sell",
    description:
      "Calculate exact fees and net profit for Etsy, Poshmark, Mercari, Depop, and eBay in seconds. Free, no signup.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reseller Fee Calculator — Know Your Profit Before You Sell",
    description:
      "Calculate exact fees and net profit for Etsy, Poshmark, Mercari, Depop, and eBay in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
