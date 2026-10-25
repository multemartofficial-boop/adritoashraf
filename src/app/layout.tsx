import type { Metadata } from "next";
import { Inter, Instrument_Serif, Manrope } from "next/font/google";
import Script from "next/script";
import { publicEnv } from "@/lib/env/public";
import { UtmCapture } from "@/components/site/utm-capture";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});
// Admin-only typeface: no preload so public visitors never download it —
// the woff2 is fetched only when an element actually uses font-admin.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Adrito Ashraf — Full Stack Developer",
    template: "%s · Adrito Ashraf",
  },
  description:
    "Freelance full stack developer building websites, SaaS, ERP and HR systems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${instrumentSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <UtmCapture />
        {/* Hostinger Reach: site-wide tracking + renders any embedded forms. */}
        <Script
          src="https://cdn-reach.hostinger.com/js/embed.js"
          strategy="afterInteractive"
        />
        <Script
          src="http://localhost:8080/widget.js"
          data-key="wk_XHdxmetx76lR5BifUYXtnquy"
          data-position="right"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
